package org.sonar.costsavings.data;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.sonar.costsavings.model.Industry;

/**
 * Maps SonarQube SQCategory (sonarsourceSecurity facet values) to plain-language
 * category names, CWE IDs, OWASP categories, and narrative templates.
 *
 * The sonarsourceSecurity facet returns keys like "sql-injection", "xss", "auth", etc.
 * These map to SQCategory in SecurityStandards.java.
 *
 * Benchmark costs are IBM/Ponemon 2025. Since IBM doesn't break down by CWE,
 * we use the industry average breach cost as the benchmark for each category.
 * The narrative differentiates by explaining what the vulnerability class enables.
 */
public final class CWEBreachBenchmarks {

  private static final String BENCHMARK_SOURCE = "IBM/Ponemon 2025";

  private static final Map<String, CategoryInfo> CATEGORY_MAP;

  static {
    Map<String, CategoryInfo> map = new LinkedHashMap<>();
    map.put("sql-injection", new CategoryInfo(
      "SQL Injection",
      List.of("CWE-89"),
      "A03:2021",
      "%d SQL injection vulnerabilities identified. " +
        "Injection attacks are the #1 cause of data exfiltration — in %s, injection-related breaches average %s.",
      1.10,
      "Avg. cost of injection-related breach"));

    map.put("command-injection", new CategoryInfo(
      "Command Injection",
      List.of("CWE-78"),
      "A03:2021",
      "%d command injection vulnerabilities found. " +
        "Command injection enables remote code execution — the primary vector for ransomware, which averages $5.13M per incident.",
      1.15,
      "Avg. cost of destructive/ransomware attack"));

    map.put("path-traversal-injection", new CategoryInfo(
      "Path Traversal",
      List.of("CWE-22"),
      "A01:2021",
      "%d path traversal vulnerabilities identified. " +
        "Path traversal allows unauthorized file access, a common precursor to data exfiltration.",
      0.85,
      "Avg. cost of breach involving data exfiltration"));

    map.put("ldap-injection", new CategoryInfo(
      "LDAP Injection",
      List.of("CWE-90"),
      "A03:2021",
      "%d LDAP injection vulnerabilities found. " +
        "LDAP injection can bypass authentication and expose directory data, often leading to lateral movement.",
      0.90,
      "Avg. cost of breach via injection vector"));

    map.put("xss", new CategoryInfo(
      "Cross-Site Scripting (XSS)",
      List.of("CWE-79"),
      "A03:2021",
      "%d cross-site scripting vulnerabilities identified. " +
        "XSS is the most common web vulnerability class — a primary vector for session hijacking and data theft.",
      0.75,
      "Avg. cost of web application breach"));

    map.put("dos", new CategoryInfo(
      "Denial of Service",
      List.of("CWE-400", "CWE-770"),
      "A05:2021",
      "%d denial-of-service vulnerabilities found. " +
        "DoS vulnerabilities threaten service availability; business disruption accounts for 35%% of total breach cost.",
      0.65,
      "Avg. cost of breach involving business disruption"));

    map.put("ssrf", new CategoryInfo(
      "Server-Side Request Forgery (SSRF)",
      List.of("CWE-918"),
      "A10:2021",
      "%d SSRF vulnerabilities identified. " +
        "SSRF enables access to internal services and cloud metadata — a top-10 OWASP risk since 2021.",
      1.05,
      "Avg. cost of cloud-environment breach"));

    map.put("csrf", new CategoryInfo(
      "Cross-Site Request Forgery",
      List.of("CWE-352"),
      "A01:2021",
      "%d CSRF vulnerabilities found. " +
        "CSRF can trick authenticated users into performing unintended actions, enabling account takeover.",
      0.70,
      "Avg. cost of web application breach"));

    map.put("object-injection", new CategoryInfo(
      "Insecure Deserialization",
      List.of("CWE-502"),
      "A08:2021",
      "%d insecure deserialization vulnerabilities identified. " +
        "Deserialization attacks can lead to remote code execution with full system compromise.",
      1.12,
      "Avg. cost of breach via RCE vector"));

    map.put("auth", new CategoryInfo(
      "Authentication Weakness",
      List.of("CWE-287", "CWE-798", "CWE-259"),
      "A07:2021",
      "%d authentication vulnerabilities found, including potential hardcoded credentials. " +
        "Stolen credentials are the #1 initial attack vector — involved in 16%% of all breaches.",
      1.08,
      "Avg. cost of breach via stolen credentials"));

    map.put("weak-cryptography", new CategoryInfo(
      "Weak Cryptography",
      List.of("CWE-327", "CWE-328"),
      "A02:2021",
      "%d weak cryptography issues identified. " +
        "Weak encryption exposes sensitive data in transit or at rest, directly increasing breach notification costs.",
      0.80,
      "Avg. cost of breach involving crypto failure"));

    map.put("insecure-conf", new CategoryInfo(
      "Security Misconfiguration",
      List.of("CWE-16", "CWE-614"),
      "A05:2021",
      "%d security misconfiguration issues found. " +
        "Misconfiguration is present in 70%% of web application penetration tests — a leading breach enabler.",
      0.72,
      "Avg. cost of breach via misconfiguration"));

    map.put("file-manipulation", new CategoryInfo(
      "File Manipulation",
      List.of("CWE-73"),
      "A01:2021",
      "%d file manipulation vulnerabilities identified. " +
        "Unsafe file operations can enable data exfiltration or arbitrary code execution.",
      0.80,
      "Avg. cost of breach involving file-based attack"));

    map.put("encryption-of-sensitive-data", new CategoryInfo(
      "Sensitive Data Exposure",
      List.of("CWE-311", "CWE-312"),
      "A02:2021",
      "%d sensitive data exposure risks identified. " +
        "Customer PII costs $165 per record in a breach; healthcare PII costs $185 per record.",
      0.95,
      "Avg. cost of breach involving sensitive data"));

    map.put("traceability", new CategoryInfo(
      "Insufficient Logging",
      List.of("CWE-778"),
      "A09:2021",
      "%d insufficient logging issues found. " +
        "Breaches detected in under 200 days cost $1.02M less than those discovered later.",
      0.55,
      "Avg. additional cost from delayed detection"));

    map.put("permission", new CategoryInfo(
      "Broken Access Control",
      List.of("CWE-284", "CWE-269"),
      "A01:2021",
      "%d access control vulnerabilities identified. " +
        "Broken access control is the #1 OWASP risk category. In %s, related breaches average %s.",
      1.05,
      "Avg. cost of breach via access control failure"));

    map.put("others", new CategoryInfo(
      "Other Security Issues",
      List.of(),
      "",
      "%d additional security issues identified across other vulnerability classes.",
      0.70,
      "Avg. cost of breach (all causes)"));

    CATEGORY_MAP = Collections.unmodifiableMap(map);
  }

