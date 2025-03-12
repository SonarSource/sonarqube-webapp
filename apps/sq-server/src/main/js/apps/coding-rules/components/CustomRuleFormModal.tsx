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

import { Button, ButtonVariety, Modal, ModalSize, Select, Text } from '@sonarsource/echoes-react';
import { HttpStatusCode } from 'axios';
import { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlagMessage,
  FormField,
  InputField,
  InputTextArea,
  LabelValueSelectOption,
  SafeHTMLInjection,
  SanitizeLevel,
} from '~design-system';
import FormattingTips from '~sq-server-shared/components/common/FormattingTips';
import IssueTypeIcon from '~sq-server-shared/components/icon-mappers/IssueTypeIcon';
import MandatoryFieldsExplanation from '~sq-server-shared/components/ui/MandatoryFieldsExplanation';
import { RULE_STATUSES, RULE_TYPES } from '~sq-server-shared/helpers/constants';
import { csvEscape } from '~sq-server-shared/helpers/csv';
import { translate } from '~sq-server-shared/helpers/l10n';
import { latinize } from '~sq-server-shared/helpers/strings';
import { useStandardExperienceModeQuery } from '~sq-server-shared/queries/mode';
import { useCreateRuleMutation, useUpdateRuleMutation } from '~sq-server-shared/queries/rules';
import {
  CleanCodeAttribute,
  CleanCodeAttributeCategory,
  SoftwareImpact,
} from '~sq-server-shared/types/clean-code-taxonomy';
import {
  CustomRuleType,
  Dict,
  RuleDetails,
  RuleParameter,
  RuleType,
} from '~sq-server-shared/types/types';
import {
  CleanCodeAttributeField,
  CleanCodeCategoryField,
  SoftwareQualitiesFields,
} from './CustomRuleFormFieldsCCT';
import { SeveritySelect } from './SeveritySelect';

interface Props {
  customRule?: RuleDetails;
  isOpen: boolean;
  onClose: () => void;
  templateRule: RuleDetails;
}

const FORM_ID = 'custom-rule-form';

