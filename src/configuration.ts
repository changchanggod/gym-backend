import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
//import { ReportMiddleware } from './middleware/report.middleware';
import * as view from '@midwayjs/view-nunjucks';
import { WeatherErrorFilter } from './filter/weather.filter';
import * as orm from '@midwayjs/typeorm';
import * as upload from '@midwayjs/upload'; // 导入组件
import * as staticFile from '@midwayjs/static-file';
const cors = require('@koa/cors');

@Configuration({
  imports: [
    koa,
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    view,
    orm,
    upload,
    staticFile,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware(staticFile.StaticMiddleware);
    // this.app.useMiddleware([ReportMiddleware]);
    this.app.use(
      cors({
        origin: '*',
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      })
    );
    // add filter
    this.app.useFilter([WeatherErrorFilter]);
  }
}
