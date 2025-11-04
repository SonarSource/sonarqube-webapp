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

import { useIntl } from 'react-intl';
import { durationFormatter } from '../../helpers/measures';
import type { IssueChangelogDiff as TypeIssueChangelogDiff } from '../../types/issue';

interface Props {
  diff: TypeIssueChangelogDiff;
}

export default function IssueChangelogDiff({ diff }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const diffComputedValues = {
    newValue: diff.newValue ?? '',
    oldValue: diff.oldValue ?? '',
  };

  if (diff.key === 'file') {
    return (
      <p>
        {formatMessage(
          { id: 'issue.change.file_move' },
          {
            '0': diffComputedValues.oldValue,
            '1': diffComputedValues.newValue,
          },
        )}
      </p>
    );
  }

  if (['from_long_branch', 'from_branch'].includes(diff.key)) {
    return (
      <p>
        {formatMessage(
          { id: 'issue.change.from_branch' },
          {
            branchA: diffComputedValues.oldValue,
            branchB: diffComputedValues.newValue,
          },
        )}
      </p>
    );
  }

  if (diff.key === 'from_short_branch') {
    // Applies to both legacy short lived branch and pull request
    return (
      <p>
        {formatMessage(
          { id: 'issue.change.from_non_branch' },
          {
            branchA: diffComputedValues.oldValue,
            branchB: diffComputedValues.newValue,
          },
        )}
      </p>
    );
  }

  if (diff.key === 'line') {
    return (
      <p>
        {formatMessage(
          { id: 'issue.changelog.line_removed_X' },
          {
            '0': diffComputedValues.oldValue,
          },
        )}
      </p>
    );
  }

  if (diff.key === 'impactSeverity') {
    const [softwareQuality, newSeverity] = diffComputedValues.newValue.split(':');
    const [_, oldSeverity] = diffComputedValues.oldValue.split(':');
    return (
      <p>
        {formatMessage(
          { id: 'issue.changelog.impactSeverity' },
          {
            '0': softwareQuality,
            '1': newSeverity,
            '2': oldSeverity,
          },
        )}
      </p>
    );
  }

  if (diff.key === 'effort') {
    diffComputedValues.newValue = durationFormatter(formatMessage, diff.newValue ?? 0);
    diffComputedValues.oldValue = durationFormatter(formatMessage, diff.oldValue ?? 0);
  }

  let message =
    diff.newValue !== undefined
      ? formatMessage(
          { id: 'issue.changelog.changed_to' },
          {
            '0': formatMessage({ id: `issue.changelog.field.${diff.key}` }),
            '1': diffComputedValues.newValue,
          },
        )
      : formatMessage(
          { id: 'issue.changelog.removed' },
          {
            '0': formatMessage({ id: `issue.changelog.field.${diff.key}` }),
          },
        );

  if (diff.oldValue !== undefined) {
    message += ` (${formatMessage(
      { id: 'issue.changelog.was' },
      {
        '0': diffComputedValues.oldValue,
      },
    )})`;
  }

  return <p>{message}</p>;
}
