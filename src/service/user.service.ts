import { Provide } from '@midwayjs/core';
import { User } from '../entity/user';
import { Event } from '../entity/event';
import { RegisterDTO, HTMLRenderUserDTO, LoginDTO } from '../dto/user';
import { EventBriefDTO } from '../dto/event';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
@Provide()
export class UserService {
  @InjectEntityModel(User)
  userRepository: Repository<User>;

  @InjectEntityModel(Event)
  eventRepository: Repository<Event>;

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

  async getUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['joinEvents', 'hostEvents'],
    });
    if (!user) {
      throw new Error(`User ${id} not found`);
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
          state: 'join',
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
          state: 'host',
          // 只选择需要的字段，避免敏感信息
        } as EventBriefDTO)
    );
    return htmlRenderUserDTO;
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
