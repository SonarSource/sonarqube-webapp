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
  Button,
  ButtonGroup,
  ButtonVariety,
  Divider,
  IconCheckCircle,
  IconError,
  LinkStandalone,
  Spinner,
  ToggleTip,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FlagMessage } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { addons } from '~sq-server-addons/index';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import {
  IMPORT_COMPATIBLE_ALMS,
  REMEDIATION_AGENT_SUPPORTED_ALM_KEYS,
} from '~sq-server-commons/helpers/constants';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { getEdition, getEditionUrl } from '~sq-server-commons/helpers/editions';
import { useDopPermissionCheckForConfiguration } from '~sq-server-commons/queries/dop-translation';
import { usePurchasableFeatureQuery } from '~sq-server-commons/queries/entitlements';
import {
  AlmBindingDefinitionBase,
  AlmKeys,
  AlmSettingsBindingStatus,
  AlmSettingsBindingStatusType,
} from '~sq-server-commons/types/alm-settings';
import { PermissionCheckStatus } from '~sq-server-commons/types/dop-translation';
import { EditionKey } from '~sq-server-commons/types/editions';

export interface AlmBindingDefinitionBoxProps {
  alm: AlmKeys;
  branchesEnabled: boolean;
  definition: AlmBindingDefinitionBase;
  onCheck: (definitionKey: string) => void;
  onDelete: (definitionKey: string) => void;
  onEdit: (definitionKey: string) => void;
  status?: AlmSettingsBindingStatus;
}

const DEFAULT_STATUS: AlmSettingsBindingStatus = {
  alertSuccess: false,
  failureMessage: '',
  type: AlmSettingsBindingStatusType.Validating,
};

type FormatMessage = (descriptor: { id: string }) => string;

const STATUS_ICON = {
  [AlmSettingsBindingStatusType.Failure]: (
    <IconError className="sw-ml-1" color="echoes-color-icon-danger" />
  ),
  [AlmSettingsBindingStatusType.Success]: (
    <IconCheckCircle className="sw-ml-1" color="echoes-color-icon-success" />
  ),
  [AlmSettingsBindingStatusType.Validating]: <div className="sw-ml-1 sw-inline-block sw-w-200" />,
};

function getPRDecorationFeatureStatus(branchesEnabled: boolean, type: keyof typeof STATUS_ICON) {
  if (branchesEnabled) {
    return STATUS_ICON[type];
  }

  return (
    <div className="sw-inline-flex sw-items-center">
      <strong className="sw-ml-2">
        <FormattedMessage id="settings.almintegration.feature.pr_decoration.disabled" />
      </strong>

      <ToggleTip
        className="sw-ml-1"
        description={
          <FormattedMessage
            id="settings.almintegration.feature.pr_decoration.disabled.no_branches"
            values={{
              link: (
                <LinkStandalone
                  enableOpenInNewTab
                  to={getEditionUrl(getEdition(EditionKey.developer), {
                    sourceEdition: EditionKey.community,
                  })}
                >
                  <FormattedMessage id="settings.almintegration.feature.pr_decoration.disabled.no_branches.link" />
                </LinkStandalone>
              ),
            }}
          />
        }
      />
    </div>
  );
}

function getImportFeatureStatus(
  alm: AlmKeys,
  definition: AlmBindingDefinitionBase,
  type: keyof typeof STATUS_ICON,
) {
  if (isDefined(definition.url) || alm === AlmKeys.BitbucketCloud) {
    return STATUS_ICON[type];
  }

  return (
    <div className="sw-inline-flex sw-items-center">
      <strong className="sw-ml-2">
        <FormattedMessage id="settings.almintegration.feature.alm_repo_import.disabled" />
      </strong>

      <ToggleTip
        className="sw-ml-1"
        description={
          <FormattedMessage id="settings.almintegration.feature.alm_repo_import.disabled.no_url" />
        }
      />
    </div>
  );
}

function getPrDecoFeatureDescription(alm: AlmKeys, formatMessage: FormatMessage) {
  switch (alm) {
    case AlmKeys.GitLab:
      return formatMessage({
        id: 'settings.almintegration.feature.status_reporting.description_mr',
      });
    case AlmKeys.GitHub:
      return formatMessage({
        id: 'settings.almintegration.feature.status_reporting.description_pr_and_commits',
      });
    default:
      return formatMessage({
        id: 'settings.almintegration.feature.status_reporting.description_pr',
      });
  }
}

