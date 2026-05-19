package org.sonar.costsavings.ws;

import com.google.gson.Gson;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.Response;
import org.sonar.api.server.ws.WebService;
import org.sonar.api.server.ServerSide;
import org.sonar.costsavings.calculation.CostCalculationService;
import org.sonar.costsavings.model.CostSummary;
import org.sonar.costsavings.model.Period;

/**
 * GET /api/cost-savings/summary
 *
 * Returns the Tier A headline: total developer time saved in dollars,
 * broken down by quality dimension (security, reliability, maintainability),
 * plus metadata (period, profile, configured state).
 */
@ServerSide
public class SummaryAction implements CostSavingsWsAction {

  private static final Gson GSON = new Gson();

  private final CostCalculationService calculationService;

  public SummaryAction(CostCalculationService calculationService) {
    this.calculationService = calculationService;
  }

  @Override
  public void define(WebService.NewController controller) {
    WebService.NewAction action = controller.createAction("summary")
      .setDescription("Returns executive cost savings summary. " +
        "Tier A: developer time saved in dollars using effort deltas and phase multipliers. " +
        "Includes period metadata and company profile state.")
      .setSince("1.0")
      .setHandler(this::handle)
      .setInternal(false);

    action.createParam("period")
      .setDescription("Time period for savings calculation")
      .setPossibleValues("month", "quarter", "year", "all")
      .setDefaultValue("year");

    action.createParam("projects")
      .setDescription("Comma-separated project keys to include. Omit for all.")
      .setExampleValue("elasticsearch,apache-kafka,webgoat");
  }

  private void handle(Request request, Response response) throws IOException {
    String periodParam = request.param("period");
    Period period = periodParam != null ? Period.valueOf(periodParam.toUpperCase()) : Period.YEAR;

    java.util.List<String> projectKeys = parseProjects(request.param("projects"));
    CostSummary summary = calculationService.getSummary(period, projectKeys);

    writeJson(response, summary);
  }

  static java.util.List<String> parseProjects(String projectsParam) {
    if (projectsParam == null || projectsParam.isBlank()) {
      return null;
    }
    return java.util.Arrays.stream(projectsParam.split(","))
      .map(String::trim)
      .filter(s -> !s.isEmpty())
      .toList();
  }

  static void writeJson(Response response, Object obj) throws IOException {
    String json = GSON.toJson(obj);
    response.stream().setMediaType("application/json");
    try (OutputStream out = response.stream().output()) {
      out.write(json.getBytes(StandardCharsets.UTF_8));
    }
  }
}
