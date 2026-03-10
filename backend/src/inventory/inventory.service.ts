import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
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

function eachDateNightsInclusiveStartExclusiveEnd(
  checkIn: string,
  checkOut: string,
): string[] {
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
  private readonly logger = new Logger(InventoryService.name);

  /**
   * 预占库存（原子 SQL：UPDATE ... SET reserved = reserved + :qty WHERE available >= :qty）。
   * 通过 affected rows 判断是否全部成功，失败则由外层事务回滚。
   */
  async reserve(
    manager: EntityManager,
    roomTypeId: number,
    checkInDate: string,
    checkOutDate: string,
    qty: number,
    opts?: { lock?: boolean },
  ): Promise<void> {
    const dates = eachDateNightsInclusiveStartExclusiveEnd(
      checkInDate,
      checkOutDate,
    );
    if (dates.length === 0) {
      throw new ForbiddenException('入住日期范围不合法');
    }

    // 先验证库存行是否存在
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

    // 原子 SQL 更新：只更新可用库存 >= qty 的行
    const result = await repo
      .createQueryBuilder()
      .update(RoomInventory)
      .set({ reserved: () => `reserved + ${qty}` })
      .where('roomTypeId = :roomTypeId', { roomTypeId })
      .andWhere('date IN (:...dates)', { dates })
      .andWhere('(total - reserved - sold) >= :qty', { qty })
      .execute();

    // 如果受影响行数不等于日期数，说明某些天库存不足
    if (result.affected !== dates.length) {
      this.logger.warn(
        `Reserve partial: affected=${result.affected}, expected=${dates.length}, roomTypeId=${roomTypeId}`,
      );
      throw new ForbiddenException(
        `库存不足（需要 ${dates.length} 天，仅 ${result.affected} 天有足够库存）`,
      );
    }
  }

  /**
   * 确认成交（原子 SQL：reserved -= qty, sold += qty）。
   * 只更新 reserved >= qty 的行，确保不会出现负数。
   */
  async commit(
    manager: EntityManager,
    roomTypeId: number,
    checkInDate: string,
    checkOutDate: string,
    qty: number,
    opts?: { lock?: boolean },
  ): Promise<void> {
    const dates = eachDateNightsInclusiveStartExclusiveEnd(
      checkInDate,
      checkOutDate,
    );
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

    // 原子 SQL 更新
    const result = await repo
      .createQueryBuilder()
      .update(RoomInventory)
      .set({
        reserved: () => `reserved - ${qty}`,
        sold: () => `sold + ${qty}`,
      })
      .where('roomTypeId = :roomTypeId', { roomTypeId })
      .andWhere('date IN (:...dates)', { dates })
      .andWhere('reserved >= :qty', { qty })
      .execute();

    if (result.affected !== dates.length) {
      throw new ForbiddenException(
        `确认成交失败（预占库存不足，affected=${result.affected}）`,
      );
    }
  }

  /**
   * 释放预占（原子 SQL：reserved -= qty）。
   * 只更新 reserved >= qty 的行，确保不会出现负数。
   */
  async release(
    manager: EntityManager,
    roomTypeId: number,
    checkInDate: string,
    checkOutDate: string,
    qty: number,
    opts?: { lock?: boolean },
  ): Promise<void> {
    const dates = eachDateNightsInclusiveStartExclusiveEnd(
      checkInDate,
      checkOutDate,
    );
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

    // 原子 SQL 更新
    const result = await manager
      .createQueryBuilder()
      .update(RoomInventory)
      .set({ reserved: () => `reserved - ${qty}` })
      .where('roomTypeId = :roomTypeId', { roomTypeId })
      .andWhere('date IN (:...dates)', { dates })
      .andWhere('reserved >= :qty', { qty })
      .execute();

    if (result.affected !== dates.length) {
      throw new ForbiddenException(
        `释放失败（预占库存不足，affected=${result.affected}）`,
      );
    }
  }
}
