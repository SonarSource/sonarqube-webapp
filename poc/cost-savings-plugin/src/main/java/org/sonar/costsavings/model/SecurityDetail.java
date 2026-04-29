package org.sonar.costsavings.model;

import java.util.List;
import java.util.Map;

/**
 * Response model for GET /api/cost-savings/security-detail.
 * Contains Tier B security risk context — industry benchmarks alongside detection counts.
 */
public class SecurityDetail {

  private List<SecurityCategory> categories;
  private Map<String, Integer> totalBySeverity;
  private ScaDependencyRisks scaDependencyRisks;
  private RevenueContext revenueContext;

  public List<SecurityCategory> getCategories() {
    return categories;
  }

  public SecurityDetail setCategories(List<SecurityCategory> categories) {
    this.categories = categories;
    return this;
  }

  public Map<String, Integer> getTotalBySeverity() {
    return totalBySeverity;
  }

  public SecurityDetail setTotalBySeverity(Map<String, Integer> totalBySeverity) {
    this.totalBySeverity = totalBySeverity;
    return this;
  }

  public ScaDependencyRisks getScaDependencyRisks() {
    return scaDependencyRisks;
  }

  public SecurityDetail setScaDependencyRisks(ScaDependencyRisks scaDependencyRisks) {
    this.scaDependencyRisks = scaDependencyRisks;
    return this;
  }

  public RevenueContext getRevenueContext() {
    return revenueContext;
  }

  public SecurityDetail setRevenueContext(RevenueContext revenueContext) {
    this.revenueContext = revenueContext;
    return this;
  }

  public static class SecurityCategory {
    private String category;
    private String categoryKey;
    private List<String> cwe;
    private String owasp;
    private int issueCount;
    private Map<String, Integer> severityBreakdown;
    private long industryBenchmarkCost;
    private String benchmarkSource;
    private String narrative;
    private List<String> complianceFrameworks;

    public String getCategory() {
      return category;
    }

    public SecurityCategory setCategory(String category) {
      this.category = category;
      return this;
    }

    public String getCategoryKey() {
      return categoryKey;
    }

    public SecurityCategory setCategoryKey(String categoryKey) {
      this.categoryKey = categoryKey;
      return this;
    }

    public List<String> getCwe() {
      return cwe;
    }

    public SecurityCategory setCwe(List<String> cwe) {
      this.cwe = cwe;
      return this;
    }

    public String getOwasp() {
      return owasp;
    }

    public SecurityCategory setOwasp(String owasp) {
      this.owasp = owasp;
      return this;
    }

    public int getIssueCount() {
      return issueCount;
    }

    public SecurityCategory setIssueCount(int issueCount) {
      this.issueCount = issueCount;
      return this;
    }

    public Map<String, Integer> getSeverityBreakdown() {
      return severityBreakdown;
    }

    public SecurityCategory setSeverityBreakdown(Map<String, Integer> severityBreakdown) {
      this.severityBreakdown = severityBreakdown;
      return this;
    }

    public long getIndustryBenchmarkCost() {
      return industryBenchmarkCost;
    }

    public SecurityCategory setIndustryBenchmarkCost(long industryBenchmarkCost) {
      this.industryBenchmarkCost = industryBenchmarkCost;
      return this;
    }

    public String getBenchmarkSource() {
      return benchmarkSource;
    }

    public SecurityCategory setBenchmarkSource(String benchmarkSource) {
      this.benchmarkSource = benchmarkSource;
      return this;
    }

    public String getNarrative() {
      return narrative;
    }

    public SecurityCategory setNarrative(String narrative) {
      this.narrative = narrative;
      return this;
    }

    public List<String> getComplianceFrameworks() {
      return complianceFrameworks;
    }

    public SecurityCategory setComplianceFrameworks(List<String> complianceFrameworks) {
      this.complianceFrameworks = complianceFrameworks;
      return this;
    }
  }

  public static class ScaDependencyRisks {
    private int count;
    private long supplyChainBenchmark;
    private String narrative;

    public int getCount() {
      return count;
    }

    public ScaDependencyRisks setCount(int count) {
      this.count = count;
      return this;
    }

    public long getSupplyChainBenchmark() {
      return supplyChainBenchmark;
    }

    public ScaDependencyRisks setSupplyChainBenchmark(long supplyChainBenchmark) {
      this.supplyChainBenchmark = supplyChainBenchmark;
      return this;
    }

    public String getNarrative() {
      return narrative;
    }

    public ScaDependencyRisks setNarrative(String narrative) {
      this.narrative = narrative;
      return this;
    }
  }

  public static class RevenueContext {
    private long maxGDPRExposure;
    private long avgRansomwareCost;
    private String narrative;

    public long getMaxGDPRExposure() {
      return maxGDPRExposure;
    }

    public RevenueContext setMaxGDPRExposure(long maxGDPRExposure) {
      this.maxGDPRExposure = maxGDPRExposure;
      return this;
    }

    public long getAvgRansomwareCost() {
      return avgRansomwareCost;
    }

    public RevenueContext setAvgRansomwareCost(long avgRansomwareCost) {
      this.avgRansomwareCost = avgRansomwareCost;
      return this;
    }

    public String getNarrative() {
      return narrative;
    }

    public RevenueContext setNarrative(String narrative) {
      this.narrative = narrative;
      return this;
    }
  }
}
