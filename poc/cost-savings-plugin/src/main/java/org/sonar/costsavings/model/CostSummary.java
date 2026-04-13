package org.sonar.costsavings.model;

/**
 * Response model for GET /api/cost-savings/summary.
 * Contains Tier A headline numbers and metadata.
 */
public class CostSummary {

  private TimeSavings timeSavings;
  private int resolvedIssueCount;
  private int openVulnerabilityCount;
  private long industryBreachBenchmark;
  private int vulnerabilityCategoryCount;
  private int projectCount;
  private Counterfactual counterfactual;
  private String periodStart;
  private String periodEnd;
  private ProfileSummary companyProfile;
  private boolean configured;
  private String edition;
  private ROI roi;
  private AICodeMetrics aiCodeMetrics;
  private RemediationBreakdown remediationBreakdown;
  private double issuesPerKLoc;
  private boolean hasMeasureHistory;
  /**
   * "measured" = savings derived from resolved work (multi-scan delta).
   * "estimated" = detection value of currently open issues (single-scan fallback).
   */
  private String savingsMode;

  public TimeSavings getTimeSavings() {
    return timeSavings;
  }

  public CostSummary setTimeSavings(TimeSavings timeSavings) {
    this.timeSavings = timeSavings;
    return this;
  }

  public int getResolvedIssueCount() {
    return resolvedIssueCount;
  }

  public CostSummary setResolvedIssueCount(int resolvedIssueCount) {
    this.resolvedIssueCount = resolvedIssueCount;
    return this;
  }

  public int getOpenVulnerabilityCount() {
    return openVulnerabilityCount;
  }

  public CostSummary setOpenVulnerabilityCount(int openVulnerabilityCount) {
    this.openVulnerabilityCount = openVulnerabilityCount;
    return this;
  }

  public long getIndustryBreachBenchmark() {
    return industryBreachBenchmark;
  }

  public CostSummary setIndustryBreachBenchmark(long industryBreachBenchmark) {
    this.industryBreachBenchmark = industryBreachBenchmark;
    return this;
  }

  public String getSavingsMode() {
    return savingsMode;
  }

  public CostSummary setSavingsMode(String savingsMode) {
    this.savingsMode = savingsMode;
    return this;
  }

  public int getVulnerabilityCategoryCount() {
    return vulnerabilityCategoryCount;
  }

  public CostSummary setVulnerabilityCategoryCount(int vulnerabilityCategoryCount) {
    this.vulnerabilityCategoryCount = vulnerabilityCategoryCount;
    return this;
  }

  public int getProjectCount() {
    return projectCount;
  }

  public CostSummary setProjectCount(int projectCount) {
    this.projectCount = projectCount;
    return this;
  }

  public Counterfactual getCounterfactual() {
    return counterfactual;
  }

  public CostSummary setCounterfactual(Counterfactual counterfactual) {
    this.counterfactual = counterfactual;
    return this;
  }

  public String getPeriodStart() {
    return periodStart;
  }

  public CostSummary setPeriodStart(String periodStart) {
    this.periodStart = periodStart;
    return this;
  }

  public String getPeriodEnd() {
    return periodEnd;
  }

  public CostSummary setPeriodEnd(String periodEnd) {
    this.periodEnd = periodEnd;
    return this;
  }

  public ProfileSummary getCompanyProfile() {
    return companyProfile;
  }

  public CostSummary setCompanyProfile(ProfileSummary companyProfile) {
    this.companyProfile = companyProfile;
    return this;
  }

  public boolean isConfigured() {
    return configured;
  }

  public CostSummary setConfigured(boolean configured) {
    this.configured = configured;
    return this;
  }

  public String getEdition() {
    return edition;
  }

  public CostSummary setEdition(String edition) {
    this.edition = edition;
    return this;
  }

  public ROI getRoi() {
    return roi;
  }

  public CostSummary setRoi(ROI roi) {
    this.roi = roi;
    return this;
  }

  public AICodeMetrics getAiCodeMetrics() {
    return aiCodeMetrics;
  }

  public CostSummary setAiCodeMetrics(AICodeMetrics aiCodeMetrics) {
    this.aiCodeMetrics = aiCodeMetrics;
    return this;
  }

  public RemediationBreakdown getRemediationBreakdown() {
    return remediationBreakdown;
  }

  public CostSummary setRemediationBreakdown(RemediationBreakdown remediationBreakdown) {
    this.remediationBreakdown = remediationBreakdown;
    return this;
  }

  public double getIssuesPerKLoc() {
    return issuesPerKLoc;
  }

  public CostSummary setIssuesPerKLoc(double issuesPerKLoc) {
    this.issuesPerKLoc = issuesPerKLoc;
    return this;
  }

  public boolean isHasMeasureHistory() {
    return hasMeasureHistory;
  }

  public CostSummary setHasMeasureHistory(boolean hasMeasureHistory) {
    this.hasMeasureHistory = hasMeasureHistory;
    return this;
  }

  public static class TimeSavings {
    private DimensionSavings total;
    private DimensionSavings security;
    private DimensionSavings reliability;
    private DimensionSavings maintainability;

    public DimensionSavings getTotal() {
      return total;
    }

    public TimeSavings setTotal(DimensionSavings total) {
      this.total = total;
      return this;
    }

