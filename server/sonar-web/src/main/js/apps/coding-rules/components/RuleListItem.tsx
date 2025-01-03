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

import styled from '@emotion/styled';
import { Button, ButtonVariety, Text, TextSize } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import {
  Badge,
  InheritanceIcon,
  Link,
  OverridenIcon,
  SeparatorCircleIcon,
  TextSubdued,
  themeBorder,
} from '~design-system';
import { Profile } from '../../../api/quality-profiles';
import Tooltip from '../../../components/controls/Tooltip';
import { CleanCodeAttributePill } from '../../../components/shared/CleanCodeAttributePill';
import SoftwareImpactPillList from '../../../components/shared/SoftwareImpactPillList';
import TagsList from '../../../components/tags/TagsList';
import { translate, translateWithParameters } from '../../../helpers/l10n';
import { getRuleUrl } from '../../../helpers/urls';
import { useStandardExperienceModeQuery } from '../../../queries/mode';
import {
  useActivateRuleMutation,
  useDeactivateRuleMutation,
} from '../../../queries/quality-profiles';
import { useRuleDetailsQuery } from '../../../queries/rules';
import { SoftwareImpact } from '../../../types/clean-code-taxonomy';
import { IssueSeverity } from '../../../types/issues';
import { Rule, RuleActivation } from '../../../types/types';
import ActivatedRuleActions from './ActivatedRuleActions';
import ActivationButton from './ActivationButton';

interface Props {
  activation?: RuleActivation;
  canDeactivateInherited?: boolean;
  isLoggedIn: boolean;
  onActivate: (profile: string, rule: string, activation: RuleActivation) => void;
  onDeactivate: (profile: string, rule: string) => void;
  onOpen: (ruleKey: string) => void;
  rule: Rule;
  selectRule: (key: string) => void;
  selected: boolean;
  selectedProfile?: Profile;
}

