import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          company: true,
          phone: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { registrations: true, organizedEvents: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        company: true,
        phone: true,
        provider: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { registrations: true, organizedEvents: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    id: string,
    data: { name?: string; phone?: string; company?: string; avatar?: string },
  ) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async updateRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }

  async toggleActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  async getDashboardStats(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
      return this.getOrganizerStats(userId);
    }
    return this.getAttendeeStats(userId);
  }

  private async getOrganizerStats(userId: string) {
    const [eventCount, registrationCount, totalRevenue, checkInCount, upcomingEvents, recentRegistrations] =
      await Promise.all([
        this.prisma.event.count({ where: { organizerId: userId } }),
        this.prisma.registration.count({
          where: { event: { organizerId: userId }, status: 'CONFIRMED' },
        }),
        this.prisma.payment.aggregate({
          where: {
            registration: { event: { organizerId: userId } },
            status: 'COMPLETED',
          },
          _sum: { amount: true },
        }),
        this.prisma.checkIn.count({
          where: { registration: { event: { organizerId: userId } } },
        }),
        this.prisma.event.findMany({
          where: {
            organizerId: userId,
            startDate: { gte: new Date() },
            status: 'PUBLISHED',
          },
          take: 5,
          orderBy: { startDate: 'asc' },
          include: { _count: { select: { registrations: true } } },
        }),
        this.prisma.registration.findMany({
          where: { event: { organizerId: userId } },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, avatar: true } },
            event: { select: { title: true } },
            ticketTier: { select: { name: true } },
          },
        }),
      ]);

    return {
      organizedEvents: eventCount,
      registrations: registrationCount,
      revenue: totalRevenue._sum.amount || 0,
      checkIns: checkInCount,
      upcomingEvents,
      recentRegistrations,
    };
  }

  private async getAttendeeStats(userId: string) {
    const [registrationCount, paymentCount, upcomingEvents, notifications] =
      await Promise.all([
        this.prisma.registration.count({
          where: { userId, status: { in: ['CONFIRMED', 'PENDING'] } },
        }),
        this.prisma.payment.count({
          where: { userId, status: 'COMPLETED' },
        }),
        this.prisma.registration.findMany({
          where: {
            userId,
            status: 'CONFIRMED',
            event: { startDate: { gte: new Date() } },
          },
          take: 5,
          orderBy: { event: { startDate: 'asc' } },
          include: {
            event: { select: { id: true, title: true, startDate: true, venue: true, slug: true } },
            ticketTier: { select: { name: true } },
          },
        }),
        this.prisma.notification.count({
          where: { userId, read: false },
        }),
      ]);

    return {
      registrations: registrationCount,
      payments: paymentCount,
      upcomingEvents,
      unreadNotifications: notifications,
    };
  }
}
