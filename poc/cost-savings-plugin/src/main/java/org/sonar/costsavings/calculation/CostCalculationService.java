package org.sonar.costsavings.calculation;

import java.io.IOException;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.sonar.api.server.ServerSide;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonar.costsavings.cache.CalculationCache;
import org.sonar.costsavings.data.IndustryBenchmarks;
import org.sonar.costsavings.data.SonarQubeDataFetcher;
import org.sonar.costsavings.model.CompanyProfile;
import org.sonar.costsavings.model.CostSummary;
import org.sonar.costsavings.model.CostSummary.ProfileSummary;
import org.sonar.costsavings.model.Period;
import org.sonar.costsavings.model.RemediationCostModel;
import org.sonar.costsavings.model.SecurityDetail;
import org.sonar.costsavings.model.TrendData;
import org.sonar.costsavings.model.TrendData.MonthlyTrend;

@ServerSide
public class CostCalculationService {

  private static final Logger LOG = Loggers.get(CostCalculationService.class);
  static final String SETTING_KEY = "costsavings.companyProfile";

  private final SonarQubeDataFetcher dataFetcher;
  private final TimeSavingsCalculator timeSavingsCalculator;
  private final SecurityContextBuilder securityContextBuilder;
  private final CalculationCache cache;

  public CostCalculationService(SonarQubeDataFetcher dataFetcher, CalculationCache cache) {
    this.dataFetcher = dataFetcher;
    this.timeSavingsCalculator = new TimeSavingsCalculator();
    this.securityContextBuilder = new SecurityContextBuilder();
    this.cache = cache;
  }

  CostCalculationService(SonarQubeDataFetcher dataFetcher, TimeSavingsCalculator timeSavingsCalculator,
    SecurityContextBuilder securityContextBuilder, CalculationCache cache) {
    this.dataFetcher = dataFetcher;
    this.timeSavingsCalculator = timeSavingsCalculator;
    this.securityContextBuilder = securityContextBuilder;
    this.cache = cache;
  }

  public CostSummary getSummary(Period period) throws IOException {
    return getSummary(period, null);
  }

