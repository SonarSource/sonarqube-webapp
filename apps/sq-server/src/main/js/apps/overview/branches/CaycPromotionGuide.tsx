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

import { Spotlight, SpotlightModalPlacement, SpotlightStep } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
  closeTour: (action: string) => void;
  run: boolean;
}

function CaycPromotionGuide(props: Readonly<Props>) {
  const { run } = props;

  const intl = useIntl();

  const onToggle = ({ action, type }: { action: string; type: string }) => {
    if (type === 'tour:end' && (action === 'close' || action === 'skip')) {
      props.closeTour(action);
    }
  };

  const constructContent = (messageId: string) => (
    <p className="sw-mt-2">
      <FormattedMessage id={messageId} />
    </p>
  );

  const constructContentLastStep = (first: string, second: string, third: string) => (
    <>
      <p className="sw-mt-2">
        <FormattedMessage
          id={first}
          values={{
            value: <strong>{intl.formatMessage({ id: 'ide' })}</strong>,
          }}
        />
      </p>

      <p className="sw-mt-2">
        <FormattedMessage
          id={second}
          values={{
            value: <strong>{intl.formatMessage({ id: 'pull_request.small' })}</strong>,
          }}
        />
      </p>

      <p className="sw-mt-2">
        <FormattedMessage
          id={third}
          values={{
            value: <strong>{intl.formatMessage({ id: 'branch.small' })}</strong>,
          }}
        />
      </p>
    </>
  );

  const steps: SpotlightStep[] = [
    {
      bodyText: constructContent('guiding.cayc_promotion.1.content.1'),
      headerText: <FormattedMessage id="guiding.cayc_promotion.1.title" />,
      placement: SpotlightModalPlacement.Left,
      target: '[data-spotlight-id="cayc-promotion-1"]',
    },
    {
      bodyText: constructContent('guiding.cayc_promotion.2.content.1'),
      headerText: <FormattedMessage id="guiding.cayc_promotion.2.title" />,
      placement: SpotlightModalPlacement.Left,
      target: '[data-spotlight-id="cayc-promotion-2"]',
    },
    {
      bodyText: constructContent('guiding.cayc_promotion.3.content.1'),
      headerText: <FormattedMessage id="guiding.cayc_promotion.3.title" />,
      placement: SpotlightModalPlacement.Right,
      target: '[data-spotlight-id="cayc-promotion-3"]',
    },
    {
      bodyText: constructContentLastStep(
        'guiding.cayc_promotion.4.content.1',
        'guiding.cayc_promotion.4.content.2',
        'guiding.cayc_promotion.4.content.3',
      ),
      headerText: <FormattedMessage id="guiding.cayc_promotion.4.title" />,
      placement: SpotlightModalPlacement.Right,
      target: '[data-spotlight-id="cayc-promotion-4"]',
    },
  ];

  return (
    <Spotlight
      backLabel={intl.formatMessage({ id: 'previous' })}
      callback={onToggle}
      closeLabel={intl.formatMessage({ id: 'complete' })}
      isRunning={run}
      steps={steps}
    />
  );
}

export default CaycPromotionGuide;
