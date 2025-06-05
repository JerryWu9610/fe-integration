import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('schedule_configs')
export class ScheduleConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  cronExpression: string;

  @Column({
    type: 'boolean',
    default: true
  })
  isEnabled: boolean;

  @Column('json')
  input: Record<string, any>;

  @Column({
    type: 'varchar',
    default: 'manual'
  })
  createdBy: string;

  @Column({
    type: 'varchar',
    default: 'manual'
  })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 