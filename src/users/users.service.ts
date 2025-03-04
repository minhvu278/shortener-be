import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanType, User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  
  async create(email: string, username: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: [{ email }, { username }] });
    if (existingUser) {
      throw new BadRequestException('Email hoặc username đã tồn tại.');
    }
    const user = this.userRepository.create({ email, username, password, plan: 'free' });
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: {email} })
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async upgradePlan(userId: number, plan: PlanType): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['links'] });
    if (!user) {
      throw new BadRequestException('User không tồn tại.');
    }
    if (plan === 'enterprise') {
      throw new BadRequestException('Vui lòng liên hệ để đăng ký gói Enterprise.');
    }
    if (plan === user.plan) {
      throw new BadRequestException(`Người dùng đã ở gói ${plan}.`);
    }
    user.plan = plan;
    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }
}
