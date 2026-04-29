package org.sonar.costsavings.calculation;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.sonar.costsavings.data.IndustryBenchmarks;
import org.sonar.costsavings.model.CompanyProfile;
import org.sonar.costsavings.model.CostSummary.DimensionSavings;
import org.sonar.costsavings.model.CostSummary.TimeSavings;

/**
 * Tier A: "Time Saved" calculation.
 *
 * Formula: savings = (remediation_minutes / 60) × hourly_rate × phase_multiplier
 *
 * Uses SQ's effort measures delta over the selected period to compute
 * how much remediation work was done (effort at start - effort at end = minutes saved).
 *
 * Phase multipliers:
 * - Bugs/code smells: 5x (Boehm & Basili 2001)
 * - Vulnerabilities: 30x (HackerOne empirical)
 */
public class TimeSavingsCalculator {

  /**
   * Calculates Tier A time savings from effort measure deltas.
   *
   * @param maintainabilityHistory effort history (date -> minutes) for maintainability
   * @param securityHistory effort history for security
   * @param reliabilityHistory effort history for reliability
   * @param profile the company profile for hourly rate
   * @param from period start
   * @param to period end
   */
  public TimeSavings calculate(
    Map<String, Long> maintainabilityHistory,
    Map<String, Long> securityHistory,
    Map<String, Long> reliabilityHistory,
    CompanyProfile profile,
    LocalDate from,
    LocalDate to) {

    double hourlyRate = profile.getEffectiveHourlyRate();

    DimensionSavings maintainability = calculateDimension(maintainabilityHistory,
      hourlyRate, IndustryBenchmarks.CODE_SMELL_PHASE_MULTIPLIER);
    DimensionSavings security = calculateDimension(securityHistory,
      hourlyRate, IndustryBenchmarks.VULNERABILITY_PHASE_MULTIPLIER);
    DimensionSavings reliability = calculateDimension(reliabilityHistory,
      hourlyRate, IndustryBenchmarks.BUG_PHASE_MULTIPLIER);

    DimensionSavings total = aggregateTotal(maintainability, security, reliability);

    return new TimeSavings()
      .setMaintainability(maintainability)
      .setSecurity(security)
      .setReliability(reliability)
      .setTotal(total);
  }

  /**
   * Calculates savings for a single quality dimension from measure history.
   * Delta = first value in period - last value in period.
   * Positive delta = effort reduced = savings.
   * Negative delta = net new debt.
   */
  DimensionSavings calculateDimension(Map<String, Long> history,
    double hourlyRate, double phaseMultiplier) {
    if (history.isEmpty()) {
      return new DimensionSavings().setDollars(0).setHours(0).setNetNewDebt(false);
    }

    List<Long> values = history.values().stream().toList();
    long firstValue = values.get(0);
    long lastValue = values.get(values.size() - 1);

    // Positive delta means effort decreased = work was done = savings
    long deltaMinutes = firstValue - lastValue;
    boolean netNewDebt = deltaMinutes < 0;

    long absMinutes = Math.abs(deltaMinutes);
    long hours = absMinutes / 60;
    long dollars = Math.round((absMinutes / 60.0) * hourlyRate * phaseMultiplier);

    if (netNewDebt) {
      // Show as negative when debt increased
      return new DimensionSavings()
        .setDollars(-dollars)
        .setHours(-hours)
        .setNetNewDebt(true);
    }

    return new DimensionSavings()
      .setDollars(dollars)
      .setHours(hours)
      .setNetNewDebt(false);
  }

  private DimensionSavings aggregateTotal(DimensionSavings... dimensions) {
    long totalDollars = 0;
    long totalHours = 0;
    boolean anyNetNewDebt = false;

    for (DimensionSavings dim : dimensions) {
      totalDollars += dim.getDollars();
      totalHours += dim.getHours();
      if (dim.isNetNewDebt()) {
        anyNetNewDebt = true;
      }
    }

    return new DimensionSavings()
      .setDollars(totalDollars)
      .setHours(totalHours)
      .setNetNewDebt(totalDollars < 0);
  }
}
