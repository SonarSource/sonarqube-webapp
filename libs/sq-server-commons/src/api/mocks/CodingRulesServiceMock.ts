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

import { cloneDeep, countBy, isEqual, pick, trim, uniq } from 'lodash';
import { getStandards } from '~shared/helpers/security-standards';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { ComponentQualifier, Visibility } from '~shared/types/component';
import { HttpStatus } from '~shared/types/request';
import {
  Rule,
  RuleActivationAdvanced,
  RuleDescriptionSections,
  RuleDetails,
  RuleParameter,
  RuleStatus,
} from '~shared/types/rules';
import { StandardsInformationKey } from '~shared/types/security';
import { IMPACT_SEVERITIES } from '../../helpers/constants';
import {
  mockCurrentUser,
  mockPaging,
  mockRestRuleDetails,
  mockRuleActivationAdvanced,
  mockRuleRepository,
} from '../../helpers/testMocks';
import { RuleRepository, SearchRulesResponse } from '../../types/coding-rules';
import { IssueSeverity, RawIssuesResponse } from '../../types/issues';
import { Profile } from '../../types/quality-profiles';
import { SearchRulesQuery } from '../../types/rules';
import { RulesUpdateRequest } from '../../types/types';
import { NoticeType } from '../../types/users';
import { mapRestRuleToRule } from '../../utils/coding-rules';
import {
  COMPLIANCE_STANDARDS_BACKEND_KEYS,
  parseComplianceStandards,
} from '../../utils/compliance-standards';
import { getComponentData } from '../components';
import { getFacet } from '../issues';
import {
  SearchQualityProfilesParameters,
  SearchQualityProfilesResponse,
  activateRule,
  bulkActivateRules,
  bulkDeactivateRules,
  deactivateRule,
  searchQualityProfiles,
} from '../quality-profiles';
import {
  CreateRuleData,
  createRule,
  deleteRule,
  getRuleDetails,
  getRuleRepositories,
  getRuleTags,
  getRulesApp,
  searchRules,
  updateRule,
} from '../rules';
import { dismissNotice, getCurrentUser } from '../users';
import { STANDARDS_TO_RULES } from './data/ids';
import { mockQualityProfilesList } from './data/qualityProfiles';
import { mockRuleDetailsList, mockRulesActivationsInQP } from './data/rules';

jest.mock('../rules');
jest.mock('../issues');
jest.mock('../users');
jest.mock('../quality-profiles');
jest.mock('../components');

type FacetFilter = Pick<
  SearchRulesQuery,
  | 'impactSeverities'
  | 'impactSoftwareQualities'
  | 'languages'
  | 'tags'
  | 'available_since'
  | 'q'
  | 'types'
  | 'repositories'
  | 'qprofile'
  | 'activation'
  | 'severities'
  | 'is_template'
  | 'template_key'
  | 'cleanCodeAttributeCategories'
  | 'prioritizedRule'
  | 'active_severities'
  | 'active_impactSeverities'
  | StandardsInformationKey
>;

const FACET_RULE_MAP: Record<string, keyof Rule> = {
  languages: 'lang',
  types: 'type',
  severities: 'severity',
  statuses: 'status',
  tags: 'tags',
};

const MQRtoStandardSeverityMap = {
  [SoftwareImpactSeverity.Info]: IssueSeverity.Info,
  [SoftwareImpactSeverity.Low]: IssueSeverity.Minor,
  [SoftwareImpactSeverity.Medium]: IssueSeverity.Major,
  [SoftwareImpactSeverity.High]: IssueSeverity.Critical,
  [SoftwareImpactSeverity.Blocker]: IssueSeverity.Blocker,
};

const StandardtoMQRSeverityMap = {
  [IssueSeverity.Info]: SoftwareImpactSeverity.Info,
  [IssueSeverity.Minor]: SoftwareImpactSeverity.Low,
  [IssueSeverity.Major]: SoftwareImpactSeverity.Medium,
  [IssueSeverity.Critical]: SoftwareImpactSeverity.High,
  [IssueSeverity.Blocker]: SoftwareImpactSeverity.Blocker,
};

export const RULE_TAGS_MOCK = ['awesome', 'cute', 'nice'];

export default class CodingRulesServiceMock {
  rulesActivations: Record<string, RuleActivationAdvanced[]> = {};
  rules: RuleDetails[] = [];
  qualityProfile: Profile[] = [];
  repositories: RuleRepository[] = [];
  isAdmin = false;
  applyWithWarning = false;
  dismissedNoticesEP = false;

