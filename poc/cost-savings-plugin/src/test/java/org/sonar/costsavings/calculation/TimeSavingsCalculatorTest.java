package org.sonar.costsavings.calculation;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.sonar.costsavings.data.IndustryBenchmarks;
import org.sonar.costsavings.model.CompanyProfile;
import org.sonar.costsavings.model.CostSummary.DimensionSavings;
import org.sonar.costsavings.model.CostSummary.TimeSavings;

import static org.assertj.core.api.Assertions.assertThat;

class TimeSavingsCalculatorTest {

  private final TimeSavingsCalculator calculator = new TimeSavingsCalculator();

  @Test
  void calculate_shouldComputeSavingsFromEffortDelta() {
    // Effort decreased from 6000 to 3000 minutes = 3000 minutes saved
    Map<String, Long> maintHistory = orderedMap("2024-01-01", 6000L, "2025-01-01", 3000L);
    Map<String, Long> secHistory = orderedMap("2024-01-01", 1200L, "2025-01-01", 600L);
    Map<String, Long> relHistory = orderedMap("2024-01-01", 1800L, "2025-01-01", 1200L);

    CompanyProfile profile = CompanyProfile.defaults(); // $75/hr

    TimeSavings result = calculator.calculate(maintHistory, secHistory, relHistory,
      profile, LocalDate.of(2024, 1, 1), LocalDate.of(2025, 1, 1));

    // Maintainability: 3000 min / 60 = 50 hours × $75 × 5x = $18,750
    assertThat(result.getMaintainability().getHours()).isEqualTo(50);
    assertThat(result.getMaintainability().getDollars()).isEqualTo(18750);
    assertThat(result.getMaintainability().isNetNewDebt()).isFalse();

    // Security: 600 min / 60 = 10 hours × $75 × 30x = $22,500
    assertThat(result.getSecurity().getHours()).isEqualTo(10);
    assertThat(result.getSecurity().getDollars()).isEqualTo(22500);

    // Reliability: 600 min / 60 = 10 hours × $75 × 5x = $3,750
    assertThat(result.getReliability().getHours()).isEqualTo(10);
    assertThat(result.getReliability().getDollars()).isEqualTo(3750);

    // Total
    assertThat(result.getTotal().getDollars()).isEqualTo(18750 + 22500 + 3750);
    assertThat(result.getTotal().getHours()).isEqualTo(70);
    assertThat(result.getTotal().isNetNewDebt()).isFalse();
  }

  @Test
  void calculate_shouldHandleNetNewDebt() {
    // Effort increased from 3000 to 6000 = 3000 minutes of new debt
    Map<String, Long> history = orderedMap("2024-01-01", 3000L, "2025-01-01", 6000L);

    CompanyProfile profile = CompanyProfile.defaults();

    DimensionSavings result = calculator.calculateDimension(history,
      profile.getEffectiveHourlyRate(), IndustryBenchmarks.BUG_PHASE_MULTIPLIER);

    assertThat(result.isNetNewDebt()).isTrue();
    assertThat(result.getDollars()).isNegative();
    assertThat(result.getHours()).isNegative();
  }

  @Test
  void calculate_shouldHandleEmptyHistory() {
    Map<String, Long> empty = Map.of();
    CompanyProfile profile = CompanyProfile.defaults();

    DimensionSavings result = calculator.calculateDimension(empty,
      profile.getEffectiveHourlyRate(), IndustryBenchmarks.BUG_PHASE_MULTIPLIER);

    assertThat(result.getDollars()).isZero();
    assertThat(result.getHours()).isZero();
    assertThat(result.isNetNewDebt()).isFalse();
  }

  @Test
  void calculate_shouldUseCustomHourlyRate() {
    Map<String, Long> history = orderedMap("2024-01-01", 1200L, "2025-01-01", 0L);
    CompanyProfile profile = CompanyProfile.defaults().setHourlyRate(150.0);

    DimensionSavings result = calculator.calculateDimension(history,
      profile.getEffectiveHourlyRate(), IndustryBenchmarks.BUG_PHASE_MULTIPLIER);

    // 1200 min / 60 = 20 hours × $150 × 5x = $15,000
    assertThat(result.getHours()).isEqualTo(20);
    assertThat(result.getDollars()).isEqualTo(15000);
  }

  @Test
  void calculate_shouldUseVulnerabilityMultiplierForSecurity() {
    Map<String, Long> history = orderedMap("2024-01-01", 600L, "2025-01-01", 0L);
    CompanyProfile profile = CompanyProfile.defaults();

    DimensionSavings result = calculator.calculateDimension(history,
      profile.getEffectiveHourlyRate(), IndustryBenchmarks.VULNERABILITY_PHASE_MULTIPLIER);

    // 600 min / 60 = 10 hours × $75 × 30x = $22,500
    assertThat(result.getDollars()).isEqualTo(22500);
  }

  @Test
  void calculate_shouldHandleSingleDataPoint() {
    // Single data point = no delta = zero savings
    Map<String, Long> history = orderedMap("2024-06-15", 5000L);

    DimensionSavings result = calculator.calculateDimension(history,
      75.0, IndustryBenchmarks.BUG_PHASE_MULTIPLIER);

    assertThat(result.getDollars()).isZero();
    assertThat(result.getHours()).isZero();
  }

  private static Map<String, Long> orderedMap(Object... keysAndValues) {
    Map<String, Long> map = new LinkedHashMap<>();
    for (int i = 0; i < keysAndValues.length - 1; i += 2) {
      map.put((String) keysAndValues[i], ((Number) keysAndValues[i + 1]).longValue());
    }
    return map;
  }
}
