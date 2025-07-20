import {
  Inject,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Del,
  Query,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { EventService } from '../service/event.service';
import { RegisterDTO, LoginDTO } from '../dto/user';
import { User } from '../entity/user';

@Controller('/api/user')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  eventService: EventService;

  @Get('/:id')
  async getUser(@Param('id') id: number) {
    try {
      const user = await this.userService.getUser(id);
      return { success: true, message: 'OK', data: user };
    } catch (error) {
      if (error.message === 'User not found') {
        return {
          success: false,
          message: 'User not found',
          code: 404,
        };
      }

      // 处理其他错误
      return {
        success: false,
        message: error.message || 'Failed to get user',
        error: error.message,
      };
    }
  }

  @Get('/userList')
  async getUserList(
    @Query('username') username: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10
  ) {
    try {
      const data = await this.userService.getUserList(username, page, pageSize);

      if (data)
        return {
          success: true,
          message: 'UserList get successfully',
          data: data,
        };
      else
        return {
          success: false,
          message: 'UserList get failed',
        };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post()
  async registerUser(
    @Body('username') username: string,
    @Body('account') account: string,
    @Body('password') password: string,
    @Body('description') description?: string,
    @Body('email') email?: string,
    @Body('phone') phone?: string
  ) {
    const registerDTO = new RegisterDTO();
    registerDTO.username = username;
    registerDTO.account = account;
    registerDTO.password = password;
    registerDTO.description = description;
    registerDTO.email = email;
    registerDTO.phone = phone;
    try {
      const result = await this.userService.registerUser(registerDTO);
      if (result) {
        return { success: true, message: '注册成功', data: result };
      }
      return {
        success: false,
        message: '注册失败，请稍后再试',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '注册失败，请稍后再试',
      };
    }
  }

  @Patch('/:id') // 假设路径参数为id，例如 /updateUser/123
  async updateUser(
    @Param('id') id: number, // 从URL路径中获取id
    @Body() updateData: Partial<User> // 从请求体中获取更新数据
  ) {
    try {
      const updatedUser = await this.userService.updateUser(id, updateData);

      // 返回成功响应
      return {
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      // 处理用户不存在的错误
      if (error.message === 'User not found') {
        return {
          success: false,
          message: 'User not found',
          code: 404,
        };
      }

      // 处理其他错误
      return {
        success: false,
        message: 'Failed to update user',
        error: error.message,
      };
    }
  }

  @Del('/:id')
  async deleteUser(@Param('id') id: number) {
    try {
      const result = await this.userService.deleteUser(id);
      return {
        success: true,
        message: 'User deleted successfully',
        data: result,
      };
    } catch (error) {
      if (error.message === 'User not found') {
        return {
          success: false,
          message: 'User not found',
          code: 404,
        };
      }

      // 处理其他错误
      return {
        success: false,
        message: 'Failed to delete user',
        error: error.message,
      };
    }
  }

  @Del('/hostEvent/:id')
  async deleteUserHostEvent(@Param('id') id: number) {
    console.log('deleteUserHostEvent method is called with id:', id);
    try {
      const result = await this.eventService.deleteEvent(id);
      return {
        success: true,
        message: 'User event deleted successfully',
        data: result,
      };
    } catch (error) {
      if (error.message === 'User event not found') {
        return {
          success: false,
          message: 'User event not found',
          code: 404,
        };
      } else if (error.message === 'User not found') {
        return {
          success: false,
          message: 'User not found',
          code: 404,
        };
      } else if (error.message === 'Event not found') {
        return {
          success: false,
          message: 'Event not found',
          code: 404,
        };
      }
      // 处理其他错误
      return {
        success: false,
        message: error.message || 'Failed to delete user event',
        error: error.message,
      };
    }
  }

  @Del('/joinEvent/:id')
  async deleteUserJoinEvent(
    @Param('id') eventId: number,
    @Body('userId') userId: number
  ) {
    try {
      const result = await this.userService.deleteUserJoinEvent(
        eventId,
        userId
      );
      return {
        success: true,
        message: 'User event deleted successfully',
        data: result,
      };
    } catch (error) {
      if (error.message === 'User event not found') {
        return {
          success: false,
          message: 'User event not found',
          code: 404,
        };
      } else if (error.message === 'User not found') {
        return {
          success: false,
          message: 'User not found',
          code: 404,
        };
      } else if (error.message === 'Event not found') {
        return {
          success: false,
          message: 'Event not found',
          code: 404,
        };
      }
      // 处理其他错误
      return {
        success: false,
        message: error.message || 'Failed to delete user event',
        error: error.message,
      };
    }
  }

  @Post('/joinEvent')
  async addUserJoinEvent(
    @Body('eventId') eventId: number,
    @Body('userId') userId: number
  ) {
    try {
      const res = await this.userService.addUserJoinEvent(eventId, userId);
      if (res) {
        return { success: true, message: res.message, data: res };
      } else {
        return { success: false, message: '参加失败,请稍后再试' };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '参加失败,请稍后再试',
      };
    }
  }

  @Post('/login')
  async loginUser(
    @Body('account') account: string,
    @Body('password') password: string
  ) {
    try {
      const loginDTO = new LoginDTO();
      loginDTO.account = account;
      loginDTO.password = password;
      const id = await this.userService.loginUser(loginDTO);
      if (id) {
        return { success: true, message: '登录成功', data: id };
      }
      return { success: false, message: '登录失败,请稍后再试' };
    } catch (error) {
      if (error.message === 'Invalid account') {
        return {
          success: false,
          message: '账号不存在',
          code: 404,
        };
      }
      if (error.message === 'Invalid password') {
        return {
          success: false,
          message: '密码错误',
          code: 401,
        };
      }
      // 处理其他错误
      return {
        success: false,
        message: '登录失败',
        error: error.message,
      };
    }
  }
}
