package org.sonar.costsavings.telemetry;

import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.sonar.costsavings.model.CompanyProfile;
import org.sonar.costsavings.model.Industry;

import static org.assertj.core.api.Assertions.assertThat;

class TelemetryCollectorTest {

  @TempDir
  Path tempDir;

  @Test
  void recordCalculation_shouldSkipWhenNotOptedIn() {
    TelemetryStore store = new TelemetryStore(tempDir);
    TelemetryCollector collector = new TelemetryCollector(store);

    int initialCustomers = store.getBenchmarks().totalCustomers;

    CompanyProfile profile = CompanyProfile.defaults(); // telemetryOptIn is null (false)
    collector.recordCalculation(profile, 5, 100_000L, 8, "daily");

    assertThat(store.getBenchmarks().totalCustomers).isEqualTo(initialCustomers);
  }

  @Test
  void recordCalculation_shouldRecordWhenOptedIn() {
    TelemetryStore store = new TelemetryStore(tempDir);
    TelemetryCollector collector = new TelemetryCollector(store);

    int initialCustomers = store.getBenchmarks().totalCustomers;

    CompanyProfile profile = CompanyProfile.defaults().setTelemetryOptIn(true);
    collector.recordCalculation(profile, 5, 100_000L, 8, "daily");

    assertThat(store.getBenchmarks().totalCustomers).isEqualTo(initialCustomers + 1);
  }

  @Test
  void roundToThousand_shouldRoundCorrectly() {
    assertThat(TelemetryCollector.roundToThousand(1_499)).isEqualTo(1_000);
    assertThat(TelemetryCollector.roundToThousand(1_500)).isEqualTo(2_000);
    assertThat(TelemetryCollector.roundToThousand(0)).isEqualTo(0);
    assertThat(TelemetryCollector.roundToThousand(284_321)).isEqualTo(284_000);
  }

  @Test
  void recordCalculation_shouldHandleNullScanFrequency() {
    TelemetryStore store = new TelemetryStore(tempDir);
    TelemetryCollector collector = new TelemetryCollector(store);

    CompanyProfile profile = CompanyProfile.defaults().setTelemetryOptIn(true);
    collector.recordCalculation(profile, 3, 50_000L, 4, null);

    // Should not throw, and should record
    assertThat(store.getBenchmarks().totalCustomers).isEqualTo(13);
  }
}
