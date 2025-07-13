import { Provide } from '@midwayjs/core';
import { Event } from '../entity/event';
import { User } from '../entity/user';
import { CreateEventDTO, HTMLRenderEventDTO } from '../dto/event';
import { UserBriefDTO } from '../dto/user';
import { CommentBriefDTO } from '../dto/comment';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
@Provide()
export class EventService {
  @InjectEntityModel(Event)
  eventRepository: Repository<Event>;

  @InjectEntityModel(User)
  userRepository: Repository<User>;

  async createEvent(createEventDTO: CreateEventDTO) {
    const newEvent = new Event();
    newEvent.name = createEventDTO.name;
    newEvent.description = createEventDTO.description;
    newEvent.type = createEventDTO.type;
    newEvent.startTime = createEventDTO.startTime;
    newEvent.endTime = createEventDTO.endTime;
    newEvent.location = createEventDTO.location;
    newEvent.participantsMaxCount = createEventDTO.participantsMaxCount;
    newEvent.organizer = await this.userRepository.findOne({
      where: { id: createEventDTO.organizerId },
    });

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
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants'],
    });
    if (!event) {
      throw new Error('Event not found');
    }
    event.participants.forEach(participant => {
      participant.joinEvents = participant.joinEvents.filter(
        e => e.id !== event.id
      );
    });
    event.organizer.hostEvents = event.organizer.hostEvents.filter(
      e => e.id !== event.id
    );
    return await this.eventRepository.remove(event);
  }
  async getEvent(id: number) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants', 'comments'],
    });
    if (!event) {
      throw new Error('Event not found');
    }
    const eventDTO = new HTMLRenderEventDTO();
    eventDTO.id = event.id;
    eventDTO.name = event.name;
    eventDTO.description = event.description;
    eventDTO.type = event.type;
    eventDTO.startTime = event.startTime;
    eventDTO.endTime = event.endTime;
    eventDTO.location = event.location;
    eventDTO.participantsMaxCount = event.participantsMaxCount;
    eventDTO.organizer = {
      id: event.organizer.id,
      username: event.organizer.username,
      email: event.organizer.email,
    } as UserBriefDTO; // 确保User对象符合UserBriefDTO结构
    eventDTO.participants = event.participants.map(
      participant =>
        ({
          id: participant.id,
          username: participant.username,
          email: participant.email,
        } as UserBriefDTO)
    );
    eventDTO.comments = event.comments.map(
      comment =>
        ({
          id: comment.id,
          content: comment.content,
          user: {
            id: comment.user.id,
            username: comment.user.username,
            email: comment.user.email,
          } as UserBriefDTO,
          createTime: comment.createTime,
        } as CommentBriefDTO)
    );
    eventDTO.createTime = event.createTime;
    eventDTO.updateTime = event.updateTime;
    return eventDTO;
  }
}
