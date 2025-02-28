import { VideoStatus } from '../../../application/video/entites/video.status';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'videos' })
export class VideoEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'path', length: 100, nullable: false })
  path: string;

  @Column({ name: 'user', length: 100, nullable: false })
  user: string;

  @Column({ name: 'user_email', length: 100, nullable: false })
  userEmail: string;

  @Column({
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.Pending,
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;
}