  constructor() {
    this.repositories = [
      mockRuleRepository({ key: 'repo1', name: 'Repository 1' }),
      mockRuleRepository({ key: 'repo2', name: 'Repository 2' }),
    ];
    this.qualityProfile = mockQualityProfilesList();
    this.rules = mockRuleDetailsList();
    this.rulesActivations = mockRulesActivationsInQP();

    jest.mocked(updateRule).mockImplementation(this.handleUpdateRule);
    jest.mocked(createRule).mockImplementation(this.handleCreateRule);
    jest.mocked(deleteRule).mockImplementation(this.handleDeleteRule);
    jest.mocked(searchRules).mockImplementation(this.handleSearchRules);
    jest.mocked(getRuleDetails).mockImplementation(this.handleGetRuleDetails);
    jest.mocked(getRuleRepositories).mockImplementation(this.handleGetRuleRepositories);
    jest.mocked(searchQualityProfiles).mockImplementation(this.handleSearchQualityProfiles);
    jest.mocked(getRulesApp).mockImplementation(this.handleGetRulesApp);
    jest.mocked(bulkActivateRules).mockImplementation(this.handleBulkActivateRules);
    jest.mocked(bulkDeactivateRules).mockImplementation(this.handleBulkDeactivateRules);
    jest.mocked(activateRule).mockImplementation(this.handleActivateRule);
    jest.mocked(deactivateRule).mockImplementation(this.handleDeactivateRule);
    jest.mocked(getFacet).mockImplementation(this.handleGetFacet);
    jest.mocked(getRuleTags).mockImplementation(this.handleGetRuleTags);
    jest.mocked(getCurrentUser).mockImplementation(this.handleGetCurrentUser);
    jest.mocked(dismissNotice).mockImplementation(this.handleDismissNotification);
    jest.mocked(getComponentData).mockImplementation(this.handleGetComponentData);
  }

  getRulesWithoutDetails(rules: RuleDetails[]) {
    return rules.map((r) =>
      pick(r, [
        'isTemplate',
        'key',
        'lang',
        'langName',
        'name',
        'params',
        'severity',
        'status',
        'sysTags',
        'tags',
        'type',
        'cleanCodeAttributeCategory',
        'cleanCodeAttribute',
        'impacts',
      ]),
    );
  }

