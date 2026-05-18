import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOrganizerOverview(organizerId: string) {
    const [events, registrations, revenue, checkIns, recentEvents, activeEvents] =
      await Promise.all([
        this.prisma.event.count({ where: { organizerId } }),
        this.prisma.registration.count({
          where: { event: { organizerId }, status: 'CONFIRMED' },
        }),
        this.prisma.payment.aggregate({
          where: {
            registration: { event: { organizerId } },
            status: 'COMPLETED',
          },
          _sum: { amount: true },
        }),
        this.prisma.checkIn.count({
          where: { registration: { event: { organizerId } } },
        }),
        this.prisma.event.findMany({
          where: { organizerId },
          take: 5,
          orderBy: { startDate: 'desc' },
          include: {
            _count: { select: { registrations: true } },
            ticketTiers: { select: { quantity: true, sold: true } },
          },
        }),
        this.prisma.event.count({
          where: { organizerId, status: 'PUBLISHED' },
        }),
      ]);

    // Real revenue by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPayments = await this.prisma.payment.findMany({
      where: {
        registration: { event: { organizerId } },
        status: 'COMPLETED',
        createdAt: { gte: sevenDaysAgo },
      },
      select: { amount: true, createdAt: true },
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueByDay = dayNames.map((day) => ({ day, value: 0 }));
    recentPayments.forEach((p) => {
      const dayIdx = new Date(p.createdAt).getDay();
      revenueByDay[dayIdx].value += Number(p.amount);
    });

    // Registration timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegs = await this.prisma.registration.findMany({
      where: {
        event: { organizerId },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    });

    const registrationTimeline: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = recentRegs.filter(
        (r) => new Date(r.createdAt).toISOString().split('T')[0] === dateStr,
      ).length;
      registrationTimeline.push({ date: dateStr, count });
    }

    // Ticket type distribution
    const ticketDistribution = await this.prisma.ticketTier.groupBy({
      by: ['type'],
      where: { event: { organizerId } },
      _sum: { sold: true },
    });

    return {
      totalEvents: events,
      activeEvents,
      totalTickets: registrations,
      totalRevenue: revenue._sum.amount || 0,
      totalCheckIns: checkIns,
      conversionRate:
        registrations > 0 ? Math.round((checkIns / registrations) * 100) : 0,
      recentEvents: recentEvents.map((e) => ({
        ...e,
        totalCapacity: e.ticketTiers.reduce((acc, t) => acc + t.quantity, 0),
        totalSold: e.ticketTiers.reduce((acc, t) => acc + t.sold, 0),
      })),
      revenueByDay,
      registrationTimeline,
      ticketDistribution,
    };
  }

  async getEventAnalytics(eventId: string) {
    const [registrations, revenue, checkIns, ticketSales, dailyRegs] =
      await Promise.all([
        this.prisma.registration.groupBy({
          by: ['status'],
          where: { eventId },
          _count: true,
        }),
        this.prisma.payment.aggregate({
          where: { registration: { eventId }, status: 'COMPLETED' },
          _sum: { amount: true },
          _count: true,
        }),
        this.prisma.checkIn.count({ where: { registration: { eventId } } }),
        this.prisma.ticketTier.findMany({
          where: { eventId },
          select: { name: true, quantity: true, sold: true, price: true, type: true },
        }),
        this.prisma.registration.findMany({
          where: { eventId },
          select: { createdAt: true, status: true },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

    // Group registrations by day
    const regByDay: Record<string, number> = {};
    dailyRegs.forEach((r) => {
      const day = new Date(r.createdAt).toISOString().split('T')[0];
      regByDay[day] = (regByDay[day] || 0) + 1;
    });
    const registrationTimeline = Object.entries(regByDay).map(
      ([date, count]) => ({ date, count }),
    );

    return {
      registrationsByStatus: registrations,
      totalRevenue: revenue._sum.amount || 0,
      totalPayments: revenue._count,
      totalCheckIns: checkIns,
      ticketSales,
      registrationTimeline,
    };
  }

  async getAdminDashboard() {
    const [totalUsers, totalEvents, totalRevenue, usersByRole, recentUsers, eventsByStatus] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.event.count(),
        this.prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        this.prisma.user.groupBy({ by: ['role'], _count: true }),
        this.prisma.user.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        }),
        this.prisma.event.groupBy({ by: ['status'], _count: true }),
      ]);

    return {
      totalUsers,
      totalEvents,
      totalRevenue: totalRevenue._sum.amount || 0,
      usersByRole,
      recentUsers,
      eventsByStatus,
    };
  }
}
