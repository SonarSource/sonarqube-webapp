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
  Heading,
  Link,
  ModalAlert,
  Spinner,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { ContentCell, Table, TableRow, UnorderedList } from '~design-system';
import { Rule, RuleDetails } from '~shared/types/rules';
import { getRuleUrl } from '~sq-server-commons/helpers/urls';
import { useDeleteRuleMutation, useSearchRulesQuery } from '~sq-server-commons/queries/rules';
import CustomRuleButton from './CustomRuleButton';

interface Props {
  canChange?: boolean;
  ruleDetails: RuleDetails;
}

const COLUMN_COUNT = 2;
const COLUMN_COUNT_WITH_EDIT_PERMISSIONS = 3;

export default function RuleDetailsCustomRules(props: Readonly<Props>) {
  const intl = useIntl();
  const { ruleDetails, canChange } = props;
  const rulesSearchParams = {
    f: 'name,severity,params',
    template_key: ruleDetails.key,
    s: 'name',
  };
  const {
    isLoading: loadingRules,
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useSearchRulesQuery(rulesSearchParams);
  const { mutate: deleteRules, isPending: deletingRule } = useDeleteRuleMutation(rulesSearchParams);

  const loading = loadingRules || deletingRule;
  const rules = data?.pages.flatMap((page) => page.rules) ?? [];

  const handleRuleDelete = React.useCallback(
    (ruleKey: string) => {
      deleteRules({ key: ruleKey });
    },
    [deleteRules],
  );

  return (
    <div className="js-rule-custom-rules">
      <div>
        <Heading as="h2">{intl.formatMessage({ id: 'coding_rules.custom_rules' })}</Heading>

        {props.canChange && (
          <CustomRuleButton templateRule={ruleDetails}>
            {({ onClick }) => (
              <Button
                className="js-create-custom-rule sw-mt-6"
                onClick={onClick}
                variety={ButtonVariety.Default}
              >
                {intl.formatMessage({ id: 'coding_rules.create' })}
              </Button>
            )}
          </CustomRuleButton>
        )}
        {rules.length > 0 && (
          <>
            <Table
              className="sw-my-6"
              columnCount={canChange ? COLUMN_COUNT_WITH_EDIT_PERMISSIONS : COLUMN_COUNT}
              columnWidths={canChange ? ['auto', 'auto', '1%'] : ['auto', 'auto']}
              id="coding-rules-detail-custom-rules"
            >
              {rules.map((rule) => (
                <RuleListItem
                  editable={canChange}
                  key={rule.key}
                  onDelete={handleRuleDelete}
                  rule={rule}
                />
              ))}
            </Table>
            {hasNextPage && (
              <Button
                isDisabled={isFetchingNextPage}
                isLoading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {intl.formatMessage({ id: 'load_more' })}
              </Button>
            )}
          </>
        )}
        <Spinner className="sw-my-6" isLoading={loading} />
      </div>
    </div>
  );
}

function RuleListItem(
  props: Readonly<{
    editable?: boolean;
    onDelete: (ruleKey: string) => void;
    rule: Rule;
  }>,
) {
  const { rule, editable } = props;
  const intl = useIntl();
  return (
    <TableRow data-rule={rule.key}>
      <ContentCell>
        <div>
          <Link to={getRuleUrl(rule.key)}>{rule.name}</Link>
        </div>
      </ContentCell>

      <ContentCell>
        <UnorderedList className="sw-mt-0">
          {rule.params
            ?.filter((param) => param.defaultValue)
            .map((param) => (
              <li key={param.key}>
                <span className="sw-font-semibold">{param.key}</span>
                <span>:&nbsp;</span>
                <span title={param.defaultValue}>{param.defaultValue}</span>
              </li>
            ))}
        </UnorderedList>
      </ContentCell>

      {editable && (
        <ContentCell>
          <ModalAlert
            description={intl.formatMessage(
              {
                id: 'coding_rules.delete.custom.confirm',
              },
              {
                name: rule.name,
              },
            )}
            primaryButton={
              <Button
                className="sw-ml-2 js-delete"
                id="coding-rules-detail-rule-delete"
                onClick={() => {
                  props.onDelete(rule.key);
                }}
                variety={ButtonVariety.DangerOutline}
              >
                {intl.formatMessage({ id: 'delete' })}
              </Button>
            }
            secondaryButtonLabel={intl.formatMessage({ id: 'close' })}
            title={intl.formatMessage({ id: 'coding_rules.delete_rule' })}
          >
            <Button
              ariaLabel={intl.formatMessage(
                { id: 'coding_rules.delete_rule_x' },
                { name: rule.name },
              )}
              className="js-delete-custom-rule"
              variety={ButtonVariety.DangerOutline}
            >
              {intl.formatMessage({ id: 'delete' })}
            </Button>
          </ModalAlert>
        </ContentCell>
      )}
    </TableRow>
  );
}
