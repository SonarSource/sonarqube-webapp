package org.sonar.costsavings.data;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Maps SonarQube security categories (CWE-based) to compliance framework controls.
 * Enables CISOs to say "SonarQube is helping us with SOC 2 / PCI-DSS / HIPAA."
 *
 * Mappings are based on the relationship between CWE vulnerability classes and
 * the controls/requirements in each compliance framework.
 */
public final class ComplianceMapping {

  private static final Map<String, List<String>> CATEGORY_TO_FRAMEWORKS;

  static {
    Map<String, List<String>> map = new LinkedHashMap<>();

    map.put("sql-injection", List.of(
      "PCI-DSS 6.5.1",
      "SOC 2 CC6.1",
      "OWASP Top 10 A03"));

    map.put("xss", List.of(
      "PCI-DSS 6.5.7",
      "SOC 2 CC6.1",
      "OWASP Top 10 A03"));

    map.put("auth", List.of(
      "PCI-DSS 6.5.10",
      "SOC 2 CC6.1",
      "HIPAA §164.312(d)",
      "OWASP Top 10 A07"));

    map.put("weak-cryptography", List.of(
      "PCI-DSS 6.5.3",
      "HIPAA §164.312(a)(2)(iv)",
      "SOC 2 CC6.1",
      "OWASP Top 10 A02"));

    map.put("command-injection", List.of(
      "PCI-DSS 6.5.1",
      "SOC 2 CC6.1",
      "OWASP Top 10 A03"));

    map.put("path-traversal-injection", List.of(
      "PCI-DSS 6.5.1",
      "SOC 2 CC6.1",
      "OWASP Top 10 A01"));

    map.put("insecure-conf", List.of(
      "PCI-DSS 6.5.6",
      "SOC 2 CC6.1",
      "HIPAA §164.312(a)(1)",
      "OWASP Top 10 A05"));

    map.put("encryption-of-sensitive-data", List.of(
      "PCI-DSS 6.5.3",
      "HIPAA §164.312(a)(2)(iv)",
      "HIPAA §164.312(e)(1)",
      "SOC 2 CC6.1",
      "OWASP Top 10 A02"));

    map.put("permission", List.of(
      "PCI-DSS 6.5.8",
      "SOC 2 CC6.1",
      "HIPAA §164.312(a)(1)",
      "OWASP Top 10 A01"));

    map.put("ldap-injection", List.of(
      "PCI-DSS 6.5.1",
      "SOC 2 CC6.1",
      "OWASP Top 10 A03"));

    map.put("ssrf", List.of(
      "SOC 2 CC6.1",
      "OWASP Top 10 A10"));

    map.put("traceability", List.of(
      "PCI-DSS 10.2",
      "SOC 2 CC7.2",
      "HIPAA §164.312(b)",
      "OWASP Top 10 A09"));

    CATEGORY_TO_FRAMEWORKS = Collections.unmodifiableMap(map);
  }

  private ComplianceMapping() {
    // utility class
  }

  /**
   * Returns the compliance framework controls that map to a security category.
   * Returns an empty list for unmapped categories.
   */
  public static List<String> getFrameworks(String sqCategory) {
    return CATEGORY_TO_FRAMEWORKS.getOrDefault(sqCategory, List.of());
  }

  /**
   * Returns all mapped categories and their frameworks.
   */
  public static Map<String, List<String>> getAllMappings() {
    return CATEGORY_TO_FRAMEWORKS;
  }

  /**
   * Returns the distinct framework names (PCI-DSS, SOC 2, HIPAA, OWASP Top 10)
   * that appear across all mapped categories present in the given category keys.
   */
  public static List<String> getDistinctFrameworks(Iterable<String> categoryKeys) {
    return java.util.stream.StreamSupport.stream(categoryKeys.spliterator(), false)
      .flatMap(key -> getFrameworks(key).stream())
      .map(ComplianceMapping::extractFrameworkName)
      .distinct()
      .sorted()
      .toList();
  }

  /**
   * Counts the total number of distinct compliance controls mapped to the given categories.
   */
  public static int countDistinctControls(Iterable<String> categoryKeys) {
    return (int) java.util.stream.StreamSupport.stream(categoryKeys.spliterator(), false)
      .flatMap(key -> getFrameworks(key).stream())
      .distinct()
      .count();
  }

  /**
   * Extracts the framework name from a control string.
   * e.g., "PCI-DSS 6.5.1" -> "PCI-DSS", "HIPAA §164.312(d)" -> "HIPAA"
   */
  static String extractFrameworkName(String control) {
    if (control.startsWith("PCI-DSS")) {
      return "PCI-DSS";
    }
    if (control.startsWith("SOC 2")) {
      return "SOC 2";
    }
    if (control.startsWith("HIPAA")) {
      return "HIPAA";
    }
    if (control.startsWith("OWASP")) {
      return "OWASP Top 10";
    }
    return control;
  }
}
