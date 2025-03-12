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

import { Button, ButtonVariety, Checkbox, Modal, Select, Text } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  FlagMessage,
  FormField,
  InputField,
  InputTextArea,
  Note,
  SafeHTMLInjection,
  SanitizeLevel,
} from '~design-system';
import DocumentationLink from '~sq-server-shared/components/common/DocumentationLink';
import { useAvailableFeatures } from '~sq-server-shared/context/available-features/withAvailableFeatures';
import { DocLink } from '~sq-server-shared/helpers/doc-links';
import { useStandardExperienceModeQuery } from '~sq-server-shared/queries/mode';
import { useActivateRuleMutation } from '~sq-server-shared/queries/quality-profiles';
import {
  SoftwareImpactSeverity,
  SoftwareQuality,
} from '~sq-server-shared/types/clean-code-taxonomy';
import { Feature } from '~sq-server-shared/types/features';
import { IssueSeverity } from '~sq-server-shared/types/issues';
import { BaseProfile } from '~sq-server-shared/types/quality-profiles';
import { Rule, RuleActivation, RuleDetails } from '~sq-server-shared/types/types';
import { sortProfiles } from '~sq-server-shared/utils/quality-profiles-utils';
import { SeveritySelect } from './SeveritySelect';

interface Props {
  activation?: RuleActivation;
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
    ...rule.impacts.map((impact) => [impact.softwareQuality, impact.severity] as const),
    ...(activation?.impacts
      ?.filter((impact) => rule.impacts.some((i) => i.softwareQuality === impact.softwareQuality))
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
        <form className="sw-pb-10" id={FORM_ID} onSubmit={handleFormSubmit}>
          <Text as="div">
            <FormattedMessage
              id="coding_rules.rule_name.title"
              values={{
                name: <Text isSubdued>{rule.name}</Text>,
              }}
            />
          </Text>

          {!isUpdateMode && activeInAllProfiles && (
            <FlagMessage className="sw-mt-4 sw-mb-6" variant="info">
              {intl.formatMessage({ id: 'coding_rules.active_in_all_profiles' })}
            </FlagMessage>
          )}

          {profilesWithDepth.length >= MIN_PROFILES_TO_ENABLE_SELECT ? (
            <FormField
              ariaLabel={intl.formatMessage({ id: 'coding_rules.quality_profile' })}
              className="sw-mt-4"
              htmlFor="coding-rules-quality-profile-select"
              label={intl.formatMessage({ id: 'coding_rules.quality_profile' })}
            >
              <Select
                data={profileOptions}
                id="coding-rules-quality-profile-select"
                isDisabled={submitting}
                isNotClearable
                onChange={(value) => setChangedProfile(value ?? undefined)}
                value={profile?.key}
              />
            </FormField>
          ) : (
            <>
              {(isUpdateMode || !activeInAllProfiles) && (
                <Text as="div" className="sw-mb-6">
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
            <FormField
              ariaLabel={intl.formatMessage({ id: 'coding_rules.prioritized_rule.title' })}
              label={intl.formatMessage({ id: 'coding_rules.prioritized_rule.title' })}
            >
              <Checkbox
                checked={prioritizedRule}
                id="coding-rules-prioritized-rule"
                label={intl.formatMessage({ id: 'coding_rules.prioritized_rule.switch_label' })}
                onCheck={(checked) => setChangedPrioritizedRule(!!checked)}
              />
              {prioritizedRule && (
                <FlagMessage className="sw-mt-2" variant="info">
                  {intl.formatMessage({ id: 'coding_rules.prioritized_rule.note' })}
                  <DocumentationLink
                    className="sw-ml-2 sw-whitespace-nowrap"
                    to={DocLink.InstanceAdminQualityProfilesPrioritizingRules}
                  >
                    {intl.formatMessage({ id: 'learn_more' })}
                  </DocumentationLink>
                </FlagMessage>
              )}
            </FormField>
          )}

          {isStandardMode && (
            <>
              <FormField label={intl.formatMessage({ id: 'coding_rules.custom_severity.title' })}>
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
              </FormField>

              <FormField
                ariaLabel={intl.formatMessage({
                  id: 'coding_rules.custom_severity.choose_severity',
                })}
                htmlFor="coding-rules-custom-severity-select"
                label={intl.formatMessage({ id: 'coding_rules.custom_severity.choose_severity' })}
              >
                <SeveritySelect
                  id="coding-rules-custom-severity-select"
                  isDisabled={submitting}
                  onChange={(value: string) => {
                    setChangedSeverity(value as IssueSeverity);
                  }}
                  recommendedSeverity={rule.severity}
                  severity={severity}
                />
              </FormField>
            </>
          )}

          {!isStandardMode && (
            <>
              <FormField label={intl.formatMessage({ id: 'coding_rules.custom_severity.title' })}>
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
              </FormField>

              {Object.values(SoftwareQuality).map((quality) => {
                const impact = rule.impacts.find((impact) => impact.softwareQuality === quality);
                const id = `coding-rules-custom-severity-${quality}-select`;
                return (
                  <FormField
                    ariaLabel={intl.formatMessage({ id: `software_quality.${quality}` })}
                    disabled={!impact}
                    htmlFor={id}
                    key={quality}
                    label={intl.formatMessage({ id: `software_quality.${quality}` })}
                  >
                    <SeveritySelect
                      id={id}
                      impactSeverity
                      isDisabled={submitting || !impact}
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
                  </FormField>
                );
              })}
            </>
          )}

          {isCustomRule ? (
            <Note as="p" className="sw-my-4">
              {intl.formatMessage({ id: 'coding_rules.custom_rule.activation_notice' })}
            </Note>
          ) : (
            rule.params?.map((param) => (
              <FormField htmlFor={param.key} key={param.key} label={param.key}>
                {param.type === 'TEXT' ? (
                  <InputTextArea
                    disabled={submitting}
                    id={param.key}
                    name={param.key}
                    onChange={handleParameterChange}
                    placeholder={param.defaultValue}
                    rows={3}
                    size="full"
                    value={params[param.key] ?? ''}
                  />
                ) : (
                  <InputField
                    disabled={submitting}
                    id={param.key}
                    name={param.key}
                    onChange={handleParameterChange}
                    placeholder={param.defaultValue}
                    size="full"
                    type="text"
                    value={params[param.key] ?? ''}
                  />
                )}
                {param.htmlDesc !== undefined && (
                  <SafeHTMLInjection
                    htmlAsString={param.htmlDesc}
                    sanitizeLevel={SanitizeLevel.FORBID_SVG_MATHML}
                  >
                    <Note as="div" />
                  </SafeHTMLInjection>
                )}
              </FormField>
            ))
          )}
        </form>
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
  activation?: RuleActivation;
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
