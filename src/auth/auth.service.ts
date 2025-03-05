import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register(email: string, username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, username, hashedPassword);

    const payload = { id: user.id, email: user.email, username: user.username, role: user.role, plan: user.plan };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, username: user.username, role: user.role, plan: user.plan },
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, email: user.email, username: user.username, role: user.role, plan: user.plan };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, username: user.username, role: user.role, plan: user.plan },
    };
  }

  async refreshToken(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { id: user.id, email: user.email, username: user.username, role: user.role, plan: user.plan };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, username: user.username, role: user.role, plan: user.plan },
    };
  }
}
