import { Rule, RuleType } from '@midwayjs/validate';
import { EventBriefDTO } from './event';

export class RegisterDTO {
  @Rule(RuleType.string().required().min(3).max(20))
  username: string;

  @Rule(RuleType.string().optional().min(0).max(500))
  description?: string;

  @Rule(RuleType.string().required().min(1).max(20))
  account: string;

  @Rule(RuleType.string().required().min(6).max(32))
  password: string;

  @Rule(RuleType.string().optional().email())
  email?: string;

  @Rule(RuleType.string().optional().length(11))
  phone?: string;
}

export class LoginDTO {
  @Rule(RuleType.string().required())
  account: string;

  @Rule(RuleType.string().required())
  password: string;
}

export class HTMLRenderUserDTO {
  id: number;

  @Rule(RuleType.string().required())
  username: string;

  @Rule(RuleType.string().required())
  account: string;

  @Rule(RuleType.string().optional().min(0).max(500))
  description?: string;

  @Rule(RuleType.string().optional().email())
  email?: string;

  @Rule(RuleType.string().optional().length(11))
  phone?: string;

  joinEvents: EventBriefDTO[];

  hostEvents: EventBriefDTO[];
}
