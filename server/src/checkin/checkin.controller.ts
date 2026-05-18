import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('checkin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkin')
export class CheckinController {
  constructor(private checkinService: CheckinService) {}

  @Post('qr')
  @ApiOperation({ summary: 'Check in attendee via QR code' })
  checkInByQr(
    @Body('qrCode') qrCode: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.checkinService.checkInByQr(qrCode, userId);
  }

  @Post('manual')
  @ApiOperation({ summary: 'Manually check in an attendee' })
  manualCheckIn(
    @Body('code') code: string,
    @Body('notes') notes: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.checkinService.manualCheckIn(code, userId, notes);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all check-ins for an event' })
  getEventCheckIns(@Param('eventId') eventId: string) {
    return this.checkinService.getEventCheckIns(eventId);
  }

  @Get('event/:eventId/stats')
  @ApiOperation({ summary: 'Get check-in statistics' })
  getStats(@Param('eventId') eventId: string) {
    return this.checkinService.getCheckInStats(eventId);
  }
}