export default function CustomRuleFormModal(props: Readonly<Props>) {
  const { customRule, templateRule, isOpen } = props;
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const [description, setDescription] = useState(customRule?.mdDesc ?? '');
  const [key, setKey] = useState(customRule?.key ?? '');
  const [keyModifiedByUser, setKeyModifiedByUser] = useState(false);
  const [name, setName] = useState(customRule?.name ?? '');
  const [params, setParams] = useState(getParams(customRule));
  const [reactivating, setReactivating] = useState(false);
  const [status, setStatus] = useState(customRule?.status ?? templateRule.status);
  const [ccCategory, setCCCategory] = useState<CleanCodeAttributeCategory>(
    templateRule.cleanCodeAttributeCategory ?? CleanCodeAttributeCategory.Consistent,
  );
  const [ccAttribute, setCCAttribute] = useState<CleanCodeAttribute>(
    templateRule.cleanCodeAttribute ?? CleanCodeAttribute.Conventional,
  );
  const [impacts, setImpacts] = useState<SoftwareImpact[]>(templateRule?.impacts ?? []);
  const [standardSeverity, setStandardSeverity] = useState(
    customRule?.severity ?? templateRule.severity,
  );
  const [standardType, setStandardType] = useState(customRule?.type ?? templateRule.type);
  const [cctType, setCCTType] = useState<CustomRuleType>(
    standardType === 'SECURITY_HOTSPOT' ? CustomRuleType.SECURITY_HOTSPOT : CustomRuleType.ISSUE,
  );
  const customRulesSearchParams = {
    f: 'name,severity,params',
    template_key: templateRule.key,
  };
  const { mutate: updateRule, isPending: updatingRule } = useUpdateRuleMutation(
    customRulesSearchParams,
    props.onClose,
  );
  const { mutate: createRule, isPending: creatingRule } = useCreateRuleMutation(
    customRulesSearchParams,
    props.onClose,
    (response: Response) => {
      setReactivating(response.status === HttpStatusCode.Conflict);
    },
  );
  const warningRef = useRef<HTMLDivElement>(null);

  const submitting = updatingRule || creatingRule;
  const hasError =
    !isStandardMode && impacts.length === 0 && cctType !== CustomRuleType.SECURITY_HOTSPOT;
  const isDisabledInUpdate = submitting || customRule !== undefined;

  const submit = () => {
    const isSecurityHotspot =
      standardType === 'SECURITY_HOTSPOT' || cctType === CustomRuleType.SECURITY_HOTSPOT;
    const stringifiedParams = Object.keys(params)
      .map((key) => `${key}=${csvEscape(params[key])}`)
      .join(';');

    const ruleData = {
      name,
      status,
      markdownDescription: description,
    };

    const standardRule = {
      type: standardType,
      ...(isSecurityHotspot ? {} : { severity: standardSeverity }),
    };

    const cctRule = isSecurityHotspot
      ? { type: cctType as RuleType }
      : {
          cleanCodeAttribute: ccAttribute,
          impacts,
        };

    if (customRule) {
      updateRule({
        ...ruleData,
        ...(isStandardMode ? standardRule : cctRule),
        params: stringifiedParams,
        key: customRule.key,
      });
    } else if (reactivating) {
      updateRule({
        ...ruleData,
        ...(isStandardMode ? standardRule : cctRule),
        params: stringifiedParams,
        key: `${templateRule.repo}:${key}`,
      });
    } else {
      createRule({
        ...ruleData,
        impacts: [], // impacts are required in createRule
        ...(isStandardMode ? standardRule : cctRule),
        key: `${templateRule.repo}:${key}`,
        templateKey: templateRule.key,
        parameters: Object.entries(params).map(([key, value]) => ({ key, defaultValue: value })),
      });
    }
  };

  // If key changes, then most likely user did it to create a new rule instead of reactivating one
  useEffect(() => {
    setReactivating(false);
  }, [key]);

  // scroll to warning when it appears
  useEffect(() => {
    if (reactivating) {
      warningRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [reactivating]);

  const NameField = useMemo(
    () => (
      <FormField
        ariaLabel={translate('name')}
        htmlFor="coding-rules-custom-rule-creation-name"
        label={translate('name')}
        required
      >
        <InputField
          autoFocus
          disabled={submitting}
          id="coding-rules-custom-rule-creation-name"
          onChange={({ currentTarget: { value: name } }: SyntheticEvent<HTMLInputElement>) => {
            setName(name);
            setKey(keyModifiedByUser ? key : latinize(name).replace(/[^A-Za-z0-9]/g, '_'));
          }}
          required
          size="full"
          type="text"
          value={name}
        />
      </FormField>
    ),
    [key, keyModifiedByUser, name, submitting],
  );

  const KeyField = useMemo(
    () => (
      <FormField
        ariaLabel={translate('key')}
        htmlFor="coding-rules-custom-rule-creation-key"
        label={translate('key')}
        required
      >
        {customRule ? (
          <span title={customRule.key}>{customRule.key}</span>
        ) : (
          <InputField
            disabled={submitting}
            id="coding-rules-custom-rule-creation-key"
            onChange={(event: SyntheticEvent<HTMLInputElement>) => {
              setKey(event.currentTarget.value);
              setKeyModifiedByUser(true);
            }}
            required
            size="full"
            type="text"
            value={key}
          />
        )}
      </FormField>
    ),
    [customRule, key, submitting],
  );

  const DescriptionField = useMemo(
    () => (
      <FormField
        ariaLabel={translate('description')}
        htmlFor="coding-rules-custom-rule-creation-html-description"
        label={translate('description')}
        required
      >
        <InputTextArea
          disabled={submitting}
          id="coding-rules-custom-rule-creation-html-description"
          onChange={(event: SyntheticEvent<HTMLTextAreaElement>) =>
            setDescription(event.currentTarget.value)
          }
          required
          rows={5}
          size="full"
          value={description}
        />
        <FormattingTips />
      </FormField>
    ),
    [description, submitting],
  );

  const CCTIssueTypeField = useMemo(() => {
    const typeOptions = Object.values(CustomRuleType).map((value) => ({
      label: translate(`coding_rules.custom.type.option.${value}`),
      value,
    }));

    return (
      <FormField
        ariaLabel={translate('coding_rules.custom.type.label')}
        htmlFor="coding-rules-custom-rule-type"
        label={translate('coding_rules.custom.type.label')}
      >
        <Select
          aria-labelledby="coding-rules-custom-rule-type"
          data={typeOptions}
          id="coding-rules-custom-rule-type"
          isDisabled={isDisabledInUpdate}
          isRequired
          isSearchable={false}
          onChange={(value) => (value ? setCCTType(value as CustomRuleType) : '')}
          value={typeOptions.find((s) => s.value === cctType)?.value}
        />
      </FormField>
    );
  }, [cctType, isDisabledInUpdate]);

  const StatusField = useMemo(() => {
    const statusesOptions = RULE_STATUSES.map((status) => ({
      label: translate('rules.status', status),
      value: status,
    }));

    return (
      <FormField
        ariaLabel={translate('coding_rules.filters.status')}
        htmlFor="coding-rules-custom-rule-status"
        label={translate('coding_rules.filters.status')}
      >
        <Select
          aria-labelledby="coding-rules-custom-rule-status"
          data={statusesOptions}
          id="coding-rules-custom-rule-status"
          isDisabled={submitting}
          isRequired
          isSearchable={false}
          onChange={(value) => (value ? setStatus(value) : undefined)}
          value={statusesOptions.find((s) => s.value === status)?.value}
        />
      </FormField>
    );
  }, [status, submitting]);

  const StandardTypeField = useMemo(() => {
    const ruleTypeOption: LabelValueSelectOption<RuleType>[] = RULE_TYPES.map((type) => ({
      label: translate('issue.type', type),
      value: type,
      prefix: <IssueTypeIcon type={type} />,
    }));
    return (
      <FormField
        ariaLabel={translate('type')}
        htmlFor="coding-rules-custom-rule-type"
        label={translate('type')}
      >
        <Select
          data={ruleTypeOption}
          id="coding-rules-custom-rule-type"
          isDisabled={isDisabledInUpdate}
          isNotClearable
          isSearchable={false}
          onChange={(value) => setStandardType(value as RuleType)}
          value={ruleTypeOption.find((t) => t.value === standardType)?.value}
          valueIcon={<IssueTypeIcon type={standardType} />}
        />
      </FormField>
    );
  }, [isDisabledInUpdate, standardType]);

  const StandardSeverityField = useMemo(
    () => (
      <FormField
        ariaLabel={translate('severity')}
        htmlFor="coding-rules-severity-select"
        label={translate('severity')}
      >
        <SeveritySelect
          id="coding-rules-severity-select"
          isDisabled={submitting}
          onChange={(value) => setStandardSeverity(value)}
          recommendedSeverity={customRule?.severity ? undefined : templateRule.severity}
          severity={standardSeverity}
        />
      </FormField>
    ),
    [customRule?.severity, standardSeverity, submitting, templateRule.severity],
  );

  const handleParameterChange = useCallback(
    (event: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.currentTarget;
      setParams({ ...params, [name]: value });
    },
    [params],
  );

  const renderParameterField = useCallback(
    (param: RuleParameter) => {
      // Gets the actual value from params from the state.
      // Without it, we have an issue with string 'constructor' as key
      const actualValue = new Map(Object.entries(params)).get(param.key) ?? '';

      return (
        <FormField
          ariaLabel={param.key}
          className="sw-capitalize"
          htmlFor={`coding-rule-custom-rule-${param.key}`}
          key={param.key}
          label={param.key}
        >
          {param.type === 'TEXT' ? (
            <InputTextArea
              disabled={submitting}
              id={`coding-rule-custom-rule-${param.key}`}
              name={param.key}
              onChange={handleParameterChange}
              placeholder={param.defaultValue}
              rows={3}
              size="full"
              value={actualValue}
            />
          ) : (
            <InputField
              disabled={submitting}
              id={`coding-rule-custom-rule-${param.key}`}
              name={param.key}
              onChange={handleParameterChange}
              placeholder={param.defaultValue}
              size="full"
              type="text"
              value={actualValue}
            />
          )}

          {param.htmlDesc !== undefined && (
            <SafeHTMLInjection
              htmlAsString={param.htmlDesc}
              sanitizeLevel={SanitizeLevel.FORBID_SVG_MATHML}
            >
              <Text isSubdued />
            </SafeHTMLInjection>
          )}
        </FormField>
      );
    },
    [params, submitting, handleParameterChange],
  );

  const { params: templateParams = [] } = templateRule;
  const header = customRule
    ? translate('coding_rules.update_custom_rule')
    : translate('coding_rules.create_custom_rule');
  let buttonText = translate(customRule ? 'save' : 'create');
  if (reactivating) {
    buttonText = translate('coding_rules.reactivate');
  }
  return (
    <Modal
      content={
        <form
          className="sw-flex sw-flex-col sw-justify-stretch sw-pb-4"
          id={FORM_ID}
          onSubmit={(event: SyntheticEvent<HTMLFormElement>) => {
            event.preventDefault();
            submit();
          }}
        >
          {reactivating && (
            <div ref={warningRef}>
              <FlagMessage className="sw-mb-6" variant="warning">
                {translate('coding_rules.reactivate.help')}
              </FlagMessage>
            </div>
          )}

          <MandatoryFieldsExplanation className="sw-mb-4" />

          {NameField}
          {KeyField}
          {isStandardMode && (
            <>
              {StandardTypeField}
              {standardType !== 'SECURITY_HOTSPOT' && StandardSeverityField}
            </>
          )}
          {!isStandardMode && (
            <>
              {CCTIssueTypeField}
              {cctType !== 'SECURITY_HOTSPOT' && (
                <>
                  <div className="sw-flex sw-justify-between sw-gap-6">
                    <CleanCodeCategoryField
                      disabled={isDisabledInUpdate}
                      onChange={setCCCategory}
                      value={ccCategory}
                    />
                    <CleanCodeAttributeField
                      category={ccCategory}
                      disabled={isDisabledInUpdate}
                      onChange={setCCAttribute}
                      value={ccAttribute}
                    />
                  </div>
                  <SoftwareQualitiesFields
                    disabled={submitting}
                    error={hasError}
                    onChange={setImpacts}
                    qualityUpdateDisabled={isDisabledInUpdate}
                    value={impacts}
                  />
                </>
              )}
            </>
          )}
          {StatusField}
          {DescriptionField}
          {templateParams.map(renderParameterField)}
        </form>
      }
      isOpen={isOpen}
      onOpenChange={props.onClose}
      primaryButton={
        <Button
          form={FORM_ID}
          isDisabled={submitting || hasError}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {buttonText}
        </Button>
      }
      secondaryButton={
        <Button onClick={props.onClose} variety={ButtonVariety.Default}>
          {translate('cancel')}
        </Button>
      }
      size={ModalSize.Wide}
      title={header}
    />
  );
}

function getParams(customRule?: RuleDetails) {
  const params: Dict<string> = {};

  if (customRule?.params) {
    for (const param of customRule.params) {
      params[param.key] = param.defaultValue ?? '';
    }
  }

  return params;
}