  filterFacet({
    impactSeverities,
    impactSoftwareQualities,
    cleanCodeAttributeCategories,
    languages,
    available_since,
    q,
    types,
    tags,
    is_template,
    template_key,
    repositories,
    qprofile,
    active_impactSeverities,
    severities,
    active_severities,
    sonarsourceSecurity,
    owaspTop10,
    'owaspTop10-2021': owasp2021Top10,
    cwe,
    activation,
    prioritizedRule,
  }: FacetFilter) {
    let filteredRules = this.getRulesFilteredByRemovedStatus();
    if (template_key) {
      filteredRules = filteredRules.filter((r) => r.templateKey === template_key);
    }
    if (cleanCodeAttributeCategories) {
      filteredRules = filteredRules.filter(
        (r) =>
          r.cleanCodeAttributeCategory &&
          cleanCodeAttributeCategories.includes(r.cleanCodeAttributeCategory),
      );
    }
    if (impactSoftwareQualities) {
      filteredRules = filteredRules.filter((r) =>
        r.impacts?.some(({ softwareQuality }) => impactSoftwareQualities.includes(softwareQuality)),
      );
    }
    if (impactSeverities) {
      filteredRules = filteredRules.filter((r) =>
        r.impacts?.some(({ severity }) => impactSeverities.includes(severity)),
      );
    }
    if (severities) {
      filteredRules = filteredRules.filter(
        (r) =>
          r.severity && severities.split(',').some((severity: string) => r.severity === severity),
      );
    }
    if (types) {
      filteredRules = filteredRules.filter((r) => types.includes(r.type));
    }
    if (languages) {
      filteredRules = filteredRules.filter((r) => r.lang && languages.includes(r.lang));
    }
    if (qprofile) {
      const qProfileLang = this.qualityProfile.find((p) => p.key === qprofile)?.language;
      filteredRules = filteredRules
        .filter((r) => r.lang === qProfileLang)
        .filter((r) => {
          const qProfilesInRule = this.rulesActivations[r.key]?.map((ra) => ra.qProfile) ?? [];
          const ruleHasQueriedProfile = qProfilesInRule.includes(qprofile);
          return activation === 'true' ? ruleHasQueriedProfile : !ruleHasQueriedProfile;
        });
    }
    if (available_since) {
      filteredRules = filteredRules.filter(
        (r) => r.createdAt && new Date(r.createdAt) > new Date(available_since),
      );
    }
    if (is_template !== undefined) {
      filteredRules = filteredRules.filter((r) => (is_template ? r.isTemplate : !r.isTemplate));
    }
    if (repositories) {
      filteredRules = filteredRules.filter((r) => r.lang && repositories.includes(r.repo));
    }
    if (sonarsourceSecurity) {
      const matchingRules =
        STANDARDS_TO_RULES[StandardsInformationKey.SONARSOURCE]?.[sonarsourceSecurity] ?? [];
      filteredRules = filteredRules.filter((r) => matchingRules.includes(r.key));
    }
    if (owasp2021Top10) {
      const matchingRules =
        STANDARDS_TO_RULES[StandardsInformationKey.OWASP_TOP10_2021]?.[owasp2021Top10] ?? [];
      filteredRules = filteredRules.filter((r) => matchingRules.includes(r.key));
    }
    if (owaspTop10) {
      const matchingRules =
        STANDARDS_TO_RULES[StandardsInformationKey.OWASP_TOP10]?.[owaspTop10] ?? [];
      filteredRules = filteredRules.filter((r) => matchingRules.includes(r.key));
    }
    if (cwe) {
      const normalizedCwe = cwe.replace(/^CWE-/i, '');
      const matchingRules = STANDARDS_TO_RULES[StandardsInformationKey.CWE]?.[normalizedCwe] ?? [];
      filteredRules = filteredRules.filter((r) => matchingRules.includes(r.key));
    }
    if (q && q.length > 2) {
      filteredRules = filteredRules.filter((r) => r.name.includes(q) || r.key.includes(q));
    }
    if (tags) {
      filteredRules = filteredRules.filter((r) => r.tags?.some((t) => tags.includes(t)));
    }
    if (qprofile && prioritizedRule !== undefined) {
      filteredRules = filteredRules.filter((r) => {
        const qProfilesInRule = this.rulesActivations[r.key] ?? [];
        const ruleHasQueriedProfile = qProfilesInRule.find((q) => q.qProfile === qprofile);
        return prioritizedRule === 'true'
          ? ruleHasQueriedProfile?.prioritizedRule
          : !ruleHasQueriedProfile?.prioritizedRule;
      });
    }
    if (qprofile && active_severities !== undefined) {
      if (activation === 'true') {
        filteredRules = filteredRules.filter((r) => {
          const qProfilesInRule = this.rulesActivations[r.key] ?? [];
          const ruleHasQueriedProfile = qProfilesInRule.find((q) => q.qProfile === qprofile);
          return active_severities.includes(ruleHasQueriedProfile?.severity ?? '');
        });
      } else {
        filteredRules = filteredRules.filter((r) =>
          active_severities.split(',').some((severity: string) => r.severity === severity),
        );
      }
    }

    if (qprofile && active_impactSeverities !== undefined) {
      if (activation === 'true') {
        filteredRules = filteredRules.filter((r) => {
          const qProfilesInRule = this.rulesActivations[r.key] ?? [];
          const ruleHasQueriedProfile = qProfilesInRule.find((q) => q.qProfile === qprofile);

          return ruleHasQueriedProfile?.impacts?.some(({ severity }) => {
            return active_impactSeverities.includes(severity);
          });
        });
      } else {
        filteredRules = filteredRules.filter((r) =>
          r.impacts?.some(({ severity }) => active_impactSeverities.includes(severity)),
        );
      }
    }

    return this.getRulesWithoutDetails(filteredRules);
  }

  setIsAdmin() {
    this.isAdmin = true;
  }

  activateWithWarning() {
    this.applyWithWarning = true;
  }

  reset() {
    this.isAdmin = false;
    this.applyWithWarning = false;
    this.dismissedNoticesEP = false;
    this.rules = mockRuleDetailsList();
    this.rulesActivations = mockRulesActivationsInQP();
  }

  getRulesFilteredByRemovedStatus() {
    return this.rules.filter((r) => r.status !== RuleStatus.Removed);
  }

