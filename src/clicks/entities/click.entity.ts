import { Link } from '../../links/entities/link.entity';
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

  @ManyToOne(() => Link, (link) => link.clicks, { onDelete: 'CASCADE' })
  link: Link;

  @Column()
  ipAdress: string;

  @Column()
  userAgent: string;

  @CreateDateColumn()
  clickedAt: Date;
}
