package org.sonar.costsavings.ws;

import java.io.IOException;
import org.sonar.api.server.ServerSide;
import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.Response;
import org.sonar.api.server.ws.WebService;
import org.sonar.costsavings.calculation.CostCalculationService;
import org.sonar.costsavings.model.TrendData;

/**
 * GET /api/cost-savings/trends
 *
 * Returns monthly savings trend data for charting.
 * Shows how value accumulates over time — reinforces renewal/expansion conversations.
 */
@ServerSide
public class TrendsAction implements CostSavingsWsAction {

  private final CostCalculationService calculationService;

  public TrendsAction(CostCalculationService calculationService) {
    this.calculationService = calculationService;
  }

  @Override
  public void define(WebService.NewController controller) {
    WebService.NewAction action = controller.createAction("trends")
      .setDescription("Returns monthly savings trend data for charting. " +
        "Each month shows dollars saved, hours, and issues resolved.")
      .setSince("1.0")
      .setHandler(this::handle)
      .setInternal(false);

    action.createParam("months")
      .setDescription("Number of months of trend data to return")
      .setDefaultValue("12");

    action.createParam("projects")
      .setDescription("Comma-separated project keys to include. Omit for all.")
      .setExampleValue("elasticsearch,apache-kafka,webgoat");
  }

  private void handle(Request request, Response response) throws IOException {
    String monthsParam = request.param("months");
    int months = monthsParam != null ? Integer.parseInt(monthsParam) : 12;
    months = Math.max(1, Math.min(months, 36));

    java.util.List<String> projectKeys = SummaryAction.parseProjects(request.param("projects"));
    TrendData trends = calculationService.getTrends(months, projectKeys);
    SummaryAction.writeJson(response, trends);
  }
}