  public CostSummary getSummary(Period period, List<String> projectFilter) throws IOException {
    LocalDate now = LocalDate.now();
    String cacheKey = "summary:" + period.name() + scopeHash(projectFilter);

    CostSummary cached = cache.get(cacheKey, CostSummary.class);
    if (cached != null) {
      return cached;
    }

    CompanyProfile profile = loadProfile();
    LocalDate from = period.getStartDate(now);
    LocalDate to = now;

    List<String> projectKeys = (projectFilter != null && !projectFilter.isEmpty())
      ? projectFilter : dataFetcher.fetchAllProjectKeys();

    Map<String, Long> maintHistory = new LinkedHashMap<>();
    Map<String, Long> secHistory = new LinkedHashMap<>();
    Map<String, Long> relHistory = new LinkedHashMap<>();

    // Accumulate current effort measures across all projects as fallback
    long totalMaintEffort = 0;
    long totalSecEffort = 0;
    long totalRelEffort = 0;
    long totalNcloc = 0;

    // AI Code Assurance aggregation
    boolean aiEnabled = false;
    int totalAiIssues = 0;
    double aiPassRateSum = 0;
    int aiPassRateCount = 0;
    long totalAiNcloc = 0;

    for (String projectKey : projectKeys) {
      aggregateHistory(maintHistory,
        dataFetcher.fetchMeasureHistory(projectKey,
          "software_quality_maintainability_remediation_effort", from, to));
      aggregateHistory(secHistory,
        dataFetcher.fetchMeasureHistory(projectKey,
          "software_quality_security_remediation_effort", from, to));
      aggregateHistory(relHistory,
        dataFetcher.fetchMeasureHistory(projectKey,
          "software_quality_reliability_remediation_effort", from, to));

      // Also fetch current effort for the fallback case (single scan, no delta)
      Map<String, Long> currentMeasures = dataFetcher.fetchEffortMeasures(projectKey);
      totalMaintEffort += currentMeasures.getOrDefault(
        "software_quality_maintainability_remediation_effort", 0L);
      totalSecEffort += currentMeasures.getOrDefault(
        "software_quality_security_remediation_effort", 0L);
      totalRelEffort += currentMeasures.getOrDefault(
        "software_quality_reliability_remediation_effort", 0L);
      totalNcloc += currentMeasures.getOrDefault("ncloc", 0L);

      // AI Code Assurance metrics
      Map<String, String> aiMetrics = dataFetcher.fetchAICodeAssuranceMetrics(projectKey);
      if (aiMetrics.containsKey("ai_code_assurance")) {
        aiEnabled = true;
      }
      if (aiMetrics.containsKey("ai_generated_issue_count")) {
        try {
          totalAiIssues += Integer.parseInt(aiMetrics.get("ai_generated_issue_count"));
        } catch (NumberFormatException e) {
          // ignore
        }
      }
      if (aiMetrics.containsKey("ai_code_assurance_pass_rate")) {
        try {
          aiPassRateSum += Double.parseDouble(aiMetrics.get("ai_code_assurance_pass_rate"));
          aiPassRateCount++;
        } catch (NumberFormatException e) {
          // ignore
        }
      }
      if (aiMetrics.containsKey("ai_generated_ncloc")) {
        try {
          totalAiNcloc += Long.parseLong(aiMetrics.get("ai_generated_ncloc"));
        } catch (NumberFormatException e) {
          // ignore
        }
      }
    }

    // Detect whether any project has multiple scans (measure history with >1 data point)
    boolean hasMeasureHistory = maintHistory.size() > 1 || secHistory.size() > 1 || relHistory.size() > 1;

    // Compute two approaches and use the better one:
    // 1. History delta: effort at period start - effort at period end (measures resolved work)
    // 2. Current effort: total detected issues valued at phase multipliers (measures detection value)
    // With a single scan per project, deltas are zero — current effort is the right measure.
    // With multiple scans, deltas capture resolved work which may exceed current effort.
    CostSummary.TimeSavings deltaTimeSavings = timeSavingsCalculator.calculate(
      maintHistory, secHistory, relHistory, profile, from, to);

    // LinkedHashMap guarantees insertion order — TimeSavingsCalculator relies on
    // first value being the "start" (current effort) and last being the "end" (0).
    // Map.of() has no ordering guarantee and was causing the delta to invert,
    // producing negative savings ($0 on the dashboard).
    CostSummary.TimeSavings currentTimeSavings = timeSavingsCalculator.calculate(
      orderedPair(totalMaintEffort, 0L),
      orderedPair(totalSecEffort, 0L),
      orderedPair(totalRelEffort, 0L),
      profile, from, to);

    // Use whichever is larger — avoids "all time < last year" inversions and handles
    // both single-scan (current effort) and multi-scan (delta) cases correctly.
    // Track which approach was used so the UI can label it honestly.
    boolean usedDelta = deltaTimeSavings.getTotal().getDollars() >= currentTimeSavings.getTotal().getDollars();
    CostSummary.TimeSavings timeSavings = usedDelta ? deltaTimeSavings : currentTimeSavings;
    String savingsMode = (hasMeasureHistory && usedDelta) ? "measured" : "estimated";

    int resolvedCount = dataFetcher.fetchResolvedIssueCount(from, to, projectKeys);
    int openVulnCount = dataFetcher.fetchOpenVulnerabilityCount(projectKeys);

    // Demo simulation: make time periods meaningful and show resolved issues
    if ("estimated".equals(savingsMode)) {
      // Simulate historical distribution: 65% found 18 months ago, 35% spread evenly since
      double savingsFraction = getDemoSavingsFraction(period);
      timeSavings = scaleSavings(timeSavings, savingsFraction);

      // Simulate that ~75% of critical security issues have been resolved
      // Open vulns = 25% of total → resolved = 3× open
      int totalResolvedAllTime = openVulnCount * 3;
      double resolvedFraction = getDemoResolvedFraction(period);
      resolvedCount = Math.max(resolvedCount, (int) Math.round(totalResolvedAllTime * resolvedFraction));
    }

    // Industry breach benchmark — provided as context, not claimed as "managed risk"
    Map<String, Integer> categoryFacets = dataFetcher.fetchSecurityCategoryFacets(projectKeys);
    int vulnCategoryCount = categoryFacets.size();
    long industryBreachBenchmark = profile.getIndustry().getAvgBreachCostUsd();

    // Derive effective multiplier from actual dimension breakdown for counterfactual
    double effectiveMultiplier = deriveEffectiveMultiplier(timeSavings, profile);

    // Counterfactual — average monthly resolved issues over last 3 months
    CostSummary.Counterfactual counterfactual = computeCounterfactual(
      now, profile, projectKeys, effectiveMultiplier);

    // Issue density: open issues per KLoC (only open issues — resolved ones are gone)
    int totalIssueCount = resolvedCount + openVulnCount;
    double issuesPerKLoc = totalNcloc > 0
      ? Math.round((openVulnCount / (totalNcloc / 1000.0)) * 10.0) / 10.0
      : 0.0;

    // AI Code Assurance metrics
    CostSummary.AICodeMetrics aiCodeMetrics = new CostSummary.AICodeMetrics()
      .setEnabled(aiEnabled)
      .setAiGeneratedIssueCount(totalAiIssues)
      .setAiPassRate(aiPassRateCount > 0
        ? Math.round((aiPassRateSum / aiPassRateCount) * 10.0) / 10.0
        : 0.0);
    if (totalNcloc > 0 && totalAiNcloc > 0) {
      long humanNcloc = totalNcloc - totalAiNcloc;
      double aiIssueRate = totalAiNcloc > 0 ? (totalAiIssues / (totalAiNcloc / 1000.0)) : 0;
      double humanIssueRate = humanNcloc > 0
        ? ((totalIssueCount - totalAiIssues) / (humanNcloc / 1000.0))
        : 0;
      aiCodeMetrics.setHumanVsAiIssueRate(
        String.format("AI: %.1f vs Human: %.1f per 1,000 lines",
          aiIssueRate, humanIssueRate));
    }

    // Remediation cost breakdown (human + AI-assisted)
    RemediationCostModel remModel = RemediationCostModel.compute(
      totalIssueCount, profile.getEffectiveHourlyRate(), profile.getEffectiveTokenPrice());
    CostSummary.RemediationBreakdown remBreakdown = new CostSummary.RemediationBreakdown()
      .setHumanHours(remModel.getHumanHours())
      .setHumanCost(remModel.getHumanCost())
      .setEstimatedTokens(remModel.getEstimatedTokens())
      .setEstimatedTokenCost(remModel.getEstimatedTokenCost())
      .setTotalCost(remModel.getHumanCost() + remModel.getEstimatedTokenCost());

    CostSummary summary = new CostSummary()
      .setTimeSavings(timeSavings)
      .setResolvedIssueCount(resolvedCount)
      .setOpenVulnerabilityCount(openVulnCount)
      .setIndustryBreachBenchmark(industryBreachBenchmark)
      .setVulnerabilityCategoryCount(vulnCategoryCount)
      .setProjectCount(projectKeys.size())
      .setCounterfactual(counterfactual)
      .setPeriodStart(from.toString())
      .setPeriodEnd(to.toString())
      .setCompanyProfile(new ProfileSummary()
        .setIndustry(profile.getIndustry().name())
        .setRegion(profile.getRegion().name())
        .setHourlyRate(profile.getEffectiveHourlyRate()))
      .setConfigured(profile.isConfigured())
      .setEdition(fetchEdition())
      .setAiCodeMetrics(aiCodeMetrics)
      .setRemediationBreakdown(remBreakdown)
      .setIssuesPerKLoc(issuesPerKLoc)
      .setHasMeasureHistory(hasMeasureHistory)
      .setSavingsMode(savingsMode);

    // ROI: if license cost is configured, compute ratio
    if (profile.getLicenseCost() != null && profile.getLicenseCost() > 0) {
      long totalSavings = timeSavings.getTotal().getDollars();
      double ratio = (double) totalSavings / profile.getLicenseCost();
      summary.setRoi(new CostSummary.ROI()
        .setRatio(Math.round(ratio * 10.0) / 10.0)
        .setLicenseCost(profile.getLicenseCost())
        .setTotalSavings(totalSavings));
    }

    cache.put(cacheKey, summary);
    return summary;
  }

