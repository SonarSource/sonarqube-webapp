package org.sonar.costsavings.model;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public enum Period {
  MONTH, QUARTER, YEAR, ALL;

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

  public LocalDate getStartDate(LocalDate now) {
    return switch (this) {
      case MONTH -> now.minusMonths(1);
      case QUARTER -> now.minusMonths(3);
      case YEAR -> now.minusYears(1);
      case ALL -> LocalDate.of(2000, 1, 1);
    };
  }

  public String formatStartDate(LocalDate now) {
    return getStartDate(now).format(DATE_FORMAT);
  }

  public String formatEndDate(LocalDate now) {
    return now.format(DATE_FORMAT);
  }
}
