package org.sonar.costsavings.model;

/**
 * Geographic regions with IBM/Ponemon 2025 regional breach cost averages (USD).
 */
public enum Region {
  US("United States", 10_220_000),
  MIDDLE_EAST("Middle East", 8_750_000),
  CANADA("Canada", 5_130_000),
  GERMANY("Germany", 5_310_000),
  JAPAN("Japan", 4_530_000),
  UK("United Kingdom", 4_530_000),
  FRANCE("France", 4_270_000),
  ITALY("Italy", 4_180_000),
  LATIN_AMERICA("Latin America", 3_690_000),
  SOUTH_KOREA("South Korea", 3_460_000),
  ASEAN("ASEAN", 3_230_000),
  AUSTRALIA("Australia", 2_780_000),
  INDIA("India", 2_180_000),
  GLOBAL("Global Average", 4_440_000);

  private final String displayName;
  private final long avgBreachCostUsd;

  Region(String displayName, long avgBreachCostUsd) {
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
