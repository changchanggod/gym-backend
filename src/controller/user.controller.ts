import {
  Inject,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { RegisterDTO, LoginDTO } from '../dto/user';
import { User } from '../entity/user';
import { Del } from '@midwayjs/core';

@Controller('/api/user')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

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
        message: 'Failed to update user',
        error: error.message,
      };
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
    const result = await this.userService.register(registerDTO);
    if (result) {
      return { success: true, message: '注册成功', data: result };
    }
    return { success: false, message: result };
  }
  @Patch('/updateUser/:id') // 假设路径参数为id，例如 /updateUser/123
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

  @Post('/login')
  async loginUser(@Body() loginDTO: LoginDTO) {
    try {
      const user = await this.userService.loginUser(loginDTO);
      return { success: true, message: '登录成功', data: user };
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
