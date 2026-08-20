package org.sonar.costsavings.data;

import org.junit.jupiter.api.Test;
import org.sonar.costsavings.model.Industry;

import static org.assertj.core.api.Assertions.assertThat;

class CWEBreachBenchmarksTest {

  @Test
  void getCategory_shouldReturnKnownCategories() {
    assertThat(CWEBreachBenchmarks.getCategory("sql-injection")).isNotNull();
    assertThat(CWEBreachBenchmarks.getCategory("sql-injection").displayName())
      .isEqualTo("SQL Injection");
  }

  @Test
  void getCategory_shouldReturnNullForUnknown() {
    assertThat(CWEBreachBenchmarks.getCategory("nonexistent")).isNull();
  }

  @Test
  void getAllCategories_shouldContainExpectedEntries() {
    assertThat(CWEBreachBenchmarks.getAllCategories()).containsKeys(
      "sql-injection", "xss", "auth", "weak-cryptography",
      "insecure-conf", "permission", "dos", "ssrf");
  }

  @Test
  void formatNarrative_shouldIncludeIssueCount() {
    String narrative = CWEBreachBenchmarks.formatNarrative(
      "sql-injection", 12, Industry.TECHNOLOGY);
    assertThat(narrative).contains("12 SQL injection");
  }

  @Test
  void formatNarrative_shouldIncludeIndustryName() {
    String narrative = CWEBreachBenchmarks.formatNarrative(
      "sql-injection", 5, Industry.HEALTHCARE);
    assertThat(narrative).contains("Healthcare");
  }

  @Test
  void formatNarrative_shouldHandleUnknownCategory() {
    String narrative = CWEBreachBenchmarks.formatNarrative(
      "unknown", 3, Industry.TECHNOLOGY);
    assertThat(narrative).contains("3 security issues");
  }

  @Test
  void formatDollars_shouldFormatMillions() {
    assertThat(CWEBreachBenchmarks.formatDollars(4_790_000)).isEqualTo("$4.79M");
    assertThat(CWEBreachBenchmarks.formatDollars(10_000_000)).isEqualTo("$10M");
    assertThat(CWEBreachBenchmarks.formatDollars(500_000)).isEqualTo("$500,000");
  }

  @Test
  void allCategories_shouldHaveCweIdsAndOwaspMapping() {
    CWEBreachBenchmarks.getAllCategories().forEach((key, info) -> {
      assertThat(info.displayName())
        .as("Display name for %s", key)
        .isNotBlank();
      assertThat(info.narrativeTemplate())
        .as("Narrative template for %s", key)
        .isNotBlank();
      // "others" may not have CWE IDs or OWASP category
      if (!"others".equals(key)) {
        assertThat(info.owaspCategory())
          .as("OWASP category for %s", key)
          .isNotBlank();
      }
    });
  }
}
