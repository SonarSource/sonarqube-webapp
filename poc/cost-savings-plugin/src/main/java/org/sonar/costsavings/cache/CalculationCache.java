package org.sonar.costsavings.cache;

import java.time.Clock;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.sonar.api.server.ServerSide;

/**
 * In-memory TTL cache for computed dashboard data.
 * Keyed by period/query combination, stores fully computed response objects.
 *
 * <ul>
 *   <li>TTL: 10 minutes (dashboard data doesn't need real-time accuracy)</li>
 *   <li>Max entries: ~20 (a few period combinations)</li>
 *   <li>Thread-safe via ConcurrentHashMap</li>
 * </ul>
 */
@ServerSide
public class CalculationCache {

  static final Duration DEFAULT_TTL = Duration.ofMinutes(10);
  private static final int MAX_ENTRIES = 50;

  private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
  private final Duration ttl;
  private final Clock clock;

  public CalculationCache() {
    this(DEFAULT_TTL, Clock.systemUTC());
  }

  // Visible for testing
  CalculationCache(Duration ttl, Clock clock) {
    this.ttl = ttl;
    this.clock = clock;
  }

  @SuppressWarnings("unchecked")
  public <T> T get(String key, Class<T> type) {
    CacheEntry entry = cache.get(key);
    if (entry == null) {
      return null;
    }
    if (isExpired(entry)) {
      cache.remove(key);
      return null;
    }
    if (type.isInstance(entry.value)) {
      return (T) entry.value;
    }
    return null;
  }

  public void put(String key, Object value) {
    evictIfNeeded();
    cache.put(key, new CacheEntry(value, clock.millis()));
  }

  public void invalidateAll() {
    cache.clear();
  }

  public void invalidate(String key) {
    cache.remove(key);
  }

  public int size() {
    evictExpired();
    return cache.size();
  }

  private boolean isExpired(CacheEntry entry) {
    return (clock.millis() - entry.createdAt) > ttl.toMillis();
  }

  private void evictExpired() {
    cache.entrySet().removeIf(e -> isExpired(e.getValue()));
  }

  private void evictIfNeeded() {
    if (cache.size() >= MAX_ENTRIES) {
      evictExpired();
    }
    if (cache.size() >= MAX_ENTRIES) {
      // Evict oldest entry
      String oldestKey = null;
      long oldestTime = Long.MAX_VALUE;
      for (Map.Entry<String, CacheEntry> e : cache.entrySet()) {
        if (e.getValue().createdAt < oldestTime) {
          oldestTime = e.getValue().createdAt;
          oldestKey = e.getKey();
        }
      }
      if (oldestKey != null) {
        cache.remove(oldestKey);
      }
    }
  }

  private record CacheEntry(Object value, long createdAt) {}
}
