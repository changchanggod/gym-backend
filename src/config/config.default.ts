import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';
import { User } from '../entity/user';
import { Event } from '../entity/event';
import { Comment } from '../entity/comment';
export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1752039930590_489',
  koa: {
    port: 7001,
    multipart: {
      fileSize: '5mb', // 文件大小限制
      whitelist: ['.jpg', '.jpeg', '.png', '.gif'], // 允许的文件类型
    },
  },
  view: {
    defaultViewEngine: 'nunjucks',
  },
  typeorm: {
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
        entities: [User, Event, Comment], // 实体类数组
      },
    },
  },
  cors: {
    origin: '*', // 开发环境允许所有域名跨域（生产环境需指定具体域名）
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的请求方法
    allowHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    exposeHeaders: ['Content-Disposition'], // 可选，根据需要添加
    credentials: true, // 允许跨域请求携带 Cookie（如需登录状态保持）
  },
  upload: {
    // 上传模式：file 本地文件，stream 流模式
    mode: 'file',
    // 临时文件存储路径
    tmpdir: join(__dirname, '../../uploads/tmp'),
    // 上传文件存储路径
    uploadDir: join(__dirname, '../../uploads'),
    // 允许的文件类型
    mimetypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    // 单个文件大小限制 (10MB)
    fileSize: '10mb',
    // 保留文件扩展名
    keepExtensions: true,
  },
  staticFile: {
    prefix: '/uploads',
    dir: join(__dirname, '../../uploads'),
  },
  middleware: ['staticFile'],
} as MidwayConfig;
