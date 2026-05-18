import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async createTier(
    eventId: string,
    data: {
      name: string;
      description?: string;
      price: number;
      quantity: number;
      type: string;
      earlyBirdPrice?: number;
      earlyBirdEndDate?: string;
      sortOrder?: number;
    },
  ) {
    const tierData: any = {
      ...data,
      eventId,
      earlyBirdEndDate: data.earlyBirdEndDate
        ? new Date(data.earlyBirdEndDate)
        : undefined,
    };
    return this.prisma.ticketTier.create({
      data: tierData,
    });
  }

  async updateTier(id: string, data: any) {
    const tier = await this.prisma.ticketTier.findUnique({ where: { id } });
    if (!tier) throw new NotFoundException('Ticket tier not found');
    return this.prisma.ticketTier.update({ where: { id }, data });
  }

  async deleteTier(id: string) {
    await this.prisma.ticketTier.delete({ where: { id } });
    return { message: 'Ticket tier deleted' };
  }

  async getEventTiers(eventId: string) {
    return this.prisma.ticketTier.findMany({
      where: { eventId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Promo codes
  async createPromoCode(
    eventId: string,
    data: {
      code: string;
      discountType: string;
      discountValue: number;
      maxUses: number;
      validUntil: string;
    },
  ) {
    return this.prisma.promoCode.create({
      data: {
        ...data,
        eventId,
        validUntil: new Date(data.validUntil),
      },
    });
  }

  async validatePromoCode(eventId: string, code: string) {
    const promo = await this.prisma.promoCode.findFirst({
      where: { eventId, code, isActive: true },
    });

    if (!promo) throw new NotFoundException('Promo code not found');
    if (promo.usedCount >= promo.maxUses)
      throw new BadRequestException('Promo code fully used');
    if (new Date() > promo.validUntil)
      throw new BadRequestException('Promo code expired');

    return promo;
  }

  async getEventPromoCodes(eventId: string) {
    return this.prisma.promoCode.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
