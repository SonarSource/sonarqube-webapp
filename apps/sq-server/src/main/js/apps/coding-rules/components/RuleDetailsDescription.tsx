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
  Form,
  FormFieldWidth,
  Spinner,
  TextArea,
} from '@sonarsource/echoes-react';
import { CodeSyntaxHighlighter, SanitizeLevel } from '~design-system';

import * as React from 'react';
import FormattingTips from '~sq-server-shared/components/common/FormattingTips';
import RuleTabViewer from '~sq-server-shared/components/rules/RuleTabViewer';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import { useUpdateRuleMutation } from '~sq-server-shared/queries/rules';
import { RuleDetails } from '~sq-server-shared/types/types';
import RemoveExtendedDescriptionModal from './RemoveExtendedDescriptionModal';

interface Props {
  canWrite: boolean | undefined;
  ruleDetails: RuleDetails;
}

export default function RuleDetailsDescription(props: Readonly<Props>) {
  const { ruleDetails, canWrite } = props;
  const [description, setDescription] = React.useState('');
  const [descriptionForm, setDescriptionForm] = React.useState(false);
  const [removeDescriptionModal, setDescriptionModal] = React.useState(false);

  const { mutate: updateRule, isPending: updatingRule } = useUpdateRuleMutation(undefined, () => {
    setDescriptionForm(false);
  });

  const updateDescription = (text = '') => {
    updateRule({
      key: ruleDetails.key,
      markdown_note: text,
    });
  };

  const renderExtendedDescription = () => (
    <div id="coding-rules-detail-description-extra">
      {ruleDetails.htmlNote !== undefined && (
        <CodeSyntaxHighlighter
          className="markdown sw-my-6"
          htmlAsString={ruleDetails.htmlNote}
          language={ruleDetails.lang}
          sanitizeLevel={SanitizeLevel.USER_INPUT}
        />
      )}

      <div className="sw-my-6">
        {canWrite && (
          <Button
            onClick={() => {
              setDescription(ruleDetails.mdNote ?? '');
              setDescriptionForm(true);
            }}
          >
            {translate('coding_rules.extend_description')}
          </Button>
        )}
      </div>
    </div>
  );

  const renderForm = () => (
    <Form
      aria-label={translate('coding_rules.detail.extend_description.form')}
      className="sw-my-6"
      onSubmit={(event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateDescription(description);
      }}
    >
      <TextArea
        aria-label={translate('coding_rules.extend_description')}
        className="sw-mb-2 sw-resize-y"
        id="coding-rules-detail-extend-description-text"
        onChange={({ currentTarget: { value } }: React.SyntheticEvent<HTMLTextAreaElement>) => {
          setDescription(value);
        }}
        rows={4}
        value={description}
        width={FormFieldWidth.Full}
      />

      <div className="sw-flex sw-items-center sw-justify-between">
        <div className="sw-flex sw-items-center">
          <Button
            id="coding-rules-detail-extend-description-submit"
            isLoading={updatingRule}
            type="submit"
            variety={ButtonVariety.Primary}
          >
            {translate('save')}
          </Button>

          {ruleDetails.mdNote !== undefined && (
            <>
              <Button
                className="sw-ml-2"
                id="coding-rules-detail-extend-description-remove"
                isLoading={updatingRule}
                onClick={() => {
                  setDescriptionModal(true);
                }}
                variety={ButtonVariety.DangerOutline}
              >
                {translate('remove')}
              </Button>
              {removeDescriptionModal && (
                <RemoveExtendedDescriptionModal
                  onCancel={() => {
                    setDescriptionModal(false);
                  }}
                  onSubmit={() => {
                    setDescriptionModal(false);
                    updateDescription();
                  }}
                />
              )}
            </>
          )}

          <Button
            className="sw-ml-2"
            id="coding-rules-detail-extend-description-cancel"
            isLoading={updatingRule}
            onClick={() => {
              setDescriptionForm(false);
            }}
          >
            {translate('cancel')}
          </Button>

          <Spinner className="sw-ml-2" isLoading={updatingRule} />
        </div>

        <FormattingTips />
      </div>
    </Form>
  );

  return (
    <div className="js-rule-description">
      <RuleTabViewer ruleDetails={ruleDetails} />

      {ruleDetails.isExternal && (
        <div className="coding-rules-detail-description rule-desc markdown">
          {translateWithParameters('issue.external_issue_description', ruleDetails.name)}
        </div>
      )}

      {!ruleDetails.templateKey && (
        <div className="sw-mt-6">
          {!descriptionForm && renderExtendedDescription()}
          {descriptionForm && canWrite && renderForm()}
        </div>
      )}
    </div>
  );
}
