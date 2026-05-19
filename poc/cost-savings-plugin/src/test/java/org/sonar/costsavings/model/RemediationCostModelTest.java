package org.sonar.costsavings.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RemediationCostModelTest {

  @Test
  void compute_shouldCalculateTokenEstimate() {
    // 100 issues × 50,000 tokens/issue = 5,000,000 tokens
    RemediationCostModel result = RemediationCostModel.compute(100, 75.0, 2.0);

    assertThat(result.getEstimatedTokens()).isEqualTo(5_000_000L);
  }

  @Test
  void compute_shouldCalculateTokenCost() {
    // 5,000,000 tokens / 1,000,000 × $2.00 = $10.00
    RemediationCostModel result = RemediationCostModel.compute(100, 75.0, 2.0);

    assertThat(result.getEstimatedTokenCost()).isEqualTo(10.0);
  }

  @Test
  void compute_shouldCalculateHumanReviewHours() {
    // 100 issues × 15 min/issue / 60 = 25.0 hours
    RemediationCostModel result = RemediationCostModel.compute(100, 75.0, 2.0);

    assertThat(result.getHumanHours()).isEqualTo(25.0);
  }

  @Test
  void compute_shouldCalculateHumanCost() {
    // 25 hours × $75/hr = $1,875
    RemediationCostModel result = RemediationCostModel.compute(100, 75.0, 2.0);

    assertThat(result.getHumanCost()).isEqualTo(1875L);
  }

  @Test
  void compute_shouldHandleZeroIssues() {
    RemediationCostModel result = RemediationCostModel.compute(0, 75.0, 2.0);

    assertThat(result.getEstimatedTokens()).isZero();
    assertThat(result.getEstimatedTokenCost()).isZero();
    assertThat(result.getHumanHours()).isZero();
    assertThat(result.getHumanCost()).isZero();
  }

  @Test
  void compute_shouldUseCustomTokenPrice() {
    // 100 issues × 50,000 = 5M tokens, at $10/M = $50
    RemediationCostModel result = RemediationCostModel.compute(100, 75.0, 10.0);

    assertThat(result.getEstimatedTokenCost()).isEqualTo(50.0);
  }

  @Test
  void compute_shouldUseCustomHourlyRate() {
    // 100 issues × 15 min / 60 = 25 hours × $150 = $3,750
    RemediationCostModel result = RemediationCostModel.compute(100, 150.0, 2.0);

    assertThat(result.getHumanCost()).isEqualTo(3750L);
  }

  @Test
  void defaults_shouldMatchExpectedValues() {
    assertThat(RemediationCostModel.DEFAULT_AVG_TOKENS_PER_FIX).isEqualTo(50_000L);
    assertThat(RemediationCostModel.DEFAULT_TOKEN_PRICE_PER_MILLION).isEqualTo(2.0);
    assertThat(RemediationCostModel.DEFAULT_HUMAN_REVIEW_MINUTES_PER_ISSUE).isEqualTo(15.0);
  }
}
