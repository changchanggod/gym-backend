import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { EventType } from '../fixed-data/event-type';
import { User } from './user';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description?: string;

  @Column()
  type?: EventType;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column()
  location: string;

  // 多对多关系，活动可以有多个参与者
  @ManyToMany(() => User, user => user.joinEvents, {
    cascade: true, // 级联操作
  })
  participants: User[];

  // 多对一关系，活动只有一个组织者
  @ManyToOne(() => User, user => user.hostEvents, {
    onDelete: 'CASCADE', // 当组织者被删除时，级联删除活动
    nullable: false, // 组织者不能为空
  })
  organizer: User;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
