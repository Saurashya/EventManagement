import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

type StripeInstance = InstanceType<typeof Stripe>;

@Injectable()
export class PaymentsService {
  private _stripe: StripeInstance | null = null;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private get stripe(): StripeInstance {
    if (!this._stripe) {
      const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
      if (!secretKey) {
        throw new BadRequestException(
          'Stripe is not configured. Please set STRIPE_SECRET_KEY in .env',
        );
      }
      this._stripe = new Stripe(secretKey);
    }
    return this._stripe;
  }

  /**
   * Creates a Stripe Checkout Session for a paid ticket.
   * Also creates a PENDING registration and payment record.
   */
  async createCheckoutSession(
    userId: string,
    data: {
      eventId: string;
      ticketTierId: string;
      promoCode?: string;
      paymentMethod?: 'stripe' | 'manual';
    },
  ) {
    // Check if already registered
    const existing = await this.prisma.registration.findUnique({
      where: { userId_eventId: { userId, eventId: data.eventId } },
    });
    if (existing) throw new BadRequestException('Already registered for this event');

    // Get ticket tier
    const tier = await this.prisma.ticketTier.findUnique({
      where: { id: data.ticketTierId },
    });
    if (!tier) throw new NotFoundException('Ticket tier not found');
    if (tier.sold >= tier.quantity) throw new BadRequestException('Tickets sold out');

    // Get event
    const event = await this.prisma.event.findUnique({
      where: { id: data.eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    // Check capacity
    if (event.capacity) {
      const regCount = await this.prisma.registration.count({
        where: { eventId: data.eventId, status: { in: ['CONFIRMED', 'PENDING'] } },
      });
      if (regCount >= event.capacity) throw new BadRequestException('Event at full capacity');
    }

    // Calculate price
    let amount = Number(tier.price);

    if (data.promoCode) {
      const promo = await this.prisma.promoCode.findFirst({
        where: { eventId: data.eventId, code: data.promoCode, isActive: true },
      });
      if (promo && promo.usedCount < promo.maxUses && new Date() <= promo.validUntil) {
        if (promo.discountType === 'PERCENTAGE') {
          amount = amount * (1 - Number(promo.discountValue) / 100);
        } else {
          amount = Math.max(0, amount - Number(promo.discountValue));
        }
      }
    }

    // If free ticket, skip Stripe — register directly
    if (amount === 0) {
      const qrCode = `EP-${uuidv4().substring(0, 8).toUpperCase()}`;
      const registration = await this.prisma.registration.create({
        data: {
          userId,
          eventId: data.eventId,
          ticketTierId: data.ticketTierId,
          qrCode,
          amount: 0,
          status: 'CONFIRMED',
        },
        include: {
          event: { select: { id: true, title: true, startDate: true, venue: true } },
          ticketTier: { select: { name: true, price: true } },
        },
      });

      await this.prisma.ticketTier.update({
        where: { id: data.ticketTierId },
        data: { sold: { increment: 1 } },
      });

      return { type: 'free', registration };
    }

    // --- MANUAL PAYMENT ---
    if (data.paymentMethod === 'manual') {
      const qrCode = `EP-${uuidv4().substring(0, 8).toUpperCase()}`;
      const registration = await this.prisma.registration.create({
        data: {
          userId,
          eventId: data.eventId,
          ticketTierId: data.ticketTierId,
          qrCode,
          amount,
          status: 'PENDING',
        },
        include: {
          event: { select: { id: true, title: true, startDate: true, venue: true } },
          ticketTier: { select: { name: true, price: true } },
        },
      });

      // Create a payment record marked as PENDING for manual verification
      const transactionId = `MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await this.prisma.payment.create({
        data: {
          registrationId: registration.id,
          userId,
          amount,
          currency: 'NPR',
          provider: 'KHALTI', // Using KHALTI as the manual/local provider
          status: 'PENDING',
          transactionId,
          metadata: { method: 'manual', note: 'Awaiting organizer confirmation' },
        },
      });

      await this.prisma.ticketTier.update({
        where: { id: data.ticketTierId },
        data: { sold: { increment: 1 } },
      });

      return {
        type: 'manual',
        registration,
        message: 'Registration created. Please complete payment as instructed by the organizer.',
      };
    }

    // --- STRIPE PAYMENT ---
    const qrCode = `EP-${uuidv4().substring(0, 8).toUpperCase()}`;
    const registration = await this.prisma.registration.create({
      data: {
        userId,
        eventId: data.eventId,
        ticketTierId: data.ticketTierId,
        qrCode,
        amount,
        status: 'PENDING',
      },
    });

    // Create PENDING payment record
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const payment = await this.prisma.payment.create({
      data: {
        registrationId: registration.id,
        userId,
        amount,
        currency: 'NPR',
        provider: 'STRIPE',
        status: 'PENDING',
        transactionId,
      },
    });

    // Create Stripe Checkout Session
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd', // Stripe sandbox uses USD
            product_data: {
              name: `${tier.name} — ${event.title}`,
              description: tier.description || `Ticket for ${event.title}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        registrationId: registration.id,
        paymentId: payment.id,
        userId,
        eventId: data.eventId,
        ticketTierId: data.ticketTierId,
      },
      success_url: `${frontendUrl}/dashboard/tickets?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/events/${event.slug}?payment=cancelled`,
    });

    // Store the Stripe session ID in payment metadata
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        metadata: { stripeSessionId: session.id },
      },
    });

    return {
      type: 'checkout',
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let stripeEvent: any;

    try {
      stripeEvent = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret || '');
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      await this.fulfillOrder(session);
    }

    return { received: true };
  }

  /**
   * Called after Stripe confirms payment — marks everything as CONFIRMED
   */
  private async fulfillOrder(session: any) {
    const registrationId = session.metadata?.registrationId;
    const paymentId = session.metadata?.paymentId;

    if (!registrationId || !paymentId) {
      this.logger.warn('Webhook missing metadata, skipping');
      return;
    }

    // Update payment to COMPLETED
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        transactionId: session.payment_intent as string,
        metadata: {
          stripeSessionId: session.id,
          stripePaymentIntent: session.payment_intent,
        },
      },
    });

    // Confirm the registration
    await this.prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'CONFIRMED' },
    });

    // Increment sold count
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
    });
    if (registration) {
      await this.prisma.ticketTier.update({
        where: { id: registration.ticketTierId },
        data: { sold: { increment: 1 } },
      });
    }

    this.logger.log(`✅ Order fulfilled for registration ${registrationId}`);
  }

  /**
   * Create a Stripe Checkout Session for an existing PENDING registration
   */
  async payPendingRegistration(userId: string, registrationId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        ticketTier: true,
        payment: true,
      },
    });

    if (!registration) throw new NotFoundException('Registration not found');
    if (registration.userId !== userId)
      throw new BadRequestException('This is not your registration');
    if (registration.status !== 'PENDING')
      throw new BadRequestException('Registration is not pending');

    const amount = Number(registration.amount);
    if (amount === 0)
      throw new BadRequestException('This is a free ticket — no payment needed');

    // If there's already a COMPLETED payment, skip
    if (registration.payment && registration.payment.status === 'COMPLETED')
      throw new BadRequestException('Payment already completed');

    // Delete existing PENDING payment (manual) so we can create a Stripe one
    if (registration.payment) {
      await this.prisma.payment.delete({ where: { id: registration.payment.id } });
    }

    // Create new PENDING payment record for Stripe
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const payment = await this.prisma.payment.create({
      data: {
        registrationId: registration.id,
        userId,
        amount,
        currency: 'NPR',
        provider: 'STRIPE',
        status: 'PENDING',
        transactionId,
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${registration.ticketTier.name} — ${registration.event.title}`,
              description: registration.ticketTier.description || `Ticket for ${registration.event.title}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        registrationId: registration.id,
        paymentId: payment.id,
        userId,
        eventId: registration.eventId,
        ticketTierId: registration.ticketTierId,
      },
      success_url: `${frontendUrl}/dashboard/tickets?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/dashboard/tickets?payment=cancelled`,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { metadata: { stripeSessionId: session.id } },
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  /**
   * Verify payment by checking the Stripe session status (manual check from frontend)
   */
  async verifySession(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // If the webhook hasn't fired yet, fulfill now
      const paymentId = session.metadata?.paymentId;
      if (paymentId) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (payment && payment.status === 'PENDING') {
          await this.fulfillOrder(session);
        }
      }
      return { status: 'paid', registrationId: session.metadata?.registrationId };
    }

    return { status: session.payment_status };
  }

  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        registration: {
          include: {
            event: { select: { id: true, title: true, slug: true } },
            ticketTier: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEventPayments(eventId: string) {
    return this.prisma.payment.findMany({
      where: { registration: { eventId } },
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true } },
            ticketTier: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async refundPayment(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { registration: { include: { event: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.registration.event.organizerId !== userId)
      throw new BadRequestException('Not your event');
    if (payment.status !== 'COMPLETED')
      throw new BadRequestException('Can only refund completed payments');

    // Attempt Stripe refund if there's a payment intent
    const metadata = payment.metadata as Record<string, any> | null;
    if (metadata?.stripePaymentIntent) {
      try {
        await this.stripe.refunds.create({
          payment_intent: metadata.stripePaymentIntent,
        });
      } catch (err) {
        this.logger.error(`Stripe refund failed: ${err}`);
      }
    }

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });

    await this.prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: 'REFUNDED' },
    });

    return updated;
  }

  async getRevenueStats(organizerId: string) {
    const [totalRevenue, monthlyRevenue, paymentsByProvider] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          registration: { event: { organizerId } },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.findMany({
        where: {
          registration: { event: { organizerId } },
          status: 'COMPLETED',
          createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
        },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.payment.groupBy({
        by: ['provider'],
        where: {
          registration: { event: { organizerId } },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTransactions: totalRevenue._count,
      monthlyRevenue,
      paymentsByProvider,
    };
  }
}
