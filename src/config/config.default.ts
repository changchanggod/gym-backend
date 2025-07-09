import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1752039930590_489',
  koa: {
    port: 7001,
  },
  view: {
    defaultViewEngine: 'nunjucks',
  },
  orm: {
    dataSource: {
      default: {
        type: 'mysql', // 数据库类型，根据实际情况修改
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '1234567890',
        database: 'gym_database',
        synchronize: true, // 开发环境使用，生产环境建议关闭
        logging: true,
        entities: [join(__dirname, '../entity/**/*.entity{.ts,.js}')],
      },
    },
  },
} as MidwayConfig;
