import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('organizer')
  @ApiOperation({ summary: 'Get organizer overview analytics' })
  getOrganizerOverview(@CurrentUser('sub') userId: string) {
    return this.analyticsService.getOrganizerOverview(userId);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get event-specific analytics' })
  getEventAnalytics(@Param('eventId') eventId: string) {
    return this.analyticsService.getEventAnalytics(eventId);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get admin dashboard analytics' })
  getAdminDashboard() {
    return this.analyticsService.getAdminDashboard();
  }
}
