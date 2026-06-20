package org.sonar.costsavings.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CompanyProfileTest {

  @Test
  void defaults_shouldReturnUnconfiguredProfile() {
    CompanyProfile profile = CompanyProfile.defaults();

    assertThat(profile.getIndustry()).isEqualTo(Industry.TECHNOLOGY);
    assertThat(profile.getRegion()).isEqualTo(Region.US);
    assertThat(profile.getHourlyRate()).isNull();
    assertThat(profile.getAnnualRevenue()).isNull();
    assertThat(profile.isConfigured()).isFalse();
    assertThat(profile.hasRevenueData()).isFalse();
  }

  @Test
  void effectiveHourlyRate_shouldUseDefaultWhenNotSet() {
    CompanyProfile profile = CompanyProfile.defaults();
    assertThat(profile.getEffectiveHourlyRate()).isEqualTo(75.0);
  }

  @Test
  void effectiveHourlyRate_shouldUseExplicitValueWhenSet() {
    CompanyProfile profile = CompanyProfile.defaults().setHourlyRate(120.0);
    assertThat(profile.getEffectiveHourlyRate()).isEqualTo(120.0);
  }

  @Test
  void effectiveHourlyRate_shouldFallbackToDefaultForZero() {
    CompanyProfile profile = CompanyProfile.defaults().setHourlyRate(0.0);
    assertThat(profile.getEffectiveHourlyRate()).isEqualTo(75.0);
  }

  @Test
  void isConfigured_shouldBeTrueWhenHourlyRateSet() {
    CompanyProfile profile = CompanyProfile.defaults().setHourlyRate(100.0);
    assertThat(profile.isConfigured()).isTrue();
  }

  @Test
  void isConfigured_shouldBeTrueWhenRevenueSet() {
    CompanyProfile profile = CompanyProfile.defaults().setAnnualRevenue(50_000_000.0);
    assertThat(profile.isConfigured()).isTrue();
  }

  @Test
  void hasRevenueData_shouldBeTrueForPositiveRevenue() {
    CompanyProfile profile = CompanyProfile.defaults().setAnnualRevenue(50_000_000.0);
    assertThat(profile.hasRevenueData()).isTrue();
  }

  @Test
  void hasRevenueData_shouldBeFalseForZeroRevenue() {
    CompanyProfile profile = CompanyProfile.defaults().setAnnualRevenue(0.0);
    assertThat(profile.hasRevenueData()).isFalse();
  }

  @Test
  void jsonRoundTrip_shouldPreserveAllFields() {
    CompanyProfile original = new CompanyProfile()
      .setIndustry(Industry.HEALTHCARE)
      .setRegion(Region.US)
      .setAnnualRevenue(100_000_000.0)
      .setEmployeeCount(500)
      .setDeveloperCount(80)
      .setHourlyRate(120.0);

    String json = original.toJson();
    CompanyProfile restored = CompanyProfile.fromJson(json);

    assertThat(restored).isNotNull();
    assertThat(restored.getIndustry()).isEqualTo(Industry.HEALTHCARE);
    assertThat(restored.getRegion()).isEqualTo(Region.US);
    assertThat(restored.getAnnualRevenue()).isEqualTo(100_000_000.0);
    assertThat(restored.getEmployeeCount()).isEqualTo(500);
    assertThat(restored.getDeveloperCount()).isEqualTo(80);
    assertThat(restored.getHourlyRate()).isEqualTo(120.0);
  }

  @Test
  void fromJson_shouldReturnNullForInvalidJson() {
    assertThat(CompanyProfile.fromJson("not json")).isNull();
  }
}
