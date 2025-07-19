import {
  Inject,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { Event } from '../entity/event';
import { EventService } from '../service/event.service';
import {
  CreateEventDTO,
  HTMLRenderEventDTO,
  EventFilterDTO,
} from '../dto/event';
import { Del } from '@midwayjs/core';
import { EventType } from '../fixed-data/event-type';
@Controller('/api/event')
export class EventController {
  @Inject()
  ctx: Context;

  @Inject()
  eventService: EventService;

  @Get('/:id')
  async getEvent(@Param('id') id: number) {
    try {
      const event: HTMLRenderEventDTO = await this.eventService.getEvent(id);
      return { success: true, message: 'OK', data: event };
    } catch (error) {
      return { success: false, message: error.message, code: 404 };
    }
  }

  @Get('/eventBriefPartly')
  async getEventBriefPartlyfilter(
    @Query('name') name: string,
    @Query('type') type: string,
    @Query('location') location: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('isNotFull') isNotFull: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('sortField')
    sortField:
      | 'startTime'
      | 'participantsMaxCount'
      | 'createTime' = 'startTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('userId') userId: number
  ) {
    try {
      const filter = new EventFilterDTO();
      filter.name = name;
      filter.location = location;
      filter.endTime = endTime;
      filter.startTime = startTime;
      filter.isNotFull = isNotFull === 'true';
      switch (type) {
        case 'athletics':
          filter.type = EventType.ATHLETICS;
          break;
        case 'ballGames':
          filter.type = EventType.BALLGAMES;
          break;
        case 'waterSports':
          filter.type = EventType.WATERSPORTS;
          break;
        case 'combatSports':
          filter.type = EventType.COMBATSPORTS;
          break;
        case 'extremeSports':
          filter.type = EventType.EXTREMESPORTS;
          break;
        case 'other':
          filter.type = EventType.OTHER;
          break;
      }
      const data = await this.eventService.getEventBriefPartlyfilter(
        filter,
        page,
        pageSize,
        sortField,
        sortOrder,
        userId
      );
      if (data)
        return {
          success: true,
          message: 'EventList get successfully',
          data: data,
        };
      else
        return {
          success: false,
          message: 'EventList get failed',
        };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post()
  async createEvent(@Body() createEventDTO: CreateEventDTO) {
    try {
      const newEvent = await this.eventService.createEvent(createEventDTO);
      return {
        success: true,
        message: 'Event created successfully',
        data: newEvent,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('/comment')
  async createEventComment(
    @Body('userId') userId: number,
    @Body('eventId') eventId: number,
    @Body('commentContent') content: string
  ) {
    try {
      const comment = await this.eventService.createEventComment(
        eventId,
        userId,
        content
      );
      if (comment) {
        return {
          success: true,
          message: 'comment create success',
          data: comment,
        };
      } else return { success: false, message: 'comment create fail' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'comment create fail',
      };
    }
  }

  @Patch('/:id')
  async updateEvent(
    @Param('id') id: number,
    @Body() updateData: Partial<Event>
  ) {
    try {
      const updatedEvent = await this.eventService.updateEvent(id, updateData);
      return {
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Del('/:id')
  async deleteEvent(@Param('id') id: number) {
    try {
      await this.eventService.deleteEvent(id);
      return { success: true, message: 'Event deleted successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
