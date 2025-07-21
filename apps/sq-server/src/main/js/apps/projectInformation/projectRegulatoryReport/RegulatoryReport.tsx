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
  Button,
  ButtonVariety,
  Divider,
  FormFieldWidth,
  Heading,
  Link,
  MessageCallout,
  MessageType,
  Select,
  toast,
} from '@sonarsource/echoes-react';
import { isEmpty, orderBy } from 'lodash';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isMainBranch } from '~shared/helpers/branch-like';
import { getBranches } from '~sq-server-commons/api/branches';
import { getRegulatoryReportUrl } from '~sq-server-commons/api/regulatory-report';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { getBranchLikeDisplayName, getBranchLikeKey } from '~sq-server-commons/helpers/branch-like';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { LabelValueSelectOption } from '~sq-server-commons/helpers/search';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  branchLike?: BranchLike;
  component: Pick<Component, 'key' | 'name'>;
}

export default function RegulatoryReport({ component, branchLike }: Readonly<Props>) {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branchOptions, setBranchOptions] = useState<LabelValueSelectOption[]>([]);

  const intl = useIntl();

  const regulatoryReportDocURL = useDocUrl(DocLink.ProjectRegulatoryReports);

  const regulatoryReportDownloadURL = getRegulatoryReportUrl(component.key, selectedBranch);

  useEffect(() => {
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

  const handleDownloadStarted = () => {
    toast.success({
      description: intl.formatMessage({ id: 'regulatory_page.download_start.sentence' }),
      duration: 'infinite',
    });
  };

  return (
    <>
      <Heading as="h2" hasMarginBottom>
        {intl.formatMessage({ id: 'regulatory_report.page' })}
      </Heading>

      <FormattedMessage
        id="regulatory_report.description1"
        values={{
          link: (text) => (
            <Link shouldOpenInNewTab to={regulatoryReportDocURL}>
              {text}
            </Link>
          ),
          br: <br />,
        }}
      />
      <div className="markdown">
        <ul>
          <li>{intl.formatMessage({ id: 'regulatory_report.bullet_point1' })}</li>
          <li>{intl.formatMessage({ id: 'regulatory_report.bullet_point2' })}</li>
          <li>{intl.formatMessage({ id: 'regulatory_report.bullet_point3' })}</li>
        </ul>
      </div>

      <p className="sw-mb-4">{intl.formatMessage({ id: 'regulatory_report.description2' })}</p>

      <Divider className="sw-mb-4" />

      {isEmpty(branchOptions) ? (
        <MessageCallout
          className="sw-mb-4"
          text={intl.formatMessage({ id: 'regulatory_page.no_available_branch' })}
          type={MessageType.Warning}
        />
      ) : (
        <>
          <div className="sw-grid sw-mb-4">
            <Select
              data={branchOptions}
              id="regulatory-report-branch-select"
              isNotClearable
              label={intl.formatMessage({ id: 'regulatory_page.select_branch' })}
              onChange={(value: string | null) => {
                if (value) {
                  setSelectedBranch(value);
                }
              }}
              value={selectedBranch || null}
              width={FormFieldWidth.Large}
            />
          </div>
          <MessageCallout
            className="sw-mb-4"
            text={
              <div>
                {intl.formatMessage({
                  id: 'regulatory_page.available_branches_info.only_keep_when_inactive',
                })}{' '}
                <FormattedMessage
                  id="regulatory_page.available_branches_info.more_info"
                  values={{
                    doc_link: (
                      <DocumentationLink to={DocLink.InactiveBranches}>
                        {intl.formatMessage({
                          id: 'regulatory_page.available_branches_info.more_info.doc_link',
                        })}
                      </DocumentationLink>
                    ),
                  }}
                />
              </div>
            }
            type={MessageType.Info}
          />
          <Button
            download={[component.name, selectedBranch, 'regulatory report.zip']
              .filter((s) => !!s)
              .join(' - ')}
            isDisabled={!selectedBranch}
            onClick={handleDownloadStarted}
            reloadDocument
            to={regulatoryReportDownloadURL}
            variety={ButtonVariety.Primary}
          >
            {intl.formatMessage({ id: 'regulatory_page.download_button' })}
          </Button>
        </>
      )}
    </>
  );
}
