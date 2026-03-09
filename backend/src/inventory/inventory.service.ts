import { Injectable, ForbiddenException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { RoomInventory } from './room-inventory.entity';

function toDateOnlyString(input: string | Date): string {
  if (input instanceof Date) return input.toISOString().slice(0, 10);
  // 支持已是 YYYY-MM-DD 的情况
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return new Date(input).toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function eachDateNightsInclusiveStartExclusiveEnd(checkIn: string, checkOut: string): string[] {
  const start = toDateOnlyString(checkIn);
  const end = toDateOnlyString(checkOut);
  const dates: string[] = [];
  let cur = start;
  while (cur < end) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

@Injectable()
export class InventoryService {
  /**
   * 预占库存（reserved += qty）。需要在调用方事务内执行。
   */
  async reserve(
    manager: EntityManager,
    roomTypeId: number,
    checkInDate: string,
    checkOutDate: string,
    qty: number,
    opts?: { lock?: boolean },
  ): Promise<void> {
    const dates = eachDateNightsInclusiveStartExclusiveEnd(checkInDate, checkOutDate);
    if (dates.length === 0) {
      throw new ForbiddenException('入住日期范围不合法');
    }
    const repo = manager.getRepository(RoomInventory);
    const qb = repo
      .createQueryBuilder('inv')
      .where('inv.roomTypeId = :roomTypeId', { roomTypeId })
      .andWhere('inv.date IN (:...dates)', { dates });
    if (opts?.lock) qb.setLock('pessimistic_write');
    const rows = await qb.getMany();

    if (rows.length !== dates.length) {
      throw new ForbiddenException('库存未初始化或日期缺失');
    }

    for (const r of rows) {
      const available = r.total - r.reserved - r.sold;
      if (available < qty) {
        throw new ForbiddenException(`库存不足（${r.date} 可用 ${available}）`);
      }
    }

    for (const r of rows) {
      r.reserved += qty;
    }
    await repo.save(rows);
  }

  /**
   * 确认成交：reserved -= qty, sold += qty。需要在调用方事务内执行。
   */
  async commit(
    manager: EntityManager,
    roomTypeId: number,
    checkInDate: string,
    checkOutDate: string,
    qty: number,
    opts?: { lock?: boolean },
  ): Promise<void> {
    const dates = eachDateNightsInclusiveStartExclusiveEnd(checkInDate, checkOutDate);
    const repo = manager.getRepository(RoomInventory);

    const qb = repo
      .createQueryBuilder('inv')
      .where('inv.roomTypeId = :roomTypeId', { roomTypeId })
      .andWhere('inv.date IN (:...dates)', { dates });
    if (opts?.lock) qb.setLock('pessimistic_write');
    const rows = await qb.getMany();
    if (rows.length !== dates.length) {
      throw new ForbiddenException('库存未初始化或日期缺失');
    }
    for (const r of rows) {
      if (r.reserved < qty) {
        throw new ForbiddenException(`预占库存不足（${r.date} reserved=${r.reserved}）`);
      }
    }
    for (const r of rows) {
      r.reserved -= qty;
      r.sold += qty;
    }
    await repo.save(rows);
  }

  /**
   * 释放预占：reserved -= qty。需要在调用方事务内执行。
   */
  async release(
    manager: EntityManager,
    roomTypeId: number,
    checkInDate: string,
    checkOutDate: string,
    qty: number,
    opts?: { lock?: boolean },
  ): Promise<void> {
    const dates = eachDateNightsInclusiveStartExclusiveEnd(checkInDate, checkOutDate);
    const repo = manager.getRepository(RoomInventory);
    const qb = repo
      .createQueryBuilder('inv')
      .where('inv.roomTypeId = :roomTypeId', { roomTypeId })
      .andWhere('inv.date IN (:...dates)', { dates });
    if (opts?.lock) qb.setLock('pessimistic_write');
    const rows = await qb.getMany();
    if (rows.length !== dates.length) {
      throw new ForbiddenException('库存未初始化或日期缺失');
    }
    for (const r of rows) {
      if (r.reserved < qty) {
        throw new ForbiddenException(`释放失败（${r.date} reserved=${r.reserved}）`);
      }
    }
    for (const r of rows) {
      r.reserved -= qty;
    }
    await repo.save(rows);
  }
}

