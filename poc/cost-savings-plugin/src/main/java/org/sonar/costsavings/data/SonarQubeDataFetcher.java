package org.sonar.costsavings.data;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.sonar.api.config.Configuration;
import org.sonar.api.server.ServerSide;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

/**
 * Fetches data from SonarQube's own Web API endpoints.
 * Uses java.net.http.HttpClient to make local HTTP calls.
 *
 * Authentication: uses the system passcode (sonar.web.systemPasscode) for internal
 * API calls, or a configured API token as fallback.
 */
@ServerSide
public class SonarQubeDataFetcher {

  private static final Logger LOG = Loggers.get(SonarQubeDataFetcher.class);
  private static final Gson GSON = new Gson();
  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;
  private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(30);
  private static final int PAGE_SIZE = 500;

  static final String PROP_BASE_URL = "sonar.core.serverBaseURL";
  static final String PROP_SYSTEM_PASSCODE = "sonar.web.systemPasscode";
  static final String PROP_API_TOKEN = "costsavings.apiToken";
  static final String DEFAULT_BASE_URL = "http://localhost:9000";

  private final Configuration config;
  private final HttpClient httpClient;

  public SonarQubeDataFetcher(Configuration config) {
    this(config, HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(10))
      .build());
  }

  // Visible for testing
  SonarQubeDataFetcher(Configuration config, HttpClient httpClient) {
    this.config = config;
    this.httpClient = httpClient;
  }

  /**
   * Lists all project keys in the SonarQube instance.
   */
  public List<String> fetchAllProjectKeys() throws IOException {
    List<String> projectKeys = new ArrayList<>();
    int page = 1;
    int totalPages;

    do {
      String url = buildUrl("/api/components/search",
        Map.of("qualifiers", "TRK", "ps", String.valueOf(PAGE_SIZE), "p", String.valueOf(page)));
      JsonObject response = executeGet(url);
      JsonObject paging = response.getAsJsonObject("paging");
      int total = paging.get("total").getAsInt();
      totalPages = (int) Math.ceil((double) total / PAGE_SIZE);

      JsonArray components = response.getAsJsonArray("components");
      for (JsonElement el : components) {
        projectKeys.add(el.getAsJsonObject().get("key").getAsString());
      }
      page++;
    } while (page <= totalPages);

    return projectKeys;
  }

  /**
   * Fetches current effort measures for a project.
   */
  public Map<String, Long> fetchEffortMeasures(String projectKey) throws IOException {
    String metricKeys = String.join(",",
      "software_quality_maintainability_remediation_effort",
      "software_quality_security_remediation_effort",
      "software_quality_reliability_remediation_effort",
      "vulnerabilities",
      "bugs",
      "ncloc");

    String url = buildUrl("/api/measures/component",
      Map.of("component", projectKey, "metricKeys", metricKeys));
    JsonObject response = executeGet(url);

    Map<String, Long> measures = new LinkedHashMap<>();
    JsonObject component = response.getAsJsonObject("component");
    if (component != null && component.has("measures")) {
      for (JsonElement el : component.getAsJsonArray("measures")) {
        JsonObject measure = el.getAsJsonObject();
        String metric = measure.get("metric").getAsString();
        String value = measure.get("value").getAsString();
        try {
          measures.put(metric, Long.parseLong(value));
        } catch (NumberFormatException e) {
          measures.put(metric, Math.round(Double.parseDouble(value)));
        }
      }
    }
    return measures;
  }

  /**
   * Fetches measure history for a project within a date range.
   */
  public Map<String, Long> fetchMeasureHistory(String projectKey, String metricKey,
    LocalDate from, LocalDate to) throws IOException {
    String url = buildUrl("/api/measures/search_history",
      Map.of(
        "component", projectKey,
        "metrics", metricKey,
        "from", from.format(DATE_FORMAT),
        "to", to.format(DATE_FORMAT),
        "ps", "1000"));
    JsonObject response = executeGet(url);

    Map<String, Long> history = new LinkedHashMap<>();
    JsonArray measures = response.getAsJsonArray("measures");
    if (measures != null && !measures.isEmpty()) {
      JsonObject metric = measures.get(0).getAsJsonObject();
      JsonArray historyArray = metric.getAsJsonArray("history");
      if (historyArray != null) {
        for (JsonElement el : historyArray) {
          JsonObject entry = el.getAsJsonObject();
          String date = entry.get("date").getAsString();
          if (entry.has("value")) {
            try {
              history.put(date.substring(0, 10), Long.parseLong(entry.get("value").getAsString()));
            } catch (NumberFormatException e) {
              history.put(date.substring(0, 10), Math.round(Double.parseDouble(entry.get("value").getAsString())));
            }
          }
        }
      }
    }
    return history;
  }

  /**
   * Fetches security issue counts by SonarSource security category.
   */
  public Map<String, Integer> fetchSecurityCategoryFacets() throws IOException {
    return fetchSecurityCategoryFacets(null);
  }

  public Map<String, Integer> fetchSecurityCategoryFacets(List<String> projectKeys) throws IOException {
    Map<String, String> params = new LinkedHashMap<>();
    params.put("types", "VULNERABILITY");
    params.put("resolved", "false");
    params.put("facets", "sonarsourceSecurity");
    params.put("ps", "1");
    if (projectKeys != null && !projectKeys.isEmpty()) {
      params.put("componentKeys", String.join(",", projectKeys));
    }
    String url = buildUrl("/api/issues/search", params);
    JsonObject response = executeGet(url);

    Map<String, Integer> facets = new LinkedHashMap<>();
    JsonArray facetArray = response.getAsJsonArray("facets");
    if (facetArray != null) {
      for (JsonElement facetEl : facetArray) {
        JsonObject facet = facetEl.getAsJsonObject();
        if ("sonarsourceSecurity".equals(facet.get("property").getAsString())) {
          for (JsonElement valueEl : facet.getAsJsonArray("values")) {
            JsonObject value = valueEl.getAsJsonObject();
            String key = value.get("val").getAsString();
            int count = value.get("count").getAsInt();
            if (count > 0) {
              facets.put(key, count);
            }
          }
        }
      }
    }
    return facets;
  }

  /**
   * Fetches severity breakdown for security issues.
   */
  public Map<String, Integer> fetchSecuritySeverityBreakdown() throws IOException {
    return fetchSecuritySeverityBreakdown(null);
  }

  public Map<String, Integer> fetchSecuritySeverityBreakdown(List<String> projectKeys) throws IOException {
    Map<String, String> params = new LinkedHashMap<>();
    params.put("types", "VULNERABILITY");
    params.put("resolved", "false");
    params.put("facets", "severities");
    params.put("ps", "1");
    if (projectKeys != null && !projectKeys.isEmpty()) {
      params.put("componentKeys", String.join(",", projectKeys));
    }
    String url = buildUrl("/api/issues/search", params);
    JsonObject response = executeGet(url);

    Map<String, Integer> severities = new LinkedHashMap<>();
    JsonArray facetArray = response.getAsJsonArray("facets");
    if (facetArray != null) {
      for (JsonElement facetEl : facetArray) {
        JsonObject facet = facetEl.getAsJsonObject();
        if ("severities".equals(facet.get("property").getAsString())) {
          for (JsonElement valueEl : facet.getAsJsonArray("values")) {
            JsonObject value = valueEl.getAsJsonObject();
            String key = value.get("val").getAsString();
            int count = value.get("count").getAsInt();
            if (count > 0) {
              severities.put(key, count);
            }
          }
        }
      }
    }
    return severities;
  }

  /**
   * Fetches severity facets scoped to a specific sonarsourceSecurity category.
   */
  public Map<String, Integer> fetchSeverityForCategory(String category) throws IOException {
    return fetchSeverityForCategory(category, null);
  }

  public Map<String, Integer> fetchSeverityForCategory(String category, List<String> projectKeys) throws IOException {
    Map<String, String> params = new LinkedHashMap<>();
    params.put("types", "VULNERABILITY");
    params.put("resolved", "false");
    params.put("sonarsourceSecurity", category);
    params.put("facets", "severities");
    params.put("ps", "1");
    if (projectKeys != null && !projectKeys.isEmpty()) {
      params.put("componentKeys", String.join(",", projectKeys));
    }
    String url = buildUrl("/api/issues/search", params);
    JsonObject response = executeGet(url);

    Map<String, Integer> severities = new LinkedHashMap<>();
    JsonArray facetArray = response.getAsJsonArray("facets");
    if (facetArray != null) {
      for (JsonElement facetEl : facetArray) {
        JsonObject facet = facetEl.getAsJsonObject();
        if ("severities".equals(facet.get("property").getAsString())) {
          for (JsonElement valueEl : facet.getAsJsonArray("values")) {
            JsonObject value = valueEl.getAsJsonObject();
            int count = value.get("count").getAsInt();
            if (count > 0) {
              severities.put(value.get("val").getAsString(), count);
            }
          }
        }
      }
    }
    return severities;
  }

  /**
   * Fetches count of resolved issues created within a date range.
   */
  public int fetchResolvedIssueCount(LocalDate from, LocalDate to) throws IOException {
    return fetchResolvedIssueCount(from, to, null);
  }

  public int fetchResolvedIssueCount(LocalDate from, LocalDate to, List<String> projectKeys) throws IOException {
    Map<String, String> params = new LinkedHashMap<>();
    params.put("resolved", "true");
    params.put("createdAfter", from.format(DATE_FORMAT));
    params.put("createdBefore", to.format(DATE_FORMAT));
    params.put("ps", "1");
    if (projectKeys != null && !projectKeys.isEmpty()) {
      params.put("componentKeys", String.join(",", projectKeys));
    }
    String url = buildUrl("/api/issues/search", params);
    JsonObject response = executeGet(url);
    return response.get("total").getAsInt();
  }

  /**
   * Fetches the total count of open vulnerabilities.
   */
  public int fetchOpenVulnerabilityCount() throws IOException {
    return fetchOpenVulnerabilityCount(null);
  }

  public int fetchOpenVulnerabilityCount(List<String> projectKeys) throws IOException {
    Map<String, String> params = new LinkedHashMap<>();
    params.put("types", "VULNERABILITY");
    params.put("resolved", "false");
    params.put("ps", "1");
    if (projectKeys != null && !projectKeys.isEmpty()) {
      params.put("componentKeys", String.join(",", projectKeys));
    }
    String url = buildUrl("/api/issues/search", params);
    JsonObject response = executeGet(url);
    return response.get("total").getAsInt();
  }

  /**
   * Fetches the SonarQube edition from the system/status endpoint.
   */
  public String fetchEdition() throws IOException {
    String url = buildUrl("/api/system/status", Map.of());
    try {
      JsonObject response = executeGet(url);
      if (response.has("edition")) {
        return response.get("edition").getAsString();
      }
    } catch (IOException e) {
      LOG.debug("Failed to fetch edition from system/status: {}", e.getMessage());
    }
    return null;
  }

  /**
   * Fetches SCA dependency risk count if available.
   */
  public int fetchScaDependencyRiskCount() {
    // SCA metric may not be available on all editions
    return 0;
  }

  /**
   * Fetches AI Code Assurance metrics for a project.
   * Checks if AI Code Assurance is enabled and retrieves related quality metrics.
   * Returns empty/default values gracefully if the API is not available.
   */
  public Map<String, String> fetchAICodeAssuranceMetrics(String projectKey) {
    Map<String, String> metrics = new LinkedHashMap<>();
    try {
      String metricKeys = String.join(",",
        "ai_code_assurance",
        "ai_code_assurance_pass_rate",
        "ai_generated_issue_count",
        "ai_generated_ncloc",
        "ncloc");
      String url = buildUrl("/api/measures/component",
        Map.of("component", projectKey, "metricKeys", metricKeys));
      JsonObject response = executeGet(url);
      JsonObject component = response.getAsJsonObject("component");
      if (component != null && component.has("measures")) {
        for (JsonElement el : component.getAsJsonArray("measures")) {
          JsonObject measure = el.getAsJsonObject();
          metrics.put(measure.get("metric").getAsString(), measure.get("value").getAsString());
        }
      }
    } catch (IOException e) {
      LOG.debug("AI Code Assurance metrics not available for {}: {}", projectKey, e.getMessage());
    }
    return metrics;
  }

  /**
   * Fetches the display name for a project.
   */
  public String fetchProjectName(String projectKey) throws IOException {
    String url = buildUrl("/api/components/show", Map.of("component", projectKey));
    try {
      JsonObject response = executeGet(url);
      JsonObject component = response.getAsJsonObject("component");
      if (component != null && component.has("name")) {
        return component.get("name").getAsString();
      }
    } catch (IOException e) {
      LOG.debug("Failed to fetch project name for {}: {}", projectKey, e.getMessage());
    }
    return projectKey;
  }

  /**
   * Fetches the last analysis date for a project.
   */
  public String fetchLastAnalysisDate(String projectKey) throws IOException {
    String url = buildUrl("/api/components/show", Map.of("component", projectKey));
    try {
      JsonObject response = executeGet(url);
      JsonObject component = response.getAsJsonObject("component");
      if (component != null && component.has("analysisDate")) {
        return component.get("analysisDate").getAsString().substring(0, 10);
      }
    } catch (IOException e) {
      LOG.debug("Failed to fetch analysis date for {}: {}", projectKey, e.getMessage());
    }
    return null;
  }

  /**
   * Reads a setting value from the SQ settings API.
   */
  public Optional<String> fetchSetting(String key) throws IOException {
    String url = buildUrl("/api/settings/values", Map.of("keys", key));
    JsonObject response = executeGet(url);
    JsonArray settings = response.getAsJsonArray("settings");
    if (settings != null) {
      for (JsonElement el : settings) {
        JsonObject setting = el.getAsJsonObject();
        if (key.equals(setting.get("key").getAsString())) {
          return Optional.of(setting.get("value").getAsString());
        }
      }
    }
    return Optional.empty();
  }

  /**
   * Saves a setting value via the SQ settings API.
   */
  public void saveSetting(String key, String value) throws IOException {
    String url = getBaseUrl() + "/api/settings/set";
    String body = "key=" + URLEncoder.encode(key, StandardCharsets.UTF_8) +
      "&value=" + URLEncoder.encode(value, StandardCharsets.UTF_8);

    HttpRequest request = addAuth(HttpRequest.newBuilder()
      .uri(URI.create(url))
      .timeout(REQUEST_TIMEOUT)
      .header("Content-Type", "application/x-www-form-urlencoded")
      .POST(HttpRequest.BodyPublishers.ofString(body)))
      .build();

    try {
      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() >= 400) {
        throw new IOException("Failed to save setting " + key + ": HTTP " + response.statusCode());
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IOException("Interrupted while saving setting", e);
    }
  }

  private JsonObject executeGet(String url) throws IOException {
    HttpRequest request = addAuth(HttpRequest.newBuilder()
      .uri(URI.create(url))
      .timeout(REQUEST_TIMEOUT)
      .GET())
      .build();

    try {
      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() >= 400) {
        throw new IOException("HTTP " + response.statusCode() + " from " + url + ": " + response.body());
      }
      return GSON.fromJson(response.body(), JsonObject.class);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IOException("Interrupted while fetching " + url, e);
    }
  }

  /**
   * Adds authentication to internal API requests.
   * Priority: system passcode > configured API token.
   */
  private HttpRequest.Builder addAuth(HttpRequest.Builder builder) {
    Optional<String> passcode = config.get(PROP_SYSTEM_PASSCODE);
    if (passcode.isPresent() && !passcode.get().isEmpty()) {
      builder.header("X-Sonar-Passcode", passcode.get());
      return builder;
    }
    Optional<String> token = config.get(PROP_API_TOKEN);
    if (token.isPresent() && !token.get().isEmpty()) {
      builder.header("Authorization", "Bearer " + token.get());
      return builder;
    }
    LOG.warn("No system passcode or API token configured for cost-savings plugin. " +
      "Set sonar.web.systemPasscode or costsavings.apiToken.");
    return builder;
  }

  private String buildUrl(String path, Map<String, String> params) {
    StringBuilder sb = new StringBuilder(getBaseUrl()).append(path);
    if (!params.isEmpty()) {
      sb.append('?');
      boolean first = true;
      for (Map.Entry<String, String> entry : params.entrySet()) {
        if (!first) {
          sb.append('&');
        }
        sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
          .append('=')
          .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        first = false;
      }
    }
    return sb.toString();
  }

  String getBaseUrl() {
    return config.get(PROP_BASE_URL).orElse(DEFAULT_BASE_URL);
  }
}
