package org.sonar.costsavings.model;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

public class CompanyProfile {

  private static final Gson GSON = new Gson();

  public static final double DEFAULT_HOURLY_RATE = 75.0;
  public static final Industry DEFAULT_INDUSTRY = Industry.TECHNOLOGY;
  public static final Region DEFAULT_REGION = Region.US;
  public static final double DEFAULT_BURDEN_MULTIPLIER = 1.4;
  public static final int DEFAULT_ANNUAL_HOURS = 2080;
  public static final double DEFAULT_TOKEN_PRICE_PER_MILLION = 2.0;

  private Industry industry;
  private Region region;
  private Double annualRevenue;
  private Integer employeeCount;
  private Integer developerCount;
  private Double hourlyRate;
  private Long licenseCost;
  private Double tokenPricePerMillion;
  private Boolean telemetryOptIn;

  public CompanyProfile() {
    this.industry = DEFAULT_INDUSTRY;
    this.region = DEFAULT_REGION;
  }

  public Industry getIndustry() {
    return industry;
  }

  public CompanyProfile setIndustry(Industry industry) {
    this.industry = industry;
    return this;
  }

  public Region getRegion() {
    return region;
  }

  public CompanyProfile setRegion(Region region) {
    this.region = region;
    return this;
  }

  public Double getAnnualRevenue() {
    return annualRevenue;
  }

  public CompanyProfile setAnnualRevenue(Double annualRevenue) {
    this.annualRevenue = annualRevenue;
    return this;
  }

  public Integer getEmployeeCount() {
    return employeeCount;
  }

  public CompanyProfile setEmployeeCount(Integer employeeCount) {
    this.employeeCount = employeeCount;
    return this;
  }

  public Integer getDeveloperCount() {
    return developerCount;
  }

  public CompanyProfile setDeveloperCount(Integer developerCount) {
    this.developerCount = developerCount;
    return this;
  }

  public Double getHourlyRate() {
    return hourlyRate;
  }

  public CompanyProfile setHourlyRate(Double hourlyRate) {
    this.hourlyRate = hourlyRate;
    return this;
  }

  public Long getLicenseCost() {
    return licenseCost;
  }

  public CompanyProfile setLicenseCost(Long licenseCost) {
    this.licenseCost = licenseCost;
    return this;
  }

  public Double getTokenPricePerMillion() {
    return tokenPricePerMillion;
  }

  public CompanyProfile setTokenPricePerMillion(Double tokenPricePerMillion) {
    this.tokenPricePerMillion = tokenPricePerMillion;
    return this;
  }

  public Boolean getTelemetryOptIn() {
    return telemetryOptIn;
  }

  public CompanyProfile setTelemetryOptIn(Boolean telemetryOptIn) {
    this.telemetryOptIn = telemetryOptIn;
    return this;
  }

  public boolean isTelemetryOptedIn() {
    return telemetryOptIn != null && telemetryOptIn;
  }

  /**
   * Returns the effective token price per million for AI remediation cost estimates.
   */
  public double getEffectiveTokenPrice() {
    if (tokenPricePerMillion != null && tokenPricePerMillion > 0) {
      return tokenPricePerMillion;
    }
    return DEFAULT_TOKEN_PRICE_PER_MILLION;
  }

  /**
   * Returns the effective hourly rate for cost calculations.
   * Priority: explicit hourlyRate > calculated from salary data > default.
   */
  public double getEffectiveHourlyRate() {
    if (hourlyRate != null && hourlyRate > 0) {
      return hourlyRate;
    }
    return DEFAULT_HOURLY_RATE;
  }

  public boolean isConfigured() {
    return hourlyRate != null || annualRevenue != null || employeeCount != null;
  }

  public boolean hasRevenueData() {
    return annualRevenue != null && annualRevenue > 0;
  }

  public String toJson() {
    return GSON.toJson(this);
  }

  public static CompanyProfile fromJson(String json) {
    try {
      return GSON.fromJson(json, CompanyProfile.class);
    } catch (JsonSyntaxException e) {
      return null;
    }
  }

  public static CompanyProfile defaults() {
    return new CompanyProfile();
  }
}
