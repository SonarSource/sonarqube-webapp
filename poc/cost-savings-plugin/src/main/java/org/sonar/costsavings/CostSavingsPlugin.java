package org.sonar.costsavings;

import org.sonar.api.Plugin;
import org.sonar.api.PropertyType;
import org.sonar.api.config.PropertyDefinition;
import org.sonar.costsavings.cache.CalculationCache;
import org.sonar.costsavings.calculation.CostCalculationService;
import org.sonar.costsavings.data.SonarQubeDataFetcher;
import org.sonar.costsavings.telemetry.TelemetryCollector;
import org.sonar.costsavings.telemetry.TelemetryStore;
import org.sonar.costsavings.ws.BenchmarksAction;
import org.sonar.costsavings.ws.ConfigureAction;
import org.sonar.costsavings.ws.CostSavingsWs;
import org.sonar.costsavings.ws.ProjectsAction;
import org.sonar.costsavings.ws.SecurityDetailAction;
import org.sonar.costsavings.ws.SummaryAction;
import org.sonar.costsavings.ws.TrendsAction;

/**
 * Plugin entry point for the Cost Savings Executive Dashboard.
 *
 * Registers:
 * - Web API endpoints (api/cost-savings/*)
 * - Property definitions for company profile storage
 * - Service components (data fetcher, calculation engine, cache)
 */
public class CostSavingsPlugin implements Plugin {

  @Override
  public void define(Context context) {
    // Property definitions
    context.addExtension(
      PropertyDefinition.builder("costsavings.companyProfile")
        .name("Company Profile")
        .description("JSON-encoded company profile for cost savings calculations. " +
          "Managed via the Cost Savings dashboard configuration panel.")
        .type(PropertyType.TEXT)
        .hidden()
        .build());
    context.addExtension(
      PropertyDefinition.builder("costsavings.apiToken")
        .name("API Token")
        .description("API token for the cost savings plugin to authenticate internal API calls. " +
          "Generate a token with admin permissions at My Account > Security.")
        .type(PropertyType.PASSWORD)
        .build());

    // Infrastructure
    context.addExtension(SonarQubeDataFetcher.class);
    context.addExtension(CalculationCache.class);
    context.addExtension(CostCalculationService.class);
    context.addExtension(TelemetryStore.class);
    context.addExtension(TelemetryCollector.class);

    // WebService and actions
    context.addExtension(CostSavingsWs.class);
    context.addExtension(SummaryAction.class);
    context.addExtension(SecurityDetailAction.class);
    context.addExtension(TrendsAction.class);
    context.addExtension(ConfigureAction.class);
    context.addExtension(ProjectsAction.class);
    context.addExtension(BenchmarksAction.class);
  }
}
