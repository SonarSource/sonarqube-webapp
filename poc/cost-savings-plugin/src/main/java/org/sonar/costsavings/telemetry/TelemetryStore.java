package org.sonar.costsavings.telemetry;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import org.sonar.api.server.ServerSide;
import org.sonar.costsavings.model.Industry;

/**
 * Stores aggregated telemetry data in a local JSON file.
 * This is NOT a database — just a local accumulator for the demo.
 * <p>
 * File location: data/telemetry-aggregate.json inside the plugin's data directory.
 * Thread-safe via ReadWriteLock.
 */
@ServerSide
public class TelemetryStore {

  private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
  private static final String DATA_FILE = "telemetry-aggregate.json";

  private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
  private final Path dataDir;

  // In-memory aggregate state
  private AggregateData aggregate;

  public TelemetryStore() {
    // Default: use temp directory for demo
    this.dataDir = Path.of(System.getProperty("java.io.tmpdir"), "sonar-costsavings-data");
    this.aggregate = loadOrInit();
  }

  // Visible for testing
  TelemetryStore(Path dataDir) {
    this.dataDir = dataDir;
    this.aggregate = loadOrInit();
  }

  public void record(TelemetryEvent event) {
    lock.writeLock().lock();
    try {
      aggregate.totalCustomers++;
      aggregate.totalCalculations++;

      String industryName = event.industry.name();
      IndustryAggregate ia = aggregate.byIndustry.computeIfAbsent(
        industryName, k -> new IndustryAggregate());
      ia.customerCount++;
      ia.totalSavings += event.totalSavings;
      ia.totalVulnCategories += event.vulnerabilityCategoryCount;

      persist();
    } finally {
      lock.writeLock().unlock();
    }
  }

  public BenchmarkResponse getBenchmarks() {
    lock.readLock().lock();
    try {
      BenchmarkResponse response = new BenchmarkResponse();
      response.totalCustomers = aggregate.totalCustomers;

      // Compute per-industry averages
      for (Map.Entry<String, IndustryAggregate> entry : aggregate.byIndustry.entrySet()) {
        IndustryAggregate ia = entry.getValue();
        if (ia.customerCount > 0) {
          response.avgSavingsByIndustry.put(entry.getKey(), ia.totalSavings / ia.customerCount);
        }
      }

      // Compute global average vulnerability categories
      long totalVulnCats = 0;
      long totalCustomerCount = 0;
      for (IndustryAggregate ia : aggregate.byIndustry.values()) {
        totalVulnCats += ia.totalVulnCategories;
        totalCustomerCount += ia.customerCount;
      }
      response.avgVulnerabilityCategories = totalCustomerCount > 0
        ? (double) totalVulnCats / totalCustomerCount : 0.0;

      // Maturity curve — seeded demo data (realistic based on industry studies)
      response.maturityCurve = Map.of(
        "year1", 48_000L,
        "year2", 142_000L,
        "year3", 284_000L);

      return response;
    } finally {
      lock.readLock().unlock();
    }
  }

  private AggregateData loadOrInit() {
    Path file = dataDir.resolve(DATA_FILE);
    if (Files.exists(file)) {
      try (Reader reader = Files.newBufferedReader(file)) {
        AggregateData loaded = GSON.fromJson(reader, AggregateData.class);
        if (loaded != null) {
          return loaded;
        }
      } catch (IOException e) {
        // Fall through to seed
      }
    }
    return seedDemoData();
  }

  private void persist() {
    try {
      Files.createDirectories(dataDir);
      Path file = dataDir.resolve(DATA_FILE);
      try (Writer writer = Files.newBufferedWriter(file)) {
        GSON.toJson(aggregate, writer);
      }
    } catch (IOException e) {
      // Best-effort persistence for demo
    }
  }

  /**
   * Seeds realistic mock data for the demo.
   */
  static AggregateData seedDemoData() {
    AggregateData data = new AggregateData();
    data.totalCustomers = 12;
    data.totalCalculations = 47;

    data.byIndustry.put("HEALTHCARE", new IndustryAggregate(3, 852_000, 24));
    data.byIndustry.put("TECHNOLOGY", new IndustryAggregate(4, 748_000, 32));
    data.byIndustry.put("FINANCIAL", new IndustryAggregate(2, 610_000, 16));
    data.byIndustry.put("MANUFACTURING", new IndustryAggregate(1, 195_000, 6));
    data.byIndustry.put("RETAIL", new IndustryAggregate(1, 142_000, 5));
    data.byIndustry.put("ENERGY", new IndustryAggregate(1, 167_000, 8));

    return data;
  }

  // --- Data classes ---

  static class AggregateData {
    int totalCustomers;
    int totalCalculations;
    Map<String, IndustryAggregate> byIndustry = new LinkedHashMap<>();
  }

  static class IndustryAggregate {
    int customerCount;
    long totalSavings;
    int totalVulnCategories;

    IndustryAggregate() {}

    IndustryAggregate(int customerCount, long totalSavings, int totalVulnCategories) {
      this.customerCount = customerCount;
      this.totalSavings = totalSavings;
      this.totalVulnCategories = totalVulnCategories;
    }
  }

  public static class TelemetryEvent {
    final Industry industry;
    final int projectCount;
    final long totalSavings;
    final int vulnerabilityCategoryCount;
    final String scanFrequency;

    public TelemetryEvent(Industry industry, int projectCount, long totalSavings,
      int vulnerabilityCategoryCount, String scanFrequency) {
      this.industry = industry;
      this.projectCount = projectCount;
      this.totalSavings = totalSavings;
      this.vulnerabilityCategoryCount = vulnerabilityCategoryCount;
      this.scanFrequency = scanFrequency;
    }
  }

  public static class BenchmarkResponse {
    int totalCustomers;
    Map<String, Long> avgSavingsByIndustry = new LinkedHashMap<>();
    double avgVulnerabilityCategories;
    Map<String, Long> maturityCurve = new LinkedHashMap<>();
  }
}
