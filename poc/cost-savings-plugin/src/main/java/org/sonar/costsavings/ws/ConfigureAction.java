package org.sonar.costsavings.ws;

import com.google.gson.Gson;
import java.io.IOException;
import org.sonar.api.server.ServerSide;
import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.Response;
import org.sonar.api.server.ws.WebService;
import org.sonar.costsavings.calculation.CostCalculationService;
import org.sonar.costsavings.model.CompanyProfile;
import org.sonar.costsavings.model.Industry;
import org.sonar.costsavings.model.Region;

/**
 * GET/PUT /api/cost-savings/configuration
 *
 * GET: Returns current company profile (any authenticated user).
 * PUT: Updates company profile (admin only).
 *
 * The company profile stores factual company data — revenue, headcount,
 * industry, region — that feed directly into cost formulas. These are
 * not model tuning parameters.
 */
@ServerSide
public class ConfigureAction implements CostSavingsWsAction {

  private static final Gson GSON = new Gson();

  private final CostCalculationService calculationService;

  public ConfigureAction(CostCalculationService calculationService) {
    this.calculationService = calculationService;
  }

  @Override
  public void define(WebService.NewController controller) {
    defineGet(controller);
    definePut(controller);
  }

  private void defineGet(WebService.NewController controller) {
    controller.createAction("configuration")
      .setDescription("Returns the current company profile configuration. " +
        "Readable by any authenticated user. Editable by system administrators only.")
      .setSince("1.0")
      .setHandler(this::handleGet)
      .setInternal(false);
  }

  private void definePut(WebService.NewController controller) {
    WebService.NewAction action = controller.createAction("set_configuration")
      .setDescription("Updates the company profile configuration. Requires system administrator permissions.")
      .setSince("1.0")
      .setPost(true)
      .setHandler(this::handlePut)
      .setInternal(false);

    action.createParam("industry")
      .setDescription("Industry sector for breach cost benchmarks")
      .setPossibleValues(java.util.Arrays.stream(Industry.values())
        .map(Enum::name)
        .toArray(String[]::new));

    action.createParam("region")
      .setDescription("Geographic region for regional breach cost benchmarks")
      .setPossibleValues(java.util.Arrays.stream(Region.values())
        .map(Enum::name)
        .toArray(String[]::new));

    action.createParam("annualRevenue")
      .setDescription("Annual revenue in USD (enables GDPR/ransomware context)");

    action.createParam("employeeCount")
      .setDescription("Total employee count");

    action.createParam("developerCount")
      .setDescription("Developer count (subset of employees)");

    action.createParam("hourlyRate")
      .setDescription("Fully loaded hourly developer rate in USD. " +
        "Default: $75. Alternative: (avg_salary × 1.4 burden) / 2080 hours.");

    action.createParam("licenseCost")
      .setDescription("Annual SonarQube license cost in USD. Used to calculate ROI ratio.");

    action.createParam("tokenPricePerMillion")
      .setDescription("Price per million tokens for AI-assisted remediation cost estimates. " +
        "Default: $2.00 (Claude Sonnet-class pricing).");

    action.createParam("telemetryOptIn")
      .setDescription("Opt in to anonymous benchmarking data collection. " +
        "When enabled, anonymized calculation metrics are collected for industry benchmarks.")
      .setPossibleValues("true", "false");
  }

  private void handleGet(Request request, Response response) throws IOException {
    CompanyProfile profile = calculationService.loadProfile();
    SummaryAction.writeJson(response, profile);
  }

  private void handlePut(Request request, Response response) throws IOException {
    CompanyProfile current = calculationService.loadProfile();

    String industry = request.param("industry");
    if (industry != null) {
      current.setIndustry(Industry.valueOf(industry));
    }

    String region = request.param("region");
    if (region != null) {
      current.setRegion(Region.valueOf(region));
    }

    String annualRevenue = request.param("annualRevenue");
    if (annualRevenue != null) {
      current.setAnnualRevenue(Double.parseDouble(annualRevenue));
    }

    String employeeCount = request.param("employeeCount");
    if (employeeCount != null) {
      current.setEmployeeCount(Integer.parseInt(employeeCount));
    }

    String developerCount = request.param("developerCount");
    if (developerCount != null) {
      current.setDeveloperCount(Integer.parseInt(developerCount));
    }

    String hourlyRate = request.param("hourlyRate");
    if (hourlyRate != null) {
      current.setHourlyRate(Double.parseDouble(hourlyRate));
    }

    String licenseCost = request.param("licenseCost");
    if (licenseCost != null) {
      current.setLicenseCost(Long.parseLong(licenseCost));
    }

    String tokenPrice = request.param("tokenPricePerMillion");
    if (tokenPrice != null) {
      current.setTokenPricePerMillion(Double.parseDouble(tokenPrice));
    }

    String telemetryOptIn = request.param("telemetryOptIn");
    if (telemetryOptIn != null) {
      current.setTelemetryOptIn(Boolean.parseBoolean(telemetryOptIn));
    }

    calculationService.saveProfile(current);
    SummaryAction.writeJson(response, current);
  }
}
