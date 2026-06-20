package org.sonar.costsavings.model;

/**
 * Computes remediation cost estimates that include both human developer time
 * and AI-assisted token consumption for issue remediation.
 *
 * Token estimate: issueCount x avgTokensPerFix
 * where avgTokensPerFix defaults to 50,000 tokens (typical Copilot Autofix consumption).
 */
public class RemediationCostModel {

  public static final long DEFAULT_AVG_TOKENS_PER_FIX = 50_000L;
  public static final double DEFAULT_TOKEN_PRICE_PER_MILLION = 2.0;
  public static final double DEFAULT_HUMAN_REVIEW_MINUTES_PER_ISSUE = 15.0;

  private double humanHours;
  private long humanCost;
  private long estimatedTokens;
  private double estimatedTokenCost;

  public double getHumanHours() {
    return humanHours;
  }

  public RemediationCostModel setHumanHours(double humanHours) {
    this.humanHours = humanHours;
    return this;
  }

  public long getHumanCost() {
    return humanCost;
  }

  public RemediationCostModel setHumanCost(long humanCost) {
    this.humanCost = humanCost;
    return this;
  }

  public long getEstimatedTokens() {
    return estimatedTokens;
  }

  public RemediationCostModel setEstimatedTokens(long estimatedTokens) {
    this.estimatedTokens = estimatedTokens;
    return this;
  }

  public double getEstimatedTokenCost() {
    return estimatedTokenCost;
  }

  public RemediationCostModel setEstimatedTokenCost(double estimatedTokenCost) {
    this.estimatedTokenCost = estimatedTokenCost;
    return this;
  }

  /**
   * Computes remediation cost breakdown for a given number of issues.
   */
  public static RemediationCostModel compute(int issueCount, double hourlyRate,
    double tokenPricePerMillion) {
    long tokens = issueCount * DEFAULT_AVG_TOKENS_PER_FIX;
    double tokenCost = (tokens / 1_000_000.0) * tokenPricePerMillion;
    double reviewHours = (issueCount * DEFAULT_HUMAN_REVIEW_MINUTES_PER_ISSUE) / 60.0;
    long humanCost = Math.round(reviewHours * hourlyRate);

    return new RemediationCostModel()
      .setHumanHours(Math.round(reviewHours * 10.0) / 10.0)
      .setHumanCost(humanCost)
      .setEstimatedTokens(tokens)
      .setEstimatedTokenCost(Math.round(tokenCost * 100.0) / 100.0);
  }
}
