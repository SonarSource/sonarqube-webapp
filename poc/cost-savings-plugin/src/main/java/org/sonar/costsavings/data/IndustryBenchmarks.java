package org.sonar.costsavings.data;

import org.sonar.costsavings.model.Industry;
import org.sonar.costsavings.model.Region;

/**
 * Static benchmark data from IBM/Ponemon Cost of a Data Breach 2025.
 * All values in USD.
 *
 * Sources:
 * - IBM/Ponemon 2025: https://www.ibm.com/reports/data-breach
 * - Verizon DBIR 2025: https://www.verizon.com/business/resources/reports/dbir/
 * - HackerOne: https://www.hackerone.com/blog/cost-savings-fixing-security-flaws
 * - Boehm & Basili 2001: IEEE Computer, "Software Defect Reduction Top 10 List"
 */
public final class IndustryBenchmarks {

  // Phase multipliers (Tier A)
  // Boehm & Basili 2001 — conservative end of the 5-15x range
  public static final double BUG_PHASE_MULTIPLIER = 5.0;
  public static final double CODE_SMELL_PHASE_MULTIPLIER = 5.0;
  // HackerOne empirical — pre-production fix ~$50 vs ~$1,500 post-production
  public static final double VULNERABILITY_PHASE_MULTIPLIER = 30.0;

  // Supply chain attack average cost (IBM/Ponemon 2025)
  public static final long SUPPLY_CHAIN_AVG_COST = 4_910_000L;

  // Breach lifecycle costs (IBM/Ponemon 2025)
  public static final long BREACH_UNDER_200_DAYS = 3_610_000L;
  public static final long BREACH_OVER_200_DAYS = 5_490_000L;

  // Per-record costs (IBM/Ponemon 2025)
  public static final int COST_PER_RECORD_CUSTOMER_PII = 160;
  public static final int COST_PER_RECORD_EMPLOYEE_PII = 168;
  public static final int COST_PER_RECORD_IP = 178;

  // GDPR fine ceiling: 4% of global annual turnover
  public static final double GDPR_FINE_PERCENTAGE = 0.04;

  // Ransomware average as percentage of revenue (derived from FBI IC3 2024 / IBM 2025 data)
  // Conservative: median ransomware demand relative to victim revenue
  public static final double RANSOMWARE_REVENUE_PERCENTAGE = 0.023;

  // Average ransomware cost (IBM/Ponemon 2025)
  public static final long RANSOMWARE_AVG_COST = 5_750_000L;

  private IndustryBenchmarks() {
    // utility class
  }

  public static long getBreachCost(Industry industry) {
    return industry.getAvgBreachCostUsd();
  }

  public static long getRegionalBreachCost(Region region) {
    return region.getAvgBreachCostUsd();
  }

  /**
   * Returns the phase multiplier for converting detected-in-dev effort
   * to estimated production-fix cost.
   */
  public static double getPhaseMultiplier(String issueType) {
    return switch (issueType.toUpperCase()) {
      case "VULNERABILITY", "SECURITY_HOTSPOT" -> VULNERABILITY_PHASE_MULTIPLIER;
      default -> BUG_PHASE_MULTIPLIER;
    };
  }

  /**
   * GDPR maximum fine: 4% of global annual turnover (or EUR 20M, whichever is greater).
   * For simplicity in this POC, we use 4% of reported revenue.
   */
  public static long calculateGDPRExposure(double annualRevenue) {
    return Math.round(annualRevenue * GDPR_FINE_PERCENTAGE);
  }

  /**
   * Ransomware cost estimate based on revenue.
   * Uses the revenue-scaled estimate (2.3% of revenue) or the global average,
   * whichever is higher — but never exceeds the company's annual revenue,
   * since a ransomware figure larger than total revenue is misleading.
   */
  public static long calculateRansomwareExposure(double annualRevenue) {
    long revenueScaled = Math.round(annualRevenue * RANSOMWARE_REVENUE_PERCENTAGE);
    long estimate = Math.max(revenueScaled, RANSOMWARE_AVG_COST);
    // Cap at annual revenue — showing $5.75M for a $5M company is not credible
    return Math.min(estimate, Math.round(annualRevenue));
  }
}
