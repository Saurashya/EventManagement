import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  async register(
    userId: string,
    data: {
      eventId: string;
      ticketTierId: string;
      promoCode?: string;
      attendeeName?: string;
      attendeeEmail?: string;
      attendeePhone?: string;
    },
  ) {
    // Check existing registration
    const existing = await this.prisma.registration.findUnique({
      where: { userId_eventId: { userId, eventId: data.eventId } },
    });
    if (existing)
      throw new ConflictException('Already registered for this event');

    // Check ticket availability
    const tier = await this.prisma.ticketTier.findUnique({
      where: { id: data.ticketTierId },
    });
    if (!tier) throw new NotFoundException('Ticket tier not found');
    if (tier.sold >= tier.quantity)
      throw new BadRequestException('Tickets sold out');

    // Check capacity
    const event = await this.prisma.event.findUnique({
      where: { id: data.eventId },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.capacity) {
      const regCount = await this.prisma.registration.count({
        where: {
          eventId: data.eventId,
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      });
      if (regCount >= event.capacity)
        throw new BadRequestException('Event at full capacity');
    }

    // Calculate price
    let amount = Number(tier.price);
    let promoCodeId: string | undefined;

    if (data.promoCode) {
      const promo = await this.prisma.promoCode.findFirst({
        where: { eventId: data.eventId, code: data.promoCode, isActive: true },
      });
      if (
        promo &&
        promo.usedCount < promo.maxUses &&
        new Date() <= promo.validUntil
      ) {
        if (promo.discountType === 'PERCENTAGE') {
          amount = amount * (1 - Number(promo.discountValue) / 100);
        } else {
          amount = Math.max(0, amount - Number(promo.discountValue));
        }
        promoCodeId = promo.id;
        await this.prisma.promoCode.update({
          where: { id: promo.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    // Create registration
    const qrCode = `EP-${uuidv4().substring(0, 8).toUpperCase()}`;

    const registration = await this.prisma.registration.create({
      data: {
        userId,
        eventId: data.eventId,
        ticketTierId: data.ticketTierId,
        qrCode,
        amount,
        status: tier.type === 'FREE' ? 'CONFIRMED' : 'PENDING',
        attendeeName: data.attendeeName,
        attendeeEmail: data.attendeeEmail,
        attendeePhone: data.attendeePhone,
        promoCodeId,
      },
      include: {
        event: {
          select: { id: true, title: true, startDate: true, venue: true },
        },
        ticketTier: { select: { name: true, price: true } },
      },
    });

    // Update sold count
    await this.prisma.ticketTier.update({
      where: { id: data.ticketTierId },
      data: { sold: { increment: 1 } },
    });

    return registration;
  }

  async getUserRegistrations(userId: string) {
    return this.prisma.registration.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            bannerUrl: true,
            startDate: true,
            endDate: true,
            venue: true,
          },
        },
        ticketTier: { select: { name: true, price: true } },
        checkIn: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEventRegistrations(eventId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { eventId },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          ticketTier: { select: { name: true, price: true } },
          checkIn: true,
          payment: { select: { status: true, amount: true, provider: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { eventId } }),
    ]);
    return { registrations, total, page, totalPages: Math.ceil(total / limit) };
  }

  async cancelRegistration(id: string, userId: string) {
    const reg = await this.prisma.registration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Registration not found');
    if (reg.userId !== userId)
      throw new BadRequestException('Not your registration');

    await this.prisma.ticketTier.update({
      where: { id: reg.ticketTierId },
      data: { sold: { decrement: 1 } },
    });

    return this.prisma.registration.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getRegistrationByQr(qrCode: string) {
    const reg = await this.prisma.registration.findUnique({
      where: { qrCode },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        event: { select: { id: true, title: true } },
        ticketTier: { select: { name: true } },
        checkIn: true,
      },
    });
    if (!reg) throw new NotFoundException('Registration not found');
    return reg;
  }

  async getOrganizerRegistrations(organizerId: string) {
    return this.prisma.registration.findMany({
      where: { event: { organizerId } },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
        ticketTier: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
