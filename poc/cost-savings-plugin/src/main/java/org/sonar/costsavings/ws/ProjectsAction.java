package org.sonar.costsavings.ws;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.sonar.api.server.ServerSide;
import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.Response;
import org.sonar.api.server.ws.WebService;
import org.sonar.costsavings.calculation.CostCalculationService;
import org.sonar.costsavings.data.SonarQubeDataFetcher;
import org.sonar.costsavings.model.CompanyProfile;

/**
 * GET /api/cost-savings/projects
 *
 * Returns all projects with per-project savings estimates, issue counts,
 * and last analysis date. Powers the project scope selector UI.
 */
@ServerSide
public class ProjectsAction implements CostSavingsWsAction {

  private final SonarQubeDataFetcher dataFetcher;
  private final CostCalculationService calculationService;

  public ProjectsAction(SonarQubeDataFetcher dataFetcher, CostCalculationService calculationService) {
    this.dataFetcher = dataFetcher;
    this.calculationService = calculationService;
  }

  @Override
  public void define(WebService.NewController controller) {
    controller.createAction("projects")
      .setDescription("Returns all projects with per-project savings estimates. " +
        "Powers the project scope selector in the dashboard header.")
      .setSince("1.0")
      .setHandler(this::handle)
      .setInternal(false);
  }

  private void handle(Request request, Response response) throws IOException {
    CompanyProfile profile = calculationService.loadProfile();
    List<String> projectKeys = dataFetcher.fetchAllProjectKeys();
    List<ProjectInfo> projects = new ArrayList<>();

    for (String key : projectKeys) {
      ProjectInfo info = new ProjectInfo();
      info.key = key;
      info.name = dataFetcher.fetchProjectName(key);

      Map<String, Long> measures = dataFetcher.fetchEffortMeasures(key);
      long totalMinutes = measures.values().stream().mapToLong(Long::longValue).sum();
      info.issueCount = measures.getOrDefault("bugs", 0L).intValue()
        + measures.getOrDefault("vulnerabilities", 0L).intValue();

      // Estimate savings using blended multiplier
      double blendedMultiplier = 8.0;
      info.estimatedSavings = Math.round(
        (totalMinutes / 60.0) * profile.getEffectiveHourlyRate() * blendedMultiplier);

      info.lastAnalysis = dataFetcher.fetchLastAnalysisDate(key);

      projects.add(info);
    }

    // Sort by estimated savings descending (highest impact first)
    projects.sort(Comparator.comparingLong((ProjectInfo p) -> p.estimatedSavings).reversed());

    ProjectListResponse result = new ProjectListResponse();
    result.projects = projects;
    SummaryAction.writeJson(response, result);
  }

  static class ProjectListResponse {
    List<ProjectInfo> projects;
  }

  static class ProjectInfo {
    String key;
    String name;
    int issueCount;
    long estimatedSavings;
    String lastAnalysis;
  }
}