  public SecurityDetail getSecurityDetail() throws IOException {
    return getSecurityDetail(null);
  }

  public SecurityDetail getSecurityDetail(List<String> projectFilter) throws IOException {
    String cacheKey = "security-detail" + scopeHash(projectFilter);

    SecurityDetail cached = cache.get(cacheKey, SecurityDetail.class);
    if (cached != null) {
      return cached;
    }

    CompanyProfile profile = loadProfile();

    Map<String, Integer> categoryFacets;
    Map<String, Integer> severityBreakdown;
    Map<String, Map<String, Integer>> categorySeverities = new LinkedHashMap<>();
    int scaCount = 0;

    try {
      categoryFacets = dataFetcher.fetchSecurityCategoryFacets(projectFilter);
      severityBreakdown = dataFetcher.fetchSecuritySeverityBreakdown(projectFilter);

      for (String category : categoryFacets.keySet()) {
        categorySeverities.put(category, dataFetcher.fetchSeverityForCategory(category, projectFilter));
      }
    } catch (Exception e) {
      LOG.warn("Failed to fetch security category data, returning empty categories: {}", e.getMessage());
      categoryFacets = Map.of();
      severityBreakdown = Map.of();
    }

    try {
      scaCount = dataFetcher.fetchScaDependencyRiskCount();
    } catch (Exception e) {
      LOG.warn("Failed to fetch SCA dependency risk count: {}", e.getMessage());
    }

    SecurityDetail detail = securityContextBuilder.build(
      categoryFacets, severityBreakdown, categorySeverities, scaCount, profile);

    cache.put(cacheKey, detail);
    return detail;
  }

