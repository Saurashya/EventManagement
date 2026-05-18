import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get ticket tiers for an event' })
  getEventTiers(@Param('eventId') eventId: string) {
    return this.ticketsService.getEventTiers(eventId);
  }

  @Post('event/:eventId/tier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a ticket tier' })
  createTier(@Param('eventId') eventId: string, @Body() data: any) {
    return this.ticketsService.createTier(eventId, data);
  }

  @Patch('tier/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a ticket tier' })
  updateTier(@Param('id') id: string, @Body() data: any) {
    return this.ticketsService.updateTier(id, data);
  }

  @Delete('tier/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a ticket tier' })
  deleteTier(@Param('id') id: string) {
    return this.ticketsService.deleteTier(id);
  }

  // Promo Codes
  @Post('event/:eventId/promo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a promo code' })
  createPromo(@Param('eventId') eventId: string, @Body() data: any) {
    return this.ticketsService.createPromoCode(eventId, data);
  }

  @Get('event/:eventId/promos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List promo codes for an event' })
  getPromos(@Param('eventId') eventId: string) {
    return this.ticketsService.getEventPromoCodes(eventId);
  }

  @Post('event/:eventId/promo/validate')
  @ApiOperation({ summary: 'Validate a promo code' })
  validatePromo(@Param('eventId') eventId: string, @Body('code') code: string) {
    return this.ticketsService.validatePromoCode(eventId, code);
  }
}
