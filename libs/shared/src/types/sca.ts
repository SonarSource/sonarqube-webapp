/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

export interface ScaEnablementPayload {
  enablement: boolean;
}

export interface ScaSelfTestCheckDetails {
  attemptedMethod: string;
  attemptedUrl: string;
  responseBody: string;
  responseBodyAppearsValid: boolean;
  responseCode: number;
}

export interface ScaSelfTestPayload {
  cliVersionCheck: ScaSelfTestCheckDetails | undefined;
  featureEnabled: boolean;
  selfTestPassed: boolean;
  vulnerabilityDetailsCheck: ScaSelfTestCheckDetails | undefined;
}

export enum ReleaseRiskSeverity {
  Blocker = 'BLOCKER',
  High = 'HIGH',
  Medium = 'MEDIUM',
  Low = 'LOW',
  Info = 'INFO',
}

export enum ReleaseRiskType {
  Vulnerability = 'VULNERABILITY',
  ProhibitedLicense = 'PROHIBITED_LICENSE',
}

export enum RiskStatus {
  Accept = 'ACCEPT',
  Confirm = 'CONFIRM',
  Open = 'OPEN',
  Fixed = 'FIXED',
  Safe = 'SAFE',
}

export enum RiskTransitions {
  Accept = 'ACCEPT',
  Confirm = 'CONFIRM',
  Fixed = 'FIXED',
  Reopen = 'REOPEN',
  Safe = 'SAFE',
}

export type L10nMessageType = string;
