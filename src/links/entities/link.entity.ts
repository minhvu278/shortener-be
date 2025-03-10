import { timestamp } from 'rxjs';
import { Click } from 'src/clicks/entities/click.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalUrl: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ unique: true, nullable: true })
  shortCode?: string;

  @Column({ unique: true, nullable: true })
  @Index()
  slug?: string

  @Column({ nullable: true })
  password?: string

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ nullable: true, type: 'text' })
  qrCode?: string

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Click, (click) => click.link)
  clicks: Click[];

  @ManyToOne(() => User, (user) => user.links)
  user: User;
}
