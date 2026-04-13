package org.sonar.costsavings.calculation;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.sonar.costsavings.data.CWEBreachBenchmarks;
import org.sonar.costsavings.data.CWEBreachBenchmarks.CategoryInfo;
import org.sonar.costsavings.data.ComplianceMapping;
import org.sonar.costsavings.data.IndustryBenchmarks;
import org.sonar.costsavings.model.CompanyProfile;
import org.sonar.costsavings.model.SecurityDetail;
import org.sonar.costsavings.model.SecurityDetail.RevenueContext;
import org.sonar.costsavings.model.SecurityDetail.ScaDependencyRisks;
import org.sonar.costsavings.model.SecurityDetail.SecurityCategory;

/**
 * Tier B: "Security Risk Context" builder.
 *
 * Presents what SonarQube found alongside what those vulnerability classes cost the industry.
 * Does NOT calculate dollar savings. Does NOT use probability math.
 *
 * Each narrative card follows three parts:
 * 1. What SonarQube found — in plain language
 * 2. What it costs the industry — IBM/Ponemon benchmark with citation
 * 3. Why it matters here — connected to user's configured context
 */
public class SecurityContextBuilder {

  private static final String BENCHMARK_SOURCE = "IBM/Ponemon 2025";

  /**
   * Builds the security detail response from SQ facet data.
   *
   * @param categoryFacets map of sonarsourceSecurity category -> issue count
   * @param severityBreakdown map of severity -> count (global across all vuln types)
   * @param categorySeverities map of category -> (severity -> count)
   * @param scaCount SCA dependency vulnerability count
   * @param profile company profile for industry context
   */
  public SecurityDetail build(
    Map<String, Integer> categoryFacets,
    Map<String, Integer> severityBreakdown,
    Map<String, Map<String, Integer>> categorySeverities,
    int scaCount,
    CompanyProfile profile) {

    List<SecurityCategory> categories = buildCategories(categoryFacets, categorySeverities, profile);

    ScaDependencyRisks scaRisks = new ScaDependencyRisks()
      .setCount(scaCount)
      .setSupplyChainBenchmark(IndustryBenchmarks.SUPPLY_CHAIN_AVG_COST)
      .setNarrative(buildScaNarrative(scaCount));

    SecurityDetail detail = new SecurityDetail()
      .setCategories(categories)
      .setTotalBySeverity(severityBreakdown)
      .setScaDependencyRisks(scaRisks);

    if (profile.hasRevenueData()) {
      detail.setRevenueContext(buildRevenueContext(profile));
    }

    return detail;
  }

  private List<SecurityCategory> buildCategories(
    Map<String, Integer> categoryFacets,
    Map<String, Map<String, Integer>> categorySeverities,
    CompanyProfile profile) {

    List<SecurityCategory> categories = new ArrayList<>();

    for (Map.Entry<String, Integer> entry : categoryFacets.entrySet()) {
      String sqCategory = entry.getKey();
      int issueCount = entry.getValue();

      CategoryInfo info = CWEBreachBenchmarks.getCategory(sqCategory);
      if (info == null) {
        continue;
      }

      String narrative = CWEBreachBenchmarks.formatNarrative(sqCategory, issueCount, profile.getIndustry());
      Map<String, Integer> severities = categorySeverities.getOrDefault(sqCategory, Map.of());

      List<String> complianceFrameworks = ComplianceMapping.getFrameworks(sqCategory);

      // Per-category benchmark: industry avg × category cost multiplier
      long categoryBenchmark = Math.round(profile.getIndustry().getAvgBreachCostUsd() * info.costMultiplier());
      String benchmarkDesc = BENCHMARK_SOURCE + " — " + info.benchmarkLabel()
        + " (" + profile.getIndustry().getDisplayName() + ")";

      categories.add(new SecurityCategory()
        .setCategory(info.displayName())
        .setCategoryKey(sqCategory)
        .setCwe(info.cweIds())
        .setOwasp(info.owaspCategory())
        .setIssueCount(issueCount)
        .setSeverityBreakdown(severities)
        .setIndustryBenchmarkCost(categoryBenchmark)
        .setBenchmarkSource(benchmarkDesc)
        .setNarrative(narrative)
        .setComplianceFrameworks(complianceFrameworks));
    }

    // Sort by issue count descending — most impactful first
    categories.sort((a, b) -> Integer.compare(b.getIssueCount(), a.getIssueCount()));

    return categories;
  }

  private String buildScaNarrative(int scaCount) {
    if (scaCount == 0) {
      return "No known dependency vulnerabilities detected. SonarQube is actively scanning your project dependencies.";
    }
    return String.format(
      "%d known dependency vulnerabilities. Supply chain attacks cost an average of %s (IBM 2025).",
      scaCount, CWEBreachBenchmarks.formatDollars(IndustryBenchmarks.SUPPLY_CHAIN_AVG_COST));
  }

  private RevenueContext buildRevenueContext(CompanyProfile profile) {
    double revenue = profile.getAnnualRevenue();
    long gdprExposure = IndustryBenchmarks.calculateGDPRExposure(revenue);
    long ransomwareExposure = IndustryBenchmarks.calculateRansomwareExposure(revenue);

    String narrative = String.format(
      "Based on your reported revenue, maximum GDPR fine exposure is %s. " +
        "Average ransomware cost for organizations your size: %s.",
      CWEBreachBenchmarks.formatDollars(gdprExposure),
      CWEBreachBenchmarks.formatDollars(ransomwareExposure));

    return new RevenueContext()
      .setMaxGDPRExposure(gdprExposure)
      .setAvgRansomwareCost(ransomwareExposure)
      .setNarrative(narrative);
  }
}
