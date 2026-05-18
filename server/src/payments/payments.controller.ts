import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * Create a Stripe Checkout Session for purchasing a ticket
   */
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session for ticket purchase' })
  createCheckoutSession(
    @CurrentUser('sub') userId: string,
    @Body() data: { eventId: string; ticketTierId: string; promoCode?: string; paymentMethod?: 'stripe' | 'manual' },
  ) {
    return this.paymentsService.createCheckoutSession(userId, data);
  }

  /**
   * Stripe Webhook — no auth guard, uses Stripe signature verification
   */
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new Error('Raw body is missing — ensure rawBody parsing is enabled');
    }
    return this.paymentsService.handleStripeWebhook(rawBody, signature);
  }

  /**
   * Pay for an existing PENDING registration via Stripe
   */
  @Post('pay-pending/:registrationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pay for a pending registration via Stripe' })
  payPendingRegistration(
    @CurrentUser('sub') userId: string,
    @Param('registrationId') registrationId: string,
  ) {
    return this.paymentsService.payPendingRegistration(userId, registrationId);
  }

  /**
   * Verify a checkout session status (called by frontend after redirect)
   */
  @Get('verify-session/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Stripe checkout session' })
  verifySession(@Param('sessionId') sessionId: string) {
    return this.paymentsService.verifySession(sessionId);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user payments' })
  getUserPayments(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getUserPayments(userId);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payments for an event' })
  getEventPayments(@Param('eventId') eventId: string) {
    return this.paymentsService.getEventPayments(eventId);
  }

  @Post(':paymentId/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a payment' })
  refundPayment(
    @Param('paymentId') paymentId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.refundPayment(paymentId, userId);
  }

  @Get('revenue-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue statistics' })
  getRevenueStats(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getRevenueStats(userId);
  }
}
