/**
 * Seeds 模块入口
 * 导出所有公共接口
 */

// 配置
export * from './config/database';
export * from './config/constants';
export * from './config/types';

// 数据
export { SEED_USERS, printUserCredentials } from './data/users';
export { FEATURED_HOTELS } from './data/featured-hotels';

// 生成器
export { generateHotels, printGenerationStats } from './generators/hotel-generator';

// 图片
export * from './images/hotel-images';
