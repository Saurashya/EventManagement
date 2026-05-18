import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { CheckinModule } from './checkin/checkin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EngagementModule } from './engagement/engagement.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SessionsModule } from './sessions/sessions.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    TicketsModule,
    RegistrationsModule,
    CheckinModule,
    AnalyticsModule,
    EngagementModule,
    NotificationsModule,
    SessionsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
