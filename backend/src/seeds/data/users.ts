/**
 * 用户种子数据
 */
import { SeedUser } from '../config/types';

export const SEED_USERS: SeedUser[] = [
    {
        username: 'merchant01',
        password: 'Test123456',
        role: 'merchant',
        nickname: '测试商户',
        phone: '13800138001',
    },
    {
        username: 'merchant02',
        password: 'Test123456',
        role: 'merchant',
        nickname: '演示商户',
        phone: '13800138002',
    },
    {
        username: 'admin01',
        password: 'Admin123456',
        role: 'admin',
        nickname: '系统管理员',
        phone: '13900139001',
    },
];

/**
 * 打印用户账号信息表格
 */
export function printUserCredentials(): void {
    console.log('\n📋 测试账号信息:');
    console.log('┌─────────────┬───────────────┬──────────────┐');
    console.log('│ 角色        │ 用户名        │ 密码         │');
    console.log('├─────────────┼───────────────┼──────────────┤');

    for (const user of SEED_USERS) {
        const roleLabel = user.role === 'merchant' ? '商户' : '管理员';
        console.log(`│ ${roleLabel.padEnd(10)} │ ${user.username.padEnd(13)} │ ${user.password.padEnd(12)} │`);
    }

    console.log('└─────────────┴───────────────┴──────────────┘');
}
