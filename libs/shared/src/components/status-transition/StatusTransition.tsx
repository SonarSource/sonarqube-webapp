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
  Tooltip,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { IssueTransitionCommentDialog } from './StatusTransitionCommentDialog';

interface StatusTransitionItem<T extends string> {
  className?: string;
  isDeprecated?: boolean;
  requiresComment?: boolean;
  value: T;
}

interface StatusTransitionProps<T extends string> {
  buttonTooltipContent?: ReactNode;
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
    isTransiting,
    dropdownHeader,
    showFeedbackCheckbox,
    status,
  } = props;

  const [selectedTransition, setSelectedTransition] = React.useState<T | null>(null);
  const [pendingComment, setPendingComment] = React.useState('');
  const [pendingIsFeedback, setPendingIsFeedback] = React.useState(false);

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
            {transitions.map((transition) => (
              <DropdownMenu.ItemButton
                className={classNames('it__issue-transition-option', transition.className)}
                helpText={
                  <FormattedMessage id={`status_transition.${transition.value}.description`} />
                }
                key={transition.value}
                onClick={() => {
                  handleTransitionChange(transition);
                }}
                suffix={
                  transition.isDeprecated ? (
                    <Badge variety={BadgeVariety.Warning}>
                      <FormattedMessage id="deprecated" />
                    </Badge>
                  ) : null
                }
              >
                {<FormattedMessage id={`status_transition.${transition.value}`} />}
              </DropdownMenu.ItemButton>
            ))}
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
          }}
          onCommentChange={setPendingComment}
          onConfirm={(comment, isFeedback) => {
            if (selectedTransition) {
              void onTransition(selectedTransition, comment, isFeedback);
              setSelectedTransition(null);
              setPendingComment('');
              setPendingIsFeedback(false);
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
