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

const { useEnum } = require('./lib/use-enum');

module.exports = useEnum(
  [
    'alert_status',
    'blocker_violations',
    'branch_coverage',
    'bugs',
    'burned_budget',
    'business_value',
    'classes',
    'code_smells',
    'cognitive_complexity',
    'comment_lines',
    'comment_lines_data',
    'comment_lines_density',
    'complexity',
    'conditions_to_cover',
    'confirmed_issues',
    'coverage',
    'critical_violations',
    'development_cost',
    'directories',
    'duplicated_blocks',
    'duplicated_files',
    'duplicated_lines',
    'duplicated_lines_density',
    'duplications_data',
    'effort_to_reach_maintainability_rating_a',
    'executable_lines_data',
    'false_positive_issues',
    'filename_size',
    'filename_size_rating',
    'files',
    'functions',
    'generated_lines',
    'generated_ncloc',
    'info_violations',
    'last_change_on_maintainability_rating',
    'last_change_on_releasability_rating',
    'last_change_on_reliability_rating',
    'last_change_on_security_rating',
    'last_change_on_security_review_rating',
    'last_commit_date',
    'leak_projects',
    'line_coverage',
    'lines',
    'lines_to_cover',
    'maintainability_rating_effort',
    'major_violations',
    'minor_violations',
    'ncloc',
    'ncloc_data',
    'ncloc_language_distribution',
    'new_blocker_violations',
    'new_branch_coverage',
    'new_bugs',
    'new_code_smells',
    'new_conditions_to_cover',
    'new_coverage',
    'new_critical_violations',
    'new_development_cost',
    'new_duplicated_blocks',
    'new_duplicated_lines',
    'new_duplicated_lines_density',
    'new_info_violations',
    'new_line_coverage',
    'new_lines',
    'new_lines_to_cover',
    'new_maintainability_rating',
    'new_major_violations',
    'new_minor_violations',
    'new_reliability_rating',
    'new_reliability_remediation_effort',
    'new_security_hotspots',
    'new_security_hotspots_reviewed',
    'new_security_rating',
    'new_security_remediation_effort',
    'new_security_review_rating',
    'new_sqale_debt_ratio',
    'new_technical_debt',
    'new_uncovered_conditions',
    'new_uncovered_lines',
    'new_violations',
    'new_vulnerabilities',
    'open_issues',
    'projects',
    'public_api',
    'public_documented_api_density',
    'public_undocumented_api',
    'quality_gate_details',
    'quality_profiles',
    'releasability_effort',
    'releasability_rating',
    'reliability_rating',
    'reliability_rating_effort',
    'reliability_remediation_effort',
    'reopened_issues',
    'security_hotspots',
    'security_hotspots_reviewed',
    'security_rating',
    'security_rating_effort',
    'security_remediation_effort',
    'security_review_rating',
    'security_review_rating_effort',
    'skipped_tests',
    'sonarjava_feedback',
    'sqale_debt_ratio',
    'sqale_index',
    'sqale_rating',
    'statements',
    'team_at_sonarsource',
    'team_size',
    'test_errors',
    'test_execution_time',
    'test_failures',
    'test_success_density',
    'tests',
    'uncovered_conditions',
    'uncovered_lines',
    'violations',
    'vulnerabilities',
    'wont_fix_issues',
  ],
  'MetricKey',
  'representing metric keys',
);
