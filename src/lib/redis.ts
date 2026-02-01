import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable not configured');
}

export const redis = new Redis(process.env.REDIS_URL);

export const RATE_LIMIT_PREFIX = 'rate_limit:';
export const TRENDING_APPS_KEY = 'trending:apps';
export const APP_VIEWS_PREFIX = 'app:views:';
export const SESSION_CACHE_PREFIX = 'session:';

export async function incrementAppViews(appId: string, ip?: string): Promise<{ views: number; isNewView: boolean }> {
  // If IP provided, check for unique view
  if (ip) {
    const viewKey = `${APP_VIEWS_PREFIX}${appId}:ips`;
    const alreadyViewed = await redis.sismember(viewKey, ip);

    if (alreadyViewed) {
      // IP already viewed this app, just return current count
      const currentViews = await redis.get(`${APP_VIEWS_PREFIX}${appId}`);
      return { views: parseInt(currentViews || '0'), isNewView: false };
    }

    // Add IP to set (expire after 24 hours to allow re-counting)
    await redis.sadd(viewKey, ip);
    await redis.expire(viewKey, 86400); // 24 hours
  }

  const views = await redis.incr(`${APP_VIEWS_PREFIX}${appId}`);
  await redis.zincrby(TRENDING_APPS_KEY, 1, appId);

  return { views, isNewView: true };
}

export async function getAppViews(appId: string): Promise<number> {
  const views = await redis.get(`${APP_VIEWS_PREFIX}${appId}`);
  return parseInt(views || '0');
}

export async function getTrendingApps(limit: number = 10): Promise<string[]> {
  return await redis.zrange(TRENDING_APPS_KEY, 0, limit - 1, 'REV');
}

export async function cacheAppMetadata(appId: string, data: unknown, ttl: number = 3600): Promise<void> {
  await redis.setex(`app:metadata:${appId}`, ttl, JSON.stringify(data));
}

export async function getCachedAppMetadata<T>(appId: string): Promise<T | null> {
  const data = await redis.get(`app:metadata:${appId}`);
  return data ? JSON.parse(data) as T : null;
}
