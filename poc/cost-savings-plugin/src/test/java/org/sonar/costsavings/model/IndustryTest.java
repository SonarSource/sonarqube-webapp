package org.sonar.costsavings.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class IndustryTest {

  @Test
  void allIndustries_shouldHavePositiveBreachCosts() {
    for (Industry industry : Industry.values()) {
      assertThat(industry.getAvgBreachCostUsd())
        .as("Breach cost for %s", industry.name())
        .isPositive();
    }
  }

  @Test
  void healthcare_shouldBeHighestCost() {
    long max = 0;
    Industry highest = null;
    for (Industry industry : Industry.values()) {
      if (industry.getAvgBreachCostUsd() > max) {
        max = industry.getAvgBreachCostUsd();
        highest = industry;
      }
    }
    assertThat(highest).isEqualTo(Industry.HEALTHCARE);
  }

  @Test
  void allIndustries_shouldHaveDisplayNames() {
    for (Industry industry : Industry.values()) {
      assertThat(industry.getDisplayName())
        .as("Display name for %s", industry.name())
        .isNotBlank();
    }
  }
}
