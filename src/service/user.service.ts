import { Provide } from '@midwayjs/core';
import { User } from '../entity/user';
import { Event } from '../entity/event';
import { RegisterDTO, HTMLRenderUserDTO, LoginDTO } from '../dto/user';
import { EventBriefDTO } from '../dto/event';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { EntityManager } from 'typeorm';
@Provide()
export class UserService {
  @InjectEntityModel(User)
  userRepository: Repository<User>;

  @InjectEntityModel(Event)
  eventRepository: Repository<Event>;

  constructor(
    private readonly entityManager: EntityManager // 注入 EntityManager
  ) {}

  // 用户注册
  async registerUser(registerDTO: RegisterDTO) {
    const newUser = new User();
    newUser.username = registerDTO.username;
    newUser.account = registerDTO.account;
    newUser.password = registerDTO.password;
    newUser.description = registerDTO.description;
    newUser.email = registerDTO.email;
    newUser.phone = registerDTO.phone;
    newUser.joinEvents = [];
    newUser.hostEvents = [];

    return await this.userRepository.save(newUser);
  }

  // 用户信息更改
  async updateUser(id: number, updateData: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  // 用户注销
  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['joinEvents', 'hostEvents', 'hostEvents.participants'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    user.joinEvents.forEach(event => {
      event.participants = event.participants.filter(u => u.id !== user.id);
    });
    user.hostEvents.forEach(event => {
      event.participants.forEach(participant => {
        participant.joinEvents = participant.joinEvents.filter(
          e => e.id !== event.id
        );
      });
    });

    return await this.userRepository.remove(user);
  }

  async deleteUserJoinEvent(eventId: number, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (!event) {
      throw new Error('Event not found');
    }
    // 从用户的joinEvents中移除该事件
    user.joinEvents = user.joinEvents.filter(event => event.id !== eventId);
    event.participants = event.participants.filter(
      participant => participant.id !== userId
    );
    // 更新用户和事件
    await this.userRepository.save(user);
    await this.eventRepository.save(event);
    return { success: true, message: 'User event deleted successfully' };
  }

  async getUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['joinEvents', 'hostEvents'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    const htmlRenderUserDTO = new HTMLRenderUserDTO();
    htmlRenderUserDTO.username = user.username;
    htmlRenderUserDTO.id = user.id;
    htmlRenderUserDTO.account = user.account;
    htmlRenderUserDTO.description = user.description;
    htmlRenderUserDTO.email = user.email;
    htmlRenderUserDTO.phone = user.phone;
    htmlRenderUserDTO.joinEvents = user.joinEvents.map(
      event =>
        ({
          id: event.id,
          name: event.name,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          // 只选择需要的字段，避免敏感信息
        } as EventBriefDTO)
    );
    htmlRenderUserDTO.hostEvents = user.hostEvents.map(
      event =>
        ({
          id: event.id,
          name: event.name,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          // 只选择需要的字段，避免敏感信息
        } as EventBriefDTO)
    );
    return htmlRenderUserDTO;
  }

  async addUserJoinEvent(eventId: number, userId: number) {
    // 开始事务
    return await this.entityManager
      .transaction(async transactionalEntityManager => {
        // 查询用户并检查是否存在
        const user = await transactionalEntityManager.findOne(User, {
          where: { id: userId },
        });
        if (!user) {
          throw new Error('User not found');
        }

        // 查询事件并检查是否存在
        const event = await transactionalEntityManager.findOne(Event, {
          where: { id: eventId },
        });
        if (!event) {
          throw new Error('Event not found');
        }

        // 检查用户是否已加入事件
        const isUserAlreadyJoined = user.joinEvents.some(e => e.id === eventId);
        if (isUserAlreadyJoined) {
          throw new Error('User has already joined this event');
        }

        // 更新关联关系
        user.joinEvents.push(event);
        event.participants.push(user);

        // 保存更改
        await transactionalEntityManager.save(user);
        await transactionalEntityManager.save(event);

        return { success: true, message: 'User joined event successfully' };
      })
      .catch(error => {
        // 统一错误处理
        console.error('Error joining user to event:', error);
        return {
          success: false,
          message: error.message || 'Failed to join event',
        };
      });
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
