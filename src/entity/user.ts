import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Unique,
} from 'typeorm';
import { Event } from './event';
import { Comment } from './comment';

@Entity('users')
@Unique('UQ_USERNAME', ['username'])
@Unique('UQ_ACCOUNT', ['account'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ nullable: true, default: '这个人貌似很神秘呢···' })
  description?: string;

  @Column()
  account: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: '未设置' })
  email?: string;

  @Column({ nullable: true, default: '未设置' })
  phone?: string;

  @Column({ nullable: true, default: '' })
  avatar?: string;

  // 多对多关系，用户可以参加多个活动
  @ManyToMany(() => Event, event => event.participants, {
    //cascade: true, // 级联操作
  })
  @JoinTable()
  joinEvents: Event[];

  // 一对多关系，用户可以组织多个活动
  @OneToMany(() => Event, event => event.organizer)
  hostEvents: Event[];

  // 一对多关系，用户可以有多个评论
  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @ManyToMany(() => User, user => user.followers)
  @JoinTable({
    name: 'user_follows',
    joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'following_id', referencedColumnName: 'id' },
  })
  follows: User[];

  @ManyToMany(() => User, user => user.follows)
  followers: User[];

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ default: 1 })
  privateStatus: number;
}
