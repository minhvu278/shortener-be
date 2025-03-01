import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(email: string, username: string, password: string) {
    const existingEmail = await this.userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new BadRequestException('Email already in use');
    }

    const existingUsername = await this.userRepository.findOne({ where: { username } });
    if (existingUsername) {
      throw new BadRequestException('Username already taken');
    }

    const user = this.userRepository.create({
      email,
      username,
      password,
      role: 'user',
    });

    const savedUser = await this.userRepository.save(user);
    const {password: _, ...result} = savedUser
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: {email} })
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
}