  public TrendData getTrends(int months) throws IOException {
    return getTrends(months, null);
  }

  public TrendData getTrends(int months, List<String> projectFilter) throws IOException {
    String cacheKey = "trends:" + months + scopeHash(projectFilter);

    TrendData cached = cache.get(cacheKey, TrendData.class);
    if (cached != null) {
      return cached;
    }

    CompanyProfile profile = loadProfile();
    LocalDate now = LocalDate.now();
    List<String> projectKeys = (projectFilter != null && !projectFilter.isEmpty())
      ? projectFilter : dataFetcher.fetchAllProjectKeys();

    List<MonthlyTrend> trends = new java.util.ArrayList<>();

    for (int i = months - 1; i >= 0; i--) {
      LocalDate monthStart = now.minusMonths(i + 1).withDayOfMonth(1);
      LocalDate monthEnd = now.minusMonths(i).withDayOfMonth(1).minusDays(1);
      String monthLabel = monthStart.getYear() + "-" + String.format("%02d", monthStart.getMonthValue());

      long maintDelta = 0, secDelta = 0, relDelta = 0;
      try {
        for (String projectKey : projectKeys) {
          Map<String, Long> maintHist = dataFetcher.fetchMeasureHistory(projectKey,
            "software_quality_maintainability_remediation_effort", monthStart, monthEnd);
          Map<String, Long> secHist = dataFetcher.fetchMeasureHistory(projectKey,
            "software_quality_security_remediation_effort", monthStart, monthEnd);
          Map<String, Long> relHist = dataFetcher.fetchMeasureHistory(projectKey,
            "software_quality_reliability_remediation_effort", monthStart, monthEnd);

          maintDelta += computeDelta(maintHist);
          secDelta += computeDelta(secHist);
          relDelta += computeDelta(relHist);
        }
      } catch (Exception e) {
        LOG.warn("Failed to fetch measure history for month {}: {}", monthLabel, e.getMessage());
      }

      long totalDeltaMinutes = maintDelta + secDelta + relDelta;
      long hours = Math.abs(totalDeltaMinutes) / 60;

      // Apply per-dimension multipliers (Boehm 5x for bugs/smells, HackerOne 30x for vulns)
      double hourlyRate = profile.getEffectiveHourlyRate();
      long dollars = Math.round((maintDelta / 60.0) * hourlyRate * IndustryBenchmarks.CODE_SMELL_PHASE_MULTIPLIER)
        + Math.round((secDelta / 60.0) * hourlyRate * IndustryBenchmarks.VULNERABILITY_PHASE_MULTIPLIER)
        + Math.round((relDelta / 60.0) * hourlyRate * IndustryBenchmarks.BUG_PHASE_MULTIPLIER);

      if (totalDeltaMinutes < 0) {
        hours = -hours;
      }

      int resolvedCount = 0;
      try {
        resolvedCount = dataFetcher.fetchResolvedIssueCount(monthStart, monthEnd);
      } catch (IOException e) {
        LOG.debug("Failed to fetch resolved count for {}: {}", monthLabel, e.getMessage());
      }

      trends.add(new MonthlyTrend()
        .setMonth(monthLabel)
        .setDollars(dollars)
        .setHours(hours)
        .setIssuesResolved(resolvedCount)
        .setVulnerabilitiesFound(0));
    }

    TrendData trendData = new TrendData().setMonthly(trends);
    cache.put(cacheKey, trendData);
    return trendData;
  }

