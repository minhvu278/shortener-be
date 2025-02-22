import { Link } from 'src/links/entities/link.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Click {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ipAddress: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  country?: string;

  @CreateDateColumn()
  clickedAt: Date;

  @ManyToOne(() => Link, (link) => link.clicks)
  link: Link;
}
