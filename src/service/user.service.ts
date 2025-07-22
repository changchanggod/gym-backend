import { Provide, Config } from '@midwayjs/core';
import { User } from '../entity/user';
import { Event } from '../entity/event';
import {
  RegisterDTO,
  HTMLRenderUserDTO,
  LoginDTO,
  UserListDTO,
} from '../dto/user';
import { EventBriefDTO } from '../dto/event';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { mkdirSync, existsSync } from 'fs';
import { rename } from 'fs/promises'; // 注意引入方式
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid'; // 需要安装：npm i uuid @types/uuid
@Provide()
export class UserService {
  @InjectEntityModel(User)
  userRepository: Repository<User>;

  @InjectEntityModel(Event)
  eventRepository: Repository<Event>;

  private uploadDir: string;

  @Config('upload')
  uploadConfig: any;

  // 修改 init 方法，确保 uploadDir 正确初始化
  async init() {
    // 增加配置存在性校验
    if (!this.uploadConfig || !this.uploadConfig.uploadDir) {
      throw new Error(
        '上传配置不存在，请检查 config.default.ts 中的 upload 配置'
      );
    }
    this.uploadDir = this.uploadConfig.uploadDir;
    // 确保目录存在
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 保存上传的图片
   * @param file 上传的文件对象
   * @returns 图片访问URL
   */
  async saveImage(file: any): Promise<string> {
    try {
      // 生成唯一文件名和目标路径
      const ext = file.filename.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const targetPath = join(this.uploadDir, filename);
      console.log('目标路径:', targetPath);

      // 若file.data是临时文件路径，则移动文件
      const tmpFilePath = file.data; // 临时文件路径（如/tmp/xxx.png）

      // 移动文件（从tmp目录到upload目录）
      await rename(tmpFilePath, targetPath);

      // 返回可访问的URL路径
      return `/uploads/${filename}`;
    } catch (error) {
      throw new Error(`图片迁移失败: ${error.message}`);
    }
  }

  // 用户注册
  async registerUser(registerDTO: RegisterDTO) {
    try {
      const newUser = new User();
      newUser.username = registerDTO.username;
      newUser.account = registerDTO.account;
      newUser.password = registerDTO.password;
      newUser.description = registerDTO.description;
      newUser.email = registerDTO.email;
      newUser.phone = registerDTO.phone;
      newUser.avatar = registerDTO.avatar;
      newUser.joinEvents = [];
      newUser.hostEvents = [];
      console.log(newUser);
      await this.userRepository.save(newUser);
      return 'success';
    } catch (error) {
      // 检查是否是唯一约束冲突
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.sqlMessage.includes('UQ_USERNAME')) {
          throw new Error('用户名已存在');
        } else if (error.sqlMessage.includes('UQ_ACCOUNT')) {
          throw new Error('账号已存在');
        }
      }
      throw new Error('注册失败，请稍后再试');
    }
  }

  // 用户信息更改
  async updateUser(id: number, updateData: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  // 用户注销
  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['hostEvents', 'joinEvents', 'hostEvents.participants'],
    });
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    user.joinEvents = [];
    for (const event of user.hostEvents) {
      event.participants = [];
    }
    await this.eventRepository.save(user.hostEvents);
    await this.userRepository.save(user);

    return await this.userRepository.remove(user);
  }

  async deleteUserJoinEvent(eventId: number, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['joinEvents'],
    });
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['participants'],
    });
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }
    // 从用户的joinEvents中移除该事件
    if (user.joinEvents) {
      user.joinEvents = user.joinEvents.filter(event => event.id !== eventId);
    } else {
      throw new Error(`User ${userId} has not joined any event`);
    }
    if (event.participants) {
      event.participants = event.participants.filter(
        participant => participant.id !== userId
      );
    } else {
      throw new Error(`The event ${eventId} has no participants`);
    }
    // 更新用户和事件
    await this.userRepository.save(user);
    return { success: true, message: 'User event deleted successfully' };
  }

  async deleteUserFollows(followerId: number, userId: number) {
    const follower = await this.userRepository.findOne({
      where: { id: followerId },
      relations: ['follows'],
    });
    if (!follower) {
      throw new Error(`Follower with id ${followerId} not found`);
    }
    follower.follows = follower.follows.filter(follow => follow.id !== userId);
    return await this.userRepository.save(follower);
  }

  async getUser(id: number, currentId: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'joinEvents',
        'hostEvents',
        'joinEvents.participants',
        'hostEvents.participants',
        'follows',
        'followers',
      ],
    });
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    let friends = false;
    const htmlRenderUserDTO = new HTMLRenderUserDTO();
    htmlRenderUserDTO.username = user.username;
    htmlRenderUserDTO.id = user.id;
    htmlRenderUserDTO.account = user.account;
    htmlRenderUserDTO.description = user.description;
    htmlRenderUserDTO.privateStatus = user.privateStatus;
    htmlRenderUserDTO.avatar = user.avatar;
    console.log(user.avatar);
    if (user.privateStatus === 2) {
      friends =
        user.followers.some(follower => follower.id === currentId) &&
        user.follows.some(follow => follow.id === user.id);
    }
    if (id === currentId || user.privateStatus === 1 || friends) {
      htmlRenderUserDTO.email = user.email;
      htmlRenderUserDTO.phone = user.phone;
      htmlRenderUserDTO.joinEvents = user.joinEvents.map(
        event =>
          ({
            id: event.id,
            name: event.name,
            startTime: event.startTime.toISOString(),
            endTime: event.endTime.toISOString(),
            registerEndTime: event.registerEndTime.toISOString(),
            location: event.location,
            state: 'join',
            participantsCount: event.participants.length,
            participantsMaxCount: event.participantsMaxCount,
            // 只选择需要的字段，避免敏感信息
          } as EventBriefDTO)
      );
      htmlRenderUserDTO.hostEvents = user.hostEvents.map(
        event =>
          ({
            id: event.id,
            name: event.name,
            startTime: event.startTime.toISOString(),
            endTime: event.endTime.toISOString(),
            registerEndTime: event.registerEndTime.toISOString(),
            location: event.location,
            state: 'host',
            participantsCount: event.participants.length,
            participantsMaxCount: event.participantsMaxCount,
            // 只选择需要的字段，避免敏感信息
          } as EventBriefDTO)
      );
      htmlRenderUserDTO.follows = user.follows.map(follow => ({
        id: follow.id,
        username: follow.username,
        account: follow.account,
        email: follow.email,
        phone: follow.phone,
        privateStatus: follow.privateStatus,
      }));
      htmlRenderUserDTO.followers = user.followers.map(follower => ({
        id: follower.id,
        username: follower.username,
        account: follower.account,
        email: follower.email,
        phone: follower.phone,
        privateStatus: follower.privateStatus,
      }));
    }
    return htmlRenderUserDTO;
  }

  async getUserList(username: string, page = 1, pageSize = 10) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.account',
        'user.email',
        'user.phone',
        'user.privateStatus',
        'user.createTime',
        'user.avatar',
      ]);

    // 添加用户名搜索条件
    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    // 添加排序和分页
    queryBuilder
      .orderBy('user.createTime', 'DESC') // 默认按创建时间降序排列
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const sql = queryBuilder.getSql();
    const params = queryBuilder.getParameters();
    console.log('Executed SQL:', sql);
    console.log('Query Parameters:', params);

    const [list, total] = await queryBuilder.getManyAndCount();

    const userList = list.map(user => {
      const userDTO = new UserListDTO();
      userDTO.id = user.id;
      userDTO.username = user.username;
      userDTO.account = user.account;
      userDTO.email = user.email;
      userDTO.phone = user.phone;
      userDTO.avatar = user.avatar;
      userDTO.privateStatus = user.privateStatus;
      return userDTO;
    });

    return { userList, total };
  }

  async getFollowsList(
    userId: number,
    username: string,
    page = 1,
    pageSize = 10
  ) {
    // 1. 检查用户是否存在并加载关注列表
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId })
      .leftJoinAndSelect('user.follows', 'follow')
      .andWhere('follow.username LIKE :username', { username: `%${username}%` })
      .getOne();

    // 3. 转换为DTO并保护敏感信息
    const userList = user.follows
      .slice((page - 1) * pageSize, page * pageSize)
      .map(follow => {
        const userDTO = new UserListDTO();
        userDTO.id = follow.id;
        userDTO.username = follow.username;

        // 根据隐私设置决定是否返回敏感信息
        if (!follow.privateStatus) {
          userDTO.email = follow.email;
          userDTO.phone = follow.phone;
          userDTO.account = follow.account;
        }

        userDTO.privateStatus = follow.privateStatus;
        return userDTO;
      });

    // 4. 返回分页信息
    return {
      userList,
      total: user.follows.length,
      page,
      pageSize,
    };
  }

  async addUserJoinEvent(eventId: number, userId: number) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['participants'],
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['joinEvents'],
    });
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    const isAlreadyJoined = user.joinEvents.some(e => e.id === eventId);
    if (isAlreadyJoined) {
      throw new Error(`User ${userId} already joined this event ${eventId}`);
    }

    if (
      event.participantsMaxCount &&
      event.participants?.length >= event.participantsMaxCount
    ) {
      throw new Error(`Event ${eventId} is full`);
    }
    if (!user.joinEvents) user.joinEvents = [];
    if (!event.participants) event.participants = [];
    user.joinEvents.push(event);
    await this.userRepository.save(user);
    return { success: true, message: 'User event joined successfully' };
  }

  async addUserFollows(followerId: number, userId: number) {
    const follower = await this.userRepository.findOne({
      where: { id: followerId },
      relations: ['follows'],
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['followers'],
    });
    if (!follower) {
      throw new Error(`Follower with id ${followerId} not found`);
    }
    if (!user) {
      throw new Error(`User with id ${followerId} not found`);
    }
    if (!follower.follows) follower.follows = [];
    if (!user.followers) user.followers = [];
    follower.follows.push(user);
    user.followers.push(follower);
    return await this.userRepository.save(follower);
  }

  async loginUser(LoginDTO: LoginDTO) {
    const user = await this.userRepository.findOne({
      where: { account: LoginDTO.account },
    });
    if (!user) {
      throw new Error('Invalid account');
    }
    if (user.password !== LoginDTO.password) {
      throw new Error('Invalid password');
    }
    return user.id;
  }
}
