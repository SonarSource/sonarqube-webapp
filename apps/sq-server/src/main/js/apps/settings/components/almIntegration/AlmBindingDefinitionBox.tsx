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
import { FormattedMessage, useIntl } from 'react-intl';
import { FlagMessage } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { IMPORT_COMPATIBLE_ALMS } from '~sq-server-commons/helpers/constants';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { getEdition, getEditionUrl } from '~sq-server-commons/helpers/editions';
import {
  AlmBindingDefinitionBase,
  AlmKeys,
  AlmSettingsBindingStatus,
  AlmSettingsBindingStatusType,
} from '~sq-server-commons/types/alm-settings';
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
            <div>
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
          <div className="sw-mb-3">
            <FlagMessage variant="success">
              <FormattedMessage id="settings.almintegration.configuration_valid" />
            </FlagMessage>
          </div>
          {alm === AlmKeys.GitHub && (
            <div className="sw-mb-3">
              <FlagMessage variant="warning">
                <p>
                  <FormattedMessage
                    id="settings.almintegration.github.additional_permission"
                    values={{
                      link: (
                        <DocumentationLink to={DocLink.AlmGitHubIntegration}>
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
      <div className="sw-flex sw-items-center">
        <Button
          ariaLabel={formatMessage(
            { id: 'settings.almintegration.check_configuration_x' },
            { 0: definition.key },
          )}
          onClick={() => {
            props.onCheck(definition.key);
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
