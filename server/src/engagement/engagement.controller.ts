import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EngagementService } from './engagement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('engagement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('engagement')
export class EngagementController {
  constructor(private engagementService: EngagementService) {}

  // ─── ANNOUNCEMENTS ──────────────────────────────────────

  @Get('announcements')
  @ApiOperation({ summary: 'Get announcements for organizer events' })
  getAnnouncements(@CurrentUser('sub') userId: string) {
    return this.engagementService.getAnnouncements(userId);
  }

  @Get('announcements/event/:eventId')
  @ApiOperation({ summary: 'Get announcements for a specific event' })
  getEventAnnouncements(@Param('eventId') eventId: string) {
    return this.engagementService.getEventAnnouncements(eventId);
  }

  @Post('announcements')
  @ApiOperation({ summary: 'Create a new announcement' })
  createAnnouncement(
    @CurrentUser('sub') userId: string,
    @Body() data: { eventId: string; title: string; content: string; priority?: string },
  ) {
    return this.engagementService.createAnnouncement(userId, data);
  }

  @Delete('announcements/:id')
  @ApiOperation({ summary: 'Delete an announcement' })
  deleteAnnouncement(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.engagementService.deleteAnnouncement(id, userId);
  }

  // ─── POLLS ──────────────────────────────────────────────

  @Get('polls')
  @ApiOperation({ summary: 'Get polls for organizer events' })
  getPolls(@CurrentUser('sub') userId: string) {
    return this.engagementService.getPolls(userId);
  }

  @Get('polls/event/:eventId')
  @ApiOperation({ summary: 'Get polls for a specific event' })
  getEventPolls(@Param('eventId') eventId: string) {
    return this.engagementService.getEventPolls(eventId);
  }

  @Post('polls')
  @ApiOperation({ summary: 'Create a new poll' })
  createPoll(
    @CurrentUser('sub') userId: string,
    @Body()
    data: { eventId: string; question: string; options: string[]; endsAt?: string },
  ) {
    return this.engagementService.createPoll(userId, data);
  }

  @Post('polls/:pollId/vote')
  @ApiOperation({ summary: 'Vote on a poll' })
  votePoll(
    @CurrentUser('sub') userId: string,
    @Param('pollId') pollId: string,
    @Body('optionId') optionId: string,
  ) {
    return this.engagementService.votePoll(userId, pollId, optionId);
  }

  @Patch('polls/:pollId/close')
  @ApiOperation({ summary: 'Close a poll' })
  closePoll(
    @Param('pollId') pollId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.engagementService.closePoll(pollId, userId);
  }

  @Delete('polls/:pollId')
  @ApiOperation({ summary: 'Delete a poll' })
  deletePoll(
    @Param('pollId') pollId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.engagementService.deletePoll(pollId, userId);
  }
}
