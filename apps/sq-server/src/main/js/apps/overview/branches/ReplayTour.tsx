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

import {
  LinkStandalone,
  Spotlight,
  SpotlightModalPlacement,
  SpotlightStep,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';

interface Props {
  closeTour: () => void;
  run: boolean;
  tourCompleted: boolean;
}

export default function ReplayTourGuide({ run, closeTour, tourCompleted }: Readonly<Props>) {
  const intl = useIntl();

  const onToggle = ({ action }: { action: string }) => {
    if (action === 'skip' || action === 'close') {
      closeTour();
    }
  };

  const docUrl = useDocUrl(DocLink.CaYC);

  const steps: SpotlightStep[] = [
    {
      bodyText: (
        <>
          <p className="sw-mt-2">
            <FormattedMessage id="guiding.replay_tour_button.1.content" />
          </p>

          {tourCompleted && (
            <div className="sw-mt-4">
              <LinkStandalone to={docUrl}>
                <FormattedMessage id="learn_more.clean_code" />
              </LinkStandalone>
            </div>
          )}
        </>
      ),
      headerText: (
        <FormattedMessage
          id={
            tourCompleted
              ? 'guiding.replay_tour_button.tour_completed.1.title'
              : 'guiding.replay_tour_button.1.title'
          }
        />
      ),
      placement: SpotlightModalPlacement.Left,
      target: '[data-spotlight-id="take-tour-1"]',
    },
  ];

  return (
    <div>
      <Spotlight
        callback={onToggle}
        closeLabel={intl.formatMessage({ id: 'got_it' })}
        isRunning={run}
        stepXofYLabel={() => ''}
        steps={steps}
      />
    </div>
  );
}
