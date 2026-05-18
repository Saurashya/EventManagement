import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckinService {
  constructor(private prisma: PrismaService) {}

  async checkInByQr(qrCode: string, checkedInBy: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { qrCode },
      include: {
        checkIn: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!registration) throw new NotFoundException('Registration not found');
    if (registration.status !== 'CONFIRMED')
      throw new BadRequestException('Registration not confirmed');
    if (registration.checkIn)
      throw new BadRequestException('Already checked in');

    const checkIn = await this.prisma.checkIn.create({
      data: {
        registrationId: registration.id,
        userId: registration.userId,
        method: 'QR_SCAN',
        checkedInBy,
      },
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true, avatar: true } },
            ticketTier: { select: { name: true } },
            event: { select: { title: true } },
          },
        },
      },
    });

    return checkIn;
  }

  async manualCheckIn(code: string, checkedInBy: string, notes?: string) {
    const registration = await this.prisma.registration.findFirst({
      where: {
        OR: [{ id: code }, { qrCode: code }],
      },
      include: { checkIn: true },
    });

    if (!registration) throw new NotFoundException('Registration not found');
    if (registration.status !== 'CONFIRMED')
      throw new BadRequestException('Registration not confirmed');
    if (registration.checkIn)
      throw new BadRequestException('Already checked in');

    return this.prisma.checkIn.create({
      data: {
        registrationId: registration.id,
        userId: registration.userId,
        method: 'MANUAL',
        checkedInBy,
        notes,
      },
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true, avatar: true } },
            ticketTier: { select: { name: true } },
            event: { select: { title: true } },
          },
        },
      },
    });
  }

  async getEventCheckIns(eventId: string) {
    return this.prisma.checkIn.findMany({
      where: { registration: { eventId } },
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true, avatar: true } },
            ticketTier: { select: { name: true } },
          },
        },
      },
      orderBy: { checkedInAt: 'desc' },
    });
  }

  async getCheckInStats(eventId: string) {
    const [totalRegistrations, totalCheckIns, recentCheckIns] =
      await Promise.all([
        this.prisma.registration.count({
          where: { eventId, status: 'CONFIRMED' },
        }),
        this.prisma.checkIn.count({ where: { registration: { eventId } } }),
        this.prisma.checkIn.findMany({
          where: { registration: { eventId } },
          take: 10,
          orderBy: { checkedInAt: 'desc' },
          include: {
            registration: {
              include: { user: { select: { name: true, avatar: true } } },
            },
          },
        }),
      ]);

    return {
      totalRegistrations,
      totalCheckIns,
      checkInRate:
        totalRegistrations > 0
          ? Math.round((totalCheckIns / totalRegistrations) * 100)
          : 0,
      recentCheckIns,
    };
  }
}