function RuleListItem(props: Readonly<Props>) {
  const {
    activation: initialActivation,
    rule,
    selectedProfile,
    isLoggedIn,
    selected,
    selectRule,
    canDeactivateInherited,
    onDeactivate,
    onActivate,
    onOpen,
  } = props;
  const intl = useIntl();
  const [ruleIsChanged, setRuleIsChanged] = React.useState(false);
  const { data } = useRuleDetailsQuery(
    { key: rule.key, actives: true },
    { enabled: ruleIsChanged },
  );
  const { mutate: activateRule } = useActivateRuleMutation(() => {
    setRuleIsChanged(true);
  });
  const { mutate: deactivateRule } = useDeactivateRuleMutation((data) =>
    onDeactivate(data.key, data.rule),
  );
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  const activation =
    data && ruleIsChanged
      ? data.actives?.find((item) => item.qProfile === selectedProfile?.key)
      : initialActivation;

  const { activationImpacts, ruleImpacts } = getImpactsDiffBySeverity(rule, activation);

  React.useEffect(() => {
    if (data && selectedProfile) {
      const newActivation = data.actives?.find((item) => item.qProfile === selectedProfile?.key);
      if (newActivation) {
        onActivate(selectedProfile?.key, rule.key, newActivation);
        setRuleIsChanged(false);
      }
    }
  }, [data, rule.key, selectedProfile, onActivate]);

  const handleDeactivate = () => {
    if (selectedProfile) {
      deactivateRule({
        key: selectedProfile.key,
        rule: rule.key,
      });
    }
  };

  const handleActivate = () => {
    setRuleIsChanged(true);
    return Promise.resolve();
  };

  const handleRevert = (key?: string) => {
    if (key !== undefined) {
      activateRule({
        key,
        rule: rule.key,
        reset: true,
      });
    }
  };

  const handleNameClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // cmd(ctrl) + click should open a rule permalink in a new tab
    const isLeftClickEvent = event.button === 0;
    const isModifiedEvent = !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
    if (isModifiedEvent || !isLeftClickEvent) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onOpen(rule.key);
  };

  const renderActivation = () => {
    if (!activation || selectedProfile?.parentName === undefined) {
      return null;
    }

    if (!['OVERRIDES', 'INHERITED'].includes(activation.inherit)) {
      return null;
    }

    return (
      <div className="sw-mr-2 sw-shrink-0">
        {activation.inherit === 'OVERRIDES' && (
          <Tooltip
            content={translateWithParameters(
              'coding_rules.overrides',
              selectedProfile.name,
              selectedProfile.parentName,
            )}
          >
            <OverridenIcon className="sw-ml-1" />
          </Tooltip>
        )}
        {activation.inherit === 'INHERITED' && (
          <Tooltip
            content={translateWithParameters(
              'coding_rules.inherits',
              selectedProfile.name,
              selectedProfile.parentName,
            )}
          >
            <InheritanceIcon className="sw-ml-1" />
          </Tooltip>
        )}
      </div>
    );
  };

  const renderActions = () => {
    if (!selectedProfile || !isLoggedIn) {
      return null;
    }

    const canCopy = selectedProfile.actions?.copy;
    if (selectedProfile.isBuiltIn && canCopy) {
      return (
        <div className="sw-ml-4">
          <Tooltip content={translate('coding_rules.need_extend_or_copy')}>
            <Button isDisabled variety={ButtonVariety.DangerOutline}>
              {translate('coding_rules', activation ? 'deactivate' : 'activate')}
            </Button>
          </Tooltip>
        </div>
      );
    }

    const canEdit = selectedProfile.actions?.edit;
    if (!canEdit) {
      return null;
    }

    if (activation) {
      return (
        <ActivatedRuleActions
          activation={activation}
          profile={selectedProfile}
          ruleDetails={rule}
          onActivate={handleActivate}
          handleDeactivate={handleDeactivate}
          handleRevert={handleRevert}
          showDeactivated
          canDeactivateInherited={canDeactivateInherited}
        />
      );
    }

    return (
      <div className="sw-ml-4">
        {!rule.isTemplate && (
          <ActivationButton
            buttonText={translate('coding_rules.activate')}
            modalHeader={translate('coding_rules.activate_in_quality_profile')}
            onDone={handleActivate}
            profiles={[selectedProfile]}
            rule={rule}
          />
        )}
      </div>
    );
  };

  const allTags = [...(rule.tags ?? []), ...(rule.sysTags ?? [])];

  return (
    <ListItemStyled
      selected={selected}
      className="it__coding-rule sw-p-3 sw-mb-4 sw-rounded-1 sw-bg-white"
      aria-current={selected}
      data-rule={rule.key}
      onClick={() => selectRule(rule.key)}
    >
      <div className="sw-flex sw-flex-col sw-gap-3">
        <div className="sw-flex sw-justify-between sw-items-center">
          <div className="sw-flex sw-items-center">
            {renderActivation()}

            <Link className="sw-typo-semibold" onClick={handleNameClick} to={getRuleUrl(rule.key)}>
              {rule.name}
            </Link>
          </div>

          <div>
            {rule.cleanCodeAttributeCategory !== undefined && !isStandardMode && (
              <CleanCodeAttributePill
                cleanCodeAttributeCategory={rule.cleanCodeAttributeCategory}
                type="rule"
              />
            )}
          </div>
        </div>

        <div className="sw-flex sw-items-center">
          <div className="sw-grow sw-flex sw-gap-2 sw-items-center sw-typo-sm">
            {isStandardMode && (
              <>
                {activation && activation.severity !== rule.severity && (
                  <Text isSubdued size={TextSize.Small}>
                    {intl.formatMessage(
                      { id: 'coding_rules.activation_custom_severity' },
                      { count: 1 },
                    )}
                  </Text>
                )}
                <SoftwareImpactPillList
                  softwareImpacts={rule.impacts}
                  issueSeverity={(activation?.severity ?? rule.severity) as IssueSeverity}
                  issueType={rule.type}
                  tooltipMessageId={
                    activation && activation.severity !== rule.severity
                      ? 'coding_rules.impact_severity.tooltip_customized'
                      : undefined
                  }
                  type="rule"
                />
              </>
            )}
            {!isStandardMode && (
              <>
                {ruleImpacts.length > 0 && (
                  <SoftwareImpactPillList
                    softwareImpacts={ruleImpacts}
                    issueSeverity={rule.severity as IssueSeverity}
                    issueType={rule.type}
                    type="rule"
                  />
                )}
                {ruleImpacts.length > 0 && activationImpacts.length > 0 && (
                  <SeparatorCircleIcon aria-hidden />
                )}
                {activationImpacts.length > 0 && (
                  <>
                    <Text isSubdued size={TextSize.Small}>
                      {intl.formatMessage(
                        { id: 'coding_rules.activation_custom_severity' },
                        { count: activationImpacts.length },
                      )}
                    </Text>
                    <SoftwareImpactPillList
                      tooltipMessageId="coding_rules.impact_severity.tooltip_customized"
                      softwareImpacts={activationImpacts}
                      issueSeverity={activation?.severity as IssueSeverity}
                      issueType={rule.type}
                      type="rule"
                    />
                  </>
                )}
              </>
            )}
          </div>

          <TextSubdued as="ul" className="sw-flex sw-gap-1 sw-items-center sw-typo-sm">
            <li>{rule.langName}</li>

            {rule.isTemplate && (
              <>
                <SeparatorCircleIcon aria-hidden as="li" />
                <li>
                  <Tooltip content={translate('coding_rules.rule_template.title')}>
                    <span>
                      <Badge>{translate('coding_rules.rule_template')}</Badge>
                    </span>
                  </Tooltip>
                </li>
              </>
            )}

            {rule.status !== 'READY' && (
              <>
                <SeparatorCircleIcon aria-hidden as="li" />
                <li>
                  <Badge variant="deleted">{translate('rules.status', rule.status)}</Badge>
                </li>
              </>
            )}

            {allTags.length > 0 && (
              <>
                <SeparatorCircleIcon aria-hidden as="li" />
                <li>
                  <TagsList
                    allowUpdate={false}
                    className="sw-typo-sm"
                    tagsClassName="sw-typo-sm"
                    tags={allTags}
                  />
                </li>
              </>
            )}
          </TextSubdued>

          <div className="sw-flex sw-items-center">{renderActions()}</div>
        </div>
      </div>
    </ListItemStyled>
  );
}

const ListItemStyled = styled.li<{ selected: boolean }>`
  outline: ${(props) =>
    props.selected ? themeBorder('heavy', 'primary') : themeBorder('default', 'almCardBorder')};
  outline-offset: ${(props) => (props.selected ? '-2px' : '-1px')};
`;

function getImpactsDiffBySeverity(rule: Rule, activation?: RuleActivation) {
  return rule.impacts.reduce<{
    activationImpacts: SoftwareImpact[];
    ruleImpacts: SoftwareImpact[];
  }>(
    (res, impact) => {
      const actImpact = activation?.impacts.find(
        (actImpact) => actImpact.softwareQuality === impact.softwareQuality,
      );

      if (actImpact && actImpact.severity !== impact.severity) {
        res.activationImpacts.push(actImpact);
      } else {
        res.ruleImpacts.push(impact);
      }

      return res;
    },
    { ruleImpacts: [], activationImpacts: [] },
  );
}

export default React.memo(RuleListItem);