  allRulesCount() {
    return this.getRulesFilteredByRemovedStatus().length;
  }

  allRulesName() {
    return this.getRulesFilteredByRemovedStatus().map((r) => r.name);
  }

  allQualityProfile(language: string) {
    return this.qualityProfile.filter((qp) => qp.language === language);
  }

  handleGetFacet = (): Promise<{
    facet: { count: number; val: string }[];
    response: RawIssuesResponse;
  }> => {
    return this.reply({
      facet: [
        { count: 135, val: 'project-1' },
        { count: 65, val: 'project-2' },
        { count: 13, val: 'project-3' },
      ],
      response: {
        components: [],
        effortTotal: 0,
        facets: [],
        issues: [],
        languages: [],
        paging: { total: 213, pageIndex: 1, pageSize: 1 },
      },
    });
  };

  handleGetRuleDetails = (parameters: {
    actives?: boolean;
    key: string;
  }): Promise<{ actives?: RuleActivationAdvanced[]; rule: RuleDetails }> => {
    const rule = this.rules.find((r) => r.key === parameters.key);
    if (!rule) {
      return Promise.reject({
        errors: [{ msg: `No rule has been found for id ${parameters.key}` }],
      });
    }
    return this.reply({
      actives: parameters.actives ? (this.rulesActivations[rule.key] ?? []) : undefined,
      rule,
    });
  };

  handleGetRuleRepositories = (parameters: {
    q: string;
  }): Promise<Array<{ key: string; language: string; name: string }>> => {
    return this.reply(this.repositories.filter((r) => r.name.includes(parameters.q)));
  };

  handleUpdateRule = (data: RulesUpdateRequest): Promise<RuleDetails> => {
    // find rule if key is in the list of rules or key is a part of 'repo:key'
    const rule = this.rules.find((r) => data.key.split(':').some((part) => part === r.key));
    if (rule === undefined) {
      return Promise.reject({
        errors: [{ msg: `No rule has been found for id ${data.key}` }],
      });
    }

    const template = this.rules.find((r) => r.key === rule.templateKey);

    // Lets not convert the md to html in test.
    rule.mdDesc = data.markdownDescription !== undefined ? data.markdownDescription : rule.mdDesc;
    rule.htmlDesc =
      data.markdownDescription !== undefined ? data.markdownDescription : rule.htmlDesc;
    rule.mdNote = data.markdown_note !== undefined ? data.markdown_note : rule.mdNote;
    rule.htmlNote = data.markdown_note !== undefined ? data.markdown_note : rule.htmlNote;
    rule.name = data.name !== undefined ? data.name : rule.name;
    rule.status = rule.status === RuleStatus.Removed ? RuleStatus.Ready : rule.status;
    rule.cleanCodeAttribute =
      data.cleanCodeAttribute !== undefined ? data.cleanCodeAttribute : rule.cleanCodeAttribute;
    rule.impacts = data.impacts !== undefined ? data.impacts : rule.impacts;
    rule.type = data.type !== undefined ? data.type : rule.type;
    rule.severity = data.severity !== undefined ? data.severity : rule.severity;

    if (template && data.params) {
      rule.params = [];
      data.params.split(';').forEach((param) => {
        const parts = param.split('=');
        const paramsDef = template.params?.find((p) => p.key === parts[0]);
        rule.params?.push({
          key: parts[0],
          type: paramsDef?.type || 'STRING',
          defaultValue: trim(parts[1], '" '),
          htmlDesc: paramsDef?.htmlDesc,
        });
      });
    }

    rule.remFnBaseEffort =
      data.remediation_fn_base_effort !== undefined
        ? data.remediation_fn_base_effort
        : rule.remFnBaseEffort;
    rule.remFnType =
      data.remediation_fn_type !== undefined ? data.remediation_fn_type : rule.remFnType;
    rule.status = data.status !== undefined ? data.status : rule.status;
    rule.tags = data.tags !== undefined ? data.tags.split(',') : rule.tags;

    return this.reply(rule);
  };