    public DimensionSavings getSecurity() {
      return security;
    }

    public TimeSavings setSecurity(DimensionSavings security) {
      this.security = security;
      return this;
    }

    public DimensionSavings getReliability() {
      return reliability;
    }

    public TimeSavings setReliability(DimensionSavings reliability) {
      this.reliability = reliability;
      return this;
    }

    public DimensionSavings getMaintainability() {
      return maintainability;
    }

    public TimeSavings setMaintainability(DimensionSavings maintainability) {
      this.maintainability = maintainability;
      return this;
    }
  }

  public static class DimensionSavings {
    private long dollars;
    private long hours;
    private boolean netNewDebt;

    public long getDollars() {
      return dollars;
    }

    public DimensionSavings setDollars(long dollars) {
      this.dollars = dollars;
      return this;
    }

    public long getHours() {
      return hours;
    }

    public DimensionSavings setHours(long hours) {
      this.hours = hours;
      return this;
    }

    public boolean isNetNewDebt() {
      return netNewDebt;
    }

    public DimensionSavings setNetNewDebt(boolean netNewDebt) {
      this.netNewDebt = netNewDebt;
      return this;
    }
  }

  public static class ProfileSummary {
    private String industry;
    private String region;
    private double hourlyRate;

    public String getIndustry() {
      return industry;
    }

    public ProfileSummary setIndustry(String industry) {
      this.industry = industry;
      return this;
    }

    public String getRegion() {
      return region;
    }

    public ProfileSummary setRegion(String region) {
      this.region = region;
      return this;
    }

    public double getHourlyRate() {
      return hourlyRate;
    }

    public ProfileSummary setHourlyRate(double hourlyRate) {
      this.hourlyRate = hourlyRate;
      return this;
    }
  }

  public static class Counterfactual {
    private int issuesPerMonth;
    private long dollarsPerMonth;

    public int getIssuesPerMonth() {
      return issuesPerMonth;
    }

    public Counterfactual setIssuesPerMonth(int issuesPerMonth) {
      this.issuesPerMonth = issuesPerMonth;
      return this;
    }

    public long getDollarsPerMonth() {
      return dollarsPerMonth;
    }

    public Counterfactual setDollarsPerMonth(long dollarsPerMonth) {
      this.dollarsPerMonth = dollarsPerMonth;
      return this;
    }
  }

  public static class ROI {
    private double ratio;
    private long licenseCost;
    private long totalSavings;

    public double getRatio() {
      return ratio;
    }

    public ROI setRatio(double ratio) {
      this.ratio = ratio;
      return this;
    }

    public long getLicenseCost() {
      return licenseCost;
    }

    public ROI setLicenseCost(long licenseCost) {
      this.licenseCost = licenseCost;
      return this;
    }

    public long getTotalSavings() {
      return totalSavings;
    }

    public ROI setTotalSavings(long totalSavings) {
      this.totalSavings = totalSavings;
      return this;
    }
  }

  public static class AICodeMetrics {
    private boolean enabled;
    private int aiGeneratedIssueCount;
    private double aiPassRate;
    private String humanVsAiIssueRate;

    public boolean isEnabled() {
      return enabled;
    }

    public AICodeMetrics setEnabled(boolean enabled) {
      this.enabled = enabled;
      return this;
    }

    public int getAiGeneratedIssueCount() {
      return aiGeneratedIssueCount;
    }

    public AICodeMetrics setAiGeneratedIssueCount(int aiGeneratedIssueCount) {
      this.aiGeneratedIssueCount = aiGeneratedIssueCount;
      return this;
    }

    public double getAiPassRate() {
      return aiPassRate;
    }

    public AICodeMetrics setAiPassRate(double aiPassRate) {
      this.aiPassRate = aiPassRate;
      return this;
    }

    public String getHumanVsAiIssueRate() {
      return humanVsAiIssueRate;
    }

    public AICodeMetrics setHumanVsAiIssueRate(String humanVsAiIssueRate) {
      this.humanVsAiIssueRate = humanVsAiIssueRate;
      return this;
    }
  }

  public static class RemediationBreakdown {
    private double humanHours;
    private long humanCost;
    private long estimatedTokens;
    private double estimatedTokenCost;
    private double totalCost;

    public double getHumanHours() {
      return humanHours;
    }

    public RemediationBreakdown setHumanHours(double humanHours) {
      this.humanHours = humanHours;
      return this;
    }

    public long getHumanCost() {
      return humanCost;
    }

    public RemediationBreakdown setHumanCost(long humanCost) {
      this.humanCost = humanCost;
      return this;
    }

    public long getEstimatedTokens() {
      return estimatedTokens;
    }

    public RemediationBreakdown setEstimatedTokens(long estimatedTokens) {
      this.estimatedTokens = estimatedTokens;
      return this;
    }

    public double getEstimatedTokenCost() {
      return estimatedTokenCost;
    }

    public RemediationBreakdown setEstimatedTokenCost(double estimatedTokenCost) {
      this.estimatedTokenCost = estimatedTokenCost;
      return this;
    }

    public double getTotalCost() {
      return totalCost;
    }

    public RemediationBreakdown setTotalCost(double totalCost) {
      this.totalCost = totalCost;
      return this;
    }
  }
}
