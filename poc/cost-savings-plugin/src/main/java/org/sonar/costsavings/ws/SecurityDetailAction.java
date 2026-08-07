package org.sonar.costsavings.ws;

import java.io.IOException;
import org.sonar.api.server.ServerSide;
import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.Response;
import org.sonar.api.server.ws.WebService;
import org.sonar.costsavings.calculation.CostCalculationService;
import org.sonar.costsavings.model.SecurityDetail;

/**
 * GET /api/cost-savings/security-detail
 *
 * Returns Tier B security risk context: vulnerability categories found by SonarQube
 * alongside industry breach cost benchmarks. Does NOT calculate dollar savings.
 *
 * Each category includes:
 * - Plain-language name (not CWE codes)
 * - Issue count and severity breakdown
 * - IBM/Ponemon industry benchmark cost
 * - Narrative text for executive display
 */
@ServerSide
public class SecurityDetailAction implements CostSavingsWsAction {

  private final CostCalculationService calculationService;

  public SecurityDetailAction(CostCalculationService calculationService) {
    this.calculationService = calculationService;
  }

  @Override
  public void define(WebService.NewController controller) {
    WebService.NewAction action = controller.createAction("security-detail")
      .setDescription("Returns security risk context with vulnerability categories, " +
        "industry breach cost benchmarks, and narrative cards for executive display. " +
        "Tier B: contextual benchmarks, not dollar savings predictions.")
      .setSince("1.0")
      .setHandler(this::handle)
      .setInternal(false);

    action.createParam("projects")
      .setDescription("Comma-separated project keys to include. Omit for all.")
      .setExampleValue("elasticsearch,apache-kafka,webgoat");
  }

  private void handle(Request request, Response response) throws IOException {
    java.util.List<String> projectKeys = SummaryAction.parseProjects(request.param("projects"));
    SecurityDetail detail = calculationService.getSecurityDetail(projectKeys);
    SummaryAction.writeJson(response, detail);
  }
}