  handleCreateRule = (data: CreateRuleData) => {
    const newRule = mockRestRuleDetails({
      descriptionSections: [
        {
          key: RuleDescriptionSections.Default,
          content: data.markdownDescription,
        },
      ],
      ...pick(data, ['templateKey', 'name', 'status', 'cleanCodeAttribute', 'impacts', 'key']),
      parameters: data.parameters as RuleParameter[],
    });

    const ruleFromTemplateWithSameKey = this.rules.find(
      (rule) => rule.templateKey === newRule.templateKey && newRule.key.split(':')[1] === rule.key,
    );

    if (ruleFromTemplateWithSameKey?.status === RuleStatus.Removed) {
      return Promise.reject({
        status: HttpStatus.Conflict,
        errors: [{ msg: `Rule with the same was removed before` }],
      });
    } else if (ruleFromTemplateWithSameKey) {
      return Promise.reject({
        errors: [{ msg: `A rule with key ${newRule.key} already exists` }],
      });
    }

    this.rules.push(mapRestRuleToRule(newRule));

    return this.reply(newRule);
  };

  handleDeleteRule = (data: { key: string }) => {
    this.rules = this.rules.filter((r) => r.key !== data.key);
    return this.reply(undefined);
  };

  handleSearchRules = async ({
    facets,
    types,
    languages,
    p,
    ps,
    available_since,
    impactSeverities,
    impactSoftwareQualities,
    active_impactSeverities,
    active_severities,
    severities,
    repositories,
    qprofile,
    sonarsourceSecurity,
    owaspTop10,
    'owaspTop10-2021': owasp2021Top10,
    complianceStandards,
    cwe,
    tags,
    q,
    rule_key,
    is_template,
    template_key,
    activation,
    cleanCodeAttributeCategories,
    prioritizedRule,
  }: SearchRulesQuery): Promise<SearchRulesResponse> => {
    const standards = await getStandards();

    // Parse complianceStandards parameter to extract individual standard values
    const parsedComplianceStandards = parseComplianceStandards(complianceStandards);
    const effectiveCwe = parsedComplianceStandards.cwe?.[0] ?? cwe;
    const effectiveOwaspTop10 = parsedComplianceStandards.owaspTop10?.[0] ?? owaspTop10;
    const effectiveOwasp2021Top10 =
      parsedComplianceStandards['owaspTop10-2021']?.[0] ?? owasp2021Top10;
    const effectiveOwaspTop102025 = parsedComplianceStandards['owaspTop10-2025']?.[0];
    const effectiveOwaspMobileTop102024 = parsedComplianceStandards['owaspMobileTop10-2024']?.[0];
    const effectiveSonarsourceSecurity =
      parsedComplianceStandards.sonarsourceSecurity?.[0] ?? sonarsourceSecurity;
    const effectiveStigV5R3 = parsedComplianceStandards['stig-ASD_V5R3']?.[0];
    const effectiveStigV6 = parsedComplianceStandards['stig-ASD_V6']?.[0];

    const facetCounts: Array<{
      property: string;
      values: { count: number; val: string }[];
    }> = [];
    for (const facet of facets?.split(',') ?? []) {
      // If we can count facet values from the list of rules
      if (FACET_RULE_MAP[facet]) {
        const counts = countBy(this.rules.map((r) => r[FACET_RULE_MAP[facet]]));
        const values = Object.keys(counts).map((val) => ({
          val,
          count: counts[val],
        }));
        facetCounts.push({
          property: facet,
          values,
        });
      } else if (facet.includes('impactSeverities')) {
        const isActive = facet.startsWith('active_');
        const counts = countBy(
          this.rules
            .map((r) => {
              const rule = isActive
                ? (this.rulesActivations[r.key]?.find((a) => a.qProfile === qprofile) ??
                  ({} as RuleDetails))
                : r;
              return uniq(rule.impacts?.map((i) => i.severity));
            })
            .flat(),
        );
        const values = IMPACT_SEVERITIES.map((val) => ({
          val,
          count: counts[val] ?? 0,
        }));
        facetCounts.push({
          property: facet,
          values,
        });
      } else if (facet === 'repositories') {
        facetCounts.push({
          property: facet,
          values: this.repositories.map((repo) => ({
            val: repo.key,
            count: this.rules.filter((r) => r.repo === repo.key).length,
          })),
        });
      } else if (facet === 'complianceStandards') {
        const complianceStandardsFacets = Object.values(StandardsInformationKey)
          .filter((key) => standards[key])
          .map((key) => ({
            property: COMPLIANCE_STANDARDS_BACKEND_KEYS[key],
            values: Object.keys(standards[key]).map((val: string) => ({
              val,
              count: 1,
            })),
          }));

        facetCounts.push(...complianceStandardsFacets);
      } else if (typeof (standards as Record<string, object>)[facet] === 'object') {
        facetCounts.push({
          property: facet,
          values: Object.keys((standards as Record<string, object>)[facet]).map((val: string) => ({
            val,
            count: 1,
          })),
        });
      } else {
        facetCounts.push({
          property: facet,
          values: [],
        });
      }
    }
    const currentPs = ps ?? 10;
    const currentP = p ?? 1;
    let filteredRules: Rule[] = [];
    if (rule_key) {
      filteredRules = this.getRulesWithoutDetails(this.rules).filter((r) => r.key === rule_key);
    } else {
      filteredRules = this.filterFacet({
        qprofile,
        languages,
        available_since,
        q,
        impactSeverities,
        impactSoftwareQualities,
        cleanCodeAttributeCategories,
        repositories,
        types,
        tags,
        is_template,
        template_key,
        severities,
        active_impactSeverities,
        active_severities,
        cwe: effectiveCwe,
        owaspTop10: effectiveOwaspTop10,
        'owaspTop10-2021': effectiveOwasp2021Top10,
        'owaspTop10-2025': effectiveOwaspTop102025,
        'owaspMobileTop10-2024': effectiveOwaspMobileTop102024,
        sonarsourceSecurity: effectiveSonarsourceSecurity,
        'stig-ASD_V5R3': effectiveStigV5R3,
        'stig-ASD_V6': effectiveStigV6,
        activation,
        prioritizedRule,
      });
    }

    const responseRules = filteredRules.slice((currentP - 1) * currentPs, currentP * currentPs);
    return this.reply({
      actives: qprofile ? this.rulesActivations : undefined,
      rules: responseRules,
      facets: facetCounts,
      paging: mockPaging({
        total: filteredRules.length,
        pageIndex: currentP,
        pageSize: currentPs,
      }),
    });
  };