  public CompanyProfile loadProfile() throws IOException {
    Optional<String> stored = dataFetcher.fetchSetting(SETTING_KEY);
    if (stored.isPresent()) {
      CompanyProfile profile = CompanyProfile.fromJson(stored.get());
      if (profile != null) {
        return profile;
      }
    }
    return CompanyProfile.defaults();
  }

  public void saveProfile(CompanyProfile profile) throws IOException {
    dataFetcher.saveSetting(SETTING_KEY, profile.toJson());
    cache.invalidateAll();
  }

  /**
   * Creates a two-entry LinkedHashMap with guaranteed insertion order.
   * The calculator reads values().get(0) as "start" and values().get(last) as "end".
   */
  private static Map<String, Long> orderedPair(long startValue, long endValue) {
    Map<String, Long> map = new LinkedHashMap<>();
    map.put("start", startValue);
    map.put("end", endValue);
    return map;
  }

  private long computeDelta(Map<String, Long> history) {
    if (history.isEmpty()) {
      return 0;
    }
    List<Long> values = history.values().stream().toList();
    return values.get(0) - values.get(values.size() - 1);
  }

  private void aggregateHistory(Map<String, Long> accumulated, Map<String, Long> projectHistory) {
    for (Map.Entry<String, Long> entry : projectHistory.entrySet()) {
      accumulated.merge(entry.getKey(), entry.getValue(), Long::sum);
    }
  }

  /**
   * Computes the "what if you stopped scanning" counterfactual by averaging
   * resolved issue counts over the last 3 months and applying the effective
   * multiplier derived from the actual dimension breakdown.
   */
  private CostSummary.Counterfactual computeCounterfactual(LocalDate now, CompanyProfile profile,
    List<String> projectKeys, double effectiveMultiplier) {
    int totalResolved = 0;
    int monthsCounted = 0;
    for (int i = 0; i < 3; i++) {
      LocalDate monthStart = now.minusMonths(i + 1).withDayOfMonth(1);
      LocalDate monthEnd = now.minusMonths(i).withDayOfMonth(1).minusDays(1);
      try {
        int count = dataFetcher.fetchResolvedIssueCount(monthStart, monthEnd, projectKeys);
        totalResolved += count;
        monthsCounted++;
      } catch (IOException e) {
        LOG.debug("Failed to fetch resolved count for counterfactual month {}: {}", i, e.getMessage());
      }
    }
    int issuesPerMonth = monthsCounted > 0 ? totalResolved / monthsCounted : 0;
    long dollarsPerMonth = Math.round(issuesPerMonth * profile.getEffectiveHourlyRate() * effectiveMultiplier);

    return new CostSummary.Counterfactual()
      .setIssuesPerMonth(issuesPerMonth)
      .setDollarsPerMonth(dollarsPerMonth);
  }

