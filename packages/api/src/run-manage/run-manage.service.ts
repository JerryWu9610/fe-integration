import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RunRecord } from './entities/run-record.entity';

@Injectable()
export class RunManageService {
  constructor(
    @InjectRepository(RunRecord)
    private runRecordRepository: Repository<RunRecord>,
  ) {}
}
