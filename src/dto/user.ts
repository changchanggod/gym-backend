import { Rule, RuleType } from '@midwayjs/validate';

export class RegisterDTO {
  @Rule(RuleType.string().required().min(3).max(20))
  username: string;

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
