package org.sonar.costsavings.model;

import java.util.List;

/**
 * Response model for GET /api/cost-savings/trends.
 * Monthly savings trend for charting.
 */
public class TrendData {

  private List<MonthlyTrend> monthly;

  public List<MonthlyTrend> getMonthly() {
    return monthly;
  }

  public TrendData setMonthly(List<MonthlyTrend> monthly) {
    this.monthly = monthly;
    return this;
  }

  public static class MonthlyTrend {
    private String month;
    private long dollars;
    private long hours;
    private int issuesResolved;
    private int vulnerabilitiesFound;

    public String getMonth() {
      return month;
    }

    public MonthlyTrend setMonth(String month) {
      this.month = month;
      return this;
    }

    public long getDollars() {
      return dollars;
    }

    public MonthlyTrend setDollars(long dollars) {
      this.dollars = dollars;
      return this;
    }

    public long getHours() {
      return hours;
    }

    public MonthlyTrend setHours(long hours) {
      this.hours = hours;
      return this;
    }

    public int getIssuesResolved() {
      return issuesResolved;
    }

    public MonthlyTrend setIssuesResolved(int issuesResolved) {
      this.issuesResolved = issuesResolved;
      return this;
    }

    public int getVulnerabilitiesFound() {
      return vulnerabilitiesFound;
    }

    public MonthlyTrend setVulnerabilitiesFound(int vulnerabilitiesFound) {
      this.vulnerabilitiesFound = vulnerabilitiesFound;
      return this;
    }
  }
}
