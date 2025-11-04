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

export enum SettingType {
  STRING = 'STRING',
  TEXT = 'TEXT',
  JSON = 'JSON',
  PASSWORD = 'PASSWORD',
  BOOLEAN = 'BOOLEAN',
  FLOAT = 'FLOAT',
  INTEGER = 'INTEGER',
  LICENSE = 'LICENSE',
  LONG = 'LONG',
  SINGLE_SELECT_LIST = 'SINGLE_SELECT_LIST',
  PROPERTY_SET = 'PROPERTY_SET',
  FORMATTED_TEXT = 'FORMATTED_TEXT',
  REGULAR_EXPRESSION = 'REGULAR_EXPRESSION',
  USER_LOGIN = 'USER_LOGIN',
}

export interface SettingDefinition {
  description?: string;
  key: string;
  multiValues?: boolean;
  name?: string;
  options: string[];
  type?: SettingType;
}

export interface SettingFieldDefinition extends SettingDefinition {
  name: string;
}

export interface ExtendedSettingDefinitionNoFields extends SettingDefinition {
  category: string;
  defaultValue?: string;
  deprecatedKey?: string;
  multiValues?: boolean;
  subCategory: string;
}

export interface ExtendedSettingDefinition extends ExtendedSettingDefinitionNoFields {
  fields: SettingFieldDefinition[];
}

export interface SettingValue {
  fieldValues?: Array<Record<string, string>>;
  inherited?: boolean;
  key: string;
  parentFieldValues?: Array<Record<string, string>>;
  parentValue?: string;
  parentValues?: string[];
  value?: string;
  values?: string[];
}

/**
 * SQS has an extra parameter, hence "Base".
 */
export interface BaseSettingsValueResponse {
  settings: SettingValue[];
}
