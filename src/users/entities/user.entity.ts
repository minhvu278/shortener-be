import { Link } from "src/links/entities/link.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export type UserRole = 'user' | 'admin';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ default: 'free' })
  plan: string

  @Column({ unique: true })
  username: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: UserRole;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Link, (link) => link.user)
  links: Link[];
}