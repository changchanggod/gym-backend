import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Event } from './event';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true, default: '这个人貌似很神秘呢···' })
  description?: string;

  @Column({ unique: true })
  account: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: '未设置' })
  email?: string;

  @Column({ nullable: true, default: '未设置' })
  phone?: string;

  // 多对多关系，用户可以参加多个活动
  @ManyToMany(() => Event, event => event.participants, {
    cascade: true, // 级联操作
  })
  @JoinTable()
  joinEvents: Event[];

  // 一对多关系，用户可以组织多个活动
  @OneToMany(() => Event, event => event.organizer)
  hostEvents: Event[];

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
