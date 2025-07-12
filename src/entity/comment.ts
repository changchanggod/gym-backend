import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Event } from './event';
import { User } from './user';
@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  // 多对一关系，评论属于一个用户
  @ManyToOne(() => User, user => user.comments, {
    nullable: false, // 用户不能为空
  })
  user: User;

  // 多对一关系，评论属于一个活动
  @ManyToOne(() => Event, event => event.comments, {
    onDelete: 'CASCADE', // 当活动被删除时，级联删除评论
    nullable: false, // 活动不能为空
  })
  event: Event;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
