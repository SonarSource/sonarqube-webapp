package org.sonar.costsavings.data;

import java.util.List;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ComplianceMappingTest {

  @Test
  void getFrameworks_shouldReturnMappingsForSqlInjection() {
    List<String> frameworks = ComplianceMapping.getFrameworks("sql-injection");
    assertThat(frameworks).containsExactly("PCI-DSS 6.5.1", "SOC 2 CC6.1", "OWASP Top 10 A03");
  }

  @Test
  void getFrameworks_shouldReturnMappingsForAuth() {
    List<String> frameworks = ComplianceMapping.getFrameworks("auth");
    assertThat(frameworks).contains("PCI-DSS 6.5.10", "HIPAA §164.312(d)");
  }

  @Test
  void getFrameworks_shouldReturnEmptyForUnknownCategory() {
    assertThat(ComplianceMapping.getFrameworks("unknown-category")).isEmpty();
  }

  @Test
  void getAllMappings_shouldContainAtLeast12Categories() {
    assertThat(ComplianceMapping.getAllMappings()).hasSizeGreaterThanOrEqualTo(12);
  }

  @Test
  void getDistinctFrameworks_shouldReturnUniqueFrameworkNames() {
    List<String> frameworks = ComplianceMapping.getDistinctFrameworks(
      List.of("sql-injection", "auth", "weak-cryptography"));
    assertThat(frameworks).contains("PCI-DSS", "SOC 2", "HIPAA", "OWASP Top 10");
  }

  @Test
  void countDistinctControls_shouldCountUniqueControls() {
    int count = ComplianceMapping.countDistinctControls(
      List.of("sql-injection", "xss"));
    // sql-injection: 3 controls, xss: 3 controls, SOC 2 CC6.1 and OWASP Top 10 A03 overlap
    assertThat(count).isEqualTo(4);
  }

  @Test
  void extractFrameworkName_shouldParseCorrectly() {
    assertThat(ComplianceMapping.extractFrameworkName("PCI-DSS 6.5.1")).isEqualTo("PCI-DSS");
    assertThat(ComplianceMapping.extractFrameworkName("SOC 2 CC6.1")).isEqualTo("SOC 2");
    assertThat(ComplianceMapping.extractFrameworkName("HIPAA §164.312(d)")).isEqualTo("HIPAA");
    assertThat(ComplianceMapping.extractFrameworkName("OWASP Top 10 A03")).isEqualTo("OWASP Top 10");
  }
}
