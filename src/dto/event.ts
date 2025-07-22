import { Rule, RuleType } from '@midwayjs/validate';
import { EventType } from '../fixed-data/event-type';
import { UserBriefDTO } from './user';
import { CommentBriefDTO } from './comment';
export class CreateEventDTO {
  @Rule(RuleType.string().required().min(1).max(100))
  name: string;

  @Rule(RuleType.string().optional().allow('').max(500))
  description?: string;

  @Rule(RuleType.string().optional())
  type?: EventType;

  @Rule(RuleType.string().required())
  startTime: string;

  @Rule(RuleType.string().required())
  endTime: string;

  @Rule(RuleType.string().required())
  registerEndTime: string;

  @Rule(RuleType.string().required().min(1).max(100))
  location: string;

  @Rule(RuleType.number().required())
  participantsMaxCount: number;

  @Rule(RuleType.number().required())
  organizerId: number;
}

export class HTMLRenderEventDTO {
  @Rule(RuleType.number().required())
  id: number;

  @Rule(RuleType.string().required().min(1).max(100))
  name: string;

  @Rule(RuleType.string().optional().min(1).max(500))
  description?: string;

  @Rule(RuleType.string().optional())
  type?: EventType;

  @Rule(RuleType.string().required())
  startTime: string;

  @Rule(RuleType.string().required())
  endTime: string;

  @Rule(RuleType.string().required())
  registerEndTime: string;

  @Rule(RuleType.string().required().min(1).max(100))
  location: string;

  @Rule(RuleType.number().required())
  participantsMaxCount: number;

  organizer: UserBriefDTO;

  participants: UserBriefDTO[];

  comments: CommentBriefDTO[];

  createTime: Date;

  updateTime: Date;
}
export class EventBriefDTO {
  @Rule(RuleType.number().required())
  id: number;

  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.string().required())
  startTime: string;

  @Rule(RuleType.string().required())
  endTime: string;

  @Rule(RuleType.string().required())
  registerEndTime: string;

  @Rule(RuleType.string().required())
  location: string;

  @Rule(RuleType.number().required())
  participantsCount: number;

  @Rule(RuleType.number().required())
  participantsMaxCount: number;

  @Rule(RuleType.string().optional()) //TODO???change to require?
  state: string;
}

export class EventFilterDTO {
  @Rule(RuleType.string().optional())
  name?: string;

  @Rule(RuleType.string().optional())
  location?: string;

  type?: EventType;

  @Rule(RuleType.string().optional())
  startTime?: string;

  @Rule(RuleType.string().optional())
  endTime?: string;

  @Rule(RuleType.boolean().optional())
  allowJoin?: boolean;
}
