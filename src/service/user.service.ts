import { Provide } from '@midwayjs/core';
import { User } from '../entity/user';
import { RegisterDTO, HTMLRenderUserDTO, LoginDTO } from '../dto/user';
import { EventBriefDTO } from '../dto/event';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
@Provide()
export class UserService {
  @InjectEntityModel(User)
  userRepository: Repository<User>;

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
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return await this.userRepository.remove(user);
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
