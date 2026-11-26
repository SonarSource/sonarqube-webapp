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

import administrationMessages from './default/administration.json' with { type: 'json' };
import billingMessages from './default/billing.json' with { type: 'json' };
import dictionaryMessages from './default/dictionary.json' with { type: 'json' };
import measuresMessages from './default/measures.json' with { type: 'json' };
import onboardingMessages from './default/onboarding.json' with { type: 'json' };
import portfoliosMessages from './default/portfolios.json' with { type: 'json' };
import projectsMessages from './default/projects.json' with { type: 'json' };
import qualityMessages from './default/quality.json' with { type: 'json' };
import securityMessages from './default/security.json' with { type: 'json' };
import sharedMessages from './default/shared.json' with { type: 'json' };

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
