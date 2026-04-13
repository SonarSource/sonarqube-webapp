package org.sonar.costsavings.ws;

import java.io.IOException;
import org.sonar.api.server.ServerSide;
import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.Response;
import org.sonar.api.server.ws.WebService;
import org.sonar.costsavings.telemetry.TelemetryStore;

/**
 * GET /api/cost-savings/benchmarks
 *
 * Returns anonymized aggregate benchmark data from telemetry.
 * For the demo, this is seeded with realistic mock data.
 */
@ServerSide
public class BenchmarksAction implements CostSavingsWsAction {

  private final TelemetryStore telemetryStore;

  public BenchmarksAction(TelemetryStore telemetryStore) {
    this.telemetryStore = telemetryStore;
  }

  @Override
  public void define(WebService.NewController controller) {
    controller.createAction("benchmarks")
      .setDescription("Returns anonymized aggregate benchmark data. " +
        "Shows industry averages, vulnerability category distribution, " +
        "and maturity curve projections based on opt-in telemetry data.")
      .setSince("1.0")
      .setHandler(this::handle)
      .setInternal(false);
  }

  private void handle(Request request, Response response) throws IOException {
    TelemetryStore.BenchmarkResponse benchmarks = telemetryStore.getBenchmarks();
    SummaryAction.writeJson(response, benchmarks);
  }
}
