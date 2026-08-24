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

import {
  Badge,
  BadgeVariety,
  Button,
  ButtonVariety,
  DropdownMenu,
  IconChevronDown,
  Text,
  Tooltip,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { BetaBadge } from '../badges/BetaBadge';
import { IssueTransitionCommentDialog } from './StatusTransitionCommentDialog';

interface StatusTransitionItem<T extends string> {
  className?: string;
  isBeta?: boolean;
  isDeprecated?: boolean;
  /**
   * Renders this transition as a hover-triggered submenu (DropdownMenu.SubMenu) instead of a
   * plain clickable item — the caller owns everything inside it (quick options, a "custom"
   * escape hatch, etc.) and is responsible for transitioning and closing the dropdown itself.
   * Takes precedence over requiresComment, which doesn't apply once set.
   */
  quickActions?: ReactNode;
  requiresComment?: boolean;
  value: T;
}

interface StatusTransitionProps<T extends string> {
  buttonTooltipContent?: ReactNode;
  defaultIsFeedback?: boolean;
  dropdownHeader?: NonNullable<React.ComponentProps<typeof DropdownMenu>['header']>;
  isOpen: boolean;
  isTransiting?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onTransition: (transition: T, comment?: string, isFeedback?: boolean) => Promise<void>;
  showFeedbackCheckbox?: boolean;
  status: string;
  transitions: StatusTransitionItem<T>[];
}

export function StatusTransition<T extends string>(props: Readonly<StatusTransitionProps<T>>) {
  const intl = useIntl();
  const {
    isOpen,
    onTransition,
    onOpenChange,
    transitions,
    buttonTooltipContent,
    defaultIsFeedback: configuredDefaultIsFeedback = false,
    isTransiting,
    dropdownHeader,
    showFeedbackCheckbox,
    status,
  } = props;

  const defaultIsFeedback = Boolean(showFeedbackCheckbox && configuredDefaultIsFeedback);

  const [selectedTransition, setSelectedTransition] = React.useState<T | null>(null);
  const [pendingComment, setPendingComment] = React.useState('');
  const [pendingIsFeedback, setPendingIsFeedback] = React.useState(defaultIsFeedback);

  React.useEffect(() => {
    setPendingIsFeedback(defaultIsFeedback);
  }, [defaultIsFeedback]);

  const handleTransitionChange = (transition: StatusTransitionItem<T>) => {
    if (transition.requiresComment) {
      setSelectedTransition(transition.value);
    } else {
      void onTransition(transition.value);
    }
    onOpenChange?.(false);
  };

  return (
    <>
      <DropdownMenu
        className="sw-z-dropdown-menu"
        header={dropdownHeader}
        isOpen={isOpen}
        items={
          <>
            {transitions.map((transition) =>
              transition.quickActions ? (
                <DropdownMenu.SubMenu
                  className={classNames('it__issue-transition-option', transition.className)}
                  items={transition.quickActions}
                  key={transition.value}
                >
                  <div className="sw-flex sw-flex-col sw-gap-1">
                    <div className="sw-flex sw-items-center sw-justify-between sw-gap-2">
                      <FormattedMessage id={`status_transition.${transition.value}`} />
                      {renderTransitionBadge(transition)}
                    </div>
                    <Text isSubtle size="small">
                      <FormattedMessage id={`status_transition.${transition.value}.description`} />
                    </Text>
                  </div>
                </DropdownMenu.SubMenu>
              ) : (
                <DropdownMenu.ItemButton
                  className={classNames('it__issue-transition-option', transition.className)}
                  helpText={
                    <FormattedMessage id={`status_transition.${transition.value}.description`} />
                  }
                  key={transition.value}
                  onClick={() => {
                    handleTransitionChange(transition);
                  }}
                  suffix={renderTransitionBadge(transition)}
                >
                  {<FormattedMessage id={`status_transition.${transition.value}`} />}
                </DropdownMenu.ItemButton>
              ),
            )}
          </>
        }
        onClose={() => {
          onOpenChange?.(false);
        }}
        onOpen={() => {
          onOpenChange?.(true);
        }}
      >
        <Tooltip content={buttonTooltipContent}>
          <Button
            ariaLabel={intl.formatMessage(
              { id: 'status_transition.status_x_click_to_change' },
              { '0': status },
            )}
            className="it__issue-transition"
            isDisabled={transitions.length === 0}
            isLoading={isTransiting}
            suffix={transitions.length > 0 ? <IconChevronDown /> : null}
            variety={ButtonVariety.DefaultGhost}
          >
            {status}
          </Button>
        </Tooltip>
      </DropdownMenu>
      {selectedTransition && (
        <IssueTransitionCommentDialog
          comment={pendingComment}
          isFeedback={pendingIsFeedback}
          isOpen
          onClose={() => {
            setSelectedTransition(null);
            setPendingComment('');
            setPendingIsFeedback(defaultIsFeedback);
          }}
          onCommentChange={setPendingComment}
          onConfirm={(comment, isFeedback) => {
            if (selectedTransition) {
              void onTransition(selectedTransition, comment, isFeedback);
              setSelectedTransition(null);
              setPendingComment('');
              setPendingIsFeedback(defaultIsFeedback);
            }
          }}
          onIsFeedbackChange={setPendingIsFeedback}
          showFeedbackCheckbox={showFeedbackCheckbox}
          transition={selectedTransition}
        />
      )}
    </>
  );
}

function renderTransitionBadge<T extends string>(transition: StatusTransitionItem<T>) {
  if (transition.isDeprecated) {
    return (
      <Badge variety={BadgeVariety.Warning}>
        <FormattedMessage id="deprecated" />
      </Badge>
    );
  }
  if (transition.isBeta) {
    return <BetaBadge />;
  }
  return null;
}
