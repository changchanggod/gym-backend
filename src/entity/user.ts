import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'text' })
  description?: string;

  @Column({ unique: true })
  account: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: '未设置' })
  email?: string;

  @Column({ nullable: true, default: '未设置' })
  phone?: string;

  @Column({ type: 'simple-array' })
  joinEventId: number[];

  @Column({ type: 'simple-array' })
  hostEventId: number[];

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}

// src/dto/user.dto.ts
