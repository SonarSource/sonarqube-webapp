package org.sonar.costsavings.ws;

import org.sonar.api.server.ServerSide;
import org.sonar.api.server.ws.WebService;

/**
 * Registers the api/cost-savings WebService controller with all its actions.
 */
@ServerSide
public class CostSavingsWs implements WebService {

  private final SummaryAction summaryAction;
  private final SecurityDetailAction securityDetailAction;
  private final TrendsAction trendsAction;
  private final ConfigureAction configureAction;
  private final ProjectsAction projectsAction;
  private final BenchmarksAction benchmarksAction;

  public CostSavingsWs(SummaryAction summaryAction, SecurityDetailAction securityDetailAction,
    TrendsAction trendsAction, ConfigureAction configureAction, ProjectsAction projectsAction,
    BenchmarksAction benchmarksAction) {
    this.summaryAction = summaryAction;
    this.securityDetailAction = securityDetailAction;
    this.trendsAction = trendsAction;
    this.configureAction = configureAction;
    this.projectsAction = projectsAction;
    this.benchmarksAction = benchmarksAction;
  }

  @Override
  public void define(Context context) {
    NewController controller = context.createController("api/cost-savings")
      .setDescription("Executive cost savings dashboard. " +
        "Shows developer time saved (Tier A) and security risk context (Tier B) " +
        "based on SonarQube issue detection data.")
      .setSince("1.0");

    summaryAction.define(controller);
    securityDetailAction.define(controller);
    trendsAction.define(controller);
    configureAction.define(controller);
    projectsAction.define(controller);
    benchmarksAction.define(controller);

    controller.done();
  }
}
