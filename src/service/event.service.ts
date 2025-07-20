import { Provide } from '@midwayjs/core';
import { Event } from '../entity/event';
import { User } from '../entity/user';
import { Comment } from '../entity/comment';
import {
  CreateEventDTO,
  HTMLRenderEventDTO,
  EventFilterDTO,
  EventBriefDTO,
} from '../dto/event';
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

  @InjectEntityModel(Comment)
  commentRepository: Repository<Comment>;

  async createEvent(createEventDTO: CreateEventDTO) {
    const newEvent = new Event();
    newEvent.name = createEventDTO.name;
    newEvent.description = createEventDTO.description;
    newEvent.type = createEventDTO.type;
    newEvent.startTime = new Date(createEventDTO.startTime);
    newEvent.endTime = new Date(createEventDTO.endTime);
    newEvent.registerEndTime = new Date(createEventDTO.registerEndTime);
    newEvent.location = createEventDTO.location;
    newEvent.participantsMaxCount = createEventDTO.participantsMaxCount;
    newEvent.organizer = await this.userRepository.findOne({
      where: { id: createEventDTO.organizerId },
    });

    return await this.eventRepository.save(newEvent);
  }

  async createEventComment(eventId: number, userId: number, content: string) {
    let comment = new Comment();
    comment.content = content;
    comment.event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    comment.user = await this.userRepository.findOne({
      where: { id: userId },
    });
    comment = await this.commentRepository.save(comment);
    const commentBriefDTO = new CommentBriefDTO();
    commentBriefDTO.content = content;
    commentBriefDTO.user = new UserBriefDTO();
    commentBriefDTO.user.id = userId;
    commentBriefDTO.user.username = comment.user.username;
    commentBriefDTO.id = comment.id;
    commentBriefDTO.createTime = comment.createTime;
    return commentBriefDTO;
  }

  async updateEventComment(commentId: number, content: string) {
    const updateComment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });
    if (!updateComment) throw new Error('comment not found');
    updateComment.content = content;
    const comment = await this.commentRepository.save(updateComment);
    const commentBriefDTO = new CommentBriefDTO();
    commentBriefDTO.content = content;
    commentBriefDTO.user = new UserBriefDTO();
    commentBriefDTO.user.id = comment.user.id;
    commentBriefDTO.user.username = comment.user.username;
    commentBriefDTO.id = comment.id;
    commentBriefDTO.createTime = comment.createTime;
    return commentBriefDTO;
  }

  async deleteEventComment(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: id },
    });
    return await this.commentRepository.remove(comment);
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
    if (event.participants) {
      event.participants.forEach(participant => {
        if (participant.joinEvents) {
          participant.joinEvents = participant.joinEvents.filter(
            e => e.id !== event.id
          );
        }
      });
    }
    if (event.organizer.hostEvents) {
      event.organizer.hostEvents = event.organizer.hostEvents.filter(
        e => e.id !== event.id
      );
    }
    return await this.eventRepository.remove(event);
  }

  async getEvent(id: number) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants', 'comments', 'comments.user'],
    });
    if (!event) {
      throw new Error('Event not found');
    }
    const eventDTO = new HTMLRenderEventDTO();
    eventDTO.id = event.id;
    eventDTO.name = event.name;
    eventDTO.description = event.description;
    eventDTO.type = event.type;
    eventDTO.startTime = event.startTime.toISOString();
    eventDTO.endTime = event.endTime.toISOString();
    eventDTO.location = event.location;
    eventDTO.participantsMaxCount = event.participantsMaxCount;
    eventDTO.registerEndTime = event.registerEndTime.toISOString();
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
          } as UserBriefDTO,
          createTime: comment.createTime,
        } as CommentBriefDTO)
    );
    eventDTO.createTime = event.createTime;
    eventDTO.updateTime = event.updateTime;
    return eventDTO;
  }

  async getEventBriefPartlyfilter(
    filter: EventFilterDTO,
    page = 1,
    pageSize = 10,
    sortField:
      | 'startTime'
      | 'participantsMaxCount'
      | 'createTime' = 'startTime',
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    userId: number
  ) {
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer');

    // 添加 isParticipating 子查询
    const subQuery = this.eventRepository
      .createQueryBuilder()
      .select('1')
      .from('users_join_events_events', 'u')
      .where('u.eventsId = event.id')
      .andWhere('u.usersId = :userId');

    queryBuilder
      .addSelect(`(${subQuery.getQuery()})`, 'isParticipating')
      .setParameter('userId', userId);

    queryBuilder.select([
      'event.id',
      'event.startTime',
      'event.endTime',
      'event.location',
      'event.name',
      'event.participantsMaxCount',
      'organizer.id',
    ]);

    // 添加过滤条件
    if (filter.name) {
      queryBuilder.andWhere('event.name LIKE :name', {
        name: `%${filter.name}%`,
      });
    }

    if (filter.type) {
      queryBuilder.andWhere('event.type = :type', { type: filter.type });
    }

    if (filter.location) {
      queryBuilder.andWhere('event.location LIKE :location', {
        location: `%${filter.location}%`,
      });
    }

    if (filter.startTime) {
      const Start = new Date(filter.startTime);
      queryBuilder.andWhere('event.startTime >= :startTime', {
        startTime: Start.toISOString(),
      });
    }

    if (filter.endTime) {
      const End = new Date(filter.endTime);
      queryBuilder.andWhere('event.endTime <= :endTime', {
        endTime: End.toISOString(),
      });
    }

    if (filter.isNotFull) {
      // 使用子查询统计参与者数量，避免与主查询的GROUP BY冲突
      queryBuilder.addSelect(
        '(SELECT COUNT(*) FROM user_event WHERE user_event.eventId = event.id)',
        'participantCount'
      );

      // 使用HAVING过滤未满员的活动
      queryBuilder.having('participantCount < event.participantsMaxCount');
    }

    // 添加排序和分页
    queryBuilder
      .orderBy(`event.${sortField}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const sql = queryBuilder.getSql();
    const params = queryBuilder.getParameters();
    console.log('Executed SQL:', sql);
    console.log('Query Parameters:', params);
    const [list, total] = await queryBuilder.getManyAndCount();

    const joinedEventIds = new Set<number>();
    if (list.length > 0) {
      const ids = list.map(e => e.id);
      const rows = await this.eventRepository.query(
        `SELECT eventsId FROM users_join_events_events
     WHERE usersId = ? AND eventsId IN (?)`,
        [userId, ids]
      );
      rows.forEach((row: any) => joinedEventIds.add(row.eventsId));
    }

    if (list.length === 0) throw new Error(`${filter}`);
    const briefEventList = list.map(event => {
      const briefEvent = new EventBriefDTO();
      briefEvent.endTime = event.endTime.toISOString();
      briefEvent.startTime = event.startTime.toISOString();
      briefEvent.id = event.id;
      briefEvent.location = event.location;
      briefEvent.name = event.name;
      briefEvent.registerEndTime = event.registerEndTime.toISOString();
      if (event.organizer.id === userId) {
        briefEvent.state = 'host';
      } else if (joinedEventIds.has(event.id)) {
        briefEvent.state = 'join';
      } else {
        briefEvent.state = 'toJoin';
      }
      return briefEvent;
    });
    return { briefEventList, total };
  }
}
