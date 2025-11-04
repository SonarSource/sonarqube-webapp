/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

export interface Measure extends MeasureIntern {
  metric: string;
}

export interface MeasureEnhanced extends MeasureIntern {
  leak?: string;
  metric: Metric;
}

/**
  SQS accepts period value
  https://next.sonarqube.com/sonarqube/web_api/api/measures?query=measure

  SQC accepts periods as array on the same api call
  https://sonarcloud.io/web_api/api/measures?query=meas&deprecated=false
 **/
export interface MeasureIntern {
  bestValue?: boolean;
  period?: PeriodMeasure; // SQS
  periods?: PeriodMeasure[]; // SQC
  value?: string;
}

export interface Metric {
  bestValue?: string;
  custom?: boolean;
  decimalScale?: number;
  description?: string;
  direction?: number;
  domain?: string;
  hidden?: boolean;
  higherValuesAreBetter?: boolean;
  id?: string;
  key: string;
  name: string;
  qualitative?: boolean;
  type: string;
  worstValue?: string;
}

export interface PeriodMeasure {
  bestValue?: boolean;
  index: number;
  value: string;
}

export interface Period {
  date: string;
  index?: number;
  mode: PeriodMode;
  modeParam?: string;
  parameter?: string;
}

export type PeriodMode =
  | 'days'
  | 'date'
  | 'version'
  | 'previous_analysis'
  | 'previous_version'
  | 'manual_baseline';

export interface MeasuresByComponents {
  component: string;
  metric: string;
  period?: PeriodMeasure;
  periods?: PeriodMeasure[];
  value?: string;
}
