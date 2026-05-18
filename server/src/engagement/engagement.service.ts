import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EngagementService {
  constructor(private prisma: PrismaService) {}

  // ─── ANNOUNCEMENTS ──────────────────────────────────────

  async getAnnouncements(userId: string) {
    return this.prisma.announcement.findMany({
      where: { event: { organizerId: userId } },
      include: { event: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEventAnnouncements(eventId: string) {
    return this.prisma.announcement.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAnnouncement(
    userId: string,
    data: { eventId: string; title: string; content: string; priority?: string },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: data.eventId },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== userId)
      throw new ForbiddenException('Not your event');

    return this.prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority || 'NORMAL',
        eventId: data.eventId,
      },
    });
  }

  async deleteAnnouncement(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    if (announcement.event.organizerId !== userId)
      throw new ForbiddenException('Not your announcement');

    await this.prisma.announcement.delete({ where: { id } });
    return { message: 'Announcement deleted' };
  }

  // ─── POLLS ──────────────────────────────────────────────

  async getPolls(userId: string) {
    const polls = await this.prisma.poll.findMany({
      where: { event: { organizerId: userId } },
      include: {
        _count: { select: { votes: true } },
        event: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      polls.map(async (poll) => {
        const voteCounts = await this.prisma.pollVote.groupBy({
          by: ['optionId'],
          where: { pollId: poll.id },
          _count: true,
        });

        const voteMap = new Map(
          voteCounts.map((v) => [v.optionId, v._count]),
        );

        return {
          ...poll,
          totalVotes: poll._count.votes,
          options: (poll.options as any[]).map((opt) => ({
            ...opt,
            votes: voteMap.get(opt.id) || 0,
          })),
        };
      }),
    );
  }

  async getEventPolls(eventId: string) {
    const polls = await this.prisma.poll.findMany({
      where: { eventId },
      include: { _count: { select: { votes: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      polls.map(async (poll) => {
        const voteCounts = await this.prisma.pollVote.groupBy({
          by: ['optionId'],
          where: { pollId: poll.id },
          _count: true,
        });

        const voteMap = new Map(
          voteCounts.map((v) => [v.optionId, v._count]),
        );

        return {
          ...poll,
          totalVotes: poll._count.votes,
          options: (poll.options as any[]).map((opt) => ({
            ...opt,
            votes: voteMap.get(opt.id) || 0,
          })),
        };
      }),
    );
  }

  async createPoll(
    userId: string,
    data: {
      eventId: string;
      question: string;
      options: string[];
      endsAt?: string;
    },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: data.eventId },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== userId)
      throw new ForbiddenException('Not your event');

    if (!data.options || data.options.length < 2)
      throw new BadRequestException('At least 2 options required');

    const options = data.options.map((text, i) => ({
      id: `opt_${Date.now()}_${i}`,
      text,
    }));

    return this.prisma.poll.create({
      data: {
        question: data.question,
        options: options as any,
        eventId: data.eventId,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      },
    });
  }

  async votePoll(userId: string, pollId: string, optionId: string) {
    const poll = await this.prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    if (!poll.isActive) throw new BadRequestException('Poll is closed');
    if (poll.endsAt && new Date() > poll.endsAt)
      throw new BadRequestException('Poll has ended');

    const options = poll.options as any[];
    if (!options.find((o: any) => o.id === optionId))
      throw new BadRequestException('Invalid option');

    const existing = await this.prisma.pollVote.findUnique({
      where: { pollId_userId: { pollId, userId } },
    });
    if (existing) throw new BadRequestException('Already voted');

    return this.prisma.pollVote.create({
      data: { pollId, userId, optionId },
    });
  }

  async closePoll(pollId: string, userId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { event: { select: { organizerId: true } } },
    });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.event.organizerId !== userId)
      throw new ForbiddenException('Not your poll');

    return this.prisma.poll.update({
      where: { id: pollId },
      data: { isActive: false },
    });
  }

  async deletePoll(pollId: string, userId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { event: { select: { organizerId: true } } },
    });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.event.organizerId !== userId)
      throw new ForbiddenException('Not your poll');

    await this.prisma.poll.delete({ where: { id: pollId } });
    return { message: 'Poll deleted' };
  }
}
