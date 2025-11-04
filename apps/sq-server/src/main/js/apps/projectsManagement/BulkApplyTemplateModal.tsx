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

import { Button, ButtonVariety, Spinner } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FlagMessage, FormField, InputSelect, LabelValueSelectOption, Modal } from '~design-system';
import { bulkApplyTemplate, getPermissionTemplates } from '~sq-server-commons/api/permissions';
import { Project } from '~sq-server-commons/api/project-management';
import MandatoryFieldsExplanation from '~sq-server-commons/components/ui/MandatoryFieldsExplanation';
import UseQuery from '~sq-server-commons/helpers/UseQuery';
import { toISO8601WithOffsetString } from '~sq-server-commons/helpers/dates';
import { addGlobalErrorMessageFromAPI } from '~sq-server-commons/helpers/globalMessages';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { useGithubProvisioningEnabledQuery } from '~sq-server-commons/queries/identity-provider/github';
import { PermissionTemplate } from '~sq-server-commons/types/types';

export interface Props {
  analyzedBefore: Date | undefined;
  onClose: () => void;
  provisioned: boolean;
  qualifier: string;
  query: string;
  selection: Project[];
  total: number;
}

interface State {
  done: boolean;
  loading: boolean;
  permissionTemplate?: string;
  permissionTemplates?: PermissionTemplate[];
  submitting: boolean;
}

const FORM_ID = 'bulk-apply-template-form';

export default class BulkApplyTemplateModal extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { done: false, loading: true, submitting: false };

  componentDidMount() {
    this.mounted = true;
    this.loadPermissionTemplates();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  loadPermissionTemplates() {
    this.setState({ loading: true });

    getPermissionTemplates().then(
      ({ permissionTemplates }) => {
        if (this.mounted) {
          this.setState({
            loading: false,
            permissionTemplate:
              permissionTemplates.length > 0 ? permissionTemplates[0].id : undefined,
            permissionTemplates,
          });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      },
    );
  }

  handleConfirmClick = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { analyzedBefore } = this.props;
    const { permissionTemplate } = this.state;

    if (permissionTemplate) {
      this.setState({ submitting: true });
      const selection = this.props.selection.filter((s) => !s.managed);

      const parameters = selection.length
        ? {
            projects: selection.map((s) => s.key).join(),
            qualifiers: this.props.qualifier,
            templateId: permissionTemplate,
          }
        : {
            analyzedBefore: analyzedBefore && toISO8601WithOffsetString(analyzedBefore),
            onProvisionedOnly: this.props.provisioned || undefined,
            qualifiers: this.props.qualifier,
            q: this.props.query || undefined,
            templateId: permissionTemplate,
          };

      bulkApplyTemplate(parameters).then(
        () => {
          if (this.mounted) {
            this.setState({ done: true, submitting: false });
          }
        },
        (error) => {
          addGlobalErrorMessageFromAPI(error);
          if (this.mounted) {
            this.setState({ submitting: false });
          }
        },
      );
    }
  };

  handlePermissionTemplateChange = ({ value }: LabelValueSelectOption) => {
    this.setState({ permissionTemplate: value });
  };

  renderWarning = () => {
    const { selection } = this.props;

    const managedProjects = selection.filter((s) => s.managed);
    const localProjects = selection.filter((s) => !s.managed);
    const isSelectionOnlyManaged = !!managedProjects.length && !localProjects.length;
    const isSelectionOnlyLocal = !managedProjects.length && !!localProjects.length;

    if (isSelectionOnlyManaged) {
      return (
        <UseQuery query={useGithubProvisioningEnabledQuery}>
          {({ data: githubProvisioningStatus }) => (
            <FlagMessage className="sw-my-2" variant="error">
              {translateWithParameters(
                'permission_templates.bulk_apply_permission_template.apply_to_only_managed_projects',
                githubProvisioningStatus ? translate('alm.github') : translate('alm.gitlab'),
              )}
            </FlagMessage>
          )}
        </UseQuery>
      );
    } else if (isSelectionOnlyLocal) {
      return (
        <FlagMessage className="sw-my-2" variant="warning">
          {this.props.selection.length
            ? translateWithParameters(
                'permission_templates.bulk_apply_permission_template.apply_to_selected',
                this.props.selection.length,
              )
            : translateWithParameters(
                'permission_templates.bulk_apply_permission_template.apply_to_all',
                this.props.total,
              )}
        </FlagMessage>
      );
    }

    return (
      <UseQuery query={useGithubProvisioningEnabledQuery}>
        {({ data: githubProvisioningStatus }) => (
          <FlagMessage className="sw-my-2" variant="warning">
            {translateWithParameters(
              'permission_templates.bulk_apply_permission_template.apply_to_selected',
              localProjects.length,
            )}
            <br />
            {translateWithParameters(
              'permission_templates.bulk_apply_permission_template.apply_to_managed_projects',
              managedProjects.length,
              githubProvisioningStatus ? translate('alm.github') : translate('alm.gitlab'),
            )}
          </FlagMessage>
        )}
      </UseQuery>
    );
  };

  renderSelect = (isSelectionOnlyManaged: boolean) => {
    const options =
      this.state.permissionTemplates !== undefined
        ? this.state.permissionTemplates.map((t) => ({ label: t.name, value: t.id }))
        : [];

    return (
      <FormField htmlFor="bulk-apply-template-input" label={translate('template')} required>
        <InputSelect
          id="bulk-apply-template"
          inputId="bulk-apply-template-input"
          isDisabled={this.state.submitting || isSelectionOnlyManaged}
          onChange={this.handlePermissionTemplateChange}
          options={options}
          size="auto"
          value={options.find((option) => option.value === this.state.permissionTemplate)}
        />
      </FormField>
    );
  };

  render() {
    const { done, loading, permissionTemplates, submitting } = this.state;
    const header = translate('permission_templates.bulk_apply_permission_template');

    const isSelectionOnlyManaged = this.props.selection.every((s) => s.managed === true);
    const body = (
      <form id={FORM_ID} onSubmit={this.handleConfirmClick}>
        {done && (
          <FlagMessage variant="success">
            {translate('projects_role.apply_template.success')}
          </FlagMessage>
        )}

        <Spinner className="sw-mr-1" isLoading={loading} />

        {!loading && !done && permissionTemplates && (
          <>
            <MandatoryFieldsExplanation className="sw-mb-2" />
            {this.renderWarning()}
            {this.renderSelect(isSelectionOnlyManaged)}
          </>
        )}
      </form>
    );

    return (
      <Modal
        body={body}
        headerTitle={header}
        isOverflowVisible
        isScrollable={false}
        loading={submitting}
        onClose={this.props.onClose}
        primaryButton={
          !loading &&
          !done &&
          permissionTemplates && (
            <Button
              form={FORM_ID}
              isDisabled={submitting || isSelectionOnlyManaged}
              type="submit"
              variety={ButtonVariety.Primary}
            >
              {translate('apply')}
            </Button>
          )
        }
        secondaryButtonLabel={done ? translate('close') : translate('cancel')}
      />
    );
  }
}
