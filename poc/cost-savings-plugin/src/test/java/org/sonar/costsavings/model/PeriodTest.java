package org.sonar.costsavings.model;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PeriodTest {

  private static final LocalDate NOW = LocalDate.of(2025, 4, 10);

  @Test
  void month_shouldReturnLastMonth() {
    LocalDate start = Period.MONTH.getStartDate(NOW);
    assertThat(start).isEqualTo(LocalDate.of(2025, 3, 10));
  }

  @Test
  void quarter_shouldReturnLastThreeMonths() {
    LocalDate start = Period.QUARTER.getStartDate(NOW);
    assertThat(start).isEqualTo(LocalDate.of(2025, 1, 10));
  }

  @Test
  void year_shouldReturnLastYear() {
    LocalDate start = Period.YEAR.getStartDate(NOW);
    assertThat(start).isEqualTo(LocalDate.of(2024, 4, 10));
  }

  @Test
  void all_shouldReturnDistantPast() {
    LocalDate start = Period.ALL.getStartDate(NOW);
    assertThat(start.getYear()).isEqualTo(2000);
  }

  @Test
  void formatDates_shouldProduceISOFormat() {
    assertThat(Period.MONTH.formatStartDate(NOW)).isEqualTo("2025-03-10");
    assertThat(Period.MONTH.formatEndDate(NOW)).isEqualTo("2025-04-10");
  }
}
