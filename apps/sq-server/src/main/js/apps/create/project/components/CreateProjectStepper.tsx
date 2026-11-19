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

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { ProgressStepper } from '~shared/components/ui/ProgressStepper';
import { getSafeRelativeRedirect } from '~sq-server-commons/helpers/urls';

export enum CreateProjectStep {
  Configure = 'configure',
  Import = 'import',
}

const STEPS = [CreateProjectStep.Configure, CreateProjectStep.Import];

interface Props {
  step: CreateProjectStep;
}

export function CreateProjectStepper({ step }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const router = useRouter();

  const stepNames = useMemo(
    () => ({
      [CreateProjectStep.Configure]: formatMessage({
        id: 'onboarding.create_project.step.configure',
      }),
      [CreateProjectStep.Import]: formatMessage({ id: 'onboarding.create_project.step.import' }),
    }),
    [formatMessage],
  );

  const handleChange = useCallback(
    (nextStep: CreateProjectStep) => {
      // Only the "Configure" step can be reached from the "Import" step: the import step
      // can't be opened without having chosen a configuration first.
      if (nextStep === CreateProjectStep.Configure) {
        const redirect = getSafeRelativeRedirect(location.query?.redirect);
        router.push({
          pathname: location.pathname,
          query: redirect === undefined ? {} : { redirect },
        });
      }
    },
    [location.pathname, location.query?.redirect, router],
  );

  return (
    <ProgressStepper
      activeStep={step}
      onChange={handleChange}
      progress={step}
      stepNames={stepNames}
      steps={STEPS}
    />
  );
}
