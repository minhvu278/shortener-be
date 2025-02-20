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

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Click, (click) => click.link)
  clicks: Click[];
}
