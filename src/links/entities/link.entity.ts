import { Click } from 'src/clicks/entities/click.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalUrl: string;

  @Column({ unique: true })
  shortCode: string;

  @Column({ unique: true, nullable: true })
  customSlug?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt?: Date;

  @Column({ nullable: true })
  qrCodeUrl?: string;

  @Column({ nullable: true })
  userId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Click, (click) => click.link)
  clicks: Click[];
}
