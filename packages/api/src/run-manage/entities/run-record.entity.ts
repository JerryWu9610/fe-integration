import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RunRecordStatus, RunRecordTriggerType } from '../consts';

@Entity('run_records')
export class RunRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  log: string;

  @Column('json')
  input: Record<string, any>;

  @Column({
    type: 'varchar',
    default: RunRecordStatus.PENDING
  })
  status: RunRecordStatus;

  @Column({
    type: 'varchar',
    default: RunRecordTriggerType.MANUAL
  })
  triggerType: RunRecordTriggerType;

  @Column('varchar')
  triggerBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 