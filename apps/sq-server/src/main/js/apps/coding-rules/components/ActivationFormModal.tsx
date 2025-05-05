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
  Checkbox,
  Form,
  FormFieldWidth,
  Heading,
  MessageInline,
  MessageType,
  Modal,
  Select,
  Text,
  TextArea,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Note } from '~design-system';
import { SafeHTMLInjection, SanitizeLevel } from '~shared/helpers/sanitize';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { Rule, RuleActivationAdvanced, RuleDetails } from '~shared/types/rules';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { useActivateRuleMutation } from '~sq-server-commons/queries/quality-profiles';
import { Feature } from '~sq-server-commons/types/features';
import { IssueSeverity } from '~sq-server-commons/types/issues';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import { sortProfiles } from '~sq-server-commons/utils/quality-profiles-utils';
import { SeveritySelect } from './SeveritySelect';

interface Props {
  activation?: RuleActivationAdvanced;
  isOpen: boolean;
  modalHeader: string;
  onClose: () => void;
  onDone?: (severity: string, prioritizedRule: boolean) => Promise<void> | void;
  onOpenChange: (isOpen: boolean) => void;
  profiles: BaseProfile[];
  rule: Rule | RuleDetails;
}

interface ProfileWithDepth extends BaseProfile {
  depth: number;
}

const MIN_PROFILES_TO_ENABLE_SELECT = 2;
const FORM_ID = 'rule-activation-modal-form';

export default function ActivationFormModal(props: Readonly<Props>) {
  const { activation, rule, profiles, modalHeader, isOpen, onOpenChange } = props;
  const { mutate: activateRule, isPending: submitting } = useActivateRuleMutation((data) => {
    props.onDone?.(data.severity as string, data.prioritizedRule as boolean);
    props.onClose();
  });
  const { hasFeature } = useAvailableFeatures();
  const intl = useIntl();
  const [changedPrioritizedRule, setChangedPrioritizedRule] = React.useState<boolean | undefined>(
    undefined,
  );
  const [changedProfile, setChangedProfile] = React.useState<string | undefined>(undefined);
  const [changedParams, setChangedParams] = React.useState<Record<string, string> | undefined>(
    undefined,
  );
  const [changedSeverity, setChangedSeverity] = React.useState<IssueSeverity | undefined>(
    undefined,
  );
  const [changedImpactSeveritiesMap, setChangedImpactSeverities] = React.useState<
    Map<SoftwareQuality, SoftwareImpactSeverity>
  >(new Map());
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  const profilesWithDepth = React.useMemo(() => {
    return getQualityProfilesWithDepth(profiles, rule.lang);
  }, [profiles, rule.lang]);

  const prioritizedRule =
    changedPrioritizedRule ?? (activation ? activation.prioritizedRule : false);
  const profile = profiles.find((p) => p.key === changedProfile) ?? profilesWithDepth[0];
  const params = changedParams ?? getRuleParams({ activation, rule });
  const severity =
    changedSeverity ?? ((activation ? activation.severity : rule.severity) as IssueSeverity);
  const impacts = new Map<SoftwareQuality, SoftwareImpactSeverity>([
    ...(rule.impacts ?? []).map((impact) => [impact.softwareQuality, impact.severity] as const),
    ...(activation?.impacts
      ?.filter((impact) => rule.impacts?.some((i) => i.softwareQuality === impact.softwareQuality))
      .map((impact) => [impact.softwareQuality, impact.severity] as const) ?? []),
    ...changedImpactSeveritiesMap,
  ]);
  const profileOptions = profilesWithDepth.map((p) => ({
    label: p.name,
    value: p.key,
    prefix: '   '.repeat(p.depth),
  }));
  const isCustomRule = !!(rule as RuleDetails).templateKey;
  const activeInAllProfiles = profilesWithDepth.length <= 0;
  const isUpdateMode = !!activation;

  React.useEffect(() => {
    if (!isOpen) {
      setChangedPrioritizedRule(undefined);
      setChangedProfile(undefined);
      setChangedParams(undefined);
      setChangedSeverity(undefined);
      setChangedImpactSeverities(new Map());
    }
  }, [isOpen]);

  const handleFormSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      key: profile?.key ?? '',
      params,
      rule: rule.key,
      severity: isStandardMode ? severity : undefined,
      prioritizedRule,
      impacts: !isStandardMode
        ? (Object.fromEntries(impacts) as Record<SoftwareQuality, SoftwareImpactSeverity>)
        : undefined,
    };
    activateRule(data);
  };

  const handleParameterChange = (
    event: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.currentTarget;
    setChangedParams({ ...params, [name]: value });
  };

  return (
    <Modal
      content={
        <Form id={FORM_ID} onSubmit={handleFormSubmit}>
          <Text as="div">
            <FormattedMessage
              id="coding_rules.rule_name.title"
              values={{
                name: <Text isSubdued>{rule.name}</Text>,
              }}
            />
          </Text>

          {!isUpdateMode && activeInAllProfiles && (
            <MessageInline type={MessageType.Info}>
              {intl.formatMessage({ id: 'coding_rules.active_in_all_profiles' })}
            </MessageInline>
          )}

          {profilesWithDepth.length >= MIN_PROFILES_TO_ENABLE_SELECT ? (
            <Select
              data={profileOptions}
              id="coding-rules-quality-profile-select"
              isDisabled={submitting}
              isNotClearable
              label={intl.formatMessage({ id: 'coding_rules.quality_profile' })}
              onChange={(value) => {
                setChangedProfile(value ?? undefined);
              }}
              value={profile?.key}
            />
          ) : (
            <>
              {(isUpdateMode || !activeInAllProfiles) && (
                <Text as="div">
                  <FormattedMessage
                    id="coding_rules.quality_profile.title"
                    values={{
                      name: <Text isSubdued>{profile?.name}</Text>,
                    }}
                  />
                </Text>
              )}
            </>
          )}

          {hasFeature(Feature.PrioritizedRules) && (
            <div className="sw-flex sw-flex-col sw-gap-2">
              <Heading as="h3">
                {intl.formatMessage({ id: 'coding_rules.prioritized_rule.title' })}
              </Heading>
              <Checkbox
                checked={prioritizedRule}
                id="coding-rules-prioritized-rule"
                label={intl.formatMessage({ id: 'coding_rules.prioritized_rule.switch_label' })}
                onCheck={(checked) => {
                  setChangedPrioritizedRule(!!checked);
                }}
              />
              {prioritizedRule && (
                <MessageInline className="sw-mt-4" type={MessageType.Info}>
                  {intl.formatMessage({ id: 'coding_rules.prioritized_rule.note' })}
                  <DocumentationLink
                    className="sw-ml-2 sw-whitespace-nowrap"
                    to={DocLink.InstanceAdminQualityProfilesPrioritizingRules}
                  >
                    {intl.formatMessage({ id: 'learn_more' })}
                  </DocumentationLink>
                </MessageInline>
              )}
            </div>
          )}

          {isStandardMode && (
            <div className="sw-flex sw-flex-col sw-gap-5">
              <Heading as="h3">
                {intl.formatMessage({ id: 'coding_rules.custom_severity.title' })}
              </Heading>
              <Text>
                <FormattedMessage
                  id="coding_rules.custom_severity.description.standard"
                  values={{
                    link: (
                      <DocumentationLink to={DocLink.RuleSeverity}>
                        {intl.formatMessage({
                          id: 'coding_rules.custom_severity.description.standard.link',
                        })}
                      </DocumentationLink>
                    ),
                  }}
                />
              </Text>

              <SeveritySelect
                id="coding-rules-custom-severity-select"
                isDisabled={submitting}
                label={intl.formatMessage({ id: 'coding_rules.custom_severity.choose_severity' })}
                onChange={(value: string) => {
                  setChangedSeverity(value as IssueSeverity);
                }}
                recommendedSeverity={rule.severity}
                severity={severity}
              />
            </div>
          )}

          {!isStandardMode && (
            <div className="sw-flex sw-flex-col">
              <Heading as="h3" className="sw-mb-2">
                {intl.formatMessage({ id: 'coding_rules.custom_severity.title' })}
              </Heading>
              <Text>
                <FormattedMessage
                  id="coding_rules.custom_severity.description.mqr"
                  values={{
                    link: (
                      <DocumentationLink to={DocLink.RuleSeverity}>
                        {intl.formatMessage({
                          id: 'coding_rules.custom_severity.description.mqr.link',
                        })}
                      </DocumentationLink>
                    ),
                  }}
                />
              </Text>

              <div className="sw-mt-6 sw-gap-6">
                {Object.values(SoftwareQuality).map((quality) => {
                  const impact = rule.impacts?.find((impact) => impact.softwareQuality === quality);
                  const id = `coding-rules-custom-severity-${quality}-select`;
                  return (
                    <SeveritySelect
                      id={id}
                      impactSeverity
                      isDisabled={submitting || !impact}
                      key={quality}
                      label={intl.formatMessage({ id: `software_quality.${quality}` })}
                      onChange={(value: string) => {
                        setChangedImpactSeverities(
                          new Map(changedImpactSeveritiesMap).set(
                            quality,
                            value as SoftwareImpactSeverity,
                          ),
                        );
                      }}
                      recommendedSeverity={impact?.severity ?? ''}
                      severity={impacts.get(quality) ?? ''}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {isCustomRule ? (
            <Note as="p" className="sw-my-4">
              {intl.formatMessage({ id: 'coding_rules.custom_rule.activation_notice' })}
            </Note>
          ) : (
            rule.params?.map(({ key, type, defaultValue, htmlDesc }) => (
              <div key={key}>
                {type === 'TEXT' ? (
                  <TextArea
                    id={key}
                    isDisabled={submitting}
                    label={key}
                    name={key}
                    onChange={handleParameterChange}
                    placeholder={defaultValue}
                    rows={3}
                    value={params[key] ?? ''}
                    width={FormFieldWidth.Full}
                  />
                ) : (
                  <TextInput
                    id={key}
                    isDisabled={submitting}
                    name={key}
                    onChange={handleParameterChange}
                    placeholder={defaultValue}
                    type="text"
                    value={params[key] ?? ''}
                    width={FormFieldWidth.Full}
                  />
                )}
                {htmlDesc !== undefined && (
                  <SafeHTMLInjection
                    htmlAsString={htmlDesc}
                    sanitizeLevel={SanitizeLevel.FORBID_SVG_MATHML}
                  >
                    <Note as="div" />
                  </SafeHTMLInjection>
                )}
              </div>
            ))
          )}
        </Form>
      }
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      primaryButton={
        <Button
          form={FORM_ID}
          isDisabled={submitting || activeInAllProfiles}
          isLoading={submitting}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {isUpdateMode
            ? intl.formatMessage({ id: 'save' })
            : intl.formatMessage({ id: 'coding_rules.activate' })}
        </Button>
      }
      secondaryButton={
        <Button isDisabled={submitting} onClick={props.onClose} variety={ButtonVariety.Default}>
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
      }
      title={modalHeader}
    />
  );
}

function getQualityProfilesWithDepth(
  profiles: BaseProfile[],
  ruleLang?: string,
): ProfileWithDepth[] {
  return sortProfiles(
    profiles.filter(
      (profile) =>
        !profile.isBuiltIn &&
        profile.actions &&
        profile.actions.edit &&
        profile.language === ruleLang,
    ),
  ).map((profile) => ({
    ...profile,
    // Decrease depth by 1, so the top level starts at 0
    depth: profile.depth - 1,
  }));
}

function getRuleParams({
  activation,
  rule,
}: {
  activation?: RuleActivationAdvanced;
  rule: RuleDetails | Rule;
}) {
  const params: Record<string, string> = {};
  if (rule.params) {
    for (const param of rule.params) {
      params[param.key] = param.defaultValue ?? '';
    }
    if (activation?.params) {
      for (const param of activation.params) {
        params[param.key] = param.value;
      }
    }
  }
  return params;
}
