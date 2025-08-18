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

import { IconArrowRight, IconQuestionMark, Text } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { ItemButton } from '../../../design-system';
import { translate } from '../../../helpers/l10n';
import HelpTooltip from '../../../sonar-aligned/components/controls/HelpTooltip';
import { IssueTransition } from '../../../types/issues';

type Props = {
  hasCommentAction?: boolean;
  isFirst: boolean;
  onSelectTransition: (transition: IssueTransition) => void;
  selected: boolean;
  transition: IssueTransition;
};

export function IssueTransitionItem({
  transition,
  selected,
  isFirst,
  onSelectTransition,
  hasCommentAction = false,
}: Readonly<Props>) {
  const intl = useIntl();
  const liRef = React.useRef<HTMLLIElement>(null);

  // Focus the first transition item when the dropdown opens
  React.useEffect(() => {
    if (isFirst && liRef.current) {
      liRef.current.querySelector('button')?.focus({ preventScroll: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tooltips: Record<string, React.JSX.Element> = {
    [IssueTransition.Confirm]: (
      <div className="sw-flex sw-flex-col sw-gap-2">
        <span>{translate('issue.transition.confirm.deprecated_tooltip.1')}</span>
        <span>{translate('issue.transition.confirm.deprecated_tooltip.2')}</span>
        <span>{translate('issue.transition.confirm.deprecated_tooltip.3')}</span>
      </div>
    ),
    [IssueTransition.Resolve]: (
      <div className="sw-flex sw-flex-col sw-gap-2">
        <span>{translate('issue.transition.resolve.deprecated_tooltip.1')}</span>
        <span>{translate('issue.transition.resolve.deprecated_tooltip.2')}</span>
        <span>{translate('issue.transition.resolve.deprecated_tooltip.3')}</span>
      </div>
    ),
  };

  return (
    <ItemButton
      className="sw-flex sw-items-center sw-justify-between sw-px-4"
      innerRef={liRef}
      key={transition}
      onClick={() => {
        onSelectTransition(transition);
      }}
      selected={selected}
    >
      <div className="it__issue-transition-option sw-flex sw-flex-col">
        <div className="sw-flex sw-gap-1 sw-items-center">
          <Text className="sw-truncate" isHighlighted>
            {intl.formatMessage({ id: `issue.transition.${transition}` })}
          </Text>
          {tooltips[transition] && (
            <HelpTooltip overlay={tooltips[transition]} placement="right">
              <IconQuestionMark />
            </HelpTooltip>
          )}
        </div>
        <Text isSubtle>{translate('issue.transition', transition, 'description')}</Text>
      </div>
      {hasCommentAction && <IconArrowRight />}
    </ItemButton>
  );
}