  handleBulkActivateRules = () => {
    if (this.applyWithWarning) {
      return this.reply({
        succeeded: this.getRulesFilteredByRemovedStatus().length - 1,
        failed: 1,
        errors: [
          {
            msg: 'c rule c:S6069 cannot be activated on cpp profile SonarSource',
          },
        ],
      });
    }
    return this.reply({
      succeeded: this.getRulesFilteredByRemovedStatus().length,
      failed: 0,
      errors: [],
    });
  };

  handleBulkDeactivateRules = () => {
    return this.reply({
      succeeded: this.getRulesFilteredByRemovedStatus().length,
      failed: 0,
    });
  };

  handleActivateRule: typeof activateRule = (data) => {
    if (data.reset) {
      const parentQP = this.qualityProfile.find((p) => p.key === data.key)?.parentKey!;
      const parentActivation = this.rulesActivations[data.rule]?.find(
        (activation) => activation.qProfile === parentQP,
      )!;
      const parentParams = parentActivation?.params ?? [];
      const activation = this.rulesActivations[data.rule]?.find(
        ({ qProfile }) => qProfile === data.key,
      )!;
      activation.inherit = 'INHERITED';
      activation.prioritizedRule = parentActivation?.prioritizedRule ?? false;
      activation.severity = parentActivation?.severity ?? 'MAJOR';
      activation.impacts = parentActivation?.impacts ?? [
        {
          softwareQuality: SoftwareQuality.Maintainability,
          severity: SoftwareImpactSeverity.Medium,
        },
      ];
      activation.params = parentParams;

      return this.reply(undefined);
    }

    const currentActivation = this.rulesActivations[data.rule]?.find(
      (a) => a.qProfile === data.key,
    );
    if (
      currentActivation &&
      isEqual(
        currentActivation.params,
        Object.entries(data.params ?? {}).map(([key, value]) => ({
          key,
          value,
        })),
      ) &&
      (!data.severity || currentActivation.severity === data.severity) &&
      currentActivation.prioritizedRule === data.prioritizedRule &&
      (!data.impacts ||
        isEqual(
          currentActivation.impacts,
          Object.entries(data.impacts).map(([softwareQuality, severity]) => ({
            softwareQuality,
            severity,
          })),
        ))
    ) {
      return this.reply(undefined);
    }

    const ruleImpacts = this.rules.find((r) => r.key === data.rule)?.impacts ?? [];
    const inheritedImpacts =
      this.rulesActivations[data.rule]?.find(({ qProfile }) => qProfile === data.key)?.impacts ??
      [];
    const severity = data.impacts
      ? MQRtoStandardSeverityMap[data.impacts[SoftwareQuality.Maintainability]]
      : data.severity;
    const impacts = data.severity
      ? [
          ...ruleImpacts.filter(
            (impact) =>
              impact.softwareQuality !== SoftwareQuality.Maintainability &&
              !inheritedImpacts.some((i) => i.softwareQuality === impact.softwareQuality),
          ),
          ...inheritedImpacts.filter(
            (impact) => impact.softwareQuality !== SoftwareQuality.Maintainability,
          ),
          {
            softwareQuality: SoftwareQuality.Maintainability,
            severity:
              StandardtoMQRSeverityMap[data.severity as keyof typeof StandardtoMQRSeverityMap],
          },
        ]
      : Object.entries(data.impacts ?? {}).map(
          ([softwareQuality, severity]: [SoftwareQuality, SoftwareImpactSeverity]) => ({
            softwareQuality,
            severity,
          }),
        );

    const nextActivations = [
      mockRuleActivationAdvanced({
        qProfile: data.key,
        severity,
        impacts,
        prioritizedRule: data.prioritizedRule,
        params: Object.entries(data.params ?? {}).map(([key, value]) => ({
          key,
          value,
        })),
      }),
    ];

    const inheritingProfiles = this.qualityProfile.filter(
      (p) => p.isInherited && p.parentKey === data.key,
    );
    nextActivations.push(
      ...inheritingProfiles.map((profile) =>
        mockRuleActivationAdvanced({
          qProfile: profile.key,
          severity,
          impacts,
          prioritizedRule: data.prioritizedRule,
          inherit: 'INHERITED',
          params: Object.entries(data.params ?? {}).map(([key, value]) => ({
            key,
            value,
          })),
        }),
      ),
    );

    if (!this.rulesActivations[data.rule]) {
      this.rulesActivations[data.rule] = nextActivations;
      return this.reply(undefined);
    }

    nextActivations.forEach((nextActivation) => {
      const activationIndex = this.rulesActivations[data.rule]?.findIndex(
        ({ qProfile }) => qProfile === nextActivation.qProfile,
      );

      if (activationIndex !== -1) {
        this.rulesActivations[data.rule][activationIndex] = {
          ...nextActivation,
          inherit: 'OVERRIDES',
        };
      } else {
        this.rulesActivations[data.rule].push(nextActivation);
      }
    });

    return this.reply(undefined);
  };

