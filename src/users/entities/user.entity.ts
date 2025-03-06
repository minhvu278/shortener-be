import { Link } from '../../links/entities/link.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export type UserRole = 'user' | 'admin';
export type PlanType = 'free' | 'basic' | 'growth' | 'premium' | 'enterprise';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ type: 'enum', enum: ['free', 'basic', 'growth', 'premium', 'enterprise'], default: 'free' })
  plan: PlanType;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: UserRole;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Link, (link) => link.user)
  links: Link[];
}