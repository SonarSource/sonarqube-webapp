package org.sonar.costsavings;

import org.junit.jupiter.api.Test;
import org.sonar.api.Plugin;
import org.sonar.api.SonarRuntime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class CostSavingsPluginTest {

  @Test
  void define_shouldRegisterExtensions() {
    CostSavingsPlugin plugin = new CostSavingsPlugin();
    Plugin.Context context = new Plugin.Context(mock(SonarRuntime.class));

    plugin.define(context);

    // 2 properties + 5 infrastructure (+ TelemetryStore, TelemetryCollector) + 7 ws classes (+ BenchmarksAction) = 14
    assertThat(context.getExtensions()).hasSize(14);
  }
}
