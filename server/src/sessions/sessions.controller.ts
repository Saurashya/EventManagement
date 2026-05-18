import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all sessions for an event' })
  getEventSessions(@Param('eventId') eventId: string) {
    return this.sessionsService.getEventSessions(eventId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a session' })
  createSession(
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.sessionsService.createSession(userId, data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a session' })
  updateSession(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.sessionsService.updateSession(id, userId, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a session' })
  deleteSession(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.sessionsService.deleteSession(id, userId);
  }
}
