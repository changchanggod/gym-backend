import { Rule, RuleType } from '@midwayjs/validate';
import { EventType } from '../fixed-data/event-type';
import { UserBriefDTO } from './user';
import { User } from '../entity/user';
export class CreateEventDTO {
  @Rule(RuleType.string().required().min(1).max(100))
  name: string;

  @Rule(RuleType.string().optional().min(1).max(500))
  description?: string;

  @Rule(RuleType.string().optional())
  type?: EventType;

  @Rule(RuleType.date().required())
  startTime: Date;

  @Rule(RuleType.date().required())
  endTime: Date;

  @Rule(RuleType.string().required().min(1).max(100))
  location: string;

  organizer: User;
}
export class EventBriefDTO {
  @Rule(RuleType.number().required())
  id: number;

  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.date().required())
  startTime: Date;

  @Rule(RuleType.date().required())
  endTime: Date;

  @Rule(RuleType.string().required())
  location: string;
}
