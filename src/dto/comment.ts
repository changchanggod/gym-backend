import { Rule, RuleType } from '@midwayjs/validate';
import { UserBriefDTO } from './user';
export class CommentBriefDTO {
  @Rule(RuleType.number().required())
  id: number;

  @Rule(RuleType.string().required().min(1).max(500))
  content: string;

  user: UserBriefDTO;

  @Rule(RuleType.date().required())
  createTime: Date;
}
