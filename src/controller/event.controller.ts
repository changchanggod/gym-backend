import {
  Inject,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { Event } from '../entity/event';
import { EventService } from '../service/event.service';
import { CreateEventDTO, HTMLRenderEventDTO } from '../dto/event';
import { Del } from '@midwayjs/core';
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
