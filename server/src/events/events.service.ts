import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(organizerId: string, dto: CreateEventDto) {
    const slug = dto.slug || this.generateSlug(dto.title);

    const eventData: any = {
      ...dto,
      slug,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      organizerId,
    };

    return this.prisma.event.create({
      data: eventData,
      include: {
        organizer: { select: { id: true, name: true, avatar: true } },
        _count: { select: { ticketTiers: true, registrations: true } },
      },
    });
  }

  async findAll(query: EventQueryDto) {
    const { page = 1, limit = 12, category, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      ...(status ? { status: status as any } : { status: 'PUBLISHED' }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      visibility: 'PUBLIC',
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          organizer: { select: { id: true, name: true, avatar: true } },
          ticketTiers: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
            take: 1,
          },
          _count: { select: { registrations: true } },
        },
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { events, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findByOrganizer(organizerId: string, query: EventQueryDto) {
    const { page = 1, limit = 12, status, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      organizerId,
      ...(status && { status: status as any }),
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          ticketTiers: true,
          _count: { select: { registrations: true, sessions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { events, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true, company: true },
        },
        ticketTiers: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        sessions: { orderBy: { startTime: 'asc' } },
        _count: { select: { registrations: true } },
      },
    });

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true, avatar: true } },
        ticketTiers: { orderBy: { sortOrder: 'asc' } },
        sessions: { orderBy: { startTime: 'asc' } },
        promoCodes: true,
        _count: { select: { registrations: true } },
      },
    });

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, organizerId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId)
      throw new ForbiddenException('Not your event');

    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.title) data.slug = this.generateSlug(dto.title);

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        organizer: { select: { id: true, name: true, avatar: true } },
        ticketTiers: true,
        _count: { select: { registrations: true } },
      },
    });
  }

  async updateStatus(id: string, organizerId: string, status: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId)
      throw new ForbiddenException('Not your event');

    return this.prisma.event.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async delete(id: string, organizerId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId)
      throw new ForbiddenException('Not your event');

    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted successfully' };
  }

  async getEventStats(id: string, organizerId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId)
      throw new ForbiddenException('Not your event');

    const [registrations, revenue, checkIns, ticketTiers] = await Promise.all([
      this.prisma.registration.count({
        where: { eventId: id, status: 'CONFIRMED' },
      }),
      this.prisma.payment.aggregate({
        where: { registration: { eventId: id }, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.checkIn.count({ where: { registration: { eventId: id } } }),
      this.prisma.ticketTier.findMany({
        where: { eventId: id },
        select: { name: true, quantity: true, sold: true, price: true },
      }),
    ]);

    return {
      totalRegistrations: registrations,
      totalRevenue: revenue._sum.amount || 0,
      totalCheckIns: checkIns,
      capacity: event.capacity,
      ticketTiers,
    };
  }

  async findAllPromoCodes(organizerId: string) {
    return this.prisma.promoCode.findMany({
      where: { event: { organizerId } },
      include: { event: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPromoCode(organizerId: string, dto: any) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId)
      throw new ForbiddenException('Not your event');

    return this.prisma.promoCode.create({
      data: {
        code: dto.code,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxUses: dto.maxUses,
        validUntil: new Date(dto.validUntil),
        eventId: dto.eventId,
      },
    });
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
  }
}
