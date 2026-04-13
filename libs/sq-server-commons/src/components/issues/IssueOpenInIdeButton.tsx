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

import { Button, DropdownMenu, toast } from '@sonarsource/echoes-react';
import { useCallback, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import IdeButtonSafariDisabled from '~shared/components/issues/IdeButtonSafariDisabled';
import { isSafari } from '~shared/helpers/browsers';
import { useAvailableIDEs } from '~shared/helpers/useAvailableIDEs';
import { DocLink } from '../../helpers/doc-links';
import {
  generateUserToken,
  openFixOrIssueInSonarLint,
  probeSonarLintServers,
} from '../../helpers/sonarlint';
import { BranchLike } from '../../types/branch-like';
import { Ide } from '../../types/sonarqube-ide';
import { NewUserToken } from '../../types/token';
import { UserBase } from '../../types/users';
import DocumentationLink from '../common/DocumentationLink';

export interface Props {
  branchLike?: BranchLike;
  issueKey: string;
  login: UserBase['login'];
  projectKey: string;
  pullRequestID?: string;
}

const showError = () =>
  toast.error({
    description: (
      <FormattedMessage
        id="issues.open_in_ide.failure"
        values={{
          link: (
            <DocumentationLink to={DocLink.SonarLintConnectedMode}>
              <FormattedMessage id="sonarlint-connected-mode-doc" />
            </DocumentationLink>
          ),
        }}
      />
    ),
  });

const showSuccess = () =>
  toast.success({ description: <FormattedMessage id="issues.open_in_ide.success" /> });

const DELAY_AFTER_TOKEN_CREATION = 3000;

export function IssueOpenInIdeButton({ branchLike, issueKey, login, projectKey }: Readonly<Props>) {
  const [isDisabled, setIsDisabled] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const { availableIDEs, closeDropdown, findAvailableIDEs, isLookingForIDEs } = useAvailableIDEs({
    onError: showError,
    onSingleIDEFound: openIssue,
    probe: probeSonarLintServers,
  });

  // to give focus back to the trigger button once it is re-rendered as a single button
  const focusTriggerButton = useCallback(() => {
    setTimeout(() => {
      ref.current?.focus();
    });
  }, []);

  const closeDropdownAndFocusTriggerButton = useCallback(() => {
    closeDropdown();
    focusTriggerButton();
  }, [closeDropdown, focusTriggerButton]);

  const onClick = availableIDEs.length === 0 ? findAvailableIDEs : undefined;
  const isLoading = isDisabled || isLookingForIDEs;

  const triggerButton = (
    <Button
      className="sw-whitespace-nowrap"
      isDisabled={isLoading}
      isLoading={isLoading}
      onClick={onClick}
      ref={ref}
    >
      <FormattedMessage id="open_in_ide" />
    </Button>
  );

  // Safari is not supported due to its limitations (no support for custom protocols)
  // Disable button entirely and show a popover explaining the situation
  if (isSafari()) {
    return <IdeButtonSafariDisabled buttonKey="open_in_ide" />;
  }

  return availableIDEs.length === 0 ? (
    triggerButton
  ) : (
    <DropdownMenu
      isOpenOnMount
      items={availableIDEs.map((ide) => {
        const { ideName, description } = ide;
        const label = ideName + (description ? ` - ${description}` : '');

        return (
          <DropdownMenu.ItemButton
            key={ide.port}
            onClick={() => {
              void openIssue(ide);
            }}
          >
            {label}
          </DropdownMenu.ItemButton>
        );
      })}
      onClose={closeDropdownAndFocusTriggerButton}
      onOpen={() => {
        void findAvailableIDEs();
      }}
    >
      {triggerButton}
    </DropdownMenu>
  );

  async function openIssue(ide: Ide) {
    closeDropdown();
    setIsDisabled(true);

    let token: NewUserToken | undefined = undefined;

    try {
      if (ide.needsToken) {
        token = await generateUserToken({
          productName: ide.ideName,
          login,
        });
      }

      await openFixOrIssueInSonarLint({
        branchLike,
        calledPort: ide.port,
        issueKey,
        projectKey,
        token,
      });

      showSuccess();
    } catch {
      showError();
    }

    setTimeout(
      () => {
        setIsDisabled(false);
        focusTriggerButton();
      },

      ide.needsToken ? DELAY_AFTER_TOKEN_CREATION : 0,
    );
  }
}
