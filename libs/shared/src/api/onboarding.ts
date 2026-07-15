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

import { API_V2_BASE_URL } from '~adapters/helpers/urls';
import { axiosClient } from '../helpers/axios-clients';
import {
  OnboardingOverview,
  OnboardingProjectsFilter,
  OnboardingProjectsResponse,
} from '../types/onboarding';

const ONBOARDING_PATH = `${API_V2_BASE_URL}/onboarding`;
const ONBOARDING_OVERVIEW_PATH = `${ONBOARDING_PATH}/overview`;
const ONBOARDING_PROJECTS_PATH = `${ONBOARDING_PATH}/projects`;

export interface OnboardingProjectsQuery {
  filter?: OnboardingProjectsFilter;
  /** Only sent by SQ-Cloud, where the feature is scoped to an organization. */
  organizationKey?: string;
  pageIndex?: number;
  pageSize?: number;
  q?: string;
}

/** Only sent by SQ-Cloud, where the feature is scoped to an organization. */
export interface OnboardingOverviewQuery {
  organizationKey?: string;
}

export function getOnboardingOverview(params: OnboardingOverviewQuery = {}) {
  return axiosClient.get<OnboardingOverview>(ONBOARDING_OVERVIEW_PATH, { params });
}

export function getOnboardingProjects(params: OnboardingProjectsQuery = {}) {
  return axiosClient.get<OnboardingProjectsResponse>(ONBOARDING_PROJECTS_PATH, { params });
}
