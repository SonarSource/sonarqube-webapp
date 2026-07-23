package org.sonar.costsavings.data;

import org.junit.jupiter.api.Test;
import org.sonar.costsavings.model.Industry;
import org.sonar.costsavings.model.Region;

import static org.assertj.core.api.Assertions.assertThat;

class IndustryBenchmarksTest {

  @Test
  void phaseMultiplier_shouldBe30xForVulnerabilities() {
    assertThat(IndustryBenchmarks.getPhaseMultiplier("VULNERABILITY")).isEqualTo(30.0);
    assertThat(IndustryBenchmarks.getPhaseMultiplier("SECURITY_HOTSPOT")).isEqualTo(30.0);
  }

  @Test
  void phaseMultiplier_shouldBe5xForBugsAndSmells() {
    assertThat(IndustryBenchmarks.getPhaseMultiplier("BUG")).isEqualTo(5.0);
    assertThat(IndustryBenchmarks.getPhaseMultiplier("CODE_SMELL")).isEqualTo(5.0);
  }

  @Test
  void phaseMultiplier_shouldBeCaseInsensitive() {
    assertThat(IndustryBenchmarks.getPhaseMultiplier("vulnerability")).isEqualTo(30.0);
    assertThat(IndustryBenchmarks.getPhaseMultiplier("bug")).isEqualTo(5.0);
  }

  @Test
  void getBreachCost_shouldReturnIndustrySpecificCost() {
    assertThat(IndustryBenchmarks.getBreachCost(Industry.HEALTHCARE)).isEqualTo(7_420_000L);
    assertThat(IndustryBenchmarks.getBreachCost(Industry.TECHNOLOGY)).isEqualTo(4_790_000L);
  }

  @Test
  void getRegionalBreachCost_shouldReturnRegionSpecificCost() {
    assertThat(IndustryBenchmarks.getRegionalBreachCost(Region.US)).isEqualTo(10_220_000L);
    assertThat(IndustryBenchmarks.getRegionalBreachCost(Region.GLOBAL)).isEqualTo(4_440_000L);
  }

  @Test
  void calculateGDPRExposure_shouldBeFourPercentOfRevenue() {
    // 4% of $50M = $2M
    assertThat(IndustryBenchmarks.calculateGDPRExposure(50_000_000)).isEqualTo(2_000_000L);
    // 4% of $100M = $4M
    assertThat(IndustryBenchmarks.calculateGDPRExposure(100_000_000)).isEqualTo(4_000_000L);
  }

  @Test
  void calculateRansomwareExposure_shouldCapAtRevenueForSmallCompanies() {
    // For a $1M company, the $5.75M average exceeds revenue — should cap at revenue
    assertThat(IndustryBenchmarks.calculateRansomwareExposure(1_000_000))
      .isEqualTo(1_000_000L);
  }

  @Test
  void calculateRansomwareExposure_shouldScaleWithHighRevenue() {
    // For high revenue: 2.3% of $1B = $23M > $5.75M avg
    long exposure = IndustryBenchmarks.calculateRansomwareExposure(1_000_000_000);
    assertThat(exposure).isGreaterThan(IndustryBenchmarks.RANSOMWARE_AVG_COST);
  }
}
