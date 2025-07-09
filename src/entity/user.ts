import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  account: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'simple-array' })
  joinEventId: number[];

  @Column({ type: 'simple-array' })
  hostEventId: number[];
}

// src/dto/user.dto.ts
