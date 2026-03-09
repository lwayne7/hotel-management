import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface AuditContext {
  actorType: 'admin' | 'merchant' | 'system';
  actorId: number | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(
    ctx: AuditContext,
    params: {
      action: string;
      targetType?: string;
      targetId?: number;
      payload?: Record<string, unknown>;
    },
  ): Promise<void> {
    const log = this.auditRepo.create({
      action: params.action,
      actorType: ctx.actorType,
      actorId: ctx.actorId ?? null,
      targetType: params.targetType ?? null,
      targetId: params.targetId ?? null,
      payload: params.payload ?? null,
      createdAt: Date.now(),
    });
    await this.auditRepo.save(log);
  }
}
