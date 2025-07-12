import { Provide } from '@midwayjs/core';
import { Event } from '../entity/event';
import { CreateEventDTO, EventBriefDTO } from '../dto/event';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
@Provide()
export class EventService {
  @InjectEntityModel(Event)
  eventRepository: Repository<Event>;
  async createEvent(createEventDTO: CreateEventDTO) {
    const newEvent = new Event();
    newEvent.name = createEventDTO.name;
    newEvent.description = createEventDTO.description;
    newEvent.type = createEventDTO.type;
    newEvent.startTime = createEventDTO.startTime;
    newEvent.endTime = createEventDTO.endTime;
    newEvent.location = createEventDTO.location;
    newEvent.organizer = createEventDTO.organizer; // 直接使用User对象

    return await this.eventRepository.save(newEvent);
  }

  async updateEvent(id: number, updateData: Partial<Event>) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new Error('Event not found');
    }
    Object.assign(event, updateData);
    return await this.eventRepository.save(event);
  }

  async deleteEvent(id: number) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new Error('Event not found');
    }
    return await this.eventRepository.remove(event);
  }
}
