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

import { Button, ButtonVariety, DropdownMenu, toast } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import IdeButtonSafariDisabled from '~shared/components/issues/IdeButtonSafariDisabled';
import { isSafari } from '~shared/helpers/browsers';
import { useAvailableIDEs } from '~shared/helpers/useAvailableIDEs';
import { useComponent } from '../../context/componentContext/withComponentContext';
import { useCurrentUser } from '../../context/current-user/CurrentUserContext';
import { probeSonarLintServers } from '../../helpers/sonarlint';
import { useComponentForSourceViewer } from '../../queries/component';
import { CodeSuggestion } from '../../queries/fix-suggestions';
import { useOpenFixOrIssueInIdeMutation } from '../../queries/sonarlint';
import { Fix, Ide } from '../../types/sonarqube-ide';
import { Issue } from '../../types/types';

export interface Props {
  aiSuggestion: CodeSuggestion;
  issue: Issue;
}

const DELAY_AFTER_TOKEN_CREATION = 3000;

export function OpenFixInIde({ aiSuggestion, issue }: Readonly<Props>) {
  const { component } = useComponent();
  const { data: branchLike, isLoading: isBranchLoading } = useCurrentBranchQuery(component);

  const {
    currentUser: { isLoggedIn },
  } = useCurrentUser();

  const { data: sourceViewerFile } = useComponentForSourceViewer(
    issue.component,
    branchLike,
    !isBranchLoading,
  );

  const { mutateAsync: openFixInIde, isPending } = useOpenFixOrIssueInIdeMutation();

  const { availableIDEs, closeDropdown, findAvailableIDEs, isLookingForIDEs } = useAvailableIDEs({
    filter: (ide) => ide.capabilities?.canOpenFixSuggestion === true,
    onError: showError,
    onSingleIDEFound: openFix,
    probe: probeSonarLintServers,
  });

  if (!isLoggedIn || branchLike === undefined || sourceViewerFile === undefined) {
    return null;
  }

  const isLoading = isLookingForIDEs || isPending;

  const triggerButton = (
    <Button
      className="sw-whitespace-nowrap"
      isDisabled={isLoading}
      isLoading={isLoading}
      onClick={findAvailableIDEs}
      variety={ButtonVariety.Default}
    >
      <FormattedMessage id="view_fix_in_ide" />
    </Button>
  );

  // Safari is not supported due to its limitations (no support for custom protocols)
  // Disable button entirely and show a popover explaining the situation
  if (isSafari()) {
    return <IdeButtonSafariDisabled buttonKey="view_fix_in_ide" />;
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
              void openFix(ide);
            }}
          >
            {label}
          </DropdownMenu.ItemButton>
        );
      })}
      onClose={closeDropdown}
      onOpen={() => {
        void findAvailableIDEs();
      }}
    >
      {triggerButton}
    </DropdownMenu>
  );

  function showError() {
    toast.error({ description: <FormattedMessage id="unable_to_find_ide_with_fix.error" /> });
  }

  async function openFix(ide: Ide) {
    closeDropdown();

    const fix: Fix = {
      explanation: aiSuggestion.explanation,
      fileEdit: {
        changes: aiSuggestion.changes.map((change) => ({
          after: change.newCode,
          before: aiSuggestion.unifiedLines
            .filter(
              (line) => line.lineBefore >= change.startLine && line.lineBefore <= change.endLine,
            )
            .map((line) => line.code)
            .join('\n'),
          beforeLineRange: {
            startLine: change.startLine,
            endLine: change.endLine,
          },
        })),
        path: sourceViewerFile?.path ?? '',
      },
      suggestionId: aiSuggestion.suggestionId,
    };

    await openFixInIde({
      branchLike,
      ide,
      fix,
      issue,
    });

    setTimeout(
      () => {
        closeDropdown();
      },
      ide.needsToken ? DELAY_AFTER_TOKEN_CREATION : 0,
    );
  }
}
