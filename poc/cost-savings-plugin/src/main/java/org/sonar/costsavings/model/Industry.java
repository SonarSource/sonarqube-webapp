package org.sonar.costsavings.model;

/**
 * Industry categories with IBM/Ponemon 2025 average breach costs (USD).
 */
public enum Industry {
  HEALTHCARE("Healthcare", 7_420_000),
  FINANCIAL("Financial Services", 5_560_000),
  PHARMACEUTICAL("Pharmaceutical", 5_010_000),
  MANUFACTURING("Manufacturing", 5_000_000),
  TECHNOLOGY("Technology", 4_790_000),
  ENERGY("Energy", 4_720_000),
  PROFESSIONAL_SERVICES("Professional Services", 4_700_000),
  TRANSPORTATION("Transportation", 4_560_000),
  COMMUNICATIONS("Communications", 4_370_000),
  EDUCATION("Education", 3_900_000),
  RETAIL("Retail", 3_480_000),
  MEDIA("Media", 3_350_000),
  HOSPITALITY("Hospitality", 3_140_000),
  PUBLIC_SECTOR("Public Sector", 2_600_000),
  OTHER("Other", 4_440_000); // Global average

  private final String displayName;
  private final long avgBreachCostUsd;

  Industry(String displayName, long avgBreachCostUsd) {
    this.displayName = displayName;
    this.avgBreachCostUsd = avgBreachCostUsd;
  }

  public String getDisplayName() {
    return displayName;
  }

  public long getAvgBreachCostUsd() {
    return avgBreachCostUsd;
  }
}
