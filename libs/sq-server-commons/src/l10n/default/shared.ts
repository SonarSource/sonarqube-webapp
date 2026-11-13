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

export const sharedMessages = {
  //------------------------------------------------------------------------------
  //
  // Open in IDE
  //
  //------------------------------------------------------------------------------
  open_in_ide: 'Open in IDE',
  'open_in_ide.safari.not_supported': 'Not supported',
  'open_in_ide.safari.not_supported.title': 'Feature not supported in Safari',
  'open_in_ide.safari.not_supported.description':
    'The "Open in IDE" feature is not supported in Safari. This is due to Safari\'s strict security policies regarding custom protocol links which are required to open files directly in your IDE. Please use Chrome or Firefox for this functionality.',

  //------------------------------------------------------------------------------
  //
  // Open Fix in ide
  //
  //------------------------------------------------------------------------------
  view_fix_in_ide: 'View fix in IDE',
  'fix_in_ide.report_success': 'Success. Switch to your IDE to see the fix.',
  'fix_in_ide.report_error': 'Unable to open the fix in the IDE.',
  'unable_to_find_ide_with_fix.error':
    'Unable to find IDE with capabilities to show fix suggestions',

  //------------------------------------------------------------------------------
  //
  // ALM
  //
  //------------------------------------------------------------------------------

  'alm.azure': 'Azure DevOps',
  'alm.azure.short': 'Azure DevOps',
  'alm.bitbucket': 'Bitbucket',
  'alm.bitbucket.short': 'Bitbucket',
  'alm.bitbucket.long': 'Bitbucket Data Center',
  'alm.bitbucketcloud': 'Bitbucket',
  'alm.bitbucket_cloud': 'Bitbucket',
  'alm.bitbucketcloud.short': 'Bitbucket',
  'alm.bitbucketcloud.long': 'Bitbucket Cloud',
  'alm.github': 'GitHub',
  'alm.github.short': 'GitHub',
  'alm.github.organization': 'organization',
  'alm.gitlab': 'GitLab',
  'alm.gitlab.short': 'GitLab',
  'alm.configuration.selector.label': '{0} configuration',
  'alm.configuration.selector.placeholder': 'Select a configuration',

  //------------------------------------------------------------------------------
  //
  // RESOURCE QUALIFIERS
  //
  //------------------------------------------------------------------------------

  'qualifier.TRK': 'Project',
  'qualifier.DIR': 'Directory',
  'qualifier.PAC': 'Package',
  'qualifier.VW': 'Portfolio',
  'qualifier.SVW': 'Portfolio',
  'qualifier.APP': 'Application',
  'qualifier.FIL': 'File',
  'qualifier.CLA': 'File',
  'qualifier.UTS': 'Test File',

  'qualifier.configuration.TRK': 'Project Configuration',
  'qualifier.configuration.VW': 'Portfolio Configuration',
  'qualifier.configuration.SVW': 'Portfolio Configuration',
  'qualifier.configuration.APP': 'Application Configuration',

  'qualifiers.TRK': 'Projects',
  'qualifiers.DIR': 'Directories',
  'qualifiers.PAC': 'Packages',
  'qualifiers.VW': 'Portfolios',
  'qualifiers.SVW': 'Portfolios',
  'qualifiers.APP': 'Applications',
  'qualifiers.FIL': 'Files',
  'qualifiers.CLA': 'Files',
  'qualifiers.UTS': 'Test Files',

  'qualifiers.all.TRK': 'All Projects',
  'qualifiers.all.VW': 'All Portfolios',
  'qualifiers.all.APP': 'All Applications',

  'qualifiers.new.TRK': 'New Project',
  'qualifiers.new.VW': 'New Portfolio',
  'qualifiers.new.APP': 'New Application',

  'qualifier.delete.TRK': 'Delete Project',
  'qualifier.delete.VW': 'Delete Portfolio',
  'qualifier.delete.APP': 'Delete Application',

  'qualifiers.delete.TRK': 'Delete Projects',
  'qualifiers.delete.VW': 'Delete Portfolios',
  'qualifiers.delete.APP': 'Delete Applications',

  'qualifier.delete_confirm.TRK': 'Do you want to delete this project?',
  'qualifier.delete_confirm.VW': 'Do you want to delete this portfolio?',
  'qualifier.delete_confirm.APP': 'Do you want to delete this application?',

  'qualifiers.delete_confirm.TRK': 'Do you want to delete these projects?',
  'qualifiers.delete_confirm.VW': 'Do you want to delete these portfolios?',
  'qualifiers.delete_confirm.APP': 'Do you want to delete these applications?',

  'qualifiers.create.TRK': 'Create Project',
  'qualifiers.create.VW': 'Create Portfolio',
  'qualifiers.create.APP': 'Create Application',

  'qualifiers.update.VW': 'Update Portfolio',
  'qualifiers.update.APP': 'Update Application',

  'qualifier.description.VW': 'Potentially multi-level, management-oriented overview aggregation.',
  'qualifier.description.SVW': 'Potentially multi-level, management-oriented overview aggregation.',
  'qualifier.description.APP':
    'Single-level aggregation with a technical focus and a project-like homepage.',

  //------------------------------------------------------------------------------
  //
  // EVENT CATEGORIES
  //
  //------------------------------------------------------------------------------

  'event.category.VERSION': 'Version',
  'event.category.QUALITY_GATE': 'Quality gate',
  'event.category.QUALITY_PROFILE': 'Quality profile',
  'event.category.SQ_UPGRADE': '{productName} upgrade',
  'event.category.DEFINITION_CHANGE': 'Definition Change',
  'event.category.OTHER': 'Other',
  'event.quality_gate.still_x': 'Still {status}',
  'event.quality_gate.ERROR': 'Failed',
  'event.quality_gate.OK': 'Passed',
  'event.definition_change.added': "''{project}'' added",
  'event.definition_change.removed': "''{project}'' removed",
  'event.definition_change.branch_added': "''{project}'' ''{branch}'' added",
  'event.definition_change.branch_removed': "''{project}'' ''{branch}'' removed",
  'event.definition_change.branch_replaced':
    "''{project}'' ''{oldBranch}'' replaced with ''{newBranch}''",
  'event.failed_conditions': 'Failed Conditions:',
  'event.sqUpgrade': 'First analysis since updating to {productName} {sqVersion}',

  //------------------------------------------------------------------------------
  //
  // GLOBAL NAVIGATION
  //
  //------------------------------------------------------------------------------

  'global_nav.news.tooltip': 'Product news',

  //------------------------------------------------------------------------------
  //
  // LAYOUT
  //
  //------------------------------------------------------------------------------

  'layout.home': 'Home',
  'layout.login': 'Log in',
  'layout.logout': 'Log out',
  'layout.measures': 'Measures',
  'layout.settings': 'Administration',
  'layout.policies': 'Policies',
  'layout.onboarding_dashboard': 'Project coverage',
  'layout.security_hotspots': 'Security hotspots',
  'layout.settings.TRK': 'Project settings',
  'layout.settings.APP': 'Application settings',
  'layout.settings.VW': 'Portfolio settings',
  'layout.settings.SVW': 'Portfolio settings',
  'layout.security_reports': 'Compliance reports',

  // Quality Gate History
  'layout.quality_gate_history': 'Quality gate history',
  'layout.nav.home_logo_alt': 'Logo, link to homepage',
  'layout.nav.home_sonarqube_logo_alt': '{productName} logo, link to homepage',

  'sidebar.agentic_tasks': 'Agentic tasks',
  'sidebar.ai_capabilities': 'AI capabilities',
  'sidebar.projects': 'Projects',
  'sidebar.project_settings': 'Configuration',
  'sidebar.security': 'Security',
  'sidebar.system': 'System',

  //------------------------------------------------------------------------------
  //
  // AGENTIC TASKS
  //
  //------------------------------------------------------------------------------

  'agentic_tasks.page': 'Agentic tasks',
  'agentic_tasks.page.description':
    'This page allows for the continuous monitoring of tasks performed by Hunter Agent and Remediation Agent.',
  'agentic_tasks.empty': 'No agentic tasks found',
  'agentic_tasks.error.title': 'Something went wrong while loading agentic tasks.',
  'agentic_tasks.error.retry': 'Retry',
  'agentic_tasks.date_filter': 'Date',
  'agentic_tasks.search_by_id': 'Search by Task ID',
  'agentic_tasks.status.ALL': 'All',
  'agentic_tasks.status.ALL_EXCEPT_PENDING': 'All Except Pending',
  'agentic_tasks.status.PENDING': 'Pending',
  'agentic_tasks.status.IN_PROGRESS': 'In Progress',
  'agentic_tasks.status.COMPLETED': 'Completed',
  'agentic_tasks.status.FAILED': 'Failed',
  'agentic_tasks.type.ALL': 'All',
  'agentic_tasks.type.HUNTER': 'Hunter Agent',
  'agentic_tasks.type.REMEDIATION': 'Remediation Agent',
  'agentic_tasks.table.status': 'Status',
  'agentic_tasks.table.task': 'Task',
  'agentic_tasks.table.task.id': 'ID',
  'agentic_tasks.table.submitted': 'Submitted',
  'agentic_tasks.table.started': 'Started',
  'agentic_tasks.table.finished': 'Finished',
  'agentic_tasks.table.duration': 'Duration',
  'agentic_tasks.actions': 'Actions for task {id}',
  'agentic_tasks.actions.download_logs': 'Download logs',
  'agentic_tasks.in_progress': 'in progress',
  'agentic_tasks.in_progress.description':
    'The number of agentic tasks that are currently in progress.',
  'ai_capabilities_select.provider.placeholder': 'Select a provider',
  'ai_capabilities_select.provider.empty':
    'No LLM providers connected yet. Connect one to choose it here.',
  'ai_capabilities_select.provider.model.help_intro':
    'Enter the slug of a supported model. Make sure it matches the format of your provider.',
  'ai_capabilities_select.provider.empty.link': 'Go to LLM providers',
  'ai_capabilities_select.provider.model.label': 'Primary model slug',
  'ai_capabilities_select.provider.model.help':
    'Supported {count, plural, one {model} other {models}}: {models}',
  'ai_capabilities_select.provider.secondary_model.label': 'Secondary model slug',
  'ai_capabilities_select.provider.secondary_model.help':
    'For primary model {primary}, the secondary supported {count, plural, one {model is} other {models are}} {models}',
  'ai_capabilities_select.provider.save.aria_label': 'Save provider selection',
  'ai_capabilities_select.provider.saved': 'Provider selection saved',
  'ai_capabilities_select.provider.error':
    "Couldn't save this selection. Check the provider and model, then try again.",

  //------------------------------------------------------------------------------
  //
  // VISIBILITY
  //
  //------------------------------------------------------------------------------

  'visibility.both': 'Public, Private',
  'visibility.public': 'Public',
  'visibility.public.description.TRK':
    'This project is public. Anyone can browse and see the source code.',
  'visibility.public.description.VW': 'This portfolio is public. Anyone can browse it.',
  'visibility.public.description.APP': 'This application is public. Anyone can browse it.',
  'visibility.public.description.short': 'Anyone can browse and see the source code.',
  'visibility.public.description.long':
    'Anyone will be able to browse your source code and see the result of your analysis.',
  'visibility.private': 'Private',
  'visibility.private.description.TRK':
    'This project is private. Only authorized users can browse and see the source code.',
  'visibility.private.description.VW':
    'This portfolio is private. Only authorized users can browse it.',
  'visibility.private.description.APP':
    'This application is private. Only authorized users can browse it.',
  'visibility.private.description.short':
    'Only authorized users can browse and see the source code.',
  'visibility.private.description.long':
    'Only members of the organization will be able to browse your source code and see the result of your analysis.',
  'coding_rule.page': '{0} rule: {1}',
  'roles.page.description2':
    'Grant and revoke project-level permissions. Permissions can be granted to groups or individual users.',
  'roles.page.description_portfolio':
    'Grant and revoke portfolio-level permissions. Permissions can be granted to groups or individual users.',
  'roles.page.description_application':
    'Grant and revoke application-level permissions. Permissions can be granted to groups or individual users.',
  'roles.page.description.github':
    'Project permissions are read-only for users provisioned from GitHub. For non-GitHub users, permissions can only be removed.',
  'roles.page.description.gitlab':
    'Project permissions are read-only for users provisioned from GitLab. For non-GitLab users, permissions can only be removed.',
  'roles.page.change_visibility': 'Change project visibility',
  'roles.page.change_visibility.readonly.github':
    'Project visibility is synchronized from GitHub and cannot be changed here.',
  'roles.page.change_visibility.readonly.gitlab':
    'Project visibility is synchronized from GitLab and cannot be changed here.',
  'project_permission.managed': 'Provisioned from {0}',
  'project_permission.local_project_with_github_provisioning':
    'Please note that this project is not linked to GitHub. Bind it to GitHub to benefit from permission provisioning.',
  'project_permission.local_project_with_gitlab_provisioning':
    'Please note that this project is not linked to GitLab. Bind it to GitLab to benefit from permission provisioning.',
  'project_permission.remove_only_confirmation':
    'Are you sure you want to remove the permission {permission} from {holder}? The permission can not be added back.',
  'project_permission.remove_only_confirmation_title': 'Remove permission',
  'projects_management.page.description':
    'Use this page to delete multiple projects at once, or to provision projects if you would like to configure them before the first analysis. Note that once a project is provisioned, you have access to perform all project configurations on it.',
  'system_info.page': 'System info',

  'update_key.page': 'Update key',
  'update_key.page.description':
    'Edit the key of a project. Key changes must be made here BEFORE analyzing the project with the new keys, otherwise the analysis will simply create another project with the new key, rather than updating the existing project.',
  'deletion.page': 'Deletion',
  'project_deletion.page.description': 'Delete this project. The operation cannot be undone.',
  'portfolio_deletion.page.description':
    'This portfolio and its sub-portfolios will be deleted. If this portfolio is referenced by other entities, it will be removed from them. Independent entities referenced by this portfolio, such as projects and other top-level portfolios will not be deleted. This operation cannot be undone.',
  'application_deletion.page.description':
    'Delete this application. Application projects will not be deleted. Projects referenced by this application will not be deleted. This operation cannot be undone.',
  'application.branches.help':
    'Easily create Application branches composed of the branches of projects in your application.',
  'application.branches.link': 'Create Branch',

  'project_baseline.page': 'New code',
  'project_baseline.page.description':
    "The new code definition sets the criteria for what's considered new code, allowing you to focus on the most recent changes in your project.",
  'project_baseline.page.description2':
    'This setting allows project administrators to customize the new code definition for their project.',
  'project_baseline.page.description3':
    "The instance's default new code definition can be adjusted in the <link>general settings.</link>",
  'project_baseline.page.selection.label': 'Project definition of new code',
  'project_baseline.global_setting': 'Follows the instance’s default',
  'project_baseline.global_setting.description': 'Current default: {default}',
  'project_baseline.specific_setting': 'Is custom',
  'project_baseline.specific_setting.description':
    'Choose whether it should be the <b>previous version</b>, a <b>number of days</b> or a <b>reference branch</b>',
  'project_baseline.configure_branches': 'Set a specific setting for a branch',
  'project_baseline.compliance.warning.title.project':
    'Your project new code definition is not recommended by Sonar',
  'project_baseline.update_success': 'New code definition has been updated',

  'baseline.specific_analysis': 'Specific analysis',
  'baseline.reference_branch': 'Reference branch',

  'baseline.next_analysis_notice': 'Changes will take effect after the next analysis',

  'baseline.reference_branch.does_not_exist':
    'Branch {branch} could not be found in {productName}.',
  'baseline.reference_branch.invalid_branch_setting':
    'Branch {0} cannot use itself as a reference. Define a specific setting instead of using the project-level setting.',

  'branch_list.branch': 'Branch',
  'branch_list.current_setting': 'Setting',
  'branch_list.actions': 'Actions',
  'branch_list.show_actions_for_x': 'Show actions for branch {0}',
  'branch_list.edit_for_x': 'Edit {0}',
  'branch_list.default_setting': 'Project setting',

  'baseline.new_code_period_for_branch_x': 'New Code for {0}',
  'baseline.new_code_period_for_branch_x.question':
    'Choose the baseline for new code for this branch',

  'regulatory_report.page': 'Regulatory report',
  'regulatory_report.description1':
    'The <link>Regulatory report</link> is a .zip file that contains a detailed snapshot of a selected project branch. {br} It is comprised of a selection of .txt, .csv, and .pdf files containing:',
  'regulatory_report.bullet_point1': 'An overview of the selected branch of the project.',
  'regulatory_report.bullet_point2':
    "The configuration items relevant to the project's quality (quality profile, quality gate, and analysis exclusions).",
  'regulatory_report.bullet_point3':
    'Lists of findings for both new and overall code on the selected branch.',
  'regulatory_report.description2':
    'Report generation and download may take a few minutes depending on the project size.',
  'regulatory_page.download_button': 'Download report',
  'regulatory_page.download_start.sentence':
    'Your download should start shortly. This may take some time.',
  'regulatory_page.select_branch': 'Choose project branch',
  'regulatory_page.no_available_branch':
    'No branch has been analyzed yet, no report can be generated.',
  'regulatory_page.available_branches_info.only_keep_when_inactive':
    'Only branches marked as "Keep when inactive" are available.',
  'regulatory_page.available_branches_info.more_info':
    'For further details, please check the {doc_link}.',
  'regulatory_page.available_branches_info.more_info.doc_link': 'related documentation',

  //------------------------------------------------------------------------------
  //
  // OTHER PAGE TITLES
  //
  //------------------------------------------------------------------------------

  'page_title.template.default': '%s - {productName}',
  'page_title.template.with_category': '%s - {page} - {productName}',
  'page_title.template.with_instance': '{project} - %s - {productName}',
  'code.page': 'Code',
  'view_projects.page': 'Projects',
  'portfolio_breakdown.page': 'Portfolio breakdown',

  //------------------------------------------------------------------------------
  //
  // ASYNC PROCESS
  //
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  //
  // SESSION
  //
  //------------------------------------------------------------------------------

  'sessions.log_in': 'Log in',
  //------------------------------------------------------------------------------
  //
  // Audit Logs
  //
  //------------------------------------------------------------------------------

  'audit_logs.page': 'Audit logs',
  'audit_logs.page.description.1':
    'Audit Logs help Administrators keep control and traceability of security related changes performed on the platform.',
  'audit_logs.page.description.2':
    'Your instance is set to keep audit logs for {housekeeping}. You can change the number of days by updating your {link}.',
  'audit_logs.page.description.link': 'housekeeping policy',

  'audit_logs.housekeeping_policy.Weekly': '7 days',
  'audit_logs.housekeeping_policy.Monthly': '30 days',
  'audit_logs.housekeeping_policy.Trimestrial': '90 days',
  'audit_logs.housekeeping_policy.Yearly': 'one year',

  'audit_logs.download': 'Download Audit Logs',
  'audit_logs.download_start.sentence.1':
    'Your download should start shortly. For longer periods this might take some time.',
  'audit_logs.download_start.sentence.2':
    'If the download doesn’t start after a few seconds, try to reduce the period for which you are fetching audit logs.',
  'audit_logs.download_start.sentence.3':
    'Change your selection above to download additional audit logs.',

  'audit_logs.range_option.today': 'Today',
  'audit_logs.range_option.7days': '7 days',
  'audit_logs.range_option.30days': '30 days',
  'audit_logs.range_option.90days': '90 days',
  'audit_logs.range_option.custom': 'Custom',

  //------------------------------------------------------------------------------
  //
  // HOTSPOTS
  //
  //------------------------------------------------------------------------------

  'risk_exposure.HIGH': 'High',
  'risk_exposure.MEDIUM': 'Medium',
  'risk_exposure.LOW': 'Low',

  'hotspot.label': 'Security hotspot on file {file} - {issue},',
  'hotspot.label_with_line': 'Security hotspot on file {file} and line {line} - {issue},',
  'hotspot.filters.title': 'Filters',
  'hotspot.filters.title_x': 'Apply filters to security hotspots; currently applied: {count}',
  'hotspot.filters.assignee.assigned_to_me': 'Assigned to me',
  'hotspot.filters.clear': 'Clear filters',
  'hotspot.filters.status': 'Status filter',
  'hotspot.filters.status.to_review': 'To review',
  'hotspot.filters.status.TO_REVIEW': 'To review',
  'hotspot.filters.status.acknowledged': 'Acknowledged',
  'hotspot.filters.status.fixed': 'Fixed',
  'hotspot.filters.status.FIXED': 'Fixed',
  'hotspot.filters.period.since_leak_period': 'New code',
  'hotspot.filters.status.safe': 'Safe',
  'hotspot.filters.status.SAFE': 'Safe',
  'hotspot.filters.by_file_or_list_x': 'Your hotspots are currently filtered, {show_all_link}',
  'hotspot.filters.show_all': 'show all hotspots',
  'hotspot.section.activity': 'Activity',
  'hotspot.location.count': '{number} extra location',
  'hotspot.location.count.plural': '{number} extra locations',
  'tags.add_tags': 'Add Tags',
  'tags.remove_tags': 'Remove Tags',
  'tags.edit_button_label': 'Edit tags: {tags}',

  // StatusTransition
  'status_transition.status_x_click_to_change': 'Status: {0}, click to change',
  'status_transition.transition': 'Transition',
  'status_transition.accept': 'Accept',
  'status_transition.accept.to_status': 'Accepted',
  'status_transition.accept.description':
    "Won't fix immediately, but will no longer affect the quality gate",
  'status_transition.confirm': 'Confirm',
  'status_transition.confirm.description':
    'Confirmation that the issue is valid. Issue impacts the quality gate',
  'status_transition.confirm.to_status': 'Confirmed',
  'status_transition.unconfirm': 'Open',
  'status_transition.unconfirm.description': 'Issue impacts the quality gate',
  'status_transition.unconfirm.to_status': 'Open',
  'status_transition.resolve': 'Fixed',
  'status_transition.resolve.description':
    'Marked manually as fixed, but will reopen after the next analysis',
  'status_transition.resolve.to_status': 'Fixed',
  'status_transition.falsepositive': 'False Positive',
  'status_transition.falsepositive.description': 'Analysis is incorrect',
  'status_transition.falsepositive.to_status': 'False Positive',
  'status_transition.reopen': 'Open',
  'status_transition.reopen.description': 'Issue impacts the quality gate',
  'status_transition.reopen.to_status': 'Open',
  'status_transition.wontfix': "Won't Fix",
  'status_transition.wontfix.description': 'Deprecated',
  'status_transition.wontfix.to_status': "Won't Fix",
  'status_transition.comment.title': 'Add status change comment (optional)',
  'status_transition.comment.label': 'Why should the current status be changed to "{status}"?',
  'status_transition.comment.placeholder': 'Add the comment',
  'status_transition.comment.share': 'Share this comment with Sonar to help us improve analyzers',
  'status_transition.comment.share.helper':
    'The following details will be shared with SonarQube Server:<br></br><br></br>Current file: code, language, project key.<br></br>Issue details: creation and update date, line, location, resolution, severity, status.<br></br>Rule details: rule repository and key.<br></br>Feedback: comment, date.<br></br><br></br>Data is shared with SonarSource Sàrl for 1 month.',
  'status_transition.change_status': 'Change status',
  'project_issues.assign_to_agent.success.title':
    '{issueCount, plural, one {# issue} other {# issues}} assigned to Remediation Agent',
  'project_issues.assign_to_agent.partial_success.title':
    '{issueCount, plural, one {# issue} other {# issues}} assigned to Agent, some failed',
  'project_issues.assign_to_agent.partial_success.description':
    'Some issues could not be assigned. Try again for the ones that are still selected.',
  'project_issues.assign_to_agent.error.title': 'Failed to assign issues',
  'project_issues.assign_to_agent.error.description':
    'Unable to create the Agent job. Please try again.',
  'project_issues.assign_to_agent.all_unsupported.languages':
    'All selected issues have unsupported languages and cannot be assigned to Remediation Agent.',
  'project_issues.assign_to_agent.all_unsupported.rules':
    'All selected issues have unsupported rules and cannot be assigned to Remediation Agent.',
  'project_issues.assign_to_agent.all_unsupported.status':
    'All selected issues have a status that cannot be assigned to Remediation Agent.',
  'project_issues.assign_to_agent.all_unsupported.multiple_reasons':
    'All selected issues cannot be assigned to Remediation Agent.',
  'project_issues.assign_to_agent.some_unsupported.languages':
    '{count} selected issue(s) have unsupported languages and will not be assigned to Remediation Agent.',
  'project_issues.assign_to_agent.some_unsupported.rules':
    '{count} selected issue(s) have unsupported rules and will not be assigned to Remediation Agent.',
  'project_issues.assign_to_agent.some_unsupported.status':
    '{count} selected issue(s) have a status that cannot be assigned to Remediation Agent.',
  'project_issues.assign_to_agent.some_unsupported.multiple_reasons':
    '{count} selected issue(s) cannot be assigned to Remediation Agent.',
  'pull_request.assign_to_agent': 'Fix with agent',
  'pull_request.assign_to_agent.fix_issues': 'Fix {count, plural, one {# issue} other {# issues}}',
  'pull_request.assign_to_agent.opens_pr': 'Opens 1 PR',
  'pull_request.assign_to_agent.loading': 'Assigning issues to Agent',
  'pull_request.assign_to_agent.success.title':
    '{issueCount, plural, one {# issue} other {# issues}} assigned to Remediation Agent',
  'pull_request.assign_to_agent.success.description':
    'The Remediation Agent job for this pull request has started.',
  'pull_request.assign_to_agent.error.title': 'Failed to assign issues',
  'pull_request.assign_to_agent.error.description':
    'Unable to create the Remediation Agent job. Please try again.',
  'pull_request.assign_to_agent.view_agent_activity': 'View Remediation Agent activity',
  'pull_request.assign_to_agent.status_loading': 'Loading Remediation Agent status',
  'pull_request.assigned_to_agent': 'Assigned to Remediation Agent',
  'pull_request.assign_to_agent.ready_to_review': 'Ready to review',
  'pull_request.assign_to_agent.pr_opened': '1 PR opened',
  'pull_request.assign_to_agent.fix_pr_number': 'Fix PR #{prNumber}',
  'pull_request.assign_to_agent.failed.description': 'Remediation Agent encountered an error',
  'pull_request.assign_to_agent.retry': 'Retry',
  'project_agent_activity.title': 'Remediation Agent',
  'project_agent_activity.description':
    'Track your Remediation Agent activity for this project. Monitor jobs, observe their progress, and access detailed information for each task.',
  'project_agent_activity.empty': 'No agent jobs yet',
  'project_agent_activity.error.title': 'Something went wrong while loading agent jobs.',
  'project_agent_activity.error.retry': 'Retry',
  'project_agent_activity.error.download_logs_hint':
    'For more information, ask your instance administrator to download the Agentic tasks logs from the administration section.',
  'project_agent_activity.unavailable.title': 'Remediation Agent is not currently available',
  'project_agent_activity.unavailable.non_admin.body':
    'Past activity is shown below, but no new fixes will be proposed. Contact your system administrator to reactivate Remediation Agent.',
  'project_agent_activity.unavailable.admin.body':
    'Past activity is shown below, but no new fixes will be proposed. Reactivate Remediation Agent to resume.',
  'project_agent_activity.unavailable.admin.cta': 'Manage settings',
  'project_agent_activity.table.status_duration': 'Status / Duration',
  'project_agent_activity.table.started': 'Started',
  'project_agent_activity.table.source': 'Source',
  'project_agent_activity.table.outcome': 'Outcome',
  'project_agent_activity.source.backlog': 'Manual',
  'project_agent_activity.source.scheduled': 'Automated',
  'project_agent_activity.source.pull_request': 'Pull request',
  'project_agent_activity.outcome.view_pull_request': 'View pull request',
  'project_agent_activity.started.today': 'Today',
  'project_agent_activity.started.yesterday': 'Yesterday',
  'project_agent_activity.total_shown': '{total} shown',
  'project_agent_activity.show_more': 'Show more',

  //------------------------------------------------------------------------------
  //
  // ISSUE BULK CHANGE
  //
  //------------------------------------------------------------------------------

  'issue_bulk_change.form.title': 'Change {0} issues',
  'issue_bulk_change.selected': '{0} issues selected',
  'issue_bulk_change.max_issues_reached':
    'There are more issues available than can be treated by a single bulk action. Your changes will only be applied to the first {max} issues.',
  'issue_bulk_change.max_issues_reached.assign_to_agent':
    'More issues are selected than can be processed. <b>Assign to Agent</b> is limited to <b>20</b> issues.',
  'issue_bulk_change.max_issues_reached.bulk_change.with_assign_to_agent':
    'More issues are selected than can be processed. <b>Bulk Change</b> is limited to <b>500</b> issues, and <b>Assign to Agent</b> is limited to <b>20</b> issues.',
  'issue_bulk_change.x_issues': '{0} issues',
  'issue_bulk_change.no_match': 'There is no issue matching your filter selection',
  'issue_bulk_change.assignee.change': 'Assign the selected issues to a user',
  'issue_bulk_change.select_tags': 'Select tags',
  'issue_bulk_change.selected_tags': 'Selected tags',
  'issue_bulk_change.resolution_comment': 'Resolution comment',
  'mttr.x_day': '{value} day',
  'mttr.x_days': '{value} days',
  'mttr.x_hour': '{value} hour',
  'mttr.x_hours': '{value} hours',
  'mttr.x_minutes': '{value} min',
  'mttr.x_month': '{value} month',
  'mttr.x_months': '{value} months',
  'mttr.x_year': '{value} year',
  'mttr.x_years': '{value} years',
  'mttr.short.x_days': '{value} d',
  'mttr.short.x_hours': '{value} hr',
  'mttr.short.x_months': '{value} mo',
  'mttr.short.x_years': '{value} yr',
  'quality_gate.breakdown.distribution_title': 'Failed conditions distribution',
  'quality_gate.breakdown.new_code': 'New code: {count}',
  'quality_gate.breakdown.overall_code': 'Overall code: {count}',
  'dashboard_widget.time_range.last_30_days': 'Last 30 days',
  'dashboard_widget.time_range.rolling_30_day_average': 'Rolling 30-day average',
  'dashboard_widget.codescope.overall': 'Overall code',
  'dashboard_widget.codescope.new': 'New code',
  'hook.use_native_browser_navigation_blocker.exit_without_saving_message':
    'You have unsaved changes. Leaving now will discard your changes.',
  retry: 'Retry',

  'editable_multigrid.error.description':
    'An error occurred while rendering the dashboard layout. Please refresh the page to recover.',
  'editable_multigrid.error.details': 'Error details',
  'editable_multigrid.error.title': 'Layout Error',

  'mode.standard.advertisement':
    'Looking for Security, Reliability, and Maintainability issues? If your team prefers working with software qualities, change it in the <a>settings</a>',
  'mode.mqr.advertisement':
    'Looking for Bugs, Vulnerabilities, or Code Smells? If your team prefers working with these types, change it in the <a>settings</a>',
  'aicodefix.admin.provider.title': 'Provider',
  'aicodefix.admin.provider.help': 'Choose between our providers or bring your own model',
  'aicodefix.admin.provider.other_providers': 'Other providers',
  'aicodefix.admin.provider.custom.help': 'Any OpenAI-compatible model',
  'aicodefix.admin.provider.sonar': 'Sonar',
  'aicodefix.admin.custom_headers.header_name': 'Header name',
  'aicodefix.admin.custom_headers.header_value': 'Value',
  'aicodefix.admin.custom_headers.secret': 'Secret',
  'aicodefix.admin.custom_headers.add': 'Add custom header',
  'aicodefix.admin.custom_headers.delete': 'Remove header {name}',
  'aicodefix.admin.provider.secret.placeholder': 'Value is hidden, type a new key to update',
  'aicodefix.updated': 'AI CodeFix settings is {0} on your instance!',
  'aicodefix.update_error': 'Fail to save settings. {0}',
  'aicodefix.cancel.modal.title': 'Are you sure you want to cancel?',
  'aicodefix.cancel.modal.description':
    'You have unsaved changes. All unsaved changes will be lost.',
  'aicodefix.cancel.modal.continue_editing': 'Continue editing',

  //------------------------------------------------------------------------------
  //
  // SEARCH ENGINE FOR RESOURCES
  //
  //------------------------------------------------------------------------------
  'search.search_for_projects': 'Search projects',
  'search.search_for_cves':
    'Search by vulnerability{withLicense, select, true { or license ID} other {}}...',
  'search.search_for_dependencies': 'Search by dependency name...',
  'search.search_for_users': 'Search for users...',
  'search.search_for_users_or_groups': 'Search for users or groups...',
  'search.search_by_login_or_name': 'Search by login or name...',
  'search.search_by_name': 'Search by name...',
  'search.search_by_name_or_key': 'Search by name or key...',
  'search.search_for_tags': 'Search for tags...',
  'search.search_for_repositories': 'Search for repositories...',
  'search.search_for_rules': 'Search for rules...',
  'search.search_for_languages': 'Search for languages...',
  'search.search_for_cwe': 'Search for CWEs...',
  'search.search_for_authors': 'Search for authors...',
  'search.search_for_directories': 'Search for directories...',
  'search.search_for_files': 'Search for files...',
  'search.search_for_metrics': 'Search for metrics...',
  'search.search_for_profiles': 'Search for quality profiles...',

  'global_search.shortcut_hint': "Hint: Press 'S' from anywhere to open this search bar.",

  //------------------------------------------------------------------------------
  //
  // GLOBAL HELP
  //
  //------------------------------------------------------------------------------

  'shortcuts.section.global.facets.multiselection': 'Add to selection',

  //------------------------------------------------------------------------------
  //
  // SELECT2.js
  //
  //------------------------------------------------------------------------------
  'select2.tooShort': 'Please enter at least {0} characters',

  //------------------------------------------------------------------------------
  //
  // Echoes Selects
  //
  //------------------------------------------------------------------------------
  'select.search.tooShort': 'To search, please enter at least {0} characters',
  'select.search.noMatches': 'No matches',

  //------------------------------------------------------------------------------
  //
  // DUPLICATION VIEWER
  //
  //------------------------------------------------------------------------------
  'duplications.dups_found_on_deleted_resource':
    'This file contains duplicated blocks with some deleted resources. This project should be reanalyzed to remove these obsolete duplicated blocks.',

  //------------------------------------------------------------------------------
  //
  // GENERIC CODE VIEWER
  //
  //------------------------------------------------------------------------------
  'code_viewer.no_source_code_displayed_due_to_empty_analysis.TRK':
    'No code files were found for analysis.',
  'code_viewer.no_source_code_displayed_due_to_empty_analysis.APP':
    'No projects in this application.',
  'code_viewer.no_source_code_displayed_due_to_empty_analysis.VW':
    'No projects, applications, or portfolios in this portfolio.',
  'code_viewer.no_source_code_displayed_due_to_empty_analysis.SVW':
    'No projects, applications, or portfolios in this portfolio.',
  'code_viewer.no_source_code_displayed_due_to_security':
    'Due to security settings, no source code can be displayed.',
  'code_viewer.no_source_code_displayed_due_to_source_removed':
    'The file was removed, no source code can be displayed.',
  'code_viewer.not_all_measures_are_shown': 'Not all projects and applications are included',
  'code_viewer.not_all_measures_are_shown.help':
    'You do not have access to all projects and/or applications.',
  'code_viewer.loading': 'Source code is loading',

  //------------------------------------------------------------------------------
  //
  // COMMON NAVIGATION
  //
  //------------------------------------------------------------------------------
  'navigation.view_all': 'View all',
  'navigation.project.group.analysis': 'Analysis',
  'navigation.project.group.architecture': 'Architecture',
  'navigation.project.group.enterprise_architecture': 'Enterprise architecture',
  'navigation.project.group.policies': 'Policies',
  'navigation.project.group.project': 'Project',
  'navigation.project.group.reporting': 'Reporting',
  'navigation.project.group.remediation': 'Remediation',
  'navigation.project.group.extensions': 'Extensions',

  //------------------------------------------------------------------------------
  //
  // RULES DOCUMENTATION PAGE
  //
  //------------------------------------------------------------------------------
  'rules.status.beta': 'Beta',
  'rules.status.BETA': 'Beta',
  'rules.status.BETA.help':
    'The rule has been recently implemented and we haven’t gotten enough feedback from users yet, so there may be false positives or false negatives.',
  'rules.status.deprecated': 'Deprecated',
  'rules.status.DEPRECATED': 'Deprecated',
  'rules.status.DEPRECATED.help':
    'The rule that generated this issue has been deprecated and will be removed. Once the rule is removed, this issue will no longer appear.',
  'rules.status.ready': 'Ready',
  'rules.status.READY': 'Ready',
  'rules.status.REMOVED': 'Removed',
  'rules.status.REMOVED.help':
    'The rule that generated this issue has been removed. Starting on the next analysis, this issue will no longer appear.',

  'rule.impact.severity.tooltip':
    'Issues found for this rule will have a {severity} impact on the {quality} of your software.',

  'rule.clean_code_attribute_category.CONSISTENT': 'Consistency',
  'rule.clean_code_attribute_category.INTENTIONAL': 'Intentionality',
  'rule.clean_code_attribute_category.ADAPTABLE': 'Adaptability',
  'rule.clean_code_attribute_category.RESPONSIBLE': 'Responsibility',

  'rule.clean_code_attribute.CLEAR': 'Clear',
  'rule.clean_code_attribute.COMPLETE': 'Complete',
  'rule.clean_code_attribute.CONVENTIONAL': 'Conventional',
  'rule.clean_code_attribute.DISTINCT': 'Distinct',
  'rule.clean_code_attribute.EFFICIENT': 'Efficient',
  'rule.clean_code_attribute.FOCUSED': 'Focused',
  'rule.clean_code_attribute.FORMATTED': 'Formatted',
  'rule.clean_code_attribute.IDENTIFIABLE': 'Identifiable',
  'rule.clean_code_attribute.LAWFUL': 'Lawful',
  'rule.clean_code_attribute.LOGICAL': 'Logical',
  'rule.clean_code_attribute.MODULAR': 'Modular',
  'rule.clean_code_attribute.RESPECTFUL': 'Respectful',
  'rule.clean_code_attribute.TESTED': 'Tested',
  'rule.clean_code_attribute.TRUSTWORTHY': 'Trustworthy',

  //------------------------------------------------------------------------------
  //
  // EMAIL NOTIFICATION CONFIGURATION
  //
  //------------------------------------------------------------------------------
  'email_notification.category': 'Email notification',
  'email_notification.header': 'SMTP Configuration',
  'email_notification.description':
    'Follow the steps below to configure and test your authentication.',
  'email_notification.subheading.1':
    'Select your authentication type and complete the fields below',
  'email_notification.subheading.2': 'Complete the SMTP fields below',
  'email_notification.subheading.3':
    'Input the ‘sender’ information below to identify your email notification',
  'email_notification.form.auth_type': 'Authentication type',
  'email_notification.form.basic_auth.title': 'Basic Authentication',
  'email_notification.form.basic_auth.description': 'Authenticate with a username and password',
  'email_notification.form.username': 'SMTP username',
  'email_notification.form.username.description':
    'Username used to authenticate to the SMTP server.',
  'email_notification.form.basic_password': 'SMTP password',
  'email_notification.form.basic_password.description':
    'Password used to authenticate to the SMTP server.',
  'email_notification.form.oauth_auth.title': 'Modern Authentication',
  'email_notification.form.oauth_auth.description': 'Authenticate with OAuth',
  'email_notification.form.oauth_auth.supported': 'Supported providers: Microsoft',
  'email_notification.form.oauth_auth.recommended_reason': 'for stronger security compliance',
  'email_notification.form.oauth_authentication_host': 'Authentication host',
  'email_notification.form.oauth_authentication_host.description':
    'Host of the Identity Provider issuing access tokens.',
  'email_notification.form.oauth_client_id': 'Client ID',
  'email_notification.form.oauth_client_id.description':
    'Client ID provided by Microsoft Exchange when registering the application.',
  'email_notification.form.oauth_client_secret': 'Client Secret',
  'email_notification.form.oauth_client_secret.description':
    'Client password provided by Microsoft Exchange when registering the application.',
  'email_notification.form.oauth_scope': 'Scope',
  'email_notification.form.oauth_scope.description':
    'OAuth scope requested when acquiring an access token. Leave empty to use the default Microsoft 365 scope. Use "https://outlook.office365.us/.default" for Azure Government (GCC High).',
  'email_notification.form.oauth_tenant': 'Tenant',
  'email_notification.form.oauth_tenant.description': 'Microsoft tenant.',
  'email_notification.form.host': 'SMTP host',
  'email_notification.form.host.description': 'URL of your SMTP server.',
  'email_notification.form.port': 'SMTP port',
  'email_notification.form.port.description': 'Port of your SMTP server (usually 25, 587 or 465).',
  'email_notification.form.security_protocol': 'Security protocol',
  'email_notification.form.security_protocol.description':
    'Security protocol used to connect to your SMTP server (SSLTLS is recommended). Valid values: NONE, SSLTLS, STARTTLS.',
  'email_notification.form.from_address': 'From address',
  'email_notification.form.from_address.description': 'Address emails will come from.',
  'email_notification.form.from_name': 'From name',
  'email_notification.form.from_name.description':
    'Name emails will come from (usually "SonarQube").',
  'email_notification.form.subject_prefix': 'Subject prefix',
  'email_notification.form.subject_prefix.description':
    'Prefix added to email so they can be easily recognized (usually "[SonarQube]").',
  'email_notification.form.save_configuration': 'Save configuration',
  'email_notification.form.save_configuration.create_success':
    'Email configuration saved successfully.',
  'email_notification.form.save_configuration.update_success':
    'Email configuration updated successfully.',
  'email_notification.form.save_configuration.delete_success':
    'Email configuration deleted successfully.',
  'email_notification.form.save_configuration.delete_error':
    'Failed to delete email configuration.',
  'email_notification.overview.heading': 'SMTP configuration settings',
  'email_notification.overview.authentication_type': 'Authentication type',
  'email_notification.overview.private': 'Hidden for security reasons',
  'email_notification.form.private': '**************',
  'email_notification.test.title': 'Test configuration',
  'email_notification.test.modal_title': 'Test email',
  'email_notification.test.to_address': 'To',
  'email_notification.test.subject': 'Subject',
  'email_notification.test.message': 'Message',
  'email_notification.test.message_text': 'This is a test message from {productName}.',
  'email_notification.test.create_test_email': 'Create test email',
  'email_notification.test.submit': 'Send test email',
  'email_notification.test.success': 'Your email was sent successfully',
  'email_notification.test.failure':
    'Your email could not be sent. Ensure your authentication configuration settings and email recipient are valid.',
  'email_notification.state.value_should_be_valid_email': 'A valid email address is required.',
  'email_notification.delete.confirm.title': 'Delete SMTP configuration',
  'email_notification.delete.confirm.text':
    'This action cannot be undone. Deleting this SMTP configuration will remove all its settings, and SonarQube will stop sending email notifications.',

  //------------------------------------------------------------------------------
  //
  // NOTIFICATIONS
  //
  //------------------------------------------------------------------------------
  'notification.for': 'Notify me for',
  'notification.by': 'by {channel}',
  'notification.channel.EmailNotificationChannel': 'Email',
  'notification.dispatcher.information': 'A notification is never sent to the author of the event.',
  'notification.dispatcher.ChangesOnMyIssue': 'Changes in issues/hotspots assigned to me',
  'notification.dispatcher.NewIssues': 'New issues',
  'notification.dispatcher.NewAlerts': 'Quality gate status changes on all available projects',
  'notification.dispatcher.NewAlerts.project': 'Quality gate status changes',
  'notification.dispatcher.NewFalsePositiveIssue': 'Issues resolved as false positive or accepted',
  'notification.dispatcher.SQ-MyNewIssues': 'My new issues',
  'notification.dispatcher.QualityGateConditionsMismatch':
    'Quality gate metrics mismatch with the mode of the instance',
  'notification.dispatcher.CeReportTaskFailure':
    'Background tasks in failure on my administered projects',
  'notification.dispatcher.CeReportTaskFailure.project': 'Background tasks in failure',
  'notification.dispatcher.security-alert-raised': 'New security alert raised',
  'notification.dispatcher.description_x': 'Check to receive notification for {project}',
  'notification.dispatcher.group.label': 'Notifications for project {project}',
  'notification.non_production_database.warning':
    "Embedded database should be used for evaluation purposes only. It doesn't support scaling, upgrading to a new SonarQube Server version, or migration to another database engine. {link}",
  'notification.non_production_database.learn_more': 'Learn more',

  //------------------------------------------------------------------------------
  //
  // ALERTS
  //
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  //
  // USER
  //
  //------------------------------------------------------------------------------
  'user.password.conditions': 'Your password must include at least:',
  'user.password.condition.12_characters': '12 characters',
  'user.password.condition.1_upper_case': '1 upper case letter',
  'user.password.condition.1_lower_case': '1 lower case letter',
  'user.password.condition.1_number': '1 number',
  'user.password.condition.1_special_character': '1 special character',
  'user.password.invalid': 'Your password must meet all the requirements.',
  'user.password.do_not_match': 'Passwords do not match.',
  'user.old_password_incorrect': 'Old password is incorrect',
  'user.new_password_same_as_old': 'New password must be different from old password',
  'user.login_or_email_used_as_scm_account':
    'Login and email are automatically considered as SCM accounts',
  'user.x_deleted': '{0} (deleted)',

  'login.page': 'Log in',
  'login.login_to_sonarqube': 'Welcome to {productName}',
  'login.login_with_x': 'Log in with {providerName}',
  'login.more_options': 'Log in with credentials',
  'login.unauthorized_access_alert':
    'You are not authorized to access this page. Please log in with more privileges and try again.',
  'login.or': 'Or',
  'login.authentication_failed': 'Invalid username or password.',
  'login.logout_failed': 'Logout failed',
  'login.username.placeholder': 'Enter your username',
  'login.password.placeholder': 'Enter your password',
  'login.hide_password': 'Hide password',
  'login.show_password': 'Show password',
  'login.marketing.background.alt': 'SonarQube whale logo',
  'login.marketing.logo.alt': 'Sonar logo',
  'login.marketing.title': 'SonarQube Server: Your independent code verification layer',
  'login.marketing.description':
    'SonarQube Server provides deep analysis to ensure all your code, human-written and AI-generated, is secure and high quality.',
  'login.marketing.continuous_verification': 'Continuous Verification: ',
  'login.marketing.continuous_verification.description':
    'Automatically reviews your code in real-time, helping you eliminate security risks, bugs, and technical debt before they reach production.',
  'login.marketing.devsecops_integrated': 'DevSecOps integrated: ',
  'login.marketing.devsecops_integrated.description':
    'Works seamlessly within your existing CI/CD workflow, including integrations with tools like GitHub Actions, GitLab CI/CD, and Jenkins.',
  'login.marketing.empowering_developers': 'Empowering developers: ',
  'login.marketing.empowering_developers.description':
    'SonarQube for IDE in connected mode enables developers to receive real-time, actionable code intelligence and guidance to resolve issues quickly.',

  'unauthorized.page': 'Unauthorized',
  'unauthorized.message':
    "You're not authorized to access this page. Please contact the administrator.",
  'unauthorized.reason': 'Reason:',

  //------------------------------------------------------------------------------
  //
  // MY PROFILE & MY ACCOUNT
  //
  //------------------------------------------------------------------------------
  'my_profile.login': 'Login',
  'my_profile.email': 'Email',
  'my_profile.groups': 'Groups',
  'my_profile.scm_accounts': 'SCM Accounts',
  'my_profile.scm_accounts.tooltip':
    'SCM accounts are used for automatic issue assignment. Login and email are automatically considered as SCM account.',
  'my_profile.password.title': 'Enter a new password',
  'my_profile.password.old': 'Old Password',
  'my_profile.password.changed': 'The password has been changed!',
  'my_profile.overall_notifications.title': 'General notifications',
  'my_profile.per_project_notifications.title': 'Notifications per project',
  'my_profile.per_project_notifications.add': 'Add a project',
  'my_profile.per_project_notifications.filter': 'Filter projects',
  'my_profile.news_notifications.title': 'SonarQube new features notifications',
  'my_profile.news_notifications.label':
    'Display a notification count in the header when new features are deployed',

  'my_account.page': 'My account',
  'my_account.notifications': 'Notifications',
  'my_account.no_project_notifications': 'You have not set project notifications yet.',
  'my_account.profile': 'Profile',
  'my_account.security': 'Security',
  'my_account.appearance.title': 'Appearance',
  'my_account.tokens_description':
    "If you want to enforce security by not providing credentials of a real {instance} user to run your code scan or to invoke web services, you can provide a User Token as a replacement of the user login. This will increase the security of your installation by not letting your analysis user's password going through your network.",
  'my_account.token_type': 'Type',
  'my_account.project_name': 'Project',
  'my_account.tokens_last_usage': 'Last use',
  'my_account.tokens.expiration': 'Expiration',
  'my_account.tokens.expired': 'Token is expired',
  'my_account.projects': 'Projects',
  'my_account.projects.description': 'You have admin privileges over the following projects.',
  'my_account.projects.no_results': 'You have no project admin privileges.',
  'my_account.projects.analyzed_x': 'Analyzed {0}',
  'my_account.projects.never_analyzed': 'Never analyzed',
  'my_account.set_notifications_for': 'Search for a project by name',
  'my_account.set_notifications_for.title': 'Add a project',
  'my_account.set_notifications_for.help': 'Minimum 2 characters',
  'my_account.create_new.TRK': 'Add a project',
  'my_account.add_project.manual': 'Local project',
  'my_account.add_project.azure': 'From Azure DevOps',
  'my_account.add_project.bitbucket': 'From Bitbucket Data Center',
  'my_account.add_project.bitbucketcloud': 'From Bitbucket Cloud',
  'my_account.add_project.github': 'From GitHub',
  'my_account.add_project.gitlab': 'From GitLab',
  'my_account.add_project.more_others': 'Import from other DevOps Platforms',
  'my_account.add_project.more': 'Import from DevOps Platforms',
  'my_account.reset_password.page': 'Update password',
  'my_account.reset_password': 'Update your password',
  'my_account.reset_password.explain': 'This account should not use the default password.',

  'my_account.preferences': 'Preferences',
  'my_account.preferences.keyboard_shortcuts': 'Enable Keyboard Shortcuts',
  'my_account.preferences.keyboard_shortcuts.description':
    "Some actions can be performed using keyboard shortcuts. If you do not want to use these shortcuts, you can disable them here (this won't disable navigation shortcuts, which include the arrows, escape, and enter keys). For a list of available keyboard shortcuts, use the question mark shortcut (hit {questionMark} on your keyboard).",

  'my_account.appearance.customize_theme': 'Customize theme',
  'my_account.appearance.description':
    'Customize how SonarQube Server looks. Select a theme of your choice, or sync your theme to your operating system settings.',

  'theme_select_card_title.dark-theme': 'Dark theme',
  'theme_select_card_title.light-theme': 'Light theme',
  'theme_select_card_title.system': 'Sync with system',

  //------------------------------------------------------------------------------
  //
  // METRIC DOMAINS
  //
  //------------------------------------------------------------------------------

  'metric_domain.Size': 'Size',
  'metric_domain.Tests': 'Tests',
  'metric_domain.Integration Tests': 'Integration tests',
  'metric_domain.Complexity': 'Complexity',
  'metric_domain.Documentation': 'Documentation',
  'metric_domain.Rules': 'Rules',
  'metric_domain.General': 'General',
  'metric_domain.Duplication': 'Duplication',
  'metric_domain.Design': 'Design',
  'metric_domain.SCM': 'SCM',
  'metric_domain.Maintainability': 'Maintainability',
  'metric_domain.Releasability': 'Releasability',
  'metric_domain.Reliability': 'Reliability',
  'metric_domain.Security': 'Security',
  'metric_domain.SecurityReview': 'Security review',
  'metric_domain.Issues': 'Issues',
  'metric_domain.Duplications': 'Duplications',
  'metric_domain.Coverage': 'Coverage',
  'metric_domain.DependencyRisks': 'Dependency risks',

  //------------------------------------------------------------------------------
  //
  // PERMISSIONS
  //
  //------------------------------------------------------------------------------
  'permission.assign_x_to_y': 'Assign permission {0} to {1}',
  'permission_template.new_template': 'Create Permission Template',
  'permission_template.delete_confirm_title': 'Delete Permission Template',
  'permission_template.do_you_want_to_delete_template_xxx':
    'Are you sure that you want to delete permission template "{0}"?',
  'permission_template.edit_template': 'Edit Permission Template',
  'permission_template.key_pattern': 'Project key pattern',
  'permission_template.key_pattern.description': 'Should be a valid regular expression',
  'permission_template.default_for': 'Default for {qualifiers}',

  //------------------------------------------------------------------------------
  //
  // Promotion
  //
  //------------------------------------------------------------------------------

  'promotion.sqide.title': 'Get the most out of {productName}!',
  'promotion.sqide.content':
    'Take advantage of the whole ecosystem by using SonarQube for IDE, a free IDE plugin that helps you find and fix issues earlier in your workflow. Connect SonarQube for IDE to {productName} to sync rule sets and issue states.',

  //------------------------------------------------------------------------------
  //
  // Sonarlint
  //
  //------------------------------------------------------------------------------

  'external-product-connection.request.title': 'Authorize {productName}?',
  'external-product-connection.request.description':
    'Allowing this connection will generate a user token for {productName}.',
  'external-product-connection.request.action': 'Allow connection',

  'external-product-connection.token-error.title': 'Token generation failed',
  'external-product-connection.token-error.description':
    '{productName} was not able to generate a token.',
  'external-product-connection.token-error.description2':
    'Go back to your {productHost} and start again, or go to the {link} of your {productName} account to create a new user token manually.',
  'external-product-connection.token-error.description2.link': 'Security section',

  'external-product-connection.connection-error.title': 'Token created',
  'external-product-connection.connection-error.description': 'The following token was created:',
  'external-product-connection.connection-error.token-name': 'Token name',
  'external-product-connection.connection-error.token-value': 'Token value',
  'external-product-connection.connection-error.next-steps': 'Next steps',
  'external-product-connection.connection-error.step1': 'Copy the above token.',
  'external-product-connection.connection-error.step2':
    'Go back to your {productHost} and paste the token.',

  'external-product-connection.success.title': 'Connection successful!',
  'external-product-connection.success.description':
    'Your user token has now been generated & sent to your {productHost}.',
  'external-product-connection.success.next': 'Return to your {productHost} to complete the setup.',

  'sonarlint-connected-mode-doc': 'documentation about SonarQube for IDE Connected Mode',
  //------------------------------------------------------------------------------
  //
  // HELP
  //
  //------------------------------------------------------------------------------
  'formatting.page': 'Formatting',
  'formatting.helplink': 'Formatting Help',
  'formatting.example.link': 'For a hyperlink, write: {example}',
  'formatting.example.link.example': '[link label](https://www.domain.com)',

  //------------------------------------------------------------------------------
  //
  // KEYBOARD SHORTCUTS
  //
  //------------------------------------------------------------------------------
  'keyboard_shortcuts_modal.title': 'Keyboard Shortcuts',
  'keyboard_shortcuts_modal.disable_link': 'Disable shortcuts',
  'keyboard_shortcuts_modal.global': ' Global',
  'keyboard_shortcuts_modal.global.open_search_bar': ' Open search bar',
  'keyboard_shortcuts_modal.global.open_keyboard_shortcuts_modal': ' Open keyboard shortcuts modal',
  'keyboard_shortcuts_modal.global.focus_toasts_messages': ' Focus toast messages',
  'keyboard_shortcuts_modal.navigate_between_issues': ' Navigate between issues',
  'keyboard_shortcuts_modal.open_issue': ' Open issue',
  'keyboard_shortcuts_modal.return_back_to_the_list': ' Return back to the list',
  'keyboard_shortcuts_modal.do_issue_transition': ' Do an issue transition',
  'keyboard_shortcuts_modal.assign_issue': ' Assign issue',
  'keyboard_shortcuts_modal.assign_issue_to_me': ' Assign issue to me',
  'keyboard_shortcuts_modal.change_tags_of_issue': ' Change tags of issue',
  'keyboard_shortcuts_modal.issues_page': ' Issues page',
  'keyboard_shortcuts_modal.issue_details_page.navigate_issue_locations':
    ' To navigate issue locations',
  'keyboard_shortcuts_modal.issue_details_page.switch_flows': ' To switch flows',
  'keyboard_shortcuts_modal.issue_details_page.comment_an_issue': ' Comment an issue',
  'keyboard_shortcuts_modal.issue_details_page.submit_comment': ' Submit comment',
  'keyboard_shortcuts_modal.code_page': ' Code page',
  'keyboard_shortcuts_modal.code_page.select_files': ' Select files',
  'keyboard_shortcuts_modal.code_page.open_file': ' Open file',
  'keyboard_shortcuts_modal.measures_page': ' Measures page',
  'keyboard_shortcuts_modal.rules_page': ' Rules page',
  'keyboard_shortcuts_modal.rules_page.navigate_between_rule': ' Navigate between rules',
  'keyboard_shortcuts_modal.rules_page.open_rule': ' Open rule',

  //------------------------------------------------------------------------------
  //
  // COMPONENT VIEWER
  //
  //------------------------------------------------------------------------------

  'component_viewer.transition.duplication': 'Duplicated By',

  'component_viewer.show_raw_source': 'Show Raw Source',
  'component_viewer.new_window': 'Open in New Window',
  'component_viewer.open_in_workspace': 'Pin This File',
  'component_viewer.open_in_workspace_X': 'Pin {0} File',
  'component_viewer.no_component': 'The component has been removed or never existed.',
  'component_viewer.copy_path_to_clipboard': 'Copy the file path to the clipboard',
  'component_viewer.action_menu': 'File actions menu',
  'lines_of_code_ellipsis.show_x_lines': 'Show {count} lines',
  'lines_of_code_ellipsis.show_more_lines': 'Show more lines',
  'lines_of_code_ellipsis.show_all_lines': 'Show all lines',

  //------------------------------------------------------------------------------
  //
  // WORKSPACE
  //
  //------------------------------------------------------------------------------
  'workspace.minimize': 'Minimize',
  'workspace.full_window': 'Expand to full window',
  'workspace.normal_size': 'Collapse to normal size',
  'workspace.close': 'Remove from the list of pinned files',

  'plugin_risk_consent.page': 'Plugin risk consent',
  'plugin_risk_consent.title': 'Installation of plugins',
  'plugin_risk_consent.description': 'A plugin has been detected.',
  'plugin_risk_consent.description2':
    'Plugins are not provided by SonarSource and are therefore installed at your own risk. SonarSource disclaims all liability for installing and using such plugins.',
  'plugin_risk_consent.action': 'I understand the risk',

  //------------------------------------------------------------------------------
  //
  // MONITORING ALERTS
  //
  //------------------------------------------------------------------------------
  'monitoring.alerts.performance_troubleshooting_guide':
    'See the performance troubleshooting guide',

  'background_task.status.ALL': 'All',
  'background_task.status.PENDING': 'Pending',
  'background_task.status.IN_PROGRESS': 'In Progress',
  'background_task.status.SUCCESS': 'Success',
  'background_task.status.FAILED': 'Failed',
  'background_task.status.CANCELED': 'Canceled',
  'background_task.status.ALL_EXCEPT_PENDING': 'All Except Pending',

  'background_task.type.ALL': 'All',
  'background_task.type.REPORT': 'Project Analysis',
  'background_task.type.DEV_REFRESH': 'Developer Analysis',
  'background_task.type.DEV_PURGE': 'Developer Cleaning',
  'background_task.type.ISSUE_SYNC': 'Project Data Reload',
  'background_task.type.APP_REFRESH': 'Application Recomputation',
  'background_task.type.PROJECT_EXPORT': 'Project Export',
  'background_task.type.PROJECT_IMPORT': 'Project Import',
  'background_task.type.AUDIT_PURGE': 'Audit Log Purge',
  'background_task.type.REPORT_SUBMIT': 'Report Email Submit',
  'background_task.type.GITHUB_AUTH_PROVISIONING': 'GitHub Provisioning',
  'background_task.type.GITHUB_PROJECT_PERMISSIONS_PROVISIONING': 'GitHub Project Permission Sync',
  'background_task.type.GITLAB_AUTH_PROVISIONING': 'GitLab Provisioning',
  'background_task.type.GITLAB_PROJECT_PERMISSIONS_PROVISIONING': 'Gitlab Project Permission Sync',
  'background_task.type.SCA_RESCAN_BRANCH': 'SCA Scan Branch',
  'quality_gate_panel.below_X_required': 'below {0} required',

  //------------------------------------------------------------------------------
  //
  // WS API
  //
  //------------------------------------------------------------------------------
  'api_documentation.domain_nav': 'Web API domains navigation',
  'api_documentation.internal_tooltip':
    'Use at your own risk; internal services are subject to change or removal without notice.',
  'api_documentation.page': 'Web API',
  'api_documentation.page.v2': 'Web API v2',
  'api_documentation.show_deprecated': 'Show Deprecated API',
  'api_documentation.show_deprecated.learn_more': 'Learn more about Web API deprecation',
  'api_documentation.show_internal': 'Show Internal API',
  'api_documentation.show_internal_v2': 'Show internal',
  'api_documentation.possible_values': 'Possible values',
  'api_documentation.default_values': 'Default value',
  'api_documentation.example_values': 'Example value',
  'api_documentation.max_values': 'Maximum allowed values',
  'api_documentation.min_value': 'Minimum value',
  'api_documentation.max_value': 'Maximum value',
  'api_documentation.min_length': 'Minimum length',
  'api_documentation.max_length': 'Maximum length',
  'api_documentation.internal': 'internal',
  'api_documentation.deprecated': 'deprecated',
  'api_documentation.deprecated_since_x': 'deprecated since {since}',
  'api_documentation.parameters': 'Parameters',
  'api_documentation.response_content_type.BINARY': 'Response content type: Binary',
  'api_documentation.response_content_type.NO_CONTENT': 'Response content type: No content',
  'api_documentation.response_content_type.TEXT': 'Response content type: Text',
  'api_documentation.response_example': 'Response Example',
  'api_documentation.changelog': 'Changelog',
  'api_documentation.search': 'Search by name...',
  'api_documentation.v2.search': 'Search API...',
  'api_documentation.v2.parameter_header': 'Request',
  'api_documentation.v2.response_header': 'Response',
  'api_documentation.v2.request_subheader.query': 'Query Parameters',
  'api_documentation.v2.request_subheader.path': 'Path Parameters',
  'api_documentation.v2.request_subheader.header': 'Headers',
  'api_documentation.v2.request_subheader.request_body': 'Request Body',
  'api_documentation.v2.request_subheader.request_content_type': 'Content-Type:',
  'api_documentation.v2.enum_description': 'Valid values: {values}',

  //------------------------------------------------------------------------------
  //
  // CODE
  //
  //------------------------------------------------------------------------------
  'code.ai_badge_tooltip.application':
    'This application contains project(s) with AI-generated code.',
  'code.ai_badge_tooltip.project': 'This project contains AI-generated code.',
  'code.ai_badge_tooltip.sub_portfolio':
    'This nested portfolio contains project(s) with AI-generated code.',
  'code.aica_disabled_projects': 'Projects without AI Code Assurance enabled',
  'code.aica_disabled_projects.tooltip':
    "Projects in this portfolio that do not use Sonar's AI Code Assurance feature.",
  'code.aica_enabled_projects': 'AI Code Assurance enabled projects',
  'code.aica_enabled_projects.tooltip':
    "Projects in this portfolio that contain AI-generated code and benefit from Sonar's AI Code Assurance.",
  'code.search_placeholder': 'Search for files...',
  'code.search_placeholder.application': 'Search for projects...',
  'code.search_placeholder.portfolio': 'Search for projects and sub-portfolios...',
  'code.parent_folder': 'Parent folder',
  'code.last_analysis_date': 'Last analysis',
  'code.name': 'Name',
  'code.pin': 'Pin file',

  //------------------------------------------------------------------------------
  //
  // PROMOTION
  //
  //------------------------------------------------------------------------------

  'promotion.security_dev_edition.title': 'Did you know...',
  'promotion.security_dev_edition.text':
    'SonarQube Developer Edition can detect <b>260+ additional</b> distinct types of security issues across the languages of your projects.',
  'promotion.security_dev_edition.action': 'Compare benefits',

  'promotion.community_build_security.title': 'Limited security analysis',
  'promotion.community_build_security.text':
    'SonarQube Community Build does not scan for critical injection vulnerabilities (SQL injection, XSS, and more).',
  'promotion.community_build_security.action': 'Explore other editions',
  //------------------------------------------------------------------------------
  //
  // DOCS
  //
  //------------------------------------------------------------------------------
  'docs.documentation': 'Documentation',
  'docs.get_help': 'Get Help',
  'docs.roadmap': 'Product Roadmap',
  'docs.news': 'Product News',
  'docs.stay_connected': 'Stay Connected',
  'docs.suggestion': 'Suggestions For This Page',

  //------------------------------------------------------------------------------
  //
  // GLOBAL FOOTER
  //
  //------------------------------------------------------------------------------
  'footer.community': 'Community',
  'footer.documentation': 'Documentation',
  'footer.license.lgplv3': 'LGPL v3',
  'footer.license.sqs': 'Terms & Conditions',
  'footer.plugins': 'Plugins',
  'footer.version.full': 'v{version}{status}',
  'footer.version.short': 'v{version}',
  'footer.version.status': '{status}',
  'footer.version.status.active': 'ACTIVE',
  'footer.version.status.inactive': 'NO LONGER ACTIVE',
  'footer.web_api': 'Web API',
  'footer.mode.STANDARD': 'Standard Experience',
  'footer.mode.MQR': 'MQR Mode',

  //------------------------------------------------------------------------------
  //
  // APPLICATIONS
  //
  //------------------------------------------------------------------------------
  'application.cannot_access_all_child_projects1':
    'You must have access to all the projects within this Application in order to browse it.',
  'application.cannot_access_all_child_projects2': 'Please contact your project administrator.',

  //------------------------------------------------------------------------------
  //
  // ENCRYPTION
  //
  //------------------------------------------------------------------------------
  'encryption.form_intro':
    'Secret key is registered. You can encrypt any property value with the following form:',
  'encryption.form_note':
    'Note that the secret key can be changed, but all the encrypted properties will have to be updated. {moreInformationLink}',
  'encryption.encrypted_value': 'Encrypted Value:',
  'encryption.generate_secret_key': 'Generate Secret Key',
  'encryption.generate_new_secret_key': 'Generate New Secret Key',
  'encryption.encrypt': 'Encrypt',
  'encryption.secret_key_description':
    'Secret key is required to be able to encrypt properties. {moreInformationLink}',
  'encryption.secret_key': 'Secret Key',
  'encryption.how_to_use': 'How To Use',
  'encryption.how_to_use.content1':
    'Store the secret key in the file {secret_file} of the server. This file can be relocated by defining the property {property} in {propreties_file}',
  'encryption.how_to_use.content2':
    'Restrict access to this file by making it readable and by owner only',
  'encryption.how_to_use.content3':
    'Restart the server if the property {property} has been set or changed.',
  'encryption.how_to_use.content4':
    'For each property that you want to encrypt, generate the encrypted value and replace the original value wherever it is stored (configuration files, command lines).',
  'groups.delete_group': 'Delete Group',
  'groups.delete_group.confirmation': 'Are you sure you want to delete "{0}"?',
  'groups.create_group': 'Create Group',
  'groups.update_group': 'Update Group',
  'groups.users.edit': 'Change {0} members',
  'groups.users.view': 'View {0} members',
  'groups.actions': 'Group actions for {0}',
  'group_membership.remove_user.error': 'User {0} is not a member of group {1}',

  //------------------------------------------------------------------------------
  //
  // INDEXING
  //
  //------------------------------------------------------------------------------
  'indexation.in_progress': 'Reindexing in progress.',
  'indexation.details_unavailable': 'Details are unavailable until this process is complete.',
  'indexation.features_partly_available':
    'Most features are available. Some details only show upon completion. {link}',
  'indexation.features_partly_available.link': 'More info',
  'indexation.progression': '{count} out of {total} projects reindexed.',
  'indexation.progression_with_error':
    '{count} out of {total} projects reindexed with some {link}.',
  'indexation.progression_with_error.link': 'tasks failing',
  'indexation.completed': 'All project data has been reloaded.',
  'indexation.completed_with_error':
    '{productName} completed the reload of project data. Some {link} causing some projects to remain unavailable.',
  'indexation.completed_with_error.link': 'tasks failed or canceled',
  'indexation.admin_link': 'See {link} for more information.',
  'indexation.page_unavailable.description': '{productName} is reindexing project data.',
  'indexation.page_unavailable.description.additional_information':
    'This page is unavailable until this process is complete. {link}',
  'indexation.filter_unavailable.description':
    'This filter is unavailable until this process is complete.',
  'indexation.learn_more': 'Learn more:',
  'indexation.reindexing': 'Reindexing',
  'indexation.filters_unavailable':
    'Some filters are unavailable until this process is complete. {link}',
  'indexation.upgrade_survey_link':
    'Help us improve the update experience. <link>Click here to share your thoughts.</link>',

  //------------------------------------------------------------------------------
  //
  // HOMEPAGE
  //
  //------------------------------------------------------------------------------
  'homepage.current':
    'This page is your homepage. Click to revert to the default homepage. Click on the top-left logo to find it anytime.',
  'homepage.current.is_default':
    'This page is your homepage. Click on the top-left logo to find it anytime.',
  'homepage.check': 'Click to make the current page your homepage.',

  //------------------------------------------------------------------------------
  //
  // FAVORITE
  //
  //------------------------------------------------------------------------------
  'favorite.action.TRK.add': 'Add this project to favorites',
  'favorite.action.TRK.remove': 'Remove this project from favorites',
  'favorite.action.VW.add': 'Add this portfolio to favorites',
  'favorite.action.VW.remove': 'Remove this portfolio from favorites',
  'favorite.action.SVW.add': 'Add this sub-portfolio to favorites',
  'favorite.action.SVW.remove': 'Remove this sub-portfolio from favorites',
  'favorite.action.APP.add': 'Add this application to favorites',
  'favorite.action.APP.remove': 'Remove this application from favorites',
  'favorite.action.TRK.add_x': 'Add project {component} to favorites',
  'favorite.action.TRK.remove_x': 'Remove project {component} from favorites',
  'favorite.action.VW.add_x': 'Add portfolio {component} to favorites',
  'favorite.action.VW.remove_x': 'Remove portfolio {component} from favorites',
  'favorite.action.SVW.add_x': 'Add sub-portfolio {component} to favorites',
  'favorite.action.SVW.remove_x': 'Remove sub-portfolio {component} from favorites',
  'favorite.action.APP.add_x': 'Add application {component} to favorites',
  'favorite.action.APP.remove_x': 'Remove application {component} from favorites',

  //------------------------------------------------------------------------------
  //
  // COMPONENT REPORT
  //
  //------------------------------------------------------------------------------
  'component_report.report': '{0} report',
  'component_report.download': 'Download {0} report (PDF)',
  'component_report.download.help_text': 'Key metrics for new code and quality gate status',
  'component_report.no_email_to_subscribe':
    'Subscribing to monthly reports requires an email address associated with your user account.',
  'component_report.subscribe_x': 'Subscribe to {0} report',
  'component_report.unsubscribe_x': 'Unsubscribe from {0} report',
  'component_report.unsubscribe': 'Unsubscribe from report',
  'component_report.unsubscribe.description':
    'If you no longer wish to receive these reports via email, you can unsubscribe by clicking on the button below.',
  'component_report.subscribe_x_success':
    'Subscription successful. You will receive a {frequency} report for this {qualifier} by email.',
  'component_report.subscribe_x_success_no_frequency':
    'Subscription successful. You will start receiving a report for this {qualifier} by email',
  'component_report.subscribe_x_success_action': 'Change report frequency',
  'component_report.unsubscribe_x_success':
    'You have successfully unsubscribed from receiving {frequency} PDF report about this {qualifier}',
  'component_report.unsubscribe_x_success_no_frequency':
    'You have successfully unsubscribed from receiving PDF report about this {qualifier}',
  'component_report.unsubscribe.page_title': 'Unsubscribe from report',
  'component_report.toggletip.permanent_branches.description':
    "Reports are only available for permanent branches. A permanent branch is one that has been marked as 'Keep when inactive'.",
  'component_report.toggletip.permanent_branches.documentation_link':
    "Visit documentation on how to enable 'Keep when inactive' setting",

  //------------------------------------------------------------------------------
  //
  // COMPONENT REGULATORY REPORT
  //
  //------------------------------------------------------------------------------
  'component_regulatory_report.report': 'Regulatory report',
  'component_regulatory_report.download': 'Download Regulatory report (.zip)',
  'component_regulatory_report.download.help_text':
    'Detailed metrics, issue lists, and project configurations',
  'component_regulatory_report.dropdown': 'Downloadable reports',

  //------------------------------------------------------------------------------
  //
  // GUIDING
  //
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  //
  // Sandboxed issues intro
  //
  //------------------------------------------------------------------------------
  'sandboxed_issues_intro.title': 'Update without breaking your quality gate ',
  'sandboxed_issues_intro.img_alt':
    'Image showing an example of sandbox issues on summary page that do not impact quality gate. Additionally, new issue status "In sandbox" is shown for an issue in issue list.',
  'sandboxed_issues_intro.description_1':
    'Say goodbye to unexpected pipeline failures. We’re introducing the Issue Sandbox to make platform updates stress-free. New issues flagged by updated analyzers are placed in a "sandbox" — visible to you, but excluded from quality gate calculations.',
  'sandboxed_issues_intro.description_2':
    '<b>Enable this setting before your first project analysis</b> following the SonarQube update to keep your pipelines green and give your teams time to triage at their own pace.',

  'sandboxed_issues_intro.footer_link': 'How does issue sandbox works?',
  'sandboxed_issues_intro.turn_on': 'Turn it on',
  'sandboxed_issues_intro.no_thanks': 'No thanks',

  //------------------------------------------------------------------------------
  //
  // Developer Server Extension
  //
  //------------------------------------------------------------------------------

  'application_console.edit': 'Edit Application',
  'application_console.project_inaccessible': 'You do not have access to this project',
  'application_console.branches': 'Application Branches',
  'application_console.branches.action_x': 'Open application branch {branchName} actions',
  'application_console.branches.edit_x': 'Edit application branch {branchName}',
  'application_console.branches.enable_x': 'Check to enable project {branchName} in this branch',
  'application_console.branches.delete_x': 'Delete application branch {branchName}',
  'application_console.branches.cannot_access_all_child_projects':
    'You must have access to all projects in this Application in order to administer branches.',
  'application_console.branches.cancel': 'Cancel',
  'application_console.branches.configuration': 'Branch configuration',
  'application_console.branches.create': 'Create branch',
  'application_console.branches.create.verb': 'Create',
  'application_console.branches.create.help':
    "For each project of your Application, choose a project branch that will be displayed inside the Application's branch.",
  'application_console.branches.delete': 'Delete branch',
  'application_console.branches.delete.warning_x':
    'Are you sure you want to delete "{branchName}" ?',
  'application_console.branches.help':
    "Track branches other than the main branch of this application's projects.",
  'application_console.branches.main_branch': 'Main Branch',
  'application_console.branches.update': 'Update branch',
  'application_console.branches.update.verb': 'Update',
  'application_console.branches.rename': 'Rename branch',
  'application_console.branches.no_branches':
    'No branches yet. You can create branches once projects are selected for this Application.',
  'application_console.page': 'Edit definition',
  'application_console.recompute': 'Recompute',
  'application_console.refresh_started': 'Your application will be recomputed soon',

  //------------------------------------------------------------------------------
  //
  // OAuth Callback
  //
  //------------------------------------------------------------------------------

  'oauth.slack_binding.success.title': "You're ready to start!",
  'oauth.slack_binding.success.toast.title': 'Binding successful',
  'oauth.slack_binding.success.toast.description':
    "You've linked your SonarQube Server and Slack accounts",
  'oauth.slack_binding.success.get_started.1':
    '<b>Invite</b> your SonarQube Server app to a channel <cmd>/invite @SonarQube Server</cmd>',
  'oauth.slack_binding.success.get_started.2':
    "<b>Subscribe</b> to a project <cmd>/sonarqube-server subscribe '<project-key>'</cmd>",
  'oauth.slack_binding.success.get_started.3':
    "To <b>unsubscribe</b>, use <cmd>/sonarqube-server unsubscribe '<project-key>'</cmd>",
  'oauth.slack_binding.success.documentation': 'For a step-by-step guide, view our {docLink}',
  'oauth.slack_binding.success.documentation.link_label': 'Slack setup documentation',
  'oauth.slack_binding.success.name': 'Logged in as {name}',
  'oauth.slack_binding.error.title': 'Could not bind your accounts',
  'oauth.slack_binding.error.description':
    'Please try again on Slack. If you continue to experience this error, visit our documentation.',
  'oauth.slack_binding.error.toast.title': 'Binding failed',
  'oauth.slack_binding.error.toast.description':
    'You were unable to link your SonarQube Instance and Slack accounts',
  'oauth.slack_binding.documentation_link': 'View documentation',
  'view.refresh.started': 'All portfolios will be recomputed soon',
  'view.refresh.started.one': 'Your portfolio will be recomputed soon',

  'portfolio_console.project_inaccessible': 'You do not have access to this project',

  // background task
  'background_task.type.VIEW_REFRESH': 'Portfolio Recomputation',

  // Governance Page
  'governance.x_portfolios': '{count} portfolios',
  'governance.section.releasability': 'Releasability',
  'governance.section.reliability': 'Reliability',
  'governance.section.review': 'Security Review',
  'governance.section.security': 'Security',
  'governance.section.maintainability': 'Maintainability',
  'governance.section.application.security_hotspots_reviewed': 'Hotspots Reviewed',
  'governance.section.sca': 'Dependency Risks',
  'governance.projects': 'Projects',
  'governance.x_projects_failed': '{count} project(s) failed',
  'governance.x_projects_in_y': '{projectCount} project(s) in {rating}',
  'governance.has_always_been_x': 'has always been {rating}',
  'governance.was': 'was',
  'governance.not_computed.VW': 'This portfolio is not yet computed.',
  'governance.no_projects.VW': 'This portfolio is empty.',
  'governance.no_ncloc.VW': 'This portfolio contains only empty projects.',

  // Report
  'report.page': 'Executive report',
  'report.configured_globally_note': '(configured globally)',
  'report.frequency': 'Frequency',
  'report.frequency.admin': 'Customize the frequency used to send PDF reports for that portfolio.',
  'report.frequency.default': 'Default',
  'report.frequency.default.description': 'Globally configured value is used.',
  'report.frequency.daily': 'Daily',
  'report.frequency.daily.description':
    'Report is sent during the first portfolio calculation of the day (if any).',
  'report.frequency.daily.effective': 'every day',
  'report.frequency.weekly': 'Weekly',
  'report.frequency.weekly.description':
    'Report is sent during the first portfolio calculation of the week (if any), starting from Midnight on Monday.',
  'report.frequency.weekly.effective': 'every week',
  'report.frequency.monthly': 'Monthly',
  'report.frequency.monthly.description':
    'Report is sent during the first portfolio calculation of the month (if any), starting from the first day of the current month.',
  'report.frequency.monthly.effective': 'every month',
  'report.recipients': 'Other Recipients',
  'report.recipients.admin':
    'Add email addresses of people who do not have an account on SonarQube Server but still want to get PDF reports for that portfolio.',
  'report.delete_recipient': 'Delete recipient {0}',

  'application_settings.page': 'Application Settings',
  'application_settings.report': 'Application report settings',
  'application_settings.report.frequency': 'Application Reports Frequency',

  // New Code Definition - Additional keys for shared component
  'new_code.page.description':
    "The new code definition sets the criteria for what's considered new code, allowing you to focus on the most recent changes in your project.<br></br><br></br>This setting establishes the instance’s default new code definition, that will be applied to all new and existing projects, and can be further customized at the project level.<br></br>{url}",
  'new_code.page.description.documentation_link': 'Learn more in documentation',

  // Toggle Tips
  'toggle_tip.aria_label.quality_gate': 'More information about quality gate',
  'toggle_tip.aria_label.alm_not_configured': 'More information about ALM integration',
  'toggle_tip.aria_label.threshold': 'More information about threshold',
  'toggle_tip.aria_label.security_hotspots': 'More information about security hotspots',
  'toggle_tip.aria_label.reports': 'More information about reports',
  'toggle_tip.aria_label.onboarding': 'More information about onboarding',

  // Beamer
  'beamer.panel.title': "What's new on SonarQube",
  'beamer.news.error': 'Failed to load news',
  'beamer.news.no_news': 'No news available',

  // ----------------------------------------------------------------------------
  //
  // Jira integration
  //
  // ----------------------------------------------------------------------------

  'jira_binding.server_error': 'Internal server error. Please try again later.',

  'security_alerts.page': 'Security Alerts',
  'security_alerts.branch_label': 'Branch:',
  'security_alerts.branch_link_label': "''{projectName}'' on branch ''{branchName}''",
  'security_alerts.filter.alert_type': 'Alert type',
  'security_alerts.filter.status': 'Status',
  'security_alerts.sort.first_detected_at': 'First Detection',
  'security_alerts.sort.last_detected_at': 'Last Detection',
  'security_alerts.alert_type.dependency_risk': 'Dependency Risk',
  'security_alerts.status.open': 'Open',
  'security_alerts.status.resolved': 'Resolved',
  'security_alerts.status.count': '{status} ({count} shown)',
  'security_alerts.severity.aria_label': '{quality} {severity}',
  'security_alerts.no_results': 'No security alerts found',
  'security_alerts.total': '{count, plural, one {# alert} other {# alerts}}',
  'security_alerts.first_detected': 'First detected {date}',
  'security_alerts.last_detected': 'Last detected {date}',
  'security_alerts.affected_branches':
    '{count, plural, one {# affected branch} other {# affected branches}}',
  'security_alerts.affected_branches_more': 'and {count} more',
  'security_alerts.detail.back': 'Back to security alerts',
  'security_alerts.detail.not_found': 'Security alert not found',
  'security_alerts.detail.sca_issue.package': 'Package',
  'security_alerts.detail.sca_issue.version': 'Version',
  'security_alerts.detail.sca_issue.action': 'Action',
  'security_alerts.detail.sca_issue.view_risk': 'View risk details',

  'group_notifications.add': 'Add subscription',
  'group_notifications.empty': 'No group subscriptions configured.',
  'group_notifications.notification_type': 'Notification type',
  'group_notifications.subscriptions': 'Notification subscriptions',
  'group_notifications.manage_subscriptions': 'Manage subscriptions',
  'group_notifications.subscriptions_count':
    '{count, plural, one {# subscription} other {# subscriptions}}',
  'group_notifications.remove_subscription': 'Remove {type}',

  'security_alerts.page.intro':
    'Security alerts are shown when critical findings are detected in your projects that could need immediate remediation. Review them to understand the risk and take action when needed.',

  'security_alerts.page.intro.learn_more':
    'Learn more about <docsLink>security alerts and how to get notified when they are detected</docsLink>.',

  'security_alerts.security_alert_banner.message':
    'New security alerts were detected in your projects in the past week. <link>View all security alerts</link>',
  'pr_remediation.page': 'Remediation overview',
  'pr_remediation.pull_requests': 'Pull requests',
  'pr_remediation.heading': 'Pull request remediation',
  'pr_remediation.description':
    'Track upstream remediation through {findingType, select, sca {dependency risks} other {issues}} closed during pull request review, helping prevent problems from reaching target branches.',
  'pr_remediation.finding_type': 'Finding type',
  'pr_remediation.issues': 'Issues',
  'pr_remediation.dependency_risks': 'Dependency risks',
  'pr_remediation.loading': 'Loading pull request remediation',
  'pr_remediation.load_error': 'Could not load pull request remediation. Try again.',
  'pr_remediation.no_analysis': 'No pull requests were analyzed in this scope during the period',
  'pr_remediation.no_analysis_description': 'Missing analysis isn’t the same as nothing closed.',
  'pr_remediation.history_unavailable': 'No comparable reporting history in this scope',
  'pr_remediation.history_unavailable_description':
    'Missing history isn’t the same as zero remediation. Try a shorter period.',
  'main_branch_remediation.main_branches': 'Main branches',
  'main_branch_remediation.heading': 'Main branch remediation',
  'main_branch_remediation.description':
    'Track {findingType, select, sca {dependency risks} other {issues}} closed in the main branches of projects in your organization.',
  'main_branch_remediation.closedFindings.title': 'Closed during this period',
  'main_branch_remediation.backlogHistory.title': 'How did the backlog change?',
  'main_branch_remediation.introducedAndResolvedFindings.title': 'Introduced vs. closed',
  'main_branch_remediation.openFindingsAge.title':
    'Age of open {findingType, select, sca {dependency risks} other {issues}}',
  'main_branch_remediation.mttr.title': 'Mean time to resolve',
  'main_branch_remediation.loading': 'Loading main branch remediation',
  'main_branch_remediation.error': 'Could not load this widget. Try again.',
  'main_branch_remediation.unavailable': 'Data is unavailable for this widget.',
  'main_branch_remediation.backlogHistory.description':
    'Last {days, number} days, as of {date} (UTC)',
  'main_branch_remediation.backlogHistory.open':
    '{findingType, select, sca {Open dependency risks} other {Open issues}}',
  'main_branch_remediation.backlogHistory.chart_label':
    '{findingType, select, sca {Dependency risk} other {Issue}} backlog history',
  'main_branch_remediation.backlogHistory.change': '{delta} compared with the start of the period',
  'main_branch_remediation.backlogHistory.no_change': 'No change since the start of the period',
  'main_branch_remediation.backlogHistory.missing_end': 'The report-end count is unavailable.',
  'main_branch_remediation.backlogHistory.missing_baseline': 'The starting count is unavailable.',
  'main_branch_remediation.backlogHistory.unavailable': 'Unavailable',
  'main_branch_remediation.backlogHistory.date': '{date} (UTC)',
  'main_branch_remediation.backlogHistory.keyboard_hint':
    'Use Left and Right arrows to explore five-day snapshots, Home and End for the first and last, and Escape to dismiss details.',
  'main_branch_remediation.openFindingsAge.as_of': 'As of {date} (UTC)',
  'main_branch_remediation.openFindingsAge.duration':
    '{unit, select, months {{value} months} other {{value} {days, plural, one {day} other {days}}}}',
  'main_branch_remediation.openFindingsAge.median_exact':
    'Median age: {value} {days, plural, one {day} other {days}}',
  'main_branch_remediation.openFindingsAge.median_caption':
    'Median age of open {findingType, select, sca {dependency risks} other {issues}}',
  'main_branch_remediation.openFindingsAge.no_open':
    'No open {findingType, select, sca {dependency risks} other {issues}}.',
  'main_branch_remediation.openFindingsAge.no_median': 'Median age is unavailable.',
  'main_branch_remediation.openFindingsAge.bucket_below': '<{end, number} days',
  'main_branch_remediation.openFindingsAge.bucket_between': '{start, number}–<{end, number} days',
  'main_branch_remediation.openFindingsAge.bucket_older': '{start, number}+ days',
  'main_branch_remediation.openFindingsAge.open':
    'Open {findingType, select, sca {dependency risks} other {issues}}',
  'main_branch_remediation.openFindingsAge.row':
    '{range}: {count, number} {findingType, select, sca {open dependency risks} other {open issues}}',
  'main_branch_remediation.openFindingsAge.keyboard_hint':
    'Use Up and Down arrows to explore age buckets, Home and End for the first and last, and Escape to dismiss details.',
  'main_branch_remediation.introducedAndResolvedFindings.description':
    'Are {findingType, select, sca {dependency risks} other {issues}} closed as fast as new ones are introduced?',
  'main_branch_remediation.introducedAndResolvedFindings.more_closed':
    '{count, number} more closed than introduced in the last {days, number} days',
  'main_branch_remediation.introducedAndResolvedFindings.more_introduced':
    '{count, number} more introduced than closed in the last {days, number} days',
  'main_branch_remediation.introducedAndResolvedFindings.balanced':
    'The same number closed and introduced in the last {days, number} days',
  'main_branch_remediation.introducedAndResolvedFindings.totals':
    '{closed, number} closed, {introduced, number} introduced',
  'main_branch_remediation.introducedAndResolvedFindings.show_net': 'Show net change',
  'main_branch_remediation.introducedAndResolvedFindings.introduced': 'Introduced',
  'main_branch_remediation.introducedAndResolvedFindings.closed': 'Closed',
  'main_branch_remediation.introducedAndResolvedFindings.net': 'Net change',
  'main_branch_remediation.introducedAndResolvedFindings.chart_label':
    '{findingType, select, sca {Dependency risks} other {Issues}} introduced above zero and closed below zero by interval',
};
