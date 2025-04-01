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

import { isEmpty, orderBy } from 'lodash';
import * as React from 'react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  BasicSeparator,
  DownloadButton,
  FlagMessage,
  FormField,
  InputSelect,
  SubTitle,
} from '~design-system';
import { getBranches } from '~sq-server-shared/api/branches';
import { getRegulatoryReportUrl } from '~sq-server-shared/api/regulatory-report';
import DocumentationLink from '~sq-server-shared/components/common/DocumentationLink';
import { getBranchLikeDisplayName, getBranchLikeKey } from '~sq-server-shared/helpers/branch-like';
import { DocLink } from '~sq-server-shared/helpers/doc-links';
import { translate } from '~sq-server-shared/helpers/l10n';
import { LabelValueSelectOption } from '~sq-server-shared/helpers/search';
import { isMainBranch } from '~sq-server-shared/sonar-aligned/helpers/branch-like';
import { BranchLike } from '~sq-server-shared/types/branch-like';
import { Component } from '~sq-server-shared/types/types';

interface Props {
  branchLike?: BranchLike;
  component: Pick<Component, 'key' | 'name'>;
}

export default function RegulatoryReport({ component, branchLike }: Props) {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branchOptions, setBranchOptions] = useState<LabelValueSelectOption[]>([]);

  React.useEffect(() => {
    async function fetchBranches() {
      try {
        const branches = await getBranches(component.key);

        const availableBranches = branches.filter(
          (br) => br.analysisDate && (isMainBranch(br) || br.excludedFromPurge),
        );
        const mainBranch = availableBranches.find(isMainBranch);
        const otherBranchSorted = orderBy(
          availableBranches.filter((b) => !isMainBranch(b)),
          (b) => b.name,
        );
        const sortedBranch = mainBranch ? [mainBranch, ...otherBranchSorted] : otherBranchSorted;
        const options = sortedBranch.map((br) => {
          return {
            value: getBranchLikeDisplayName(br),
            label: getBranchLikeDisplayName(br),
          };
        });

        let selectedBranch = '';
        if (
          branchLike &&
          availableBranches.find((br) => getBranchLikeKey(br) === getBranchLikeKey(branchLike))
        ) {
          selectedBranch = getBranchLikeDisplayName(branchLike);
        } else if (mainBranch) {
          selectedBranch = getBranchLikeDisplayName(mainBranch);
        }
        setSelectedBranch(selectedBranch);
        setBranchOptions(options);
      } catch (error) {
        setBranchOptions([]);
      }
    }

    fetchBranches();
  }, [component, branchLike]);

  const isDownloadButtonDisabled = downloadStarted || !selectedBranch;

  return (
    <>
      <SubTitle>{translate('regulatory_report.page')}</SubTitle>

      <p>{translate('regulatory_report.description1')}</p>
      <div className="markdown">
        <ul>
          <li>{translate('regulatory_report.bullet_point1')}</li>
          <li>{translate('regulatory_report.bullet_point2')}</li>
          <li>{translate('regulatory_report.bullet_point3')}</li>
        </ul>
      </div>

      <p className="sw-mb-4">{translate('regulatory_report.description2')}</p>

      <BasicSeparator className="sw-mb-4" />

      {isEmpty(branchOptions) ? (
        <FlagMessage className="sw-mb-4" variant="warning">
          {translate('regulatory_page.no_available_branch')}
        </FlagMessage>
      ) : (
        <>
          <div className="sw-grid sw-mb-4">
            <FormField
              htmlFor="regulatory-report-branch-select"
              label={translate('regulatory_page.select_branch')}
            >
              <InputSelect
                className="sw-w-abs-300"
                inputId="regulatory-report-branch-select"
                onChange={({ value }: LabelValueSelectOption) => {
                  setSelectedBranch(value);
                  setDownloadStarted(false);
                }}
                options={branchOptions}
                size="full"
                value={branchOptions.find((o) => o.value === selectedBranch)}
              />
            </FormField>
          </div>
          <FlagMessage className="sw-mb-4 sw-w-full" variant="info">
            <div>
              {translate('regulatory_page.available_branches_info.only_keep_when_inactive')}
              <FormattedMessage
                id="regulatory_page.available_branches_info.more_info"
                values={{
                  doc_link: (
                    <DocumentationLink to={DocLink.InactiveBranches}>
                      {translate('regulatory_page.available_branches_info.more_info.doc_link')}
                    </DocumentationLink>
                  ),
                }}
              />
            </div>
          </FlagMessage>
        </>
      )}

      {downloadStarted && (
        <p className="sw-mb-4">{translate('regulatory_page.download_start.sentence')}</p>
      )}

      {!isDownloadButtonDisabled && (
        <DownloadButton
          aria-disabled={isDownloadButtonDisabled}
          download={[component.name, selectedBranch, 'regulatory report.zip']
            .filter((s) => !!s)
            .join(' - ')}
          href={getRegulatoryReportUrl(component.key, selectedBranch)}
          onClick={() => {
            setDownloadStarted(true);
          }}
          rel="noopener noreferrer"
          target="_blank"
        >
          {translate('download_verb')}
        </DownloadButton>
      )}
    </>
  );
}
