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
        entities: [join(__dirname, '../entity/**/*.{ts,js}')],
      },
    },
  },
  cors: {
    origin: '*', // 开发环境允许所有域名跨域（生产环境需指定具体域名）
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的请求方法
    allowHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    credentials: true, // 允许跨域请求携带 Cookie（如需登录状态保持）
  },
} as MidwayConfig;
