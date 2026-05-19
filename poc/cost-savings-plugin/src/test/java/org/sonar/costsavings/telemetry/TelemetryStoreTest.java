package org.sonar.costsavings.telemetry;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.sonar.costsavings.model.Industry;

import static org.assertj.core.api.Assertions.assertThat;

class TelemetryStoreTest {

  @TempDir
  Path tempDir;

  @Test
  void seedDemoData_shouldProvideRealisticDefaults() {
    TelemetryStore.AggregateData data = TelemetryStore.seedDemoData();

    assertThat(data.totalCustomers).isEqualTo(12);
    assertThat(data.byIndustry).containsKeys("HEALTHCARE", "TECHNOLOGY", "FINANCIAL");
  }

  @Test
  void getBenchmarks_shouldReturnSeededData() {
    TelemetryStore store = new TelemetryStore(tempDir);

    TelemetryStore.BenchmarkResponse response = store.getBenchmarks();

    assertThat(response.totalCustomers).isEqualTo(12);
    assertThat(response.avgSavingsByIndustry).containsKey("HEALTHCARE");
    assertThat(response.avgSavingsByIndustry.get("HEALTHCARE")).isEqualTo(284_000L);
    assertThat(response.avgSavingsByIndustry.get("TECHNOLOGY")).isEqualTo(187_000L);
    assertThat(response.avgVulnerabilityCategories).isGreaterThan(0);
    assertThat(response.maturityCurve).containsKeys("year1", "year2", "year3");
    assertThat(response.maturityCurve.get("year1")).isEqualTo(48_000L);
    assertThat(response.maturityCurve.get("year3")).isEqualTo(284_000L);
  }

  @Test
  void record_shouldIncrementAggregates() {
    TelemetryStore store = new TelemetryStore(tempDir);

    TelemetryStore.TelemetryEvent event = new TelemetryStore.TelemetryEvent(
      Industry.HEALTHCARE, 5, 100_000L, 8, "daily");

    store.record(event);

    TelemetryStore.BenchmarkResponse response = store.getBenchmarks();
    // Seeded HEALTHCARE had 3 customers with 852K total → avg 284K
    // After adding 1 more with 100K → 4 customers with 952K total → avg 238K
    assertThat(response.totalCustomers).isEqualTo(13);
    assertThat(response.avgSavingsByIndustry.get("HEALTHCARE")).isEqualTo(238_000L);
  }

  @Test
  void record_shouldCreateNewIndustryEntry() {
    TelemetryStore store = new TelemetryStore(tempDir);

    TelemetryStore.TelemetryEvent event = new TelemetryStore.TelemetryEvent(
      Industry.EDUCATION, 3, 50_000L, 4, "weekly");

    store.record(event);

    TelemetryStore.BenchmarkResponse response = store.getBenchmarks();
    assertThat(response.avgSavingsByIndustry).containsKey("EDUCATION");
    assertThat(response.avgSavingsByIndustry.get("EDUCATION")).isEqualTo(50_000L);
  }

  @Test
  void persist_shouldWriteJsonFile() {
    TelemetryStore store = new TelemetryStore(tempDir);

    TelemetryStore.TelemetryEvent event = new TelemetryStore.TelemetryEvent(
      Industry.TECHNOLOGY, 2, 75_000L, 5, "monthly");

    store.record(event);

    Path dataFile = tempDir.resolve("telemetry-aggregate.json");
    assertThat(Files.exists(dataFile)).isTrue();
  }

  @Test
  void loadFromDisk_shouldRestorePersistedData() {
    // First store: seed + record
    TelemetryStore store1 = new TelemetryStore(tempDir);
    store1.record(new TelemetryStore.TelemetryEvent(
      Industry.EDUCATION, 1, 30_000L, 2, "daily"));

    // Second store: should load persisted state
    TelemetryStore store2 = new TelemetryStore(tempDir);
    TelemetryStore.BenchmarkResponse response = store2.getBenchmarks();

    assertThat(response.totalCustomers).isEqualTo(13);
    assertThat(response.avgSavingsByIndustry).containsKey("EDUCATION");
  }
}
