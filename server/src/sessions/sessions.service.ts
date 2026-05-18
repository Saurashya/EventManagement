import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async getEventSessions(eventId: string) {
    return this.prisma.session.findMany({
      where: { eventId },
      orderBy: { startTime: 'asc' },
    });
  }

  async createSession(
    organizerId: string,
    data: {
      eventId: string;
      title: string;
      description?: string;
      speaker?: string;
      speakerBio?: string;
      speakerAvatar?: string;
      room?: string;
      startTime: string;
      endTime: string;
    },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: data.eventId },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId)
      throw new ForbiddenException('Not your event');

    return this.prisma.session.create({
      data: {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
      },
    });
  }

  async updateSession(
    id: string,
    organizerId: string,
    data: any,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.event.organizerId !== organizerId)
      throw new ForbiddenException('Not your event');

    const updateData: any = { ...data };
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);

    return this.prisma.session.update({ where: { id }, data: updateData });
  }

  async deleteSession(id: string, organizerId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.event.organizerId !== organizerId)
      throw new ForbiddenException('Not your event');

    await this.prisma.session.delete({ where: { id } });
    return { message: 'Session deleted' };
  }
}
