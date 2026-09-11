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
export const MAX_LLM_PROVIDERS = 15;

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
 * Outcome of a live connection test against an already-configured provider. The test is never
 * cached server-side, so this reflects whether the provider accepts its stored credentials right
 * now. `error` is null when `isValid` is true, and is a short generic reason otherwise — the
 * server deliberately does not reflect upstream statuses or bodies back, to avoid turning the
 * test into a probe for internal services.
 */
export interface LlmProviderValidation {
  error: string | null;
  isValid: boolean;
  llmProviderId: string;
}

/**
 * Per-provider view of its own connection test. Each provider is probed independently, so its
 * in-flight state has to be tracked independently too: one shared flag would leave a provider whose
 * probe already settled waiting on the slowest of its siblings.
 *
 * `isFetching` covers a re-run as well as the first run, and takes precedence over `validation`:
 * while a provider is being re-probed its previous verdict is no longer known to hold.
 */
export interface LlmProviderValidationState {
  isFetching: boolean;
  validation: LlmProviderValidation | undefined;
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
  secondaryModelIdentifier?: string | null;
}

export interface LlmProviderSelectionUpsert {
  aiCapability: `${AiCapability}`;
  llmProviderId: string;
  modelIdentifier: string | null;
  secondaryModelIdentifier?: string | null;
}