  handleDeactivateRule = (data: { key: string; rule: string }) => {
    this.rulesActivations[data.rule] = this.rulesActivations[data.rule]?.filter(
      (activation) => activation.qProfile !== data.key,
    );
    return this.reply(undefined);
  };

  handleSearchQualityProfiles = ({
    language,
  }: SearchQualityProfilesParameters = {}): Promise<SearchQualityProfilesResponse> => {
    let profiles: Profile[] = this.isAdmin
      ? this.qualityProfile.map((p) => ({ ...p, actions: { edit: true } }))
      : this.qualityProfile;
    if (language) {
      profiles = profiles.filter((p) => p.language === language);
    }
    return this.reply({ profiles });
  };

  handleGetRuleTags = (data: { ps?: number; q: string }) => {
    return this.reply(RULE_TAGS_MOCK.filter((tag) => tag.includes(data.q)));
  };

  handleGetRulesApp = () => {
    return this.reply({
      canWrite: this.isAdmin,
      repositories: this.repositories,
    });
  };

  handleGetCurrentUser = () => {
    return this.reply(
      mockCurrentUser({
        dismissedNotices: {
          educationPrinciples: this.dismissedNoticesEP,
        },
      }),
    );
  };

  handleDismissNotification = (noticeType: NoticeType) => {
    if (noticeType === NoticeType.EDUCATION_PRINCIPLES) {
      this.dismissedNoticesEP = true;
      return this.reply(undefined);
    }

    return Promise.reject();
  };

  handleGetComponentData = (data: { component: string }) => {
    return Promise.resolve({
      ancestors: [],
      component: {
        key: data.component,
        name: data.component.toUpperCase().split(/[ -.]/g).join(' '),
        qualifier: ComponentQualifier.Project,
        visibility: Visibility.Public,
      },
    });
  };

  reply<T>(response: T): Promise<T> {
    return Promise.resolve(cloneDeep(response));
  }
}
