package org.sonar.costsavings.calculation;

import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.sonar.costsavings.model.CompanyProfile;
import org.sonar.costsavings.model.Industry;
import org.sonar.costsavings.model.Region;
import org.sonar.costsavings.model.SecurityDetail;
import org.sonar.costsavings.model.SecurityDetail.SecurityCategory;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityContextBuilderTest {

  private final SecurityContextBuilder builder = new SecurityContextBuilder();

  @Test
  void build_shouldCreateCategoriesFromFacets() {
    Map<String, Integer> facets = new LinkedHashMap<>();
    facets.put("sql-injection", 12);
    facets.put("xss", 23);

    Map<String, Integer> severities = Map.of("HIGH", 8, "MEDIUM", 4);
    Map<String, Map<String, Integer>> categorySeverities = Map.of(
      "sql-injection", severities,
      "xss", Map.of("MEDIUM", 18, "LOW", 5));

    CompanyProfile profile = CompanyProfile.defaults()
      .setIndustry(Industry.TECHNOLOGY);

    SecurityDetail detail = builder.build(facets, Map.of("HIGH", 8, "MEDIUM", 22, "LOW", 5),
      categorySeverities, 5, profile);

    assertThat(detail.getCategories()).hasSize(2);

    // Sorted by issue count descending
    SecurityCategory first = detail.getCategories().get(0);
    assertThat(first.getCategory()).isEqualTo("Cross-Site Scripting (XSS)");
    assertThat(first.getIssueCount()).isEqualTo(23);
    // XSS multiplier is 0.75 × Technology avg $4.79M = $3,592,500
    assertThat(first.getIndustryBenchmarkCost()).isEqualTo(3_592_500L);
    assertThat(first.getBenchmarkSource()).contains("IBM/Ponemon 2025")
      .contains("Technology");
    assertThat(first.getNarrative()).contains("23 cross-site scripting");

    SecurityCategory second = detail.getCategories().get(1);
    assertThat(second.getCategory()).isEqualTo("SQL Injection");
    assertThat(second.getIssueCount()).isEqualTo(12);
    assertThat(second.getSeverityBreakdown()).containsEntry("HIGH", 8);
  }

  @Test
  void build_shouldIncludeScaRisks() {
    SecurityDetail detail = builder.build(Map.of(), Map.of(), Map.of(), 5,
      CompanyProfile.defaults());

    assertThat(detail.getScaDependencyRisks().getCount()).isEqualTo(5);
    assertThat(detail.getScaDependencyRisks().getSupplyChainBenchmark()).isEqualTo(4_910_000L);
    assertThat(detail.getScaDependencyRisks().getNarrative()).contains("5 known dependency");
  }

  @Test
  void build_shouldIncludeRevenueContextWhenConfigured() {
    CompanyProfile profile = CompanyProfile.defaults()
      .setAnnualRevenue(50_000_000.0);

    SecurityDetail detail = builder.build(Map.of(), Map.of(), Map.of(), 0, profile);

    assertThat(detail.getRevenueContext()).isNotNull();
    // GDPR: 4% of $50M = $2M
    assertThat(detail.getRevenueContext().getMaxGDPRExposure()).isEqualTo(2_000_000L);
    assertThat(detail.getRevenueContext().getNarrative()).contains("$2M");
  }

  @Test
  void build_shouldOmitRevenueContextWhenNotConfigured() {
    SecurityDetail detail = builder.build(Map.of(), Map.of(), Map.of(), 0,
      CompanyProfile.defaults());

    assertThat(detail.getRevenueContext()).isNull();
  }

  @Test
  void build_shouldUseIndustrySpecificCostsInNarrative() {
    Map<String, Integer> facets = Map.of("sql-injection", 5);
    CompanyProfile profile = CompanyProfile.defaults()
      .setIndustry(Industry.HEALTHCARE);

    SecurityDetail detail = builder.build(facets, Map.of(), Map.of("sql-injection", Map.of()), 0, profile);

    SecurityCategory category = detail.getCategories().get(0);
    assertThat(category.getNarrative()).contains("Healthcare");
    // SQL Injection multiplier is 1.10 × Healthcare avg $7.42M = $8,162,000
    assertThat(category.getIndustryBenchmarkCost()).isEqualTo(8_162_000L);
  }

  @Test
  void build_shouldHandleZeroScaCount() {
    SecurityDetail detail = builder.build(Map.of(), Map.of(), Map.of(), 0,
      CompanyProfile.defaults());

    assertThat(detail.getScaDependencyRisks().getNarrative())
      .contains("No known dependency vulnerabilities");
  }

  @Test
  void build_shouldSkipUnknownCategories() {
    Map<String, Integer> facets = Map.of("unknown-category", 3);
    SecurityDetail detail = builder.build(facets, Map.of(), Map.of(), 0,
      CompanyProfile.defaults());

    assertThat(detail.getCategories()).isEmpty();
  }
}
