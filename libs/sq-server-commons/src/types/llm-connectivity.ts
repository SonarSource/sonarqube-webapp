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

/**
 * An installation may hold at most this many providers. The backend rejects a
 * create beyond it; the UI mirrors the count to disable the add button early.
 */
export const MAX_LLM_PROVIDERS = 4;

export enum LlmProviderType {
  CustomProxy = 'CUSTOM_PROXY',
  Sonar = 'SONAR',
}

export enum AiCapability {
  AiCodefix = 'AI_CODEFIX',
  HunterAgent = 'HUNTER_AGENT',
  RemediationAgent = 'REMEDIATION_AGENT',
}

export enum LlmProviderFieldType {
  HttpHeaders = 'HTTP_HEADERS',
  String = 'STRING',
}

export interface LlmHttpHeader {
  name: string;
  secret: boolean;
  value: string;
}

interface LlmProviderField {
  key: string;
  label: string;
  required: boolean;
  secret?: boolean;
  type: `${LlmProviderFieldType}`;
}

export interface LlmProviderDefinition {
  fields: LlmProviderField[];
  label: string;
  provider: `${LlmProviderType}`;
}

export type LlmProviderConfigurationValue = LlmHttpHeader[] | string;

export type LlmProviderConfiguration = Record<string, LlmProviderConfigurationValue>;

/**
 * Secret values are never returned on read. A secret `STRING` field is absent from
 * `configuration`, and an `LlmHttpHeader` marked secret comes back with an empty
 * `value` but its `secret` flag intact.
 */
export interface LlmProvider {
  configuration: LlmProviderConfiguration;
  id: string;
  label: string;
  provider: `${LlmProviderType}`;
}

/**
 * On write, a secret header may omit `value` to keep the stored secret untouched.
 */
export interface LlmHttpHeaderWrite {
  name: string;
  secret: boolean;
  value?: string;
}

export type LlmProviderConfigurationWrite = Record<string, LlmHttpHeaderWrite[] | string>;

export interface LlmProviderCreate {
  configuration: LlmProviderConfigurationWrite;
  label: string;
  provider: `${LlmProviderType}`;
}

export interface LlmProviderUpdate {
  configuration: LlmProviderConfigurationWrite;
  label: string;
}

/**
 * There is one selection per AI capability. `llmProviderId` is null until an admin
 * picks one, and `modelIdentifier` is null when the capability runs on a fixed model.
 */
export interface LlmProviderSelection {
  aiCapability: `${AiCapability}`;
  llmProviderId: string | null;
  modelIdentifier: string | null;
}

export interface LlmProviderSelectionUpsert {
  aiCapability: `${AiCapability}`;
  llmProviderId: string;
  modelIdentifier: string | null;
}
