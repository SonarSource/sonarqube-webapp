package org.sonar.costsavings.cache;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CalculationCacheTest {

  @Test
  void get_shouldReturnNullForMissing() {
    CalculationCache cache = new CalculationCache();
    assertThat(cache.get("nonexistent", String.class)).isNull();
  }

  @Test
  void putAndGet_shouldStoreAndRetrieve() {
    CalculationCache cache = new CalculationCache();
    cache.put("key1", "value1");
    assertThat(cache.get("key1", String.class)).isEqualTo("value1");
  }

  @Test
  void get_shouldReturnNullForWrongType() {
    CalculationCache cache = new CalculationCache();
    cache.put("key1", "value1");
    assertThat(cache.get("key1", Integer.class)).isNull();
  }

  @Test
  void get_shouldReturnNullAfterExpiry() {
    TestClock clock = new TestClock();
    CalculationCache cache = new CalculationCache(Duration.ofMinutes(10), clock);

    cache.put("key1", "value1");
    assertThat(cache.get("key1", String.class)).isEqualTo("value1");

    // Advance past TTL
    clock.advance(Duration.ofMinutes(11));
    assertThat(cache.get("key1", String.class)).isNull();
  }

  @Test
  void invalidateAll_shouldClearAllEntries() {
    CalculationCache cache = new CalculationCache();
    cache.put("key1", "v1");
    cache.put("key2", "v2");

    cache.invalidateAll();

    assertThat(cache.get("key1", String.class)).isNull();
    assertThat(cache.get("key2", String.class)).isNull();
    assertThat(cache.size()).isZero();
  }

  @Test
  void invalidate_shouldRemoveSingleEntry() {
    CalculationCache cache = new CalculationCache();
    cache.put("key1", "v1");
    cache.put("key2", "v2");

    cache.invalidate("key1");

    assertThat(cache.get("key1", String.class)).isNull();
    assertThat(cache.get("key2", String.class)).isEqualTo("v2");
  }

  @Test
  void size_shouldReflectActiveEntries() {
    CalculationCache cache = new CalculationCache();
    assertThat(cache.size()).isZero();

    cache.put("key1", "v1");
    cache.put("key2", "v2");
    assertThat(cache.size()).isEqualTo(2);
  }

  @Test
  void size_shouldExcludeExpiredEntries() {
    TestClock clock = new TestClock();
    CalculationCache cache = new CalculationCache(Duration.ofMinutes(10), clock);

    cache.put("key1", "v1");
    clock.advance(Duration.ofMinutes(11));
    cache.put("key2", "v2");

    assertThat(cache.size()).isEqualTo(1);
  }

  @Test
  void defaultTTL_shouldBeTenMinutes() {
    assertThat(CalculationCache.DEFAULT_TTL).isEqualTo(Duration.ofMinutes(10));
  }

  private static class TestClock extends Clock {
    private Instant now = Instant.now();

    void advance(Duration duration) {
      now = now.plus(duration);
    }

    @Override
    public ZoneId getZone() {
      return ZoneId.of("UTC");
    }

    @Override
    public Clock withZone(ZoneId zone) {
      return this;
    }

    @Override
    public Instant instant() {
      return now;
    }

    @Override
    public long millis() {
      return now.toEpochMilli();
    }
  }
}