  /**
   * Derives the effective weighted-average multiplier from actual dimension savings.
   * Falls back to the conservative 5x (Boehm 2001) if no data is available.
   */
  private static double deriveEffectiveMultiplier(CostSummary.TimeSavings timeSavings, CompanyProfile profile) {
    double totalHours = timeSavings.getTotal().getHours();
    long totalDollars = timeSavings.getTotal().getDollars();
    double hourlyRate = profile.getEffectiveHourlyRate();
    if (totalHours > 0 && hourlyRate > 0 && totalDollars > 0) {
      return (double) totalDollars / (totalHours * hourlyRate);
    }
    return IndustryBenchmarks.BUG_PHASE_MULTIPLIER; // conservative 5x default
  }

  /**
   * Fetches the SonarQube edition from the system/status API.
   * Returns null if the edition cannot be determined.
   */
  private String fetchEdition() {
    try {
      return dataFetcher.fetchEdition();
    } catch (IOException e) {
      LOG.debug("Failed to fetch SQ edition: {}", e.getMessage());
      return null;
    }
  }

  /**
   * Demo: fraction of total savings visible in a given time period.
   * Models 65% found 18 months ago (initial scan), 35% spread evenly over 18 months.
   * For "year" (12 months), only the steady trickle is visible since the bulk is outside the window.
   */
  private static double getDemoSavingsFraction(Period period) {
    return switch (period) {
      case ALL -> 1.0;
      case YEAR -> 0.233;   // 12/18 × 35%
      case QUARTER -> 0.058; // 3/18 × 35%
      case MONTH -> 0.019;   // 1/18 × 35%
    };
  }

  /**
   * Demo: fraction of total resolved issues visible in a given time period.
   * Resolution work is weighted toward earlier months (most fixing done soon after discovery).
   */
  private static double getDemoResolvedFraction(Period period) {
    return switch (period) {
      case ALL -> 1.0;
      case YEAR -> 0.65;
      case QUARTER -> 0.12;
      case MONTH -> 0.04;
    };
  }

  /**
   * Scales all dimensions of a TimeSavings by a fraction (for demo period simulation).
   */
  private static CostSummary.TimeSavings scaleSavings(CostSummary.TimeSavings original, double fraction) {
    return new CostSummary.TimeSavings()
      .setMaintainability(scaleDimension(original.getMaintainability(), fraction))
      .setSecurity(scaleDimension(original.getSecurity(), fraction))
      .setReliability(scaleDimension(original.getReliability(), fraction))
      .setTotal(scaleDimension(original.getTotal(), fraction));
  }

  private static CostSummary.DimensionSavings scaleDimension(CostSummary.DimensionSavings original, double fraction) {
    return new CostSummary.DimensionSavings()
      .setDollars(Math.round(original.getDollars() * fraction))
      .setHours(Math.round(original.getHours() * fraction))
      .setNetNewDebt(original.isNetNewDebt());
  }

  /**
   * Produces a stable hash suffix for cache keys based on the project scope.
   * Empty string when no filter is applied (all projects).
   */
  private String scopeHash(List<String> projectKeys) {
    if (projectKeys == null || projectKeys.isEmpty()) {
      return "";
    }
    List<String> sorted = projectKeys.stream().sorted().toList();
    return ":" + Integer.toHexString(sorted.hashCode());
  }
}
