/**
 * 校验 seeds 图片 URL 可用性（避免前端出现“暂无图片”）
 *
 * 使用: npm run validate-image-urls
 * 可选：CONCURRENCY=12 npm run validate-image-urls
 */
import * as images from '../images/hotel-images';

function isStringUrlArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string' && /^https?:\/\//.test(v));
}

function collectUrlUsage(mod: Record<string, unknown>): Map<string, Set<string>> {
    const usage = new Map<string, Set<string>>();
    for (const [key, value] of Object.entries(mod)) {
        if (!isStringUrlArray(value)) continue;
        for (const url of value) {
            if (!usage.has(url)) usage.set(url, new Set());
            usage.get(url)!.add(key);
        }
    }
    return usage;
}

async function checkUrl(url: string): Promise<{ ok: boolean; status: number | 'ERR'; error?: string }> {
    try {
        const res = await fetch(url, { method: 'GET', redirect: 'follow' });
        // 尽量不要下载图片内容
        res.body?.cancel?.();
        return { ok: res.ok, status: res.status };
    } catch (err) {
        return { ok: false, status: 'ERR', error: err instanceof Error ? err.message : String(err) };
    }
}

async function main() {
    const usage = collectUrlUsage(images as unknown as Record<string, unknown>);
    const urls = Array.from(usage.keys());
    const concurrency = Math.max(1, Math.min(32, Number(process.env.CONCURRENCY ?? 12) || 12));

    console.log(`🔎 校验图片 URL... (unique=${urls.length}, concurrency=${concurrency})`);

    let index = 0;
    const bad: { url: string; status: number | 'ERR'; keys: string[]; error?: string }[] = [];

    const worker = async () => {
        while (true) {
            const i = index++;
            if (i >= urls.length) return;
            const url = urls[i];
            const result = await checkUrl(url);
            if (!result.ok) {
                bad.push({
                    url,
                    status: result.status,
                    keys: Array.from(usage.get(url) ?? []),
                    error: result.error,
                });
            }
        }
    };

    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    if (bad.length > 0) {
        console.error(`\n❌ 发现 ${bad.length} 个不可用 URL：`);
        for (const item of bad.slice(0, 30)) {
            const keys = item.keys.length ? ` (${item.keys.join(', ')})` : '';
            const err = item.error ? ` - ${item.error}` : '';
            console.error(`- ${item.status} ${item.url}${keys}${err}`);
        }
        if (bad.length > 30) console.error(`... (还有 ${bad.length - 30} 个未展示)`);
        process.exit(1);
    }

    console.log('✅ 全部 URL 可用');
}

main().catch((err) => {
    console.error('❌ 校验失败：', err);
    process.exit(1);
});

