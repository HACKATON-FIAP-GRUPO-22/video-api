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

  @Column({ name: 'id_video', length: 100, nullable: true })
  idVideo: string;

  @Column({ name: 'id_video_processed', length: 100, nullable: true })
  idVideoProcessed: string;

  @Column({ name: 'user', length: 100, nullable: true })
  user: string;

  @Column({ name: 'user_email', length: 100, nullable: true })
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
