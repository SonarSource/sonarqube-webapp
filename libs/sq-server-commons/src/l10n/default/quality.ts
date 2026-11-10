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

/* eslint-disable eslint-js/camelcase */

export const qualityMessages = {
  'issues.x_results_found': '{count, plural, one {# result found} other {# results found}}',
  'quality_gate_history.page_title': 'Quality gate history',
  'quality_gate_history.page_description':
    'This page helps you identify releases made while quality gate was failing.',
  'quality_gate_history.intro':
    'Each version released on the main branch is marked {safe} when its quality gate passed at release time, or {risky} when it failed.',
  'quality_gate_history.safe': 'safe',
  'quality_gate_history.risky': 'risky',
  'quality_gate_history.percent': '{value}%',
  'quality_gate_history.period.all': 'All time',
  'quality_gate_history.period.30d': '30 days',
  'quality_gate_history.period.6m': '6 months',
  'quality_gate_history.period.1y': '1 year',
  'quality_gate_history.timeframe.30d': '30 days',
  'quality_gate_history.timeframe.6m': '6 months',
  'quality_gate_history.timeframe.1y': 'year',
  'quality_gate_history.link.label': 'View quality gate history',
  'quality_gate_history.last_released': 'Last released: {version} on {date}',
  'quality_gate_history.safe_releases': 'Safe releases',
  'quality_gate_history.risky_releases': 'Risky releases',
  'quality_gate_history.risky_releases.help':
    'A release is risky when its quality gate was failing at the time the version was released. You can configure your CI tool to fail the pipeline when quality gate fails.',
  'quality_gate_history.risky_releases.link': 'Understand quality gates',
  'quality_gate_history.releases_count': '{count} of {total} releases',
  'quality_gate_history.legend.OK': 'Gate passed (safe)',
  'quality_gate_history.legend.ERROR': 'Gate failed (risky)',
  'quality_gate_history.empty.non_compatible.title': "This project isn't using Project Version",
  'quality_gate_history.empty.non_compatible.description':
    'Set your New Code definition to the "Previous version" option to track the quality gate result of each released version.',
  'quality_gate_history.empty.non_compatible.cta': 'Configure New Code definition',
  'quality_gate_history.empty.no_releases.title': 'No versions have been released yet',
  'quality_gate_history.empty.no_releases.description':
    'Historical version releases will appear here after more releases are done.',
  'quality_gate_history.empty.no_releases.cta': 'How does versioning work at Sonar',
  'quality_gate_history.empty.no_releases_in_period.title':
    'No version releases for the past {period}',
  'quality_gate_history.empty.no_releases_in_period.description':
    "Try widening the timeframe to see more of this project's release history.",

  //------------------------------------------------------------------------------
  //
  // ADMIN PAGE TITLES and descriptions
  //
  //------------------------------------------------------------------------------

  'coding_rules.page': 'Rules',

  'project_quality_gate.page': 'Quality gate',
  'project_quality_gate.page.description':
    'Choose which quality gate is associated with this project.',
  'project_quality_gate.aica_builtin_gate_help': 'Recommended quality gate for agentic work',
  'project_quality_gate.sonar_way_help': 'Recommended quality gate for human centered work',
  'quality_profiles.page': 'Quality profiles',
  'quality_gates.page': 'Quality gates',
  'issues.page': 'Issues',
  'issues.skip_to_filters': 'Skip to issue filters',
  'issues.skip_to_list': 'Skip to issues list',

  'hotspots.page': 'Security Hotspots',
  'hotspots.no_hotspots.title': 'There are no Security Hotspots to review.',
  'hotspots.no_hotspots.description':
    'Next time you analyze a piece of code that contains a potential security risk, it will show up here.',
  'hotspots.no_hotspots_for_file.title': 'The selected file contains no hotspots.',
  'hotspots.no_hotspots_for_file.description':
    'Go back and select another file, or click "Show all hotspots".',
  'hotspots.no_hotspots_for_filters.title':
    "We couldn't find any results matching the selected criteria.",
  'hotspots.no_hotspots_for_filters.description': 'Try changing the filters to get some results.',
  'hotspots.no_hotspots_for_keys.title': 'The requested hotspots no longer exist.',
  'hotspots.no_hotspots_for_keys.description':
    'They have been closed because the code involved has been changed or removed.',
  'hotspots.learn_more': 'Learn more about Security Hotspots',
  'hotspots.list': 'List of Security Hotspots',
  'hotspots.list_title': '{0} Security Hotspots',
  'hotspots.list_title.TO_REVIEW': '{0} Security Hotspots to review',
  'hotspots.list_title.ACKNOWLEDGED': '{0} Security Hotspots reviewed as acknowledged',
  'hotspots.list_title.FIXED': '{0} Security Hotspots reviewed as fixed',
  'hotspots.list_title.SAFE': '{0} Security Hotspots reviewed as safe',
  'hotspots.risk_exposure': 'Review priority',
  'hotspots.permalink_copy': 'Copy permalink to current hotspot: "{title}"',

  'hotspots.tabs.code': 'Where is the risk?',
  'hotspots.tabs.risk_description': "What's the risk?",
  'hotspots.tabs.vulnerability_description': 'Assess the risk',
  'hotspots.tabs.fix_recommendations': 'How can I fix it?',
  'hotspots.tabs.activity': 'Activity',
  'hotspots.review_history.created': 'created Security Hotspot',
  'hotspots.review_history.comment_added': 'added a comment',
  'hotspots.comment.field': 'Comment:',
  'hotspots.comment.submit': 'Comment',
  'hotspots.open_in_ide.success': 'Success. Switch to your IDE to see the security hotspot.',
  'hotspots.open_in_ide.failure':
    "Unable to connect to your IDE to open the Security Hotspot. Please make sure you're running the latest version of SonarQube for IDE.",

  'hotspots.assignee.change_user': 'Click to change assignee',
  'hotspots.status.cannot_change_status': "Changing a hotspot's status requires permission.",
  'hotspots.status.review': 'Review',
  'hotspots.status.review_title': 'Review Security Hotspot',
  'hotspots.status.select': 'Select a status',
  'hotspots.status.add_comment': 'Add a comment',
  'hotspots.status.add_comment_optional': 'Add a comment (Optional)',
  'hotspots.status.change_status': 'Change status',

  'hotspots.status_option.TO_REVIEW': 'To review',
  'hotspots.status_option.TO_REVIEW.description':
    'This security hotspot needs to be reviewed to assess whether the code poses a risk.',
  'hotspots.status_option.ACKNOWLEDGED': 'Acknowledged',
  'hotspots.status_option.ACKNOWLEDGED.description':
    'The code has been reviewed and does pose a risk. A fix is required.',
  'hotspots.status_option.FIXED': 'Fixed',
  'hotspots.status_option.FIXED.description':
    'The code has been reviewed and modified to follow the recommended secure coding practices.',
  'hotspots.status_option.SAFE': 'Safe',
  'hotspots.status_option.SAFE.description':
    'The code has been reviewed and does not pose a risk. It does not need to be modified.',
  'hotspots.no_associated_lines':
    'This Security Hotspot is not associated with any specific lines of code.',
  'hotspots.congratulations': 'Congratulations!',
  'hotspots.find_in_status_filter_x':
    ' You can find it again by setting the status filter to {status_label}.',
  'hotspots.successful_status_change_to_x': 'The Security Hotspot was successfully changed to {0}.',
  'hotspots.x_done_keep_going': '{percentage} of the Security Hotspots have been reviewed.',
  'hotspots.see_x_hotspots': 'See "{0}" Security Hotspots',
  'hotspots.continue_to_next_hotspot': 'Continue Reviewing',

  'hotspots.reviewed.tooltip':
    'Percentage of open Security Hotspots that have been reviewed (Acknowledged, Fixed or Safe)',

  'hotspots.assign.success': 'Security Hotspot was successfully assigned to {0}',
  'hotspots.assign.unassign.success': 'Security Hotspot was successfully unassigned',
  'hotspots.update.success': 'Update successful',
  'hotspots.success_dialog.do_not_show': "Don't show this dialog next time",

  'hotspots.deprecated_feature_warning.title': 'The concept of Security Hotspots is deprecated',
  'hotspots.deprecated_feature_warning.description':
    'Security Hotspot findings now appear as security issues or vulnerabilities in the Issues page. <link>Learn more in the documentation</link>.',

  //------------------------------------------------------------------------------
  //
  // ISSUES
  //
  //------------------------------------------------------------------------------

  'issues.on_file_x': 'Issues on file {file}',
  'issue.create_tag': 'Create Tag',
  'issue.tags': 'Tags',
  'issue.assign.assigned_to_x_click_to_change': 'Assigned to {user}, click to change',
  'issue.assign.unassigned_click_to_assign': 'Unassigned, click to assign issue',
  'issue.assign.formlink': 'Assign',
  'issue.quick_fix': 'Quick fix',
  'issue.quick_fix_available_with_sonarlint_no_link': 'Quick fix available in SonarQube for IDE',
  'issue.details.assignee': 'Assignee',
  'issue.details.code_attribute': 'Code Attribute',
  'issue.details.properties': 'Properties',
  'issue.details.software_quality_impacts': 'Software quality impacts',
  'issue.details.tags': 'Tags',
  'issue.details.type': 'Type',
  'issue.details.status': 'Status',
  'issue.comment.add_comment.submit': 'Comment',
  'issue.comment.enter_comment': 'Enter Comment',
  'issue.comment.formlink': 'Comment',
  'issue.comment.edit': 'Edit comment',
  'issue.comment.delete': 'Delete comment',
  'issue.comment.delete_confirm_message': 'Do you want to delete this comment?',
  'issue.back_to_issues_list': 'Back to issues list',
  'issue.send_notifications': 'Send Notifications',
  'issue.label': 'Issue on file {file} and line {line} - {issue},',
  'issue.why_this_issue': 'Why is this an issue?',
  'issue.why_this_issue.long':
    "Why is this an issue? Open the rule's details at the bottom of the page.",
  'issue.severity.updated_notification.link.mqr': "This issue's",
  'issue.severity.updated_notification':
    '{issueLink, select, other { {issueLink} }} {quality, select, other { {quality} }} severity was changed from {before} to {after}',
  'issue.change_status': 'Change Status',

  'issue.transition.title': 'Change issue status',
  'issue.transition.status': 'Issue status',
  'issue.transition.status_deprecated': 'Deprecated issue status',
  'issue.transition.status_in_sandbox':
    "Issues that don't affect the quality gate or measures, but should be triaged to avoid technical debt accumulation",
  'issue.transition.in_sandbox_helptext':
    'If "In sandbox" status is changed, it can\'t be assigned again',
  'issue.transition.status_change': 'Status change',
  'issue.transition.go_back_change_status': 'Go back to status change',
  'issue.transition.change_status': 'Change status',

  'issue.sandbox.title': 'Issue sandbox',
  'issue.sandbox.description':
    'Issues that don’t affect the quality gate or measures, but should be triaged to avoid technical debt accumulation. Change their status and bring them back to the workflow.',
  'issue.sandbox.includes_blockers': 'Includes blocker issues',
  'issue.sandbox.see_x_sandboxed_issues':
    'See the list of {count} {quality} issues in sandbox. {hasBlockers, select, true {Includes blocker issues.} other {}}',

  'issue.tabs.code': 'Where is the issue?',
  'issue.location_x': 'Location {0}',
  'issue.closed.file_level':
    'This issue is {status}. It was detected in the file below and is no longer being detected.',
  'issue.closed.project_level':
    'This issue is {status}. It was detected in the project below and is no longer being detected.',
  'issue.prioritized_rule.description':
    'The associated rule has been designated as a priority in the quality profile, indicating that all corresponding issues in Overall Code should be fixed.',

  'issues.action_select': 'Select issue',
  'issues.action_select.label': 'Select issue {0}',

  'issue.type.CODE_SMELL': 'Code smell',
  'issue.type.BUG': 'Bug',
  'issue.type.VULNERABILITY': 'Vulnerability',
  'issue.type.SECURITY_HOTSPOT': 'Security Hotspot',
  'issue.type.SECURITY_HOTSPOT.plural': 'Security Hotspots',
  'issue.type.CODE_SMELL.plural': 'Code Smells',
  'issue.type.BUG.plural': 'Bugs',
  'issue.type.VULNERABILITY.plural': 'Vulnerabilities',
  'issue.type.tooltip': '{severity} severity.',
  'issue.type.tooltip_with_change': '{severity} severity. Click to change.',
  'issue.type.deprecation.title': 'Issue types are deprecated and can no longer be modified.',
  'issue.type.deprecation.filter_by': 'You can now filter issues by:',
  'issue.type.deprecation.documentation': 'Documentation',

  'issue.type.severity.button.popover':
    '{type} of {severity} severity . Click for more information.',
  'issue.type.severity.button.change':
    '{type} of {severity} severity . Click to change the severity.',

  'issue.impact.severity.tooltip':
    'This issue has a {severity} impact on the {quality} of your software.',

  'issue.clean_code_attribute_category.CONSISTENT': 'Consistency',
  'issue.clean_code_attribute_category.INTENTIONAL': 'Intentionality',
  'issue.clean_code_attribute_category.ADAPTABLE': 'Adaptability',
  'issue.clean_code_attribute_category.RESPONSIBLE': 'Responsibility',

  'cct.clean_code_attribute_category.CONSISTENT': 'Consistency',
  'cct.clean_code_attribute_category.CONSISTENT.title':
    'This is a consistency {type, select, rule {rule} other {issue}}.',
  'cct.clean_code_attribute_category.CONSISTENT.advice':
    'To be consistent, the code needs to be written in a uniform and conventional way.',
  'cct.clean_code_attribute_category.INTENTIONAL': 'Intentionality',
  'cct.clean_code_attribute_category.INTENTIONAL.title':
    'This is an intentionality {type, select, rule {rule} other {issue}}.',
  'cct.clean_code_attribute_category.INTENTIONAL.advice':
    'To be intentional, the code content needs to be precise and purposeful.',
  'cct.clean_code_attribute_category.ADAPTABLE': 'Adaptability',
  'cct.clean_code_attribute_category.ADAPTABLE.title':
    'This is an adaptability {type, select, rule {rule} other {issue}}.',
  'cct.clean_code_attribute_category.ADAPTABLE.advice':
    'To be adaptable, the code needs to be structured to be easy to evolve and develop with confidence.',
  'cct.clean_code_attribute_category.RESPONSIBLE': 'Responsibility',
  'cct.clean_code_attribute_category.RESPONSIBLE.title':
    'This is a responsibility {type, select, rule {rule} other {issue}}.',
  'cct.clean_code_attribute_category.RESPONSIBLE.advice':
    'To be responsible, the code must take into account its ethical obligations on data and potential impact of societal norms.',

  'cct.clean_code_attribute.CLEAR': 'Not clear',
  'cct.clean_code_attribute.CLEAR.rule': 'Clear',
  'cct.clean_code_attribute.CLEAR.issue.title':
    'This is an intentionality issue, the code is not clear enough.',
  'cct.clean_code_attribute.CLEAR.rule.title':
    'This is an intentionality rule, the code should be clear.',
  'cct.clean_code_attribute.CLEAR.advice':
    'To be clear, the code needs to be self-explanatory and transparently communicate its functionality.',
  'cct.clean_code_attribute.COMPLETE': 'Not complete',
  'cct.clean_code_attribute.COMPLETE.rule': 'Complete',
  'cct.clean_code_attribute.COMPLETE.issue.title':
    'This is an intentionality issue, the code is not complete enough.',
  'cct.clean_code_attribute.COMPLETE.rule.title':
    'This is an intentionality rule, the code should be complete.',
  'cct.clean_code_attribute.COMPLETE.advice':
    'To be complete, the code must be functional and achieve its implied goals through comprehensive, adequate, and thorough code constructs.',
  'cct.clean_code_attribute.CONVENTIONAL': 'Not conventional',
  'cct.clean_code_attribute.CONVENTIONAL.rule': 'Conventional',
  'cct.clean_code_attribute.CONVENTIONAL.issue.title':
    'This is a consistency issue, the code is not conventional enough.',
  'cct.clean_code_attribute.CONVENTIONAL.rule.title':
    'This is a consistency rule, the code should be conventional.',
  'cct.clean_code_attribute.CONVENTIONAL.advice':
    'To be conventional, the code needs to perform tasks with expected instructions, and adhere to a single choice across all instances when faced with equally good options.',
  'cct.clean_code_attribute.DISTINCT': 'Not distinct',
  'cct.clean_code_attribute.DISTINCT.rule': 'Distinct',
  'cct.clean_code_attribute.DISTINCT.issue.title':
    'This is an adaptability issue, the code is not distinct enough.',
  'cct.clean_code_attribute.DISTINCT.rule.title':
    'This is an adaptability rule, the code should be distinct.',
  'cct.clean_code_attribute.DISTINCT.advice':
    'To be distinct, the code needs to have procedures and data that are unique and distinctive, without unnecessary duplication.',
  'cct.clean_code_attribute.EFFICIENT': 'Not efficient',
  'cct.clean_code_attribute.EFFICIENT.rule': 'Efficient',
  'cct.clean_code_attribute.EFFICIENT.issue.title':
    'This is an intentionality issue, the code is not efficient enough.',
  'cct.clean_code_attribute.EFFICIENT.rule.title':
    'This is an intentionality rule, the code should be efficient.',
  'cct.clean_code_attribute.EFFICIENT.advice':
    'To be efficient, the code needs to use resources without needless waste, and prioritize economical options when available.',
  'cct.clean_code_attribute.FOCUSED': 'Not focused',
  'cct.clean_code_attribute.FOCUSED.rule': 'Focused',
  'cct.clean_code_attribute.FOCUSED.issue.title':
    'This is an adaptability issue, the code is not focused enough.',
  'cct.clean_code_attribute.FOCUSED.rule.title':
    'This is an adaptability rule, the code should be focused.',
  'cct.clean_code_attribute.FOCUSED.advice':
    'To be focused, the code needs to have a single, narrow, and specific scope. Each of its units should have only one concise purpose.',
  'cct.clean_code_attribute.FORMATTED': 'Not formatted',
  'cct.clean_code_attribute.FORMATTED.rule': 'Formatted',
  'cct.clean_code_attribute.FORMATTED.issue.title':
    'This is a consistency issue, the code is not formatted enough.',
  'cct.clean_code_attribute.FORMATTED.rule.title':
    'This is a consistency rule, the code should be formatted.',
  'cct.clean_code_attribute.FORMATTED.advice':
    'To be formatted, the code needs to be presented in a systematic and regular way, with the same non-semantic choices used over all the codebase.',
  'cct.clean_code_attribute.IDENTIFIABLE': 'Not identifiable',
  'cct.clean_code_attribute.IDENTIFIABLE.rule': 'Identifiable',
  'cct.clean_code_attribute.IDENTIFIABLE.issue.title':
    'This is a consistency issue, the code is not identifiable enough.',
  'cct.clean_code_attribute.IDENTIFIABLE.rule.title':
    'This is a consistency rule, the code should be identifiable.',
  'cct.clean_code_attribute.IDENTIFIABLE.advice':
    'To be identifiable, the code needs to include names and identifiers with a regular structure based on language conventions.',
  'cct.clean_code_attribute.LAWFUL': 'Not lawful',
  'cct.clean_code_attribute.LAWFUL.rule': 'Lawful',
  'cct.clean_code_attribute.LAWFUL.issue.title':
    'This is a responsibility issue, the code is not lawful enough.',
  'cct.clean_code_attribute.LAWFUL.rule.title':
    'This is a responsibility rule, the code should be lawful.',
  'cct.clean_code_attribute.LAWFUL.advice':
    'To be lawful, the code needs to respect licensing and copyright regulation.',
  'cct.clean_code_attribute.LOGICAL': 'Not logical',
  'cct.clean_code_attribute.LOGICAL.rule': 'Logical',
  'cct.clean_code_attribute.LOGICAL.issue.title':
    'This is an intentionality issue, the code is not logical enough.',
  'cct.clean_code_attribute.LOGICAL.rule.title':
    'This is an intentionality rule, the code should be logical.',
  'cct.clean_code_attribute.LOGICAL.advice':
    'To be logical, the code needs to have well-formed and sound instructions that work together, and be free of explicit errors.',
  'cct.clean_code_attribute.MODULAR': 'Not modular',
  'cct.clean_code_attribute.MODULAR.rule': 'Modular',
  'cct.clean_code_attribute.MODULAR.issue.title':
    'This is an adaptability issue, the code is not modular enough.',
  'cct.clean_code_attribute.MODULAR.rule.title':
    'This is an adaptability rule, the code should be modular.',
  'cct.clean_code_attribute.MODULAR.advice':
    'To be modular, the code needs to be organized and distributed to emphasize the separation between its parts.',
  'cct.clean_code_attribute.RESPECTFUL': 'Not respectful',
  'cct.clean_code_attribute.RESPECTFUL.rule': 'Respectful',
  'cct.clean_code_attribute.RESPECTFUL.issue.title':
    'This is a responsibility issue, the code is not respectful enough.',
  'cct.clean_code_attribute.RESPECTFUL.rule.title':
    'This is a responsibility rule, the code should be respectful.',
  'cct.clean_code_attribute.RESPECTFUL.advice':
    'To be respectful, the code needs to refrain from using discriminatory and offensive language.',
  'cct.clean_code_attribute.TESTED': 'Not tested',
  'cct.clean_code_attribute.TESTED.rule': 'Tested',
  'cct.clean_code_attribute.TESTED.issue.title':
    'This is an adaptability issue, the code is not tested enough.',
  'cct.clean_code_attribute.TESTED.rule.title':
    'This is an adaptability rule, the code should be tested.',
  'cct.clean_code_attribute.TESTED.advice':
    'To be tested, the code needs to have automated functional tests that provide confidence in the functionality.',
  'cct.clean_code_attribute.TRUSTWORTHY': 'Not trustworthy',
  'cct.clean_code_attribute.TRUSTWORTHY.rule': 'Trustworthy',
  'cct.clean_code_attribute.TRUSTWORTHY.issue.title':
    'This is a responsibility issue, the code is not trustworthy enough.',
  'cct.clean_code_attribute.TRUSTWORTHY.rule.title':
    'This is a responsibility rule, the code should be trustworthy.',
  'cct.clean_code_attribute.TRUSTWORTHY.advice':
    'To be trustworthy, the code needs to abstain from revealing or hard-coding private information.',

  'issue.issue_status.OPEN': 'Open',
  'issue.issue_status.ACCEPTED': 'Accepted',
  'issue.issue_status.CONFIRMED': 'Confirmed',
  'issue.issue_status.FIXED': 'Fixed',
  'issue.issue_status.FALSE_POSITIVE': 'False positive',
  'issue.issue_status.IN_SANDBOX': 'In sandbox',

  'issue.status.ACCEPTED': 'Accepted',
  'issue.status.REOPENED': 'Reopened',
  'issue.status.RESOLVED': 'Resolved',
  'issue.status.OPEN': 'Open',
  'issue.status.CONFIRMED': 'Confirmed',
  'issue.status.FALSE_POSITIVE': 'False Positive',
  'issue.status.FIXED': 'Fixed',
  'issue.status.CLOSED': 'Closed',
  'issue.status.TO_REVIEW': 'To Review',
  'issue.status.IN_REVIEW': 'In Review',
  'issue.status.REVIEWED': 'Reviewed',

  'issue.scope.MAIN': 'Main code',
  'issue.scope.TEST': 'Test code',

  'issue.resolution.FALSE-POSITIVE': 'False Positive',
  'issue.resolution.FALSE-POSITIVE.description':
    'Issues that manual review determined were False Positives. Effort from these issues is ignored.',
  'issue.resolution.FIXED': 'Fixed',
  'issue.resolution.FIXED.description': 'Issues that were corrected in code and reanalyzed.',
  'issue.resolution.WONTFIX': "Won't Fix",
  'issue.resolution.WONTFIX.description':
    'Issues that are accepted in this context. They and their effort will be ignored.',
  'issue.resolution.REMOVED': 'Removed',
  'issue.resolution.REMOVED.description':
    'Either the rule or the resource was changed (removed, relocated, parameters changed, etc.) so that analysis no longer finds these issues.',

  'issue.preview.jupyter_notebook.error':
    'Error while loading the Jupyter notebook. Use the Code tab to see issue details.',

  'issue.line_affected': 'Line affected',
  'issue.introduced': 'Introduced',
  'issue.effort': 'Effort',
  'issue.x_effort': '{0} effort',
  'issue.ncloc_x.short': 'L{0}',
  'issue.1_code_variant': '1 variant',
  'issue.x_code_variants': '{0} variants',
  'issue.from_external_rule_engine': 'Issue detected by an external rule engine: {0}',
  'issue.external_issue_description': 'This is external rule {0}. No details are available.',
  'issues.loading_issues': 'Loading issues',
  'issues.bulk_change_X_issues': 'Bulk Change {0} Issue(s)',
  'issues.fix_x_with_agent': '{count, plural, =0 {Fix with agent} other {Fix {count} with agent}}',
  'issues.fix_with_agent': 'Fix with agent',
  'issues.fix_issue_x_with_agent': 'Fix with agent: {issue}',
  'issues.select_all_issues': 'Select all Issues',
  'issues.issues': 'issues',
  'issues.new_code': 'Issues in new code',
  'issues.new_code_period': 'New Code Period',
  'issues.my_issues': 'My Issues',
  'issues.sort.label': 'Sort by',
  'issues.sort.PRIORITY': 'Priority',
  'issues.sort.FILE_LINE': 'File name',
  'issues.sort.CREATION_DATE': 'Creation date',
  'issues.no_my_issues': 'There are no issues assigned to you.',
  'issues.no_issues': 'No Issues. Hooray!',
  'issues.fixed_issues': 'Fixed issues',
  'issues.fixed_issues.description': 'List of issues that will be fixed by {pullRequest}',
  'issues.not_all_issue_show': 'Not all issues are included',
  'issues.not_all_issue_show_why': 'You do not have access to all projects in this portfolio',
  'issues.qg_mismatch.title': 'Mode metrics mismatch',
  'issues.qg_mismatch.description':
    'Your project contains metrics from {isStandardMode, select, true {Multi-Quality Rule (MQR) Mode} other {Standard Experience}}. While your instance remains in the {isStandardMode, select, true {Standard Experience} other {Multi-Quality Rule mode}}, some additional filters will be visible for these {isStandardMode, select, true {MQR} other {Standard Experience}} metrics.',
  'issues.qg_mismatch.link': 'Learn more about both modes in documentation',
  'issues.open_in_ide.success': 'Success. Switch to your IDE to see the issue.',
  'issues.open_in_ide.failure': 'Unable to open the issue in the IDE. Please check the {link}.',

  'issue.activity.review_history.created': 'Created Issue',
  'issue.activity.review_history.comment_added': 'added a comment',
  'issue.activity.add_comment': 'Add a comment',

  // ISSUES SUBNAVIGATION
  'issues.x_execution_flows':
    '{flowsCount, plural, one {{flows} execution flow} other {{flows} execution flows}}',
  'issues.execution_flow': 'execution flow',
  'issues.x_data_flows': '{flowsCount, plural, one {{flows} data flow} other {{flows} data flows}}',
  'issues.x_data_and_execution_flows':
    '{dataFlowsCount, plural, one {{dataFlows} data flow} other {{dataFlows} data flows}} and {executionFlowsCount, plural, one {{executionFlows} execution flow} other {{executionFlows} execution flows}}',
  'issues.x_locations':
    '{locationsCount, plural, one {{locations} location} other {{locations} locations}}',
  'issues.show_x_more_locations': 'Show {0} more location(s)',
  'issue.flow.1_step': '1 step',
  'issue.flow.x_steps': '{0} steps',
  'issue.unnamed_location': 'Other location',
  'issue.show_full_execution_flow': 'See the whole {0} step execution flow',

  // Issues code fix
  'issues.code_fix.get_fix_suggestion': 'Preview fix',
  'issues.code_fix.see_fix_suggestion': 'See AI Fix',
  'issues.code_fix.let_us_suggest_fix': 'Let us suggest a fix for this issue',
  'issues.code_fix.fix_is_being_generated': 'A fix is being generated...',
  'issues.code_fix.something_went_wrong': 'Something went wrong.',
  'issues.code_fix.not_available': 'Fix generation is currently unavailable',
  'issues.code_fix.reached_usage_limit':
    'Your organization has reached the monthly usage limit for AI CodeFix.',
  'issues.code_fix.not_able_to_generate_fix': 'We are not able to generate a fix for this issue.',
  'issues.code_fix.check_how_to_fix':
    'Try again later, or visit the other sections above to learn how to fix this issue.',

  //------------------------------------------------------------------------------
  //
  // ISSUE CHANGELOG
  //
  //------------------------------------------------------------------------------
  'issue.changelog.changed_to': '{0} changed to {1}',
  'issue.changelog.was': 'was {0}',
  'issue.change.file_move': 'The file has been moved from {0} to {1}',
  'issue.change.from_branch':
    "The issue has been copied from branch ''{branchA}'' to branch ''{branchB}''",
  'issue.change.from_non_branch': "The issue has been merged from ''{branchA}''into ''{branchB}''",
  'issue.changelog.removed': '{0} removed',
  'issue.changelog.line_removed_X': 'Line number removed from issue (was {0})',
  'issue.changelog.field.severity': 'Severity',
  'issue.changelog.field.originalSeverity': 'Calculated Severity',
  'issue.changelog.field.actionPlan': 'Action Plan',
  'issue.changelog.field.assignee': 'Assignee',
  'issue.changelog.field.assigneeName': 'Assignee',
  'issue.changelog.field.author': 'Author',
  'issue.changelog.field.resolution': 'Resolution',
  'issue.changelog.field.effort': 'Effort',
  'issue.changelog.field.status': 'Status',
  'issue.changelog.field.issueStatus': 'Status',
  'issue.changelog.field.tags': 'Tags',
  'issue.changelog.field.code_variants': 'Code Variants',
  'issue.changelog.field.type': 'Type',
  'issue.changelog.field.file': 'File',
  'issue.changelog.field.cleanCodeAttribute': 'Code attribute',
  'issue.changelog.field.deferralDate': 'Snooze Date',
  'issue.changelog.impactSeverity': '{0} severity changed to {1} (was {2})',

  //------------------------------------------------------------------------------
  //
  // ISSUES FACETS
  //
  //------------------------------------------------------------------------------
  'issues.facet.period': 'Period',
  'issues.facet.types': 'Type',
  'issues.facet.severities': 'Severity',
  'issues.facet.scopes': 'Scope',
  'issues.facet.projects': 'Project',
  'issues.facet.issueStatuses': 'Status',
  'issues.facet.issueStatuses.help.title': 'Issue lifecycle',
  'issues.facet.issueStatuses.help.description':
    'There are {hasSandboxIssues, select, true {six} other {five}} possible statuses in the issue lifecycle. Some of them can be assigned manually, others can only be assigned by SonarQube after the scan.',
  'issues.facet.issueStatuses.help.description.ACCEPTED': "Accepted: won't fix immediately",
  'issues.facet.issueStatuses.help.description.FALSE_POSITIVE':
    'False positive: analysis is incorrect',
  'issues.facet.issueStatuses.help.description.CONFIRMED':
    'Confirmed: a confirmation that the issue is valid',
  'issues.facet.issueStatuses.help.description.IN_SANDBOX':
    'In sandbox: filtered issues that temporarily don’t affect the quality gate',
  'issues.facet.issueStatuses.help.description.FIXED': 'Fixed: issue has been resolved',
  'issues.facet.issueStatuses.help.link': 'Learn more about the issue lifecycle in documentation',
  'issues.facet.hotspotStatuses': 'Hotspot Status',
  'issues.facet.assignees': 'Assignee',
  'issues.facet.files': 'File',
  'issues.facet.modules': 'Module',
  'issues.facet.directories': 'Directory',
  'issues.facet.tags': 'Tag',
  'issues.facet.rules': 'Rule',
  'issues.facet.languages': 'Language',
  'issues.facet.cleanCodeAttributeCategories': 'Code attribute',
  'issues.facet.cleanCodeAttributeCategories.help.title':
    'Attributes group together conceptually similar issues.',
  'issues.facet.cleanCodeAttributeCategories.help.link': 'Learn more about code attributes',
  'issues.facet.impactSoftwareQualities': 'Software quality',
  'issues.facet.impactSoftwareQualities.help.title': 'What are software qualities?',
  'issues.facet.impactSoftwareQualities.help.description':
    '<p1>Security is the protection of your software from unauthorized access, use, or destruction.</p1><p>Reliability is a measure of how your software is capable of maintaining its level of performance under stated conditions for a stated period of time.</p><p>Maintainability refers to the ease with which you can repair, improve and understand software code.</p>',
  'issues.facet.impactSoftwareQualities.help.link': 'Learn more about software qualities',
  'issues.facet.codeVariants': 'Code variant',
  'issues.facet.createdAt': 'Creation date',
  'issues.facet.createdAt.all': 'All',
  'issues.facet.createdAt.last_week': 'Last week',
  'issues.facet.createdAt.last_month': 'Last month',
  'issues.facet.createdAt.last_year': 'Last year',
  'issues.facet.createdAt.bar_description': '{0} issues from {1} to {2}',
  'issues.facet.authors': 'Author',
  'issues.facet.impactSeverities': 'Severity',
  'issues.facet.issues': 'Issue Key',
  'issues.facet.mode': 'Display Mode',
  'issues.facet.mode.count': 'Issues',
  'issues.facet.mode.effort': 'Effort',
  'issues.facet.standards': 'Compliance category',
  'issues.facet.casa': 'CASA',
  'issues.facet.cra': 'EU CRA',
  'issues.facet.owaspTop10': 'OWASP Top 10 2017',
  'issues.facet.owaspTop10_2021': 'OWASP Top 10 2021',
  'issues.facet.owaspTop10_2025': 'OWASP Top 10 2025',
  'issues.facet.owaspLlmTop10_2025': 'OWASP Top 10 for LLM 2025',
  'issues.facet.owaspAsvs_4.0': 'OWASP ASVS 4.0',
  'issues.facet.owaspAsvs_5.0': 'OWASP ASVS 5.0',
  'issues.facet.owaspMasvs_v2': 'OWASP MASVS',
  'issues.facet.owaspMobileTop10_2024': 'OWASP Mobile Top 10 2024',
  'issues.facet.sonarsourceSecurity': 'SonarSource',
  'issues.facet.stigAsd_v5r3': 'STIG ASD V5R3',
  'issues.facet.stigAsd_v6': 'STIG ASD V6',
  'issues.facet.pciDss_3.2': 'PCI DSS 3.2',
  'issues.facet.pciDss_4.0': 'PCI DSS 4.0',
  'issues.facet.cwe': 'CWE',
  'issues.facet.misra': 'MISRA',
  'issues.facet.wcag_2.2': 'WCAG 2.2',
  'issues.facet.wcag_2.1': 'WCAG 2.1',
  'issues.facet.wcag_2.0': 'WCAG 2.0',
  'issues.facet.sonarsource.show_more': 'Show more SonarSource categories',
  'issues.facet.stigAsd_v5r3.show_more': 'Show more STIG ASD V5R3 categories',
  'issues.facet.stigAsd_v5r3.show_less': 'Show less STIG ASD V5R3 categories',
  'issues.facet.stigAsd_v6.show_more': 'Show more STIG ASD V6 categories',
  'issues.facet.stigAsd_v6.show_less': 'Show less STIG ASD V6 categories',
  'issues.facet.prioritized_rule.category': 'Prioritized rules',
  'issues.facet.prioritized_rule': 'Issues from prioritized rules',
  'issues.facet.detection_cause': 'Detection cause',
  'issues.facet.detection_cause.help':
    'New SonarQube issues arise either because of user actions (such as code changes or modification of custom quality profiles) or because of SonarQube updates (such as analyzer/rule improvements or built-in profile adjustments).',
  'issues.facet.detection_cause.help.aria_label': 'Detection cause information',
  'issues.facet.detection_cause.sonarqube_update': 'SonarQube update',
  'issues.facet.detection_cause.other_causes': 'All other causes',
  'issues.facet.second_line.mode.standard': 'Standard experience',
  'issues.facet.second_line.mode.mqr': 'MQR mode',
  'issues.facet.linkedTicketStatus': 'Jira',
  'issues.facet.linkedTicketStatus.LINKED': 'Pushed to Jira',
  'issues.facet.linkedTicketStatus.NOT_LINKED': 'Not created',
  'issues.facet.owaspLlmTop10_2026': 'OWASP Top 10 for LLM 2026',

  //------------------------------------------------------------------------------
  //
  // PROJECT QUALITY PROFILE PAGE
  //
  //------------------------------------------------------------------------------
  'project_quality_profile.instance_default': 'Instance default:',
  'project_quality_profile.successfully_updated':
    '{0} quality profile has been successfully updated.',
  'project_quality_profile.always_use_default': 'Always use the instance default quality profile',
  'project_quality_profile.current': 'Current quality profile',
  'project_quality_profile.always_use_specific': 'Always use a specific quality profile',
  'project_quality_profile.change_lang_X_profile': 'Change {0} quality profile',
  'project_quality_profile.requires_new_analysis':
    'Changes will be applied after the next analysis.',
  'project_quality_profile.add_language.title': 'Configure a profile for new language',
  'project_quality_profile.add_language.description':
    'To use a specific, non-default quality profile for a new language, configure and apply it manually, then rerun your analysis.',
  'project_quality_profile.add_language.action': 'Add language',
  'project_quality_profile.add_language_modal.title': 'Add a language',
  'project_quality_profile.add_language_modal.choose_language': 'Choose a language',
  'project_quality_profile.add_language_modal.choose_profile': 'Choose a profile',
  'project_quality_profile.add_language_modal.no_active_rules': 'this profile has no active rules',
  'project_quality_profile.add_language_modal.profile_unavailable_no_active_rules':
    'This profile has no active rules, and cannot be used. Please enable at least 1 rule before using this profile.',
  'project_quality_profile.add_language_modal.go_to_profile': 'Go to quality profile',
  'project_quality_profile.change_profile_x': 'Change {x} profile',
  'project_quality_profile.page': 'Quality profiles',
  'project_quality_profile.page.description':
    'Each language is automatically assigned the default quality profile of this instance. As a project administrator, you can override the default assignment and choose different profiles for languages used in this project.',
  'project_quality_profile.profiles_by_languages': 'Profiles by languages',
  'project_quality_profile.profiles_by_languages.description':
    'For each language, choose the profile associated with this project.',
  'project_quality_profile.contains_ai_code.title': 'This project contains AI-generated code',
  'project_quality_profile.contains_ai_code.description':
    '<b>{agenticQualityProfileName}</b> and <b>Sonar way</b> are the recommended quality profiles for AI generated code. Although it is not a mandatory step, we suggest you review your quality profiles to ensure protection. <p>Learn why in our documentation</p>',
  //------------------------------------------------------------------------------
  //
  // PROJECT QUALITY GATE PAGE
  //
  //------------------------------------------------------------------------------
  'project_quality_gate.successfully_updated': 'Quality gate has been successfully updated.',
  'project_quality_gate.always_use_default': 'Always use the instance default quality gate',
  'project_quality_gate.always_use_specific': 'Always use a specific quality gate',
  'project_quality_gate.select_specific_qg': 'Select quality gate',
  'project_quality_gate.requires_new_analysis': 'Changes will be applied after the next analysis.',
  'project_quality_gate.no_condition':
    'This quality gate is empty. To make it usable, add conditions.',
  'project_quality_gate.no_condition_on_new_code':
    'This quality gate sets conditions on overall code but not on new code. It will not appear on pull requests. To enable it for pull requests, add conditions to the {link}.',
  'project_quality_gate.no_condition.link': 'Quality gate definition',
  'project_quality_gate.ai_assured_quality_gate':
    'This quality gate is qualified for AI Code Assurance',
  'project_quality_gate.not_ai_assured_quality_gate':
    'This quality gate is not qualified for AI Code Assurance',
  'project_quality_gate.ai_generated_code_protected.title': 'Your AI-generated code is protected',
  'project_quality_gate.ai_generated_code_protected.description':
    '<p>This project contains AI-generated code and the selected quality gate is qualified for <link>AI Code Assurance</link>.</p>',
  'project_quality_gate.ai_generated_code_not_protected.title':
    'Protect your AI-generated code with ‘AI Code Assurance’',
  'project_quality_gate.ai_generated_code_not_protected.description':
    '<p>This project contains AI-generated code. We recommend using a qualified quality gate to enable <link>AI Code Assurance</link>.</p><p>You may use <linkSonarWay>Sonar way for Agentic AI</linkSonarWay> or <linkQualifyDoc>qualify your own custom quality gates for AI Code Assurance</linkQualifyDoc>.</p>',

  //------------------------------------------------------------------------------
  //
  // QUALITY PROFILES
  //
  //------------------------------------------------------------------------------

  'quality_profiles.page_title_changelog_x': '{profile} Changelog',
  'quality_profiles.page_title_compare_x': '{profile} Comparison',
  'quality_profiles.new_profile': 'New quality profile',

  'quality_profiles.compare_with': 'Compare with',
  'quality_profiles.filter_by': 'Filter by',
  'quality_profiles.filter_by_lang': 'Filter by language',
  'quality_profiles.select_lang': 'Select language',
  'quality_profiles.no_lang_found': 'No languages found',
  'quality_profiles.restore_profile': 'Restore Profile',
  'quality_profiles.restore_profile.success':
    "{ruleSuccesses} rule(s) restored in profile ''{profileName}''",
  'quality_profiles.restore_profile.warning':
    "{ruleSuccesses} rule(s) restored, {ruleFailures} rule(s) ignored in profile ''{profileName}''",
  'quality_profiles.optional_configuration_file': 'Optional configuration file',
  'quality_profiles.new_name': 'New name',
  'quality_profiles.no_languages_available':
    'There are no languages available. You cannot create a new profile.',
  'quality_profiles.delete_confirm_title': 'Delete Profile',
  'quality_profiles.delete_confirm_description': "You're about to delete a profile.",
  'quality_profiles.are_you_sure_want_delete_profile_x':
    'Are you sure that you want to delete the profile "{profileName}"?',
  'quality_profiles.are_you_sure_want_delete_profile_x_and_descendants':
    'Are you sure that you want to delete the profile "{profileName}" and all its descendants?',
  'quality_profiles.this_profile_has_descendants': 'This profile has descendants.',
  'quality_profiles.profile_inheritance': 'Inheritance',
  'quality_profiles.no_projects_associated_to_profile':
    'No projects are explicitly associated to the profile.',
  'quality_profiles.cannot_associate_projects_no_rules':
    'You must activate at least 1 rule before you can assign projects to this profile.',
  'quality_profiles.cannot_set_default_no_rules':
    'You must activate at least 1 rule before you can make this profile the default profile.',
  'quality_profiles.warning.used_by_projects_no_rules':
    'The current profile is used on several projects, but it has no active rules. Please activate at least 1 rule for this profile.',
  'quality_profiles.warning.is_default_no_rules':
    'The current profile is the default profile, but it has no active rules. Please activate at least 1 rule for this profile.',
  'quality_profiles.parent': 'Parent',
  'quality_profiles.parameter_set_to': 'Parameter {0} set to {1}',
  'quality_profiles.sonar_agentic_ai.help_text': 'Recommended quality profile for agentic work',
  'quality_profiles.sonar_way.help_text': 'Recommended quality profile for human centered work',
  'quality_profiles.x_rules_only_in': '{count} rules in {profile}',
  'quality_profiles.x_rules_have_different_configuration':
    '{count} rules have a different configuration',
  'quality_profiles.copy_x_title': 'Copy Profile "{profile}" - {language}',
  'quality_profiles.extend_x_title': 'Extend Profile "{profile}" - {language}',
  'quality_profiles.rename_x_title': 'Rename Profile {profile} - {language}',
  'quality_profiles.severity_set_to': 'Severity set to',
  'quality_profiles.changelog.ACTIVATED': 'Activated',
  'quality_profiles.changelog.DEACTIVATED': 'Deactivated',
  'quality_profiles.changelog.UPDATED': 'Updated',
  'quality_profiles.changelog.parameter_reset_to_default_value':
    'Parameter {0} reset to default value',
  'quality_profiles.changelog.prioritized_rule_changed': 'Prioritized rule set to {flag}',
  'quality_profiles.changelog.cca_and_category_changed':
    'Code category set to {newCleanCodeAttributeCategory} and attribute set to {newCleanCodeAttribute}, was {oldCleanCodeAttributeCategory} and {oldCleanCodeAttribute}',
  'quality_profiles.changelog.cca_only_changed':
    'Code attribute set to {newCleanCodeAttribute}, was {oldCleanCodeAttribute}',
  'quality_profiles.changelog.impact_changed':
    'Software impact set to {newSoftwareQuality} with severity {newSeverity}, was {oldSoftwareQuality} with severity {oldSeverity}',
  'quality_profiles.changelog.impact_added':
    'Software impact {newSoftwareQuality} with severity {newSeverity} was added',
  'quality_profiles.changelog.impact_removed':
    'Software impact {oldSoftwareQuality} with severity {oldSeverity} was removed',
  'quality_profiles.changelog.sq_upgrade': 'Instance updated to {productName} {sqVersion}',
  'quality_profiles.projects_for_default':
    'Every project not specifically associated with a quality profile will be associated to this one by default.',
  'quality_profiles.x_overridden_rules': '{0} overridden rules',
  'quality_profiles.change_parent': 'Change Parent',
  'quality_profiles.change_parent_warning':
    'By changing the parent of this profile, any information on inherited rules that were manually disabled will be lost. This means some previously disabled rules might be re-enabled.',
  'quality_profiles.x_profiles': '{name}, {count} profile(s)',
  'quality_profiles.activate_more': 'Activate More',
  'quality_profiles.activate_more.help.built_in':
    'This quality profile is built in, and cannot be updated manually. If you want to activate more rules, create a new profile that inherits from this one and add rules there.',
  'quality_profiles.activate_more_rules': 'Activate More Rules',
  'quality_profiles.comparison.activate_rule': 'Activate rule for profile "{profile}"',
  'quality_profiles.comparison.deactivate_rule': 'Dectivate rule for profile "{profile}"',
  'quality_profiles.intro':
    'Quality profiles are collections of rules to apply during an analysis. For each language, there is a default profile. All projects not explicitly assigned to some other profile will be analyzed with the default. Ideally, all projects will use the same profile for a language. <p1>A strict quality profile is needed for projects that contain AI-generated code. We recommend using the Sonar way quality profile.</p1> <p2>Learn more about <link>quality profiles in our documentation</link></p2>',
  'quality_profiles.list.projects': 'Projects',
  'quality_profiles.list.projects.help':
    'Projects assigned to a profile will always be analyzed with it for that language, regardless of which profile is the default. Quality profile administrators may assign projects to a non-default profile, or always make it follow the system default. Project administrators may choose any profile for each language.',
  'quality_profiles.list.rules': 'Rules',
  'quality_profiles.list.updated': 'Updated',
  'quality_profiles.list.used': 'Used',
  'quality_profiles.list.default.help':
    'For each language there is a default profile. All projects not explicitly assigned to some other profile will be analyzed with the default.',
  'quality_profiles.x_updated_on_y': '{name}, updated on {date}',
  'quality_profiles.change_projects': 'Change Projects',
  'quality_profiles.not_found': 'The requested quality profile was not found',
  'quality_profiles.not_found.description':
    'This profile may have been deleted or the link is outdated.',
  'quality_profiles.back_to_list': 'Back to quality profiles list',
  'quality_profiles.latest_new_rules': 'Recently Added Rules',
  'quality_profiles.latest_new_rules.activated': '{0}, activated on {1} profile(s)',
  'quality_profiles.latest_new_rules.not_activated': '{0}, not yet activated',
  'quality_profiles.latest_new_rules.see_all_x': 'See all {count} recently added rules',
  'quality_profiles.deprecated_rules': 'Deprecated Rules',
  'quality_profiles.x_deprecated_rules':
    '{linkCount} deprecated {count, plural, one {rule} other {rules}}',
  'quality_profiles.deprecated_rules_description':
    'These deprecated rules will eventually disappear. You should proactively investigate replacing them.',
  'quality_profiles.deprecated_rules_are_still_activated':
    'Deprecated rules are still activated on {count} quality profile(s):',
  'quality_profiles.sonarway_missing_rules_description':
    'Recommended rules are missing from your profile',
  'quality_profiles.x_sonarway_missing_rules':
    '{linkCount} Sonar way {count, plural, one {rule} other {rules}} not included',
  'quality_profiles.sonarway_see_x_missing_rules': 'See {0} missing Sonar way rules',
  'quality_profiles.stagnant_profiles': 'Stagnant Profiles',
  'quality_profiles.not_updated_more_than_year':
    "The following profiles haven't been updated for more than 1 year:",
  'quality_profiles.exporters': 'Exporters',
  'quality_profiles.exporters.deprecated':
    'Exporters are deprecated, and will be removed in a future version.',
  'quality_profiles.updated_': 'Updated:',
  'quality_profiles.used_': 'Used:',
  'quality_profiles.built_in': 'Built-in',
  'quality_profiles.built_in.agentic.description':
    'The {agenticQualityProfileName} quality profile is recommended for projects where AI agents generate or contribute significant amounts of Java, JavaScript/TypeScript, or Python code. It activates the security and reliability rules most relevant to AI-generated code, while reducing noise from maintainability rules that are less critical in agentic workflows. Sonar maintains and updates this profile as AI coding patterns and risks evolve.',
  'quality_profiles.built_in.agentic.description.learn_more':
    '<link>Learn why in our documentation</link>',
  'quality_profiles.built_in.description':
    'Sonar way serves as the definitive baseline for codebases where human intuition and authorship drive the logic. While AI might assist, this profile is built on the principle that humans must still read, understand, and evolve the code over years of development.',
  'quality_profiles.built_in.description.learn_more': '<link>Learn why in our documentation</link>',
  'quality_profiles.no_built_in_updates_warning':
    'This quality profile does not inherit from a built-in profile. It will not benefit from automatic updates when new rules are introduced.',
  'quality_profiles.no_built_in_updates_warning_admin':
    'To benefit from automatic updates, set the corresponding built-in profile as the parent of your quality profile.',
  'quality_profiles.no_built_in_updates_warning.new_profile':
    "This new quality profile won't inherit from a built-in profile. It will not benefit from automatic updates when new rules are introduced.",
  'quality_profiles.no_built_in_updates_warning.new_profile.2':
    'If you want to benefit from automatic updates, consider extending a built-in quality profile instead.',
  'quality_profiles.default_permissions':
    'Users with the global "Administer quality profiles" permission and those listed below can manage this quality profile.',
  'quality_profiles.grant_permissions_to_more_users': 'Grant permissions to more users',
  'quality_profiles.grant_permissions_to_user_or_group': 'Grant permissions to a user or a group',
  'quality_profiles.search_description': 'Search users by login or name, and groups by name:',
  'quality_profiles.permissions.remove.user': 'Remove permission from user',
  'quality_profiles.permissions.remove.user_x': 'Remove permission from user {0}',
  'quality_profiles.permissions.remove.user.confirmation':
    'Are you sure you want to remove permission on this quality profile from user {user}?',
  'quality_profiles.permissions.remove.group': 'Remove permission from group',
  'quality_profiles.permissions.remove.group_x': 'Remove permission for {0}',
  'quality_profiles.permissions.remove.group.confirmation':
    'Are you sure you want to remove permission on this quality profile from group {user}?',
  'quality_profiles.copy_help':
    'Create a new quality profile as a replica of "{profile}".  The two profiles will then evolve independently.',
  'quality_profiles.extend_help':
    'Create a child quality profile inheriting all active rules from "{profile}". Changes to "{profile}" will impact the child profile.',
  'quality_profiles.chose_creation_type': 'What type of profile do you want to create?',
  'quality_profiles.creation_from_extend': 'Extend an existing quality profile',
  'quality_profiles.creation_from_extend_description_1':
    'Create a child quality profile inheriting its parent’s active rules.',
  'quality_profiles.creation_from_extend_description_2':
    'Changes to the parent profile will impact the child profile.',
  'quality_profiles.creation_from_copy': 'Copy an existing quality profile',
  'quality_profiles.creation_from_copy_description_1':
    'Create a new quality profile as a replica of the copied quality profile.',
  'quality_profiles.creation_from_copy_description_2':
    'The two profiles will then evolve independently.',
  'quality_profiles.creation_from_blank': 'Create a blank quality profile',
  'quality_profiles.creation_from_blank_description':
    'Create a new quality profile with no active rules by default.',
  'quality_profiles.creation.choose_parent_quality_profile': 'Profile to extend',
  'quality_profiles.creation.choose_copy_quality_profile': 'Profile to copy',
  'quality_profiles.actions': 'Open {0} {1} quality profile actions',
  'quality_profiles.aica.tooltip.icon':
    'Standard for projects where human authorship drive the logic, although AI assisted',
  'quality_profiles.aica.tooltip.icon.agentic':
    'Projects using primarily agent-centric development. Filters out stylistic rules to prioritize high-impact risks like structural drift and security',

  //------------------------------------------------------------------------------
  //
  // QUALITY GATES
  //
  //------------------------------------------------------------------------------

  'quality_gates.create': 'Create quality gate',
  'quality_gates.rename': 'Rename quality gate',
  'quality_gates.rename_x': 'Rename {name} quality gate',
  'quality_gates.delete': 'Delete quality gate',
  'quality_gates.delete_x': 'Delete {name} quality gate',
  'quality_gates.copy': 'Copy quality gate',
  'quality_gates.copy_x': 'Copy {name} quality gate',
  'quality_gates.set_as_default_x': 'Set {name} as default quality gate',
  'quality_gates.upgrade_badge.tooltip':
    'SonarQube Advanced Security add-on is required for this condition to work. <a>Learn more</a>.',
  'quality_gates.upgrade_badge.tooltip.aria':
    'SonarQube Advanced Security add-on is required for this condition to work.',
  'quality_gates.is_default_no_conditions':
    'This is the default quality gate, but it has no configured conditions. Please configure at least 1 condition for this quality gate.',
  'quality_gates.is_built_in.tooltip': 'Built-in quality gate reflecting recommended practices',
  'quality_gates.is_built_in.ai.tooltip':
    'Built-in quality gate reflecting recommended practices for AI-generated code',
  'quality_gates.conditions': 'Conditions',
  'quality_gates.conditions.help':
    'Your project will fail the quality gate if it crosses any metric thresholds set for new code or overall code.',
  'quality_gates.conditions.update': 'Update conditions on new code',
  'quality_gates.conditions.update_x': 'Update conditions on new code for {name} quality gate',
  'quality_gates.conditions.enable_sca_hint':
    '<a>Enable SonarQube Advanced Security</a> to use this condition',
  'quality_gates.conditions.new_sca_severity_any_issue.hint':
    'This condition prevents agents from introducing malicious or vulnerable dependencies.',
  'quality_gates.projects': 'Projects',
  'quality_gates.projects.help':
    'The Default gate is applied to all projects not explicitly assigned to a gate. Quality gate administrators can assign projects to a non-default gate, or always make it follow the system default. Project administrators may choose any gate.',
  'quality_gates.add_condition': 'Add Condition',
  'quality_gates.add_condition_x': 'Add condition to {name} quality gate',
  'quality_gates.add_condition.metric_from_other_mode':
    'This quality gate already has an equivalent condition based on the same concept ("{metric}") that persists from the {isStandardMode, select, true {Standard Experience} other {Multi-Quality Rule Mode}}. Update the metric and you will be able to edit the condition.',
  'quality_gates.condition.edit': 'Edit condition on {metric}',
  'quality_gates.condition.delete': 'Delete condition on {metric}',
  'quality_gates.condition_added': 'Successfully added condition.',
  'quality_gates.update_condition': 'Update Condition',
  'quality_gates.condition_updated': 'Successfully updated condition.',
  'quality_gates.conditions_updated': 'Successfully updated conditions.',
  'quality_gates.conditions_updated_to_the_mode':
    'The metrics of "{qualityGateName}" gate were successfully updated',
  'quality_gates.conditions.error_message.percent': 'Value must be between 0 and 100',
  'quality_gates.conditions.error_message.default': 'Value is invalid',
  'quality_gates.no_conditions': 'No Conditions',
  'quality_gates.projects_for_default':
    'Every project not specifically associated to a quality gate will be associated to this one by default.',
  'quality_gates.projects.with': 'With',
  'quality_gates.projects.without': 'Without',
  'quality_gates.projects.all': 'All',
  'quality_gates.projects.cannot_associate_projects_no_conditions':
    'You must configure at least 1 condition before you can assign projects to this quality gate.',
  'quality_gates.projects.ai_assured_message': 'This project contains AI-generated code.',
  'quality_gates.operator.LT': 'is less than',
  'quality_gates.operator.inverted.LT': 'greater than or equal',
  'quality_gates.operator.GT': 'is greater than',
  'quality_gates.operator.inverted.GT': 'less than or equal',
  'quality_gates.operator.LT.rating': 'is better than',
  'quality_gates.operator.GT.rating': 'is worse than',
  'quality_gates.operator.GTE.issueSeverity': 'is greater than or equal to',
  'quality_gates.operator.LT.issueSeverity': 'is less than',
  'quality_gates.operator.least': 'at least',
  'quality_gates.operator.GTE': 'is greater than or equal to',
  'quality_gates.delete.confirm.message':
    'Are you sure you want to delete the "{qualityGate}" quality gate?',
  'quality_gates.delete_condition': 'Delete Condition',
  'quality_gates.condition_deleted': 'Successfully deleted condition',
  'quality_gates.delete_condition.confirm.message':
    'Are you sure you want to delete the "{metric}" condition?',
  'quality_gates.conditions.fails_when': 'Quality gate fails when',
  'quality_gates.conditions.metric': 'Metric',
  'quality_gates.conditions.builtin_overall.metric': '{metric} is {operator} {value}',
  'quality_gates.conditions.builtin': 'Conditions on New Code',
  'quality_gates.conditions.description':
    'These conditions apply to the new code of all branches and to pull requests.',
  'quality_gates.conditions.builtin_new_code.metric': '{metric} is {operator} to {value}',
  'quality_gates.conditions.builtin_new_code.severity.new_reliability_issue_severity.operator':
    'Reliability severity is below {value}',
  'quality_gates.conditions.builtin_new_code.severity.new_security_issue_severity.operator':
    'Security severity is below {value}',
  'quality_gates.conditions.builtin_new_code.severity.new_maintainability_issue_severity.operator':
    'Maintainability severity is below {value}',
  'quality_gates.conditions.builtin_new_code.severity.new_sca_severity_any_issue.operator':
    'Dependency risk severity is below {value}',
  'quality_gates.conditions.builtin_new_code.severity.new_bugs_severity.operator':
    'Bugs severity is below {value}',
  'quality_gates.conditions.builtin_new_code.severity.new_vulnerabilities_severity.operator':
    'Vulnerabilities severity is below {value}',
  'quality_gates.conditions.builtin_new_code.severity.new_code_smells_severity.operator':
    'Code smells severity is below {value}',
  'quality_gates.conditions.hint':
    'The conditions below must be true for your project to pass the quality gate.',
  'quality_gates.conditions.threshold.hint':
    'Sonar recommends this threshold. Create a new quality gate to set a different value.',
  'quality_gates.conditions.new_code': 'On New Code',
  'quality_gates.conditions.new_code.long': 'Conditions on New Code',
  'quality_gates.conditions.new_code.description':
    'Conditions on new code apply to all branches and to pull requests.',
  'quality_gates.conditions.overall_code': 'On Overall Code',
  'quality_gates.conditions.overall_code.long': 'Conditions on Overall Code',
  'quality_gates.conditions.overall_code.description':
    'Conditions on overall code apply to branches only.',
  'quality_gates.conditions.x_conditions_failed':
    '{conditions} {conditions, plural, one {condition} other {conditions}} failed',
  'quality_gates.conditions.operator': 'Operator',
  'quality_gates.conditions.value': 'Value',
  'quality_gates.conditions.threshold': 'Set condition value',
  'quality_gates.conditions.where': 'Where?',
  'quality_gates.duplicated_conditions': 'This quality gate has duplicated conditions:',
  'quality_gates.built_in': 'Built-in',
  'quality_gates.built_in.helper': 'Built-in, immutable quality gate reflecting best practices.',
  'quality_gates.help.title': 'What is a quality gate?',
  'quality_gates.help.desc':
    "It`s a set of measure-based, Boolean conditions. It helps you know immediately whether your projects are production-ready. Ideally, all projects will use the same quality gate. Each project's quality gate status is displayed prominently on its homepage.",
  'quality_gates.help.link': 'Learn more about quality gates',
  'quality_gates.permissions': 'Permissions',
  'quality_gates.permissions.help':
    'Users with the global "Administer quality gates" permission and those listed below can manage this quality gate.',
  'quality_gates.permissions.grant': 'Grant permissions to a user or a group',
  'quality_gates.permissions.search': 'Search users by login or name, and groups by name:',
  'quality_gates.permissions.remove.user': 'Remove permission from user',
  'quality_gates.permissions.remove.user.confirmation':
    'Are you sure you want to remove permission on this quality gate from user {user}?',
  'quality_gates.permissions.remove.group': 'Remove permission from group',
  'quality_gates.permissions.remove.group.confirmation':
    'Are you sure you want to remove permission on this quality gate from group {user}?',
  'quality_gates.condition_simplification_list':
    'List of conditions to ensure that any code added follow Sonar practices',

  'quality_gates.banner.builtin.title':
    'This quality gate reflects <link>Sonar recommended practices</link>',
  'quality_gates.banner.recommendation_update.title': 'Consider updating conditions on new code',
  'quality_gates.banner.recommendation_update.description':
    'Updating conditions on new code would align this gate with <link>standards recommended by Sonar</link>',
  'quality_gates.banner.info.multiple.title': 'This quality gate:',
  'quality_gates.banner.info.multiple.aica': 'Is qualified for <link>AI Code Assurance</link>',
  'quality_gates.banner.info.multiple.sonar':
    'Has all of conditions <link>recommended by Sonar</link>',
  'quality_gates.info.recommended.title':
    'This quality gate has all of the conditions <link>recommended by Sonar</link>',
  'quality_gates.info.aica.title':
    'This quality gate is qualified for <link>AI Code Assurance</link>',

  'quality_gates.recommendation.new_maintainability_rating.A':
    'Technical debt ratio is less than {0}',
  'quality_gates.recommendation.new_maintainability_rating':
    'Technical debt ratio is greater than {1}',
  'quality_gates.recommendation.new_reliability_rating.A': 'No bugs',
  'quality_gates.recommendation.new_security_rating.A': 'No vulnerabilities',

  'quality_gates.fix_modal.title': 'Update conditions on new code',
  'quality_gates.fix_modal.description':
    'Modify conditions on new code to align this quality gate with <link>standards recommended by Sonar</link>. All conditions on overall code will remain unchanged.',
  'quality_gates.fix_modal.to_add.title.x_conditions':
    '{count} {count, plural, one {condition} other {conditions}} on new code will be added',
  'quality_gates.fix_modal.to_modify.title.x_conditions':
    '{count} {count, plural, one {condition} other {conditions}} on new code will be modified',
  'quality_gates.fix_modal.to_modify.accessible_item':
    '{metric} is changing from "{op} {oldValue}" to "{op} {newValue}"',
  'quality_gates.fix_modal.to_remove.selection.description':
    'All selected conditions will be removed. Deselect conditions you want to retain.',
  'quality_gates.fix_modal.success': 'Conditions on new code were successfully updated',
  'quality_gates.fix_modal.review_update': 'Review and update',
  'quality_gates.fix_modal.review_update_x':
    'Review and update conditions on new code for {name} quality gate',
  'quality_gates.recommended.tooltip.message': 'This  gate has all recommended conditions',
  'quality_gates.ai_generated.tooltip.message':
    'This quality gate is qualified for AI Code Assurance',
  'quality_gates.recommended_and_ai.tooltip':
    'This gate has all recommended conditions and is marked as qualified for AI-generated code',
  'quality_gates.aica.builtin.title': 'The gate designed to ensure safety of AI-generated code',
  'quality_gates.aica.builtin.description':
    'The Sonar way for Agentic AI quality gate is Sonar recommended pass/fail conditions for projects built with AI agents. It enforces <link>AI Code Assurance</link> guardrails by blocking on the security and reliability issues, including dependency risks, most likely to appear in AI-generated code, while relaxing conditions that are less relevant to agentic workflows.',
  'quality_gates.aica.builtin.description.admin':
    'Pair it with the <link>Sonar way for Agentic quality profile</link> to set a consistent, repeatable standard for AI-accelerated delivery.',

  'quality_gates.mqr_mode_update.tooltip.message': 'Update the metrics of this quality gate',
  'quality_gates.mqr_mode_update.single_metric.tooltip.message': 'Update {metric} metric to {mode}',
  'quality_gates.update_conditions.update_metrics': 'Update metrics',
  'quality_gates.update_conditions.header': 'Update all metrics of “{qualityGate}” gate',
  'quality_gates.update_conditions.header.single_metric': 'Update this metric',
  'quality_gates.update_conditions.description.line1':
    'The <b>condition(s)</b> listed below will be updated to align with the mode of this instance ({mode}).',
  'quality_gates.update_conditions.description.line2':
    'In some cases, you will see that the name of the conditions does not change between modes. In these cases, the underlying calculation will be changing to something similar but not identical. Your settings for <b>Operator</b> and <b>value</b> will remain unchanged.',
  'quality_gates.update_conditions.description.line3':
    'Note that the update to {mode} might cause your quality gate to fail. {link}',
  'quality_gates.update_conditions.description.link':
    'For more information, refer to the documentation.',
  'quality_gates.metric.standard_mode_short': 'Standard Experience',
  'quality_gates.metric.standard_mode_long': 'Standard Experience Metric',
  'quality_gates.metric.mqr_mode_short': 'MQR Mode',
  'quality_gates.metric.mqr_mode_long': 'MQR Mode Metric',
  'quality_gates.update_conditions.operator_and_value_header': 'Operator and Value',
  'quality_gates.update_conditions.removed': 'Condition will be removed',
  'quality_gates.update_conditions.error': 'Failed to update some conditions',
  'quality_gates.mode_banner.title':
    'This quality gate is using conditions with metrics that belong to the {mode}',
  'quality_gates.mode_banner.description':
    'This instance is currently in the {link}. We recommend you update the metrics of your quality gate conditions to ensure accurate categorization and ranking of your issues in this mode. Conditions that use {otherMode} metrics can’t be edited until they are updated.',
  'quality_gates.mode_banner.button': 'Review and update metrics',
  'quality_gates.actions.disqualify_for_ai_code_assurance': 'Disqualify for AI Code Assurance',
  'quality_gates.actions.disqualify_for_ai_code_assurance_x':
    'Disqualify {name} quality gate for AI Code Assurance',
  'quality_gates.actions.qualify_for_ai_code_assurance': 'Qualify for AI Code Assurance',
  'quality_gates.actions.qualify_for_ai_code_assurance_x':
    'Qualify {name} quality gate for AI Code Assurance',
  'quality_gates.disqualify_ai_modal.title':
    'Disqualify this quality gate and disable AI Code Assurance on {count} {count, plural, one {project} other {projects}}?',
  'quality_gates.disqualify_ai_modal_default.title':
    'Some projects may lose their AI Code Assurance',
  'quality_gates.disqualify_ai_modal.content.line1':
    '{count} {count, plural, one {project uses} other {projects use}} this quality gate to benefit from AI Code Assurance. If you disqualify it, {count, plural, one {this project} other {these projects}} will lose {count, plural, one {its} other {their}} AI Code Assurance.',
  'quality_gates.disqualify_ai_modal_default.content.line1':
    'Some projects may rely on the default quality gate to benefit from AI Code Assurance. If you disqualify it, these projects will lose their AI Code Assurance.',
  'quality_gates.disqualify_ai_modal.content.line2': 'Do you want to continue?',
  'quality_gates.disqualify_ai_modal.confirm': 'Disqualify for AI Code Assurance',

  //------------------------------------------------------------------------------
  //
  // CODING RULES
  //
  //------------------------------------------------------------------------------
  'coding_rules.active_in_all_profiles':
    'The rule is already activated on all available quality profiles.',
  'coding_rules.custom_severity.title': 'Rule severity in this quality profile',
  'coding_rules.custom_severity.description.standard':
    'Changing rule severity in a quality profile {link}',
  'coding_rules.custom_severity.description.standard.link':
    'does not change its recommended severity',
  'coding_rules.custom_severity.description.mqr':
    'In the multi-quality mode, severities are directly tied to the software quality impacted. This means that {link}',
  'coding_rules.custom_severity.description.mqr.link':
    'each software quality has its own severity per rule.',
  'coding_rules.custom_severity.not_recommended':
    'This is a custom rule severity, the recommended one is {recommended}',
  'coding_rules.custom_severity.choose_severity': 'Choose severity',
  'coding_rules.custom_severity.severity_with_recommended': '{severity} (recommended)',
  'coding_rules.activate': 'Activate',
  'coding_rules.activate_in': 'Activate In',
  'coding_rules.activate_in_quality_profile': 'Activate in quality profile',
  'coding_rules.activation_custom_severity':
    'Custom {count, plural, one {severity} other {severities}}:',
  'coding_rules.available_since': 'Available since',
  'coding_rules.bulk_change.success': '{2} rule(s) changed in profile {0} - {1}',
  'coding_rules.bulk_change.warning':
    '{2} rule(s) changed, {3} rule(s) ignored in profile {0} - {1}',
  'coding_rules.bulk_change.no_quality_profile': 'No quality profile.',
  'coding_rules.can_not_bulk_change':
    'Bulk change is only available when you have a custom quality profile to target. You can create a customizable quality profile based on a built-in one by Copying or Extending it in the quality profiles list.',
  'coding_rules.deactivate_inherited_rules_disabled':
    'Deactivation of inherited rules is disabled by an administrative setting (sonar.qualityProfiles.allowDisableInheritedRules)',
  'coding_rules.change_details': 'Change details of quality profile',
  'coding_rules.change_details_x': 'Change details of quality profile {0}',
  'coding_rules.context.others.title': 'How can I fix it in another component or framework?',
  'coding_rules.context.others.description.first':
    'Although the main framework or component you use in your project is not listed above, you may find helpful content in the instructions we provide.',
  'coding_rules.context.others.description.second':
    'Caution: The libraries mentioned in these instructions may not be appropriate for your code.',
  'coding_rules.context.others.description.do':
    'Do use libraries that are compatible with the frameworks you are using.',
  'coding_rules.context.others.description.dont':
    'Don’t blindly copy and paste the fixups into your code.',
  'coding_rules.context.others.title_feedback': 'Help us improve',
  'coding_rules.context.others.feedback_description_1':
    'Let us know if the instructions we provide do not work for you. Tell us which framework you use and why our solution does not work by submitting an idea on the {productName} productboard.',
  'coding_rules.context.others.feedback_description_2':
    'We will do our best to provide you with more relevant instructions in the future.',
  'coding_rules.context.others.feedback_description.link': 'Submit an idea',
  'coding_rules.create': 'Create',
  'coding_rules.create_custom_rule': 'Create Custom Rule',
  'coding_rules.custom_rule': 'Custom Rule',
  'coding_rules.custom_rule.help':
    'Custom rules are created by administrators from templates, and are the only fully-editable rules.',
  'coding_rules.custom_rule.activation_notice':
    'Note: parameters of a custom rule are not customizable on rule activation, only during creation/edit.',
  'coding_rules.custom_rule.software_quality_x': '{quality} software quality',
  'coding_rules.custom_rule.select_software_quality':
    'Please select at least one software quality.',
  'coding_rules.custom_rule.removal':
    'Only custom rules may be deleted. When a custom rule is deleted, it is not removed from the {productName} instance. Instead its status is set to "REMOVED", allowing relevant issues to continue to be displayed properly.',
  'coding_rules.custom_rules': 'Custom Rules',
  'coding_rules.deactivate_in_quality_profile': 'Deactivate in quality profile',
  'coding_rules.deactivate_in_quality_profile_x': 'Deactivate in quality profile {0}',
  'coding_rules.delete_rule': 'Delete Rule',
  'coding_rules.delete_rule_x': 'Delete Rule {name}',
  'coding_rules.delete.custom.confirm': 'Are you sure you want to delete custom rule "{name}"?',
  'coding_rules.extend_description': 'Extend Description',
  'coding_rules.deactivate_in': 'Deactivate In',
  'coding_rules.deactivate': 'Deactivate',
  'coding_rules.deactivate.confirm':
    'Are you sure you want to deactivate this rule in the profile?',
  'coding_rules.see_actions_for_profile_x': 'See rule actions for profile {x}',
  'coding_rules.inherits': '"{0}" inherits from "{1}"',
  'coding_rules.issues': 'Issues',
  'coding_rules.issues.only_main_branches':
    'Only issues from the main project branches are included.',
  'coding_rules.most_violating_projects': 'Most Violating Projects',
  'coding_rules.most_violating_projects.more_x':
    '{count} more projects contain issues raised from this rule. {link}',
  'coding_rules.most_violating_projects.link': 'See full list of issues',
  'coding_rules.need_extend_or_copy':
    "Rules in built-in quality profiles can't be changed. You can create a customizable quality profile based on a built-in one by Copying or Extending it in the quality profiles list.",
  'coding_rules.no_issue_detected_for_projects':
    'No issues were detected for this rule in the main project branches.',
  'coding_rules.no_tags': 'No tags',
  'coding_rules.original': 'Original:',
  'coding_rules.overrides': '"{0}" overrides "{1}"',
  'coding_rules.parameters': 'Parameters',
  'coding_rules.parameters.default_value': 'Default Value:',
  'coding_rules.quality_profiles': 'Quality profiles',
  'coding_rules.quality_profiles.description':
    "List of all quality profiles where this rule is activated. Built-in profiles can't be changed.",
  'coding_rules.quality_profile': 'Quality profile',
  'coding_rules.reactivate': 'Reactivate',
  'coding_rules.reactivate.help':
    'A rule with the same key has been previously deleted. Please reactivate the existing rule or modify the key to create a new rule.',
  'coding_rules.remove_extended_description': 'Remove Extended Description',
  'coding_rules.remove_extended_description.confirm':
    'Are you sure you want to remove the extended description?',
  'coding_rules.repository': 'Rule repo:',
  'coding_rules.revert_to_parent_definition': 'Revert to Parent Definition',
  'coding_rules.revert_to_parent_definition.confirm':
    'This rule will be reverted to the parameters defined in profile {0}. Are you sure?',
  'coding_rules.rule_template': 'Rule Template',
  'coding_rules.rule_template.help':
    'Rule Templates allow users to easily define their own rules. They are like cookie cutters from which you can stamp out new, "custom rules". The rules created from a template are listed on its rule detail page.',
  'coding_rules.rule_template.title':
    'This rule can be used as a template to create custom rules, it cannot be activated on a profile',
  'coding_rules._rules': 'rules',
  'coding_rules.show_template': 'Show Template',
  'coding_rules.skip_to_filters': 'Skip to rules filters',
  'coding_rules.software_qualities.label': 'Software qualities impacted',
  'coding_rules.cct_attribute.label': 'Code attribute',
  'coding_rules.prioritized_rule.title': 'Prioritized rule',
  'coding_rules.impact_severity.tooltip_customized.standard':
    '{type} of {severity} severity. This is a custom severity associated with the quality profile selected. Click for more information.',
  'coding_rules.impact_severity.tooltip_customized.mqr':
    '{severity} severity impact on {quality}. This is a custom severity associated with the quality profile selected. Click for more information.',
  'coding_rules.impact_customized.message': 'Rule severity was customized in this profile',
  'coding_rules.impact_customized.detail':
    '{softwareQuality} changed from {recommended} to {customized}',
  'coding_rules.severity_customized.message':
    'Rule severity was customized from {recommended} to {customized}',
  'coding_rules.prioritized_rule.switch_label':
    'All corresponding issues in the overall code should be fixed',
  'coding_rules.prioritized_rule.note':
    'For the quality gate to fail, you must add a condition that checks whether any issues have been raised from prioritised rules',
  'coding_rules.rule_name.title': 'Rule Name: {name}',
  'coding_rules.quality_profile.title': 'Quality profile: {name}',

  'coding_rules.update_custom_rule': 'Update Custom Rule',

  'coding_rules.filters.activation.active_rules': 'Active Rules',
  'coding_rules.filters.inheritance.inactive':
    'Inheritance criterion is available when an inherited quality profile is selected',
  'coding_rules.filters.inheritance.none': 'Not Inherited',
  'coding_rules.filters.inheritance.inherited': 'Inherited',
  'coding_rules.filters.inheritance.x_inherited_from_y': '{count} inherited from "{name}"',
  'coding_rules.filters.inheritance.overrides': 'Overridden',
  'coding_rules.filters.language.inactive':
    'Language criterion is only available when no quality profile is selected',
  'coding_rules.filters.security_hotspots': 'Security hotspot',
  'coding_rules.filters.status': 'Status',
  'coding_rules.filters.template.is_template': 'Show templates only',
  'coding_rules.filters.template.is_not_template': 'Hide templates',
  'coding_rules.filters.prioritizedRule.disabled':
    'Prioritized rules criterion is available when quality profile is selected',
  'coding_rules.filters.prioritizedRule.true': 'Show prioritized only',
  'coding_rules.filters.prioritizedRule.false': 'Hide prioritized',
  'coding_rules.facet.languages': 'Language',
  'coding_rules.facet.repositories': 'Repository',
  'coding_rules.facet.impactSeverities': 'Severity',
  'coding_rules.facet.active_impactSeverities': 'Severity',
  'coding_rules.facet.cleanCodeAttributeCategories': 'Code attribute',
  'coding_rules.facet.impactSoftwareQualities': 'Software quality',
  'coding_rules.facet.tags': 'Tags',
  'coding_rules.facet.qprofile': 'Quality profile',
  'coding_rules.facet.qprofile.help.title': 'Quality profiles',
  'coding_rules.facet.qprofile.help.desc':
    'Quality profiles are collections of Rules to apply during an analysis.',
  'coding_rules.facet.qprofile.help.extra':
    'When filtering active rules by quality profile, any customized rule severity associated with it will be shown.',
  'coding_rules.facet.qprofile.help.learn_more': 'Learn more about quality profiles',
  'coding_rules.facet.qprofile.link': 'See also: Quality profiles',
  'coding_rules.facet.debt_characteristics': 'Characteristic',
  'coding_rules.facet.severities': 'Severity',
  'coding_rules.facet.active_severities': 'Severity',
  'coding_rules.facet.statuses': 'Status',
  'coding_rules.facet.available_since': 'Available since',
  'coding_rules.facet.inheritance': 'Inheritance',
  'coding_rules.facet.template': 'Template',
  'coding_rules.facet.types': 'Type',
  'coding_rules.facet.prioritizedRule': 'Prioritized rules',
  'coding_rules.facet.security_hotspots.show_only': 'Show security hotspots only',

  'coding_rules.rule_id': 'Rule ID:',

  'coding_rules.analysis_scope': 'Analysis scope:',

  'coding_rules.scope.MAIN': 'main sources',
  'coding_rules.scope.TEST': 'test sources',
  'coding_rules.scope.ALL': 'all sources',

  'coding_rules.remediation_effort': 'Effort:',
  'coding_rules.remediation_function': 'Remediation function',
  'coding_rules.remediation_function.LINEAR': 'Linear',
  'coding_rules.remediation_function.LINEAR_OFFSET': 'Linear with offset',
  'coding_rules.remediation_function.CONSTANT_ISSUE': 'Constant/issue',
  'coding_rules.remediation_function.coeff': 'Coeff',
  'coding_rules.remediation_function.offset': 'Offset',
  'coding_rules.remediation_function.constant': 'Constant',

  'coding_rules.external_rule.engine_tooltip': 'Rule provided by an external rule engine: {0}',
  'coding_rules.external_rule.engine': 'Engine:',

  'coding_rules.description_section.title.root_cause': 'Why is this an issue?',
  'coding_rules.description_section.title.root_cause.SECURITY_HOTSPOT': 'What is the risk?',
  'coding_rules.description_section.title.assess_the_problem': 'Assess the risk',
  'coding_rules.description_section.title.how_to_fix': 'How can I fix it?',
  'coding_rules.description_section.title.code_fix': 'AI CodeFix',
  'coding_rules.description_section.title.more_info': 'More info',
  'coding_rules.description_section.title.activity': 'Activity',

  'coding_rules.description_context.title': 'Which component or framework contains the issue?',
  'coding_rules.description_context.subtitle': 'How can I fix it in {0}?',
  'coding_rules.description_context.default_information':
    '{0} was detected as the most relevant component or framework for this issue.',
  'coding_rules.description_context.other': 'Other',

  'coding_rules.more_info.education_principles.title': 'Code principles',
  'coding_rules.more_info.resources.title': 'Resources',

  'coding_rules.more_info.notification_message':
    "We've added new information about Code principles below to help you improve your code quality and security. Take a moment to read through them.",
  'coding_rules.more_info.scroll_message': 'Scroll down to code quality principles',

  'coding_rules.detail.extend_description.form': "Extend this rule's description",
  'coding_rules.create_tag': 'Create Tag',

  'coding_rules.select_profile': 'Select Profile',
  'coding_rules.selected_profiles': 'Selected Profiles',

  'coding_rules.custom.type.label': 'Type',
  'coding_rules.custom.type.option.ISSUE': 'Issue',
  'coding_rules.custom.type.option.SECURITY_HOTSPOT': 'Security Hotspot',

  'coding_rules.system_tags_tooltip':
    "This tag can't be removed because it has been predefined by our system",

  'coding_rules.rule_impacts_aria_label': 'Rule impacts for {key}',
  'coding_rules.software_impacts_aria_label': 'Software impacts for rule {key}',
  'coding_rules.custom_activation_impacts_aria_label': 'Custom activation impacts for {key}',

  'issue.jira.work_item_deletion_error': 'Failed removing link to Jira issue {0}',
  'issue.jira.work_item_deletion_link': 'Remove link',
  'issue.jira.work_item_deletion_tooltip': 'Remove link to Jira issue',
  'issue.jira.work_item_deletion_modal_description':
    'This action cannot be undone. Deleting this connection only removes the link between SonarQube and Jira; it will not delete any work items in Jira itself.',
  'issue.jira.work_item_deletion_modal_title': 'Are you sure you want to remove the Jira link?',
  'issue.jira.work_item_deletion_success': 'Link to Jira issue {0} has been removed',
  'issue.jira.work_item_creation': 'Push to Jira',
  'issue.jira.work_item_creation.in_progress': 'Pushing to Jira',
  'issue.jira.work_item_creation_success': 'Work item {0} created in Jira',
  'issue.jira.work_type_dropdown': 'Choose Jira work type',

  //------------------------------------------------------------------------------
  //
  // SEVERITIES
  //
  //------------------------------------------------------------------------------

  'severity.BLOCKER': 'Blocker',
  'severity.BLOCKER.description': 'Must be fixed immediately.',
  'severity.CRITICAL': 'Critical',
  'severity.CRITICAL.description': 'Must be reviewed immediately and fixed soon.',
  'severity.MAJOR': 'Major',
  'severity.MAJOR.description': 'High potential for significant to moderate impact.',
  'severity.MINOR': 'Minor',
  'severity.MINOR.description': 'Potential for moderate to minor impact.',
  'severity.INFO': 'Info',
  'severity.INFO.description': 'Neither a bug nor a quality flaw. Just a finding.',
  'severity.HIGH': 'High',
  'severity.MEDIUM': 'Medium',
  'severity.LOW': 'Low',

  // New severities
  'severity_impact.title': '{x} severity of impact',
  'severity_impact.levels': 'Severity levels',
  'severity_impact.BLOCKER': 'Blocker',
  'severity_impact.BLOCKER.description': 'Must be fixed immediately.',
  'severity_impact.HIGH': 'High',
  'severity_impact.HIGH.description': 'Must be reviewed immediately and fixed soon.',
  'severity_impact.MEDIUM': 'Medium',
  'severity_impact.MEDIUM.description': 'High potential for significant to moderate impact.',
  'severity_impact.LOW': 'Low',
  'severity_impact.LOW.description': 'Potential for moderate to minor impact.',
  'severity_impact.INFO': 'Info',
  'severity_impact.INFO.description': 'Neither a bug nor a quality flaw. Just a finding.',
  'severity_impact.help.description':
    '<p1>Severities are now directly tied to the software quality impacted. This means that one software quality impacted has one severity.</p1><p>They can be changed with sufficient permissions.</p>',
  'severity_impact.help.link': 'Learn more about severity and software qualities',
  'severity_impact.help.line1':
    'Severities are now directly tied to the software quality impacted. This means that one software quality impacted has one severity.',
  'severity_impact.help.line2':
    'There are five levels of severity: blocker, high, medium, low and info.',

  'severity.icon.label': 'Severity: {severity}',

  //------------------------------------------------------------------------------
  //
  // SOFTWARE QUALITIES
  //
  //------------------------------------------------------------------------------

  software_quality: 'Software quality',
  'software_quality.SECURITY': 'Security',
  'software_quality.RELIABILITY': 'Reliability',
  'software_quality.MAINTAINABILITY': 'Maintainability',

  'software_impact.button': '{severity} severity impact on {quality}. Click for more information.',
  'software_impact.button.change':
    '{severity} severity impact on {quality}. Click to change the severity.',
};