export default function AlmBindingDefinitionBox(props: Readonly<AlmBindingDefinitionBoxProps>) {
  const { alm, branchesEnabled, definition, status = DEFAULT_STATUS } = props;
  const { formatMessage } = useIntl();
  // Bumped on every "Check configuration" click so the Remediation Agent permission banner
  // (SONAR-32166) can (re)run its own check off the same action — there is no separate refresh
  // control. Passed to the banner rather than the capability status row above, since that row
  // unmounts whenever the general ALM check reports a Warning and would otherwise miss the
  // signal. A plain counter, not `status.type === Validating`, because that flag also flips
  // during the silent automatic validation on page load, which must not force a live re-check.
  const [checkRequestId, setCheckRequestId] = useState(0);

  // Whether the Remediation Agent permission check can run at all for this connection — mirrors
  // the same gate used inside RemediationAgentPermissionBanner/AlmBindingDefinitionForm
  // (SONAR-32166), so the generic success banner and the permission banner never disagree about
  // whether the feature applies here.
  const { data: purchasableFeature } = usePurchasableFeatureQuery(
    EntitlementCheckFeatureKey.RemediationAgent,
  );
  const canCheckRemediationAgentPermission =
    Boolean(addons.remediationAgent) &&
    REMEDIATION_AGENT_SUPPORTED_ALM_KEYS.includes(alm) &&
    purchasableFeature?.isAvailable === true;
  const {
    data: remediationAgentPermissionCheck,
    isLoading: isRemediationAgentPermissionCheckLoading,
  } = useDopPermissionCheckForConfiguration(definition.key, {
    enabled: canCheckRemediationAgentPermission,
  });
  // Suppresses the generic "Configuration valid" banner until the Remediation Agent permission
  // result is known to be SUFFICIENT — showing it any earlier (while the check is still loading)
  // or alongside an INSUFFICIENT/UNKNOWN/CHECK_FAILED/UNSUPPORTED_TOKEN_TYPE result would
  // contradict the permission banner rendered right below it (SONAR-32166 "Prevent conflicting
  // validation messages"). Stays `false` for Bitbucket or when the feature isn't purchasable, so
  // the existing behaviour there is unaffected.
  const remediationAgentBlocksSuccessBanner =
    canCheckRemediationAgentPermission &&
    (isRemediationAgentPermissionCheckLoading ||
      remediationAgentPermissionCheck?.status !== PermissionCheckStatus.Sufficient);

  return (
    <div className="it__alm-binding-definition sw-pb-10">
      <Divider className="sw-mb-6" />

      <ButtonGroup className="sw-float-right">
        <Button
          ariaLabel={formatMessage(
            { id: 'settings.almintegration.edit_configuration' },
            { 0: definition.key },
          )}
          onClick={() => {
            props.onEdit(definition.key);
          }}
        >
          <FormattedMessage id="edit" />
        </Button>
        <Button
          ariaLabel={formatMessage(
            { id: 'settings.almintegration.delete_configuration' },
            { 0: definition.key },
          )}
          onClick={() => {
            props.onDelete(definition.key);
          }}
          variety={ButtonVariety.DangerOutline}
        >
          <FormattedMessage id="delete" />
        </Button>
      </ButtonGroup>
      <div className="sw-mb-4">
        <h3>{definition.key}</h3>
        {definition.url && <span>{definition.url}</span>}
      </div>
      {status.type !== AlmSettingsBindingStatusType.Warning && (
        <div className="sw-flex sw-mb-3">
          <div className="sw-mr-10">
            <div className="sw-flex sw-items-center">
              <span>
                <FormattedMessage id="settings.almintegration.feature.status_reporting.title" />
              </span>

              <ToggleTip
                className="sw-ml-1"
                description={getPrDecoFeatureDescription(alm, formatMessage)}
              />
            </div>

            {getPRDecorationFeatureStatus(branchesEnabled, status.type)}
          </div>
          {IMPORT_COMPATIBLE_ALMS.includes(alm) && (
            <div className="sw-mr-10">
              <div className="sw-flex sw-items-center">
                <span>
                  <FormattedMessage id="settings.almintegration.feature.alm_repo_import.title" />
                </span>

                <ToggleTip
                  className="sw-ml-1"
                  description={
                    <FormattedMessage id="settings.almintegration.feature.alm_repo_import.description" />
                  }
                />
              </div>

              {getImportFeatureStatus(alm, definition, status.type)}
            </div>
          )}
          {addons.remediationAgent && (
            <addons.remediationAgent.RemediationAgentCapabilityStatus
              almKey={alm}
              connectionKey={definition.key}
            />
          )}
        </div>
      )}
      {status.type === AlmSettingsBindingStatusType.Warning && (
        <div className="sw-mb-3">
          <FlagMessage variant="warning">
            <FormattedMessage id="settings.almintegration.could_not_validate" />
          </FlagMessage>
        </div>
      )}
      {status.type === AlmSettingsBindingStatusType.Failure && (
        <div className="sw-mb-3">
          <FlagMessage variant="error">{status.failureMessage}</FlagMessage>
        </div>
      )}
      {status.type === AlmSettingsBindingStatusType.Success && status.alertSuccess && (
        <>
          {!remediationAgentBlocksSuccessBanner && (
            <div className="sw-mb-3">
              <FlagMessage variant="success">
                <FormattedMessage id="settings.almintegration.configuration_valid" />
              </FlagMessage>
            </div>
          )}
          {alm === AlmKeys.GitHub && (
            <div className="sw-mb-3">
              <FlagMessage variant="warning">
                <p>
                  <FormattedMessage
                    id="settings.almintegration.github.additional_permission"
                    values={{
                      link: (
                        <DocumentationLink enableOpenInNewTab to={DocLink.AlmGitHubIntegration}>
                          <FormattedMessage id="learn_more" />
                        </DocumentationLink>
                      ),
                    }}
                  />
                </p>
              </FlagMessage>
            </div>
          )}
        </>
      )}
      {addons.remediationAgent && (
        <addons.remediationAgent.RemediationAgentPermissionBanner
          almKey={alm}
          checkRequestId={checkRequestId}
          connectionKey={definition.key}
        />
      )}
      <div className="sw-flex sw-items-center">
        <Button
          ariaLabel={formatMessage(
            { id: 'settings.almintegration.check_configuration_x' },
            { 0: definition.key },
          )}
          onClick={() => {
            props.onCheck(definition.key);
            setCheckRequestId((current) => current + 1);
          }}
        >
          <FormattedMessage id="settings.almintegration.check_configuration" />
        </Button>
        <Spinner
          ariaLabel={formatMessage({ id: 'settings.almintegration.checking_configuration' })}
          className="sw-ml-3"
          isLoading={status.type === AlmSettingsBindingStatusType.Validating}
        />
        {status.type === AlmSettingsBindingStatusType.Validating && (
          <span className="sw-ml-2">
            <FormattedMessage id="settings.almintegration.checking_configuration" />
          </span>
        )}
      </div>
    </div>
  );
}
