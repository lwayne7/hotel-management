import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.usersRepository.count({ where: { username } });
    return count > 0;
  }

  /** 递增 tokenVersion，使该用户所有旧 refresh_token 立即失效 */
  async incrementTokenVersion(userId: number): Promise<void> {
    await this.usersRepository.increment({ id: userId }, 'tokenVersion', 1);
  }
}
