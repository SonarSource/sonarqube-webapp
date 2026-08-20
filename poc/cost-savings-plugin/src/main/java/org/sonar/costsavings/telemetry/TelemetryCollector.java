package org.sonar.costsavings.telemetry;

import org.sonar.api.server.ServerSide;
import org.sonar.costsavings.model.CompanyProfile;
import org.sonar.costsavings.model.Industry;

/**
 * Collects anonymized calculation metrics when telemetry is opted in.
 * <p>
 * Data collected per calculation event:
 * - industry (enum)
 * - projectCount (int)
 * - totalSavings (long, rounded to nearest $1000)
 * - vulnerabilityCategoryCount (int)
 * - scanFrequency (daily/weekly/monthly)
 * <p>
 * NO project names, NO company names, NO IP addresses.
 */
@ServerSide
public class TelemetryCollector {

  private final TelemetryStore store;

  public TelemetryCollector(TelemetryStore store) {
    this.store = store;
  }

  /**
   * Records an anonymized calculation event if the profile has opted in.
   */
  public void recordCalculation(CompanyProfile profile, int projectCount,
    long totalSavings, int vulnerabilityCategoryCount, String scanFrequency) {
    if (!profile.isTelemetryOptedIn()) {
      return;
    }

    TelemetryStore.TelemetryEvent event = new TelemetryStore.TelemetryEvent(
      profile.getIndustry(),
      projectCount,
      roundToThousand(totalSavings),
      vulnerabilityCategoryCount,
      scanFrequency != null ? scanFrequency : "unknown");

    store.record(event);
  }

  /**
   * Round savings to nearest $1000 for anonymization.
   */
  static long roundToThousand(long value) {
    return Math.round(value / 1000.0) * 1000;
  }
}
