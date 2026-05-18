import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private registrationsService: RegistrationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register for an event' })
  register(@CurrentUser('sub') userId: string, @Body() data: any) {
    return this.registrationsService.register(userId, data);
  }

  @Get('my-registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user registrations' })
  getMyRegistrations(@CurrentUser('sub') userId: string) {
    return this.registrationsService.getUserRegistrations(userId);
  }

  @Get('my-events-registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get registrations for current organizer's events" })
  getMyEventsRegistrations(@CurrentUser('sub') userId: string) {
    return this.registrationsService.getOrganizerRegistrations(userId);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get registrations for an event' })
  getEventRegistrations(
    @Param('eventId') eventId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.registrationsService.getEventRegistrations(
      eventId,
      page,
      limit,
    );
  }

  @Get('qr/:qrCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get registration by QR code' })
  getByQr(@Param('qrCode') qrCode: string) {
    return this.registrationsService.getRegistrationByQr(qrCode);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel registration' })
  cancel(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.registrationsService.cancelRegistration(id, userId);
  }
}
