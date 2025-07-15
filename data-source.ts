import { DataSource } from 'typeorm';
import { User } from './src/entity/user';
import { Event } from './src/entity/event';
import { Comment } from './src/entity/comment';

export const AppDataSource = new DataSource({
  type: 'mysql', // 根据你的数据库类型修改
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1234567890',
  database: 'gym_database',
  entities: [User, Event, Comment], // 注册所有实体
  migrations: ['src/migration/*.ts'], // 迁移文件路径
  synchronize: false, // 生产环境禁用
});
