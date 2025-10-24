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
  DropdownMenu,
  DropdownMenuAlign,
  IconChevronDown,
  IconClock,
  Text,
  toast,
  ToggleTip,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { isApplication } from '~shared/helpers/component';
import { getReportUrl } from '../../api/component-report';
import { getRegulatoryReportUrl } from '../../api/regulatory-report';
import { DocLink } from '../../helpers/doc-links';
import { translate, translateWithParameters } from '../../helpers/l10n';
import { Branch } from '../../types/branch-like';
import { Component } from '../../types/types';
import DocumentationLink from '../common/DocumentationLink';

export interface ComponentReportActionsRendererProps {
  branch?: Branch;
  canSubscribe: boolean;
  component: Component;
  currentUserHasEmail: boolean;
  frequency: string;
  handleSubscription: () => void;
  handleUnsubscription: () => void;
  subscribed: boolean;
}

const getSubscriptionText = ({
  frequency,
  subscribed,
}: Pick<ComponentReportActionsRendererProps, 'frequency' | 'subscribed'>) => {
  const translationKey = subscribed
    ? 'component_report.unsubscribe_x'
    : 'component_report.subscribe_x';
  const frequencyTranslation = translate('report.frequency', frequency).toLowerCase();

  return translateWithParameters(translationKey, frequencyTranslation);
};

export default function ComponentReportActionsRenderer(
  props: Readonly<ComponentReportActionsRendererProps>,
) {
  const {
    branch,
    component,
    frequency,
    subscribed,
    canSubscribe,
    currentUserHasEmail,
    handleSubscription,
    handleUnsubscription,
  } = props;

  const downloadName = [component.name, branch?.name, 'PDF Report.pdf']
    .filter((s) => !!s)
    .join(' - ');
  const reportUrl = getReportUrl(component.key, branch?.name);

  const regulatoryReportDownloadURL = getRegulatoryReportUrl(component.key, branch?.name);

  const intl = useIntl();

  const handleDownloadStarted = () => {
    toast.success({
      description: intl.formatMessage({
        id: 'regulatory_page.download_start.sentence',
      }),
      duration: 'infinite',
    });
  };

  return (
    <>
      <DropdownMenu
        align={DropdownMenuAlign.End}
        id="component-report"
        items={
          <>
            <DropdownMenu.GroupLabel>
              {intl.formatMessage(
                { id: 'component_report.report' },
                { 0: intl.formatMessage({ id: `qualifier.${component.qualifier}` }) },
              )}
            </DropdownMenu.GroupLabel>

            <DropdownMenu.ItemLinkDownload
              download={downloadName}
              helpText={intl.formatMessage({ id: 'component_report.download.help_text' })}
              isDisabled={!branch?.excludedFromPurge}
              onClick={handleDownloadStarted}
              to={reportUrl}
            >
              {intl.formatMessage(
                { id: 'component_report.download' },
                { 0: intl.formatMessage({ id: `qualifier.${component.qualifier}` }) },
              )}
            </DropdownMenu.ItemLinkDownload>

            <DropdownMenu.ItemButton
              data-test="overview__subscribe-to-report-button"
              isDisabled={!currentUserHasEmail || !branch?.excludedFromPurge || !canSubscribe}
              onClick={subscribed ? handleUnsubscription : handleSubscription}
              prefix={<IconClock />}
            >
              {getSubscriptionText({
                frequency,
                subscribed,
              })}
            </DropdownMenu.ItemButton>

            {!isApplication(component.qualifier) && (
              <>
                <DropdownMenu.Separator />
                <DropdownMenu.GroupLabel>
                  {intl.formatMessage({ id: 'component_regulatory_report.report' })}
                </DropdownMenu.GroupLabel>
                <DropdownMenu.ItemLinkDownload
                  download={[component.name, branch?.name, 'regulatory report.zip']
                    .filter((s) => !!s)
                    .join(' - ')}
                  helpText={intl.formatMessage({
                    id: 'component_regulatory_report.download.help_text',
                  })}
                  isDisabled={!branch?.excludedFromPurge}
                  onClick={handleDownloadStarted}
                  to={regulatoryReportDownloadURL}
                >
                  {intl.formatMessage({ id: 'component_regulatory_report.download' })}
                </DropdownMenu.ItemLinkDownload>
              </>
            )}
          </>
        }
      >
        <Button>
          {intl.formatMessage({ id: 'component_regulatory_report.dropdown' })}{' '}
          <IconChevronDown className="sw-ml-1" />
        </Button>
      </DropdownMenu>

      {!branch?.excludedFromPurge && (
        <ToggleTip
          ariaLabel={intl.formatMessage({ id: 'toggle_tip.aria_label.reports' })}
          description={
            <Text>
              {intl.formatMessage({
                id: 'component_report.toggletip.permanent_branches.description',
              })}
            </Text>
          }
          footer={
            <DocumentationLink enableOpenInNewTab to={DocLink.MaintainBranches}>
              {intl.formatMessage({
                id: 'component_report.toggletip.permanent_branches.documentation_link',
              })}
            </DocumentationLink>
          }
        />
      )}

      {!currentUserHasEmail && branch?.excludedFromPurge && (
        <ToggleTip
          ariaLabel={intl.formatMessage({ id: 'toggle_tip.aria_label.reports' })}
          description={intl.formatMessage({ id: 'component_report.no_email_to_subscribe' })}
        />
      )}
    </>
  );
}
