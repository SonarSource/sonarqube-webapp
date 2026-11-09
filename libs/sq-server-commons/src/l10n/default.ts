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

import { administrationMessages } from './default/administration.ts';
import { billingMessages } from './default/billing.ts';
import { dictionaryMessages } from './default/dictionary.ts';
import { measuresMessages } from './default/measures.ts';
import { onboardingMessages } from './default/onboarding.ts';
import { portfoliosMessages } from './default/portfolios.ts';
import { projectsMessages } from './default/projects.ts';
import { qualityMessages } from './default/quality.ts';
import { securityMessages } from './default/security.ts';
import { sharedMessages } from './default/shared.ts';

export const defaultMessages = {
  ...sharedMessages,
  ...dictionaryMessages,
  ...billingMessages,
  ...onboardingMessages,
  ...administrationMessages,
  ...projectsMessages,
  ...qualityMessages,
  ...securityMessages,
  ...measuresMessages,
  ...portfoliosMessages,
};