  private CWEBreachBenchmarks() {
    // utility class
  }

  public static CategoryInfo getCategory(String sqCategory) {
    return CATEGORY_MAP.get(sqCategory);
  }

  public static Map<String, CategoryInfo> getAllCategories() {
    return CATEGORY_MAP;
  }

  public static String formatNarrative(String sqCategory, int issueCount, Industry industry) {
    CategoryInfo info = CATEGORY_MAP.get(sqCategory);
    if (info == null) {
      return issueCount + " security issues identified.";
    }
    String costFormatted = formatDollars(industry.getAvgBreachCostUsd());
    return String.format(info.narrativeTemplate(), issueCount, industry.getDisplayName(), costFormatted);
  }

  public static String formatDollars(long amount) {
    if (amount >= 1_000_000) {
      double millions = amount / 1_000_000.0;
      if (millions == Math.floor(millions)) {
        return "$" + String.format("%.0fM", millions);
      }
      return "$" + String.format("%.2fM", millions);
    }
    return "$" + String.format("%,d", amount);
  }

  /**
   * @param displayName     plain-language category name
   * @param cweIds          associated CWE identifiers
   * @param owaspCategory   OWASP Top 10 mapping
   * @param narrativeTemplate format string for the narrative (args: count, industry, cost)
   * @param costMultiplier  multiplier relative to industry avg breach cost (1.0 = avg, 1.15 = 15% above)
   * @param benchmarkLabel  short description of what this benchmark measures
   */
  public record CategoryInfo(
    String displayName,
    List<String> cweIds,
    String owaspCategory,
    String narrativeTemplate,
    double costMultiplier,
    String benchmarkLabel
  ) {}
}
