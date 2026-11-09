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

export const projectsMessages = {
  'projects.favorite_search.empty.title': 'No matching favorite projects',
  'projects.favorite_search.clear_all_filters': 'Clear all filters',
  'projects.sidebar.clear_all_filters': 'Clear all filters',
  //------------------------------------------------------------------------------
  //
  // PROJECT LINKS
  //
  //------------------------------------------------------------------------------

  'project_links.homepage': "Project's Website",
  'project_links.ci': 'Continuous integration',
  'project_links.issue': 'Bug Tracker',
  'project_links.scm': 'Sources',
  'project_links.scm_ro': 'Read-only connection',
  'project_links.scm_dev': 'Developer connection',

  'project_links.create_new_project_link': 'Create New Project Link',
  'project_links.delete_project_link': 'Delete Project Link',
  'project_links.are_you_sure_to_delete_x_link': 'Are you sure you want to delete the "{0}" link?',
  'project_links.delete_x_link': 'Delete "{0}" link',
  'project_links.name': 'Name',
  'project_links.url': 'URL',
  'project_links.no_results': 'No links yet. Click "Create" to add one.',
  'project_overview.agent_activity.error_description': 'Oops! Something went wrong.',
  'project_overview.agent_activity.error_reason_description':
    "We couldn't retrieve the list of agent activity for this project at this time. This might be a temporary issue.",
  'project_overview.agent_activity.table.outcome': 'Outcome',
  'project_overview.agent_activity.table.started': 'Started',
  'project_settings.page': 'General settings',
  'project_settings.page.description': 'Edit project settings.',
  'project_links.page': 'Links',
  'project_links.page.description': 'Edit some links associated with this project.',
  'project_branch_pull_request.page': 'Branches & pull requests',
  'project_branch_pull_request.lifetime_information':
    'Branches and Pull Requests are permanently deleted after {days} days without analysis.',
  'project_branch_pull_request.lifetime_information.admin':
    'You can adjust this value globally in {settings}.',
  'project_branch_pull_request.branch.rename': 'Rename branch',
  'project_branch_pull_request.branch.set_main': 'Set as main branch',
  'project_branch_pull_request.branch.set_x_as_main': 'Set "{branch}" as the main branch',
  'project_branch_pull_request.branch.delete': 'Delete branch',
  'project_branch_pull_request.branch.actions_label': 'Update {branchName}',
  'project_branch_pull_request.branch.delete.are_you_sure':
    'Are you sure you want to delete branch "{name}"?',
  'project_branch_pull_request.branch.main_branch.are_you_sure':
    'Are you sure you want to set branch "{branch}" as the main branch of this project?',
  'project_branch_pull_request.branch.main_branch.requires_reindex':
    'Changing the main branch of your project will trigger a project re-indexing and may impact the level of information that is available until re-indexing is complete.',
  'project_branch_pull_request.branch.main_branch.learn_more':
    'Please refer to the {documentation} to understand the impacts of changing the main branch.',
  'project_branch_pull_request.branch.auto_deletion.keep_when_inactive': 'Keep when inactive',
  'project_branch_pull_request.branch.auto_deletion.keep_when_inactive.tooltip':
    'When turned on, the branch will not be automatically deleted when inactive.',
  'project_branch_pull_request.branch.auto_deletion.main_branch_tooltip':
    'The main branch is always excluded from automatic deletion.',
  'project_branch_pull_request.pull_request.delete': 'Delete Pull Request',
  'project_branch_pull_request.pull_request.delete.are_you_sure':
    'Are you sure you want to delete Pull Request "{name}"?',
  'project_branch_pull_request.tabs.branches': 'Branches',
  'project_branch_pull_request.tabs.pull_requests': 'Pull Requests',
  'project_branch_pull_request.table.branch': 'Branch',
  'project_branch_pull_request.table.pull_request': 'Pull Request',
  'project_branch_pull_request.last_analysis_date': 'Last Analysis Date',
  'project_dashboards.page': 'All dashboards',
  'project_dashboards.page.description':
    'List of all dashboards in this project, including Built-in and custom dashboards. Learn more about <link>viewing and managing project dashboards</link>.',
  'project_dashboards.page.private_project_message':
    'Anyone with access to this project can view, create, and edit dashboards.',
  'project_dashboards.page.public_project_message':
    'Anyone can view. Only authenticated users can create and edit dashboards.',
  'project_dashboards.all.page': 'Dashboards',
  'project_dashboards.create_dashboard': 'Create custom dashboard',
  'project_dashboards.search_placeholder': 'Search for dashboard...',
  'project_dashboards.number_of_dashboards':
    '<b>{count}</b> {count, plural, one {dashboard} other {dashboards}}',
  'project_dashboard.list.toast.create_success': 'Dashboard {dashboardName} created.',
  'project_dashboard.list.toast.delete_success': 'Dashboard {dashboardName} deleted.',
  'project_dashboard.list.toast.create_error': 'We could not create your dashboard. Try again.',
  'project_dashboard.list.toast.delete_error': 'We could not delete your dashboard. Try again.',
  'project_dashboard.list.toast.edit_error': 'We could not edit your dashboard. Try again.',
  'project_dashboard.list.toast.duplicate_error':
    'We could not duplicate your dashboard. Try again.',
  'project_dashboard.list.toast.edit_success': 'Dashboard {dashboardName} updated.',
  'project_dashboard.list.toast.duplicate_success': 'Dashboard {dashboardName} duplicated.',
  'project_dashboard.overview.banner.title': 'Meet the new Overview',
  'project_dashboard.overview.banner.description':
    "The Overview page has a new look, putting your project health metrics front and center. Looking for the previous Overview page? It's still available, now as the <link>analysis summary page.</link>",
  'project_activity.page': 'Activity',
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  //
  // PROJECTS PAGE
  //
  //------------------------------------------------------------------------------

  'projects.page': 'Projects',
  'projects.add': 'Create Project',
  'projects.coverage': 'Project coverage',
  'projects.coverage.spotlight.title': 'See which projects are not yet imported or analyzed.',
  'projects.coverage.spotlight.content':
    'Your dashboard for importing and analyzing all your projects.',
  'projects.coverage.spotlight.image_alt': 'Project coverage donut chart',
  'projects.coverage.spotlight.close': 'Close',
  'projects.create_application': 'Create Application',
  'projects.no_projects.empty_instance': 'There are no visible projects yet',
  'projects.no_projects.empty_instance.new_project':
    'Once you analyze some projects, they will show up here',
  'projects.no_projects.empty_instance.how_to_add_projects':
    'Here is how you can analyze new projects',
  'projects.no_favorite_projects': "You don't have any favorite projects yet.",
  'projects.no_favorite_projects.engagement':
    'Discover and mark projects as favorites to access them quickly here.',
  'projects.explore_projects': 'Explore projects',
  'projects.not_analyzed.TRK': "Project's Main Branch is not analyzed yet.",
  'projects.not_analyzed.APP': "None of the Application's projects have been analyzed.",
  'projects.no_new_code_period.TRK': 'Project has no new code data yet.',
  'projects.no_new_code_period.APP': 'Application has no new code data yet.',
  'projects.configure_analysis': 'Configure analysis',
  'projects.configure_analysis_for_x': 'Configure analysis for project {project}',
  'projects.last_analysis_on_x': 'Last analysis: {date}',
  'projects.search': 'Search by project name or key',
  'projects.perspective': 'Perspective',
  'projects.skip_to_filters': 'Skip to project filters',
  'projects.x_projects_found': '{count} projects found',
  'projects.sort_by': 'Sort by',
  'projects.sort_ascending': 'Result sorted in ascending order',
  'projects.sort_descending': 'Result sorted in descending order',
  'projects.sorting.default': 'default',
  'projects.sorting.name': 'Name',
  'projects.sorting.analysis_date': 'Last analysis date',
  'projects.sorting.creation_date': 'Creation date',
  'projects.sorting.reliability': 'Reliability',
  'projects.sorting.security': 'Security',
  'projects.sorting.security_review': 'Security Review',
  'projects.sorting.maintainability': 'Maintainability',
  'projects.sorting.coverage': 'Coverage',
  'projects.sorting.duplications': 'Duplications',
  'projects.sorting.size': 'Size',
  'projects.sorting.new_reliability': 'Reliability',
  'projects.sorting.new_security': 'Security',
  'projects.sorting.new_security_review': 'Security Review',
  'projects.sorting.new_maintainability': 'Maintainability',
  'projects.sorting.new_coverage': 'Coverage',
  'projects.sorting.new_duplications': 'Duplications',
  'projects.sorting.new_lines': 'New Lines',
  'projects.sorting.new_ncloc': 'New Lines of Code',
  'projects.view.overall': 'Overall Status',
  'projects.view.overall_code': 'Overall Code',
  'projects.view.new_code': 'New Code',
  'projects.facets.quality_gate': 'Quality gate',
  'projects.facets.quality_gate.warning_help':
    'Warning status is deprecated. This filter will disappear when no Warning quality gate remains.',
  'projects.facets.rating_option.reliability.legacy.1': '≥ 0 info issues',
  'projects.facets.rating_option.reliability.legacy.2': '≥ 1 minor issue',
  'projects.facets.rating_option.reliability.legacy.3': '≥ 1 major issue',
  'projects.facets.rating_option.reliability.legacy.4': '≥ 1 critical issue',
  'projects.facets.rating_option.reliability.legacy.5': '≥ 1 blocker issue',
  'projects.facets.rating_option.reliability.1': '≥ 0 info issues',
  'projects.facets.rating_option.reliability.2': '≥ 1 low issue',
  'projects.facets.rating_option.reliability.3': '≥ 1 medium issue',
  'projects.facets.rating_option.reliability.4': '≥ 1 high issue',
  'projects.facets.rating_option.reliability.5': '≥ 1 blocker issue',
  'projects.facets.rating_option.security.legacy.1': '≥ 0 info issues',
  'projects.facets.rating_option.security.legacy.2': '≥ 1 minor issue',
  'projects.facets.rating_option.security.legacy.3': '≥ 1 major issue',
  'projects.facets.rating_option.security.legacy.4': '≥ 1 critical issue',
  'projects.facets.rating_option.security.legacy.5': '≥ 1 blocker issue',
  'projects.facets.rating_option.security.1': '≥ 0 info issues',
  'projects.facets.rating_option.security.2': '≥ 1 low issue',
  'projects.facets.rating_option.security.3': '≥ 1 medium issue',
  'projects.facets.rating_option.security.4': '≥ 1 high issue',
  'projects.facets.rating_option.security.5': '≥ 1 blocker issue',
  'projects.facets.rating_option.maintainability.1': '≤ 5% to 0%',
  'projects.facets.rating_option.maintainability.2': '≥ 5% to <10%',
  'projects.facets.rating_option.maintainability.3': '≥ 10% to <20%',
  'projects.facets.rating_option.maintainability.4': '≥ 20% to <50%',
  'projects.facets.rating_option.maintainability.5': '≥ 50%',
  'projects.facets.rating_option.security_review.1': '≥ 80%',
  'projects.facets.rating_option.security_review.2': '≥ 70% to <80%',
  'projects.facets.rating_option.security_review.3': '≥ 50% to <70%',
  'projects.facets.rating_option.security_review.4': '≥ 30% to <50%',
  'projects.facets.rating_option.security_review.5': '< 30%',
  'projects.facets.rating_option.sca_rating.1': '≥ 0 info risks',
  'projects.facets.rating_option.sca_rating.2': '≥ 1 low risk',
  'projects.facets.rating_option.sca_rating.3': '≥ 1 medium risk',
  'projects.facets.rating_option.sca_rating.4': '≥ 1 high risk',
  'projects.facets.rating_option.sca_rating.5': '≥ 1 blocker risk',
  'projects.facets.security_review.description':
    'The percentage of reviewed (fixed or safe) security hotspots',
  'projects.facets.maintainability.description':
    'Ratio of the estimated time needed to fix all outstanding maintainability issues to the size of the project',
  'projects.facets.security.description': 'Vulnerability count',
  'projects.facets.reliability.description': 'Bug count',
  'projects.facets.languages': 'Languages',
  'projects.facets.new_ncloc': 'New lines of code',
  'projects.facets.tags': 'Tags',
  'projects.facets.qualifier': 'Type',
  'projects.facets.rating_label_single_x': 'Click to filter projects with a {0} rating of {1}.',
  'projects.facets.rating_label_multi_x':
    'Click to filter projects with a {0} rating of {1} or worse.',
  'projects.facets.label_no_data_x': 'Click to filter projects with no {0} data.',
  'projects.facets.size.label.1': 'Click to filter projects with fewer than 1k lines of code',
  'projects.facets.size.label.2': 'Click to filter projects with 1k lines of code or more',
  'projects.facets.size.label.3': 'Click to filter projects with 10k lines of code or more',
  'projects.facets.size.label.4': 'Click to filter projects with 100k lines of code or more',
  'projects.facets.size.label.5': 'Click to filter projects with more than 500k lines of code',
  'projects.facets.new_ncloc.label.1':
    'Click to filter projects with fewer than 1k new lines of code',
  'projects.facets.new_ncloc.label.2': 'Click to filter projects with 1k new lines of code or more',
  'projects.facets.new_ncloc.label.3':
    'Click to filter projects with 10k new lines of code or more',
  'projects.facets.new_ncloc.label.4':
    'Click to filter projects with 100k new lines of code or more',
  'projects.facets.new_ncloc.label.5':
    'Click to filter projects with more than 500k new lines of code',
  'projects.facets.coverage.label.1': 'Click to filter projects with more than 80% coverage',
  'projects.facets.coverage.label.2': 'Click to filter projects with less than 80% coverage',
  'projects.facets.coverage.label.3': 'Click to filter projects with less than 70% coverage',
  'projects.facets.coverage.label.4': 'Click to filter projects with less than 50% coverage',
  'projects.facets.coverage.label.5': 'Click to filter projects with less than 30% coverage',
  'projects.facets.duplication.label.1': 'Click to filter projects with less than 3% duplication',
  'projects.facets.duplication.label.2': 'Click to filter projects with more than 3% duplication',
  'projects.facets.duplication.label.3': 'Click to filter projects with more than 5% duplication',
  'projects.facets.duplication.label.4': 'Click to filter projects with more than 10% duplication',
  'projects.facets.duplication.label.5': 'Click to filter projects with more than 20% duplication',
  'projects.facets.no_available_filters_clear_others':
    'No available filters. Clear other filters to see options.',
  'projects.show_more': 'Show more projects',
  'projects.security_hotspots_reviewed': 'Hotspots Reviewed',
  'projects.awaiting_scan': 'Change in Calculation',
  'projects.awaiting_scan.title': 'Values might change after the next analysis',
  'projects.awaiting_scan.description.TRK':
    'The calculation methodology for security, reliability, and maintainability ratings has changed, and the values displayed may be updated after the next analysis.',
  'projects.awaiting_scan.description.APP':
    'The calculation methodology for security, reliability, and maintainability ratings has changed, and the values displayed may be updated after analyzing all projects in this application.',
  'projects.awaiting_scan.description.VW':
    'The calculation methodology for security, reliability, and maintainability ratings has changed, and the values displayed may be updated after analyzing all projects in this portfolio.',
  'projects.awaiting_scan.learn_more': 'Learn more in SonarQube documentation',
  'projects.ai_code_assurance_on.description': 'AI Code Assurance is on',
  'projects.ai_code_assurance_off.description': 'AI Code Assurance is off',
  'projects.ai_code_assurance_fail.description': 'AI Code Assurance failed',
  'projects.ai_code_assurance_pass.description': 'AI Code Assurance passed',
  'projects.ai_code_assurance.edit_quality_gate': 'Change quality gate',
  'projects.ai_code.tooltip.content': 'This project contains AI-generated code.',
  'projects.ai_code_detected.title': 'AI code detected',
  'projects.ai_code_detected.description': 'This project may contain AI-generated code.',
  'projects.ai_code_detected.link': 'Review AI-Generated Code setting',
  'projects.ai_code_detected.tooltip.content':
    'Some contributors in this project used GitHub Copilot recently.',
  'projects.branch.info.AI_CODE_ASSURANCE_ON.content':
    'This project benefits from Sonar’s AI Code Assurance.',
  'projects.branch.info.AI_CODE_ASSURANCE_PASS.content':
    'This branch meets your quality standard for AI Code.',
  'projects.branch.info.AI_CODE_ASSURANCE_FAIL.content':
    'This branch does not meet your quality standard for AI Code.',
  'projects.branches.AI_CODE_ASSURANCE_OFF.admin.content':
    'To benefit from AI Code Assurance, select an AI-qualified quality gate. <link>Change quality gate</link>',
  'projects.branches.AI_CODE_ASSURANCE_OFF.content':
    'This project could benefit from AI Code Assurance by using an <link>AI-qualified quality gate</link>.',
  'project_dashboard.modal.permission_access.private_project_description':
    'Visible and editable by anyone with browse access to this private project.',
  'project_dashboard.modal.permission_access.public_project_description':
    'Anyone can view. Only authenticated users can create and edit dashboards.',
  'project_dashboard.widget.tooltip.count': 'Count: {count}',
  'project_dashboard.widget.tooltip.percentage': 'Percentage: {percentage}',
  'project_dashboard.widget.pie_chart': 'Pie chart',
  'project_dashboard.widget.pie_chart.aria_label': '{title}. {breakdown}',
  'project_dashboard.widget.pie_chart.aria_label.segment': '{label}: {count} ({percentage}%)',
  'project_dashboard.widget.line_chart.aria_label': 'Line chart showing {metric} over time',
  'project_dashboard.dashboard_name': 'Name',
  'project_dashboard.last_edited_by': 'Last edited <b>{lastUpdatedAt}</b> by <b>{user}</b>',
  'project_dashboard.modal.dashboard_name_placeholder': 'Dashboard name',
  'project_dashboard.dashboard_description': 'Description',
  'project_dashboard.modal.dashboard_description_placeholder': 'Dashboard description',
  'project_dashboard.duplicate_dashboard_title': 'Duplicate dashboard',
  'project_dashboard.duplicate_dashboard_description':
    'Duplicating a dashboard creates a copy with all the same widgets.',
  'project_dashboard.modal.duplicate_dashboard_button': 'Duplicate',
  'project_dashboard.save_changes_message': 'Unsaved changes',
  'project_dashboard.save_changes': 'Save changes',
  'project_dashboard.empty.button.enter_edit_mode': 'Enter edit mode',
  'project_dashboard.cancel_changes': 'Cancel and exit',
  'project_dashboard.exit_without_saving_title': 'Exit without saving?',
  'project_dashboard.exit_without_saving_message':
    'You have unsaved edits in your dashboard. Leaving now will discard your changes.',
  'project_dashboard.exit_without_saving': 'Exit without saving',
  'project_dashboard.go_back_to_editing': 'Go back to editing',
  'project_dashboard.new_section': 'Add section',
  'project_dashboard.create_section': 'Add to dashboard',
  'project_dashboard.create_section_title': 'Add new section',
  'project_dashboard.edit_mode_message': 'Editing dashboard',
  'project_dashboard.last_edited': 'Last edited {lastUpdatedAt}',
  'project_dashboard.custom.error.description':
    'We could not load this dashboard. Try again later.',
  'project_dashboard.custom.error.invalid_layout.description':
    "This dashboard's saved layout is invalid or corrupted and cannot be shown.",
  'project_dashboard.custom.error.invalid_layout.title': 'Dashboard layout is invalid',
  'project_dashboard.custom.error.title': 'Something went wrong',
  'project_dashboard.custom.toast.save_error': 'We could not save your dashboard. Try again.',
  'project_dashboard.custom.toast.save_success': 'Dashboard saved.',
  'project_dashboard.custom.toast.delete_error': 'We could not delete your dashboard. Try again.',
  'project_dashboard.custom.not_found.back_to_list': 'Back to dashboards',
  'project_dashboard.custom.not_found.description':
    'This dashboard may have been deleted or the link is incorrect.',
  'project_dashboard.custom.not_found.title': 'Dashboard not found',

  //------------------------------------------------------------------------------
  //
  // PROJECT ACTIVITY/HISTORY SERVICE
  //
  //------------------------------------------------------------------------------

  'project_activity.analysis_build_string_X': 'Build string: {0}',
  'project_activity.add_version': 'Create Version',
  'project_activity.analysis_X_actions': 'Show actions for analysis {0}',
  'project_activity.show_analysis_X_on_graph':
    'Show details on interactive graph for analysis {0}. Note: this data is also available as a table. Click on the button below the graph.',
  'project_activity.remove_version': 'Remove Version',
  'project_activity.remove_version.question': 'Are you sure you want to delete this version?',
  'project_activity.change_version': 'Change Version',
  'project_activity.add_custom_event': 'Create Custom Event',
  'project_activity.change_custom_event': 'Change Event',
  'project_activity.remove_custom_event': 'Delete Event',
  'project_activity.remove_custom_event.question': 'Are you sure you want to delete this event?',
  'project_activity.reset_dates': 'Reset dates',
  'project_activity.delete_analysis': 'Delete Analysis',
  'project_activity.delete_analysis.question':
    'Are you sure you want to delete this analysis from the history?',
  'project_activity.filter_events': 'Events filter',
  'project_activity.filter_events.placeholder': 'Select an event',
  'project_activity.filter_date_range': 'Date range filter',
  'project_activity.events.tooltip.edit': 'Edit this event: {event}',
  'project_activity.events.tooltip.delete': 'Delete this event: {event}',
  'project_activity.new_code_period_start': 'Everything above this line is New Code',
  'project_activity.new_code_period_start.help':
    'The analysis below this mark is the baseline for New Code comparison',

  'project_activity.graphs.choose_type': 'Graph type',
  'project_activity.graphs.explanation_x':
    'This interactive graph shows data for the following project measures over time: {0}',
  'project_activity.graphs.issues': 'Issues',
  'project_activity.graphs.coverage': 'Coverage',
  'project_activity.graphs.duplications': 'Duplications',
  'project_activity.graphs.custom': 'Custom',
  'project_activity.graphs.custom.add': 'Add metric',
  'project_activity.graphs.custom.select_metric': 'Select metric to display',
  'project_activity.graphs.custom.add_metric_info':
    'Only 3 metrics of the same type can be displayed on one graph. You can have a maximum of two graphs.',
  'project_activity.graphs.custom.remove_metric': 'Remove the {0} metric from the graph',
  'project_activity.graphs.custom.no_history':
    "There isn't enough data to generate an activity graph, please select more metrics.",
  'project_activity.graphs.custom.metric_no_history':
    'This metric has no historical data to display.',
  'project_activity.graphs.custom.metric_no_history.coverage':
    'No coverage data available. Make sure coverage analysis is set up correctly.',
  'project_activity.graphs.custom.type_x_message':
    'Only "{0}" metrics are available with your current selection.',
  'project_activity.graphs.graph_shown_x': 'Graph shown for {0}.',
  'project_activity.graphs.open_in_table': "Press 'Enter' to show the graph data in a table.",
  'project_activity.graphs.data_table.title': 'Graph data in table format',
  'project_activity.graphs.data_table.max_lines_warning':
    'Only the {0} most recent data entries are shown. If you want to see different data, change the date filters on the main page.',
  'project_activity.graphs.data_table.no_data_warning': 'There is no data for the selected series.',
  'project_activity.graphs.data_table.no_data_warning_check_dates_x':
    'There is no data for the selected date range (everything after {start}). Try modifying the date filters on the main page.',
  'project_activity.graphs.data_table.no_data_warning_check_dates_y':
    'There is no data for the selected date range (everything before {end}). Try modifying the date filters on the main page.',
  'project_activity.graphs.data_table.no_data_warning_check_dates_x_y':
    'There is no data for the selected date range ({start} to {end}). Try modifying the date filters on the main page.',
  'project_activity.graphs.data_table.data_gap':
    'The chart history for issues related to software qualities may contain gaps while information is not available for one or more projects. {learn_more}',

  'project_activity.graphs.rating_split.title': 'Metrics calculation changed',
  'project_activity.graphs.rating_split.description':
    "The way we calculate metrics has changed and it might have affected this metric's values.",
  'project_activity.graphs.rating_split.info_icon': 'Metrics calculation change information',

  'project_activity.custom_metric.covered_lines': 'Covered Lines',

  'project_activity.custom_metric.deprecated.severity':
    'Old severities and the corresponding filters are deprecated.',
  'project_activity.custom_metric.deprecated.quality':
    'Issue types and the corresponding filters are deprecated. You can use filters by Software Quality.',

  //------------------------------------------------------------------------------
  //
  // PROJECT INFORMATION DRAWER
  //
  //------------------------------------------------------------------------------

  'project.info.title': 'Project information',
  'project.about.title': 'About this Project',
  'project.info.description': 'Description',
  'project.info.empty_description': 'No description added for this project.',
  'project.info.quality_gate': 'Quality gate used',
  'project.info.quality_gate.link_label':
    '{gate} - quality gate used for this project. Click to navigate to the quality gate page.',
  'project.info.notifications': 'Notifications',
  'project.info.main_branch': 'Main branch',
  'project.info.see_more_info_on_x_locs': 'See more information on your {0} lines of code',
  'project.info.contain_ai_code.title': 'AI Code',
  'project.info.contain_ai_code.description': 'This project contains AI-generated code.',
  'project.info.detected_ai_code.description': 'This project may contain AI-generated code.',
  'project.info.ai_code_assurance.title': 'AI Code Assurance',
  'project.info.ai_code_assurance.on.description':
    'This project benefits from Sonar’s AI Code Assurance.',
  'project.info.ai_code_assurance.off.description':
    'This project could benefit from AI Code Assurance by using an <link>AI-qualified quality gate</link>.',
  'project.info.ai_code_assurance.off.description_for_admin':
    'To benefit from AI Code Assurance, select an AI-qualified quality gate.',
  'project.info.ai_code_fix.title': 'AI CodeFix',
  'project.info.ai_code_fix.message': 'AI CodeFix is enabled for this project.',

  'source_viewer.view_all_issues': 'See all issues in this file',
  'source_viewer.expand_all_lines': 'Show all lines of code',
  'source_viewer.line_X': 'Line: {0}',
  'source_viewer.click_for_scm_info': 'Click to see SCM information for line {0}',
  'source_viewer.author_X': 'Author: {0}',
  'source_viewer.click_to_copy_filepath': 'Click to copy the filepath to clipboard',
  'source_viewer.issue_link_x': '{count} {quality} {count, plural, one {issue} other {issues}}',
  'source_viewer.jupyter.output.image': 'Output',
  'source_viewer.jupyter.preview.error':
    'Error while loading the Jupyter notebook. Use the Code tab to view raw.',

  'source_viewer.tooltip.duplicated_block': 'Duplicated block. Click for details.',
  'source_viewer.tooltip.covered': 'Fully covered by tests.',
  'source_viewer.tooltip.covered.conditions': 'Fully covered by tests ({0} conditions).',
  'source_viewer.tooltip.partially-covered': 'Partially covered by tests.',
  'source_viewer.tooltip.partially-covered.conditions':
    'Partially covered by tests ({0} of {1} conditions).',
  'source_viewer.tooltip.uncovered': 'Not covered by tests.',
  'source_viewer.tooltip.uncovered.conditions': 'Not covered by tests ({0} conditions).',
  'source_viewer.tooltip.scm.commited_on': 'Committed on',
  'source_viewer.tooltip.scm.revision': 'Revision',

  'source_viewer.issues_on_line.multiple_issues':
    '{show, select, true {Show} other {Hide}} multiple issues on this line',
  'source_viewer.issues_on_line.multiple_issues_same_category':
    '{show, select, true {Show} other {Hide}} {count} {category} {count, plural, one {issue} other {issues}} on this line',
  'source_viewer.issues_on_line.multiple_issues_same_category.legacy':
    '{show, select, true {Show} other {Hide}} {count} {issueType} on this line',

  'source_viewer.load_more_code': 'Load More Code',
  'source_viewer.loading_more_code': 'Loading More Code...',

  'source_viewer.expand_above': 'Show previous few lines of code',
  'source_viewer.expand_below': 'Show next few lines of code',
  'source_viewer.copy_permalink': 'Copy Permalink',
  'source_viewer.copy_line': 'Copy Line',
  'source_viewer.copied_to_clipboard': 'Copied to Clipboard',
  'source_viewer.new_code': 'New Code',
  'source_viewer.coverage.covered': 'Covered code',
  'source_viewer.coverage.uncovered': 'Uncovered code',
  'source_viewer.coverage.partially-covered': 'Partially covered code',

  //------------------------------------------------------------------------------
  //
  // BACKGROUND TASKS
  //
  //------------------------------------------------------------------------------
  'component_navigation.status.failed': 'The last background task has failed.',
  'component_navigation.status.failed_X': 'The {type} has failed.',
  'component_navigation.status.failed.admin.link':
    'The last background task has failed. More details available on the {url} page.',
  'component_navigation.status.failed_X.admin.link':
    'The {type} has failed. More details available on the {url} page.',
  'component_navigation.status.failed.admin.help':
    'The last background task has failed. You can find more details below by clicking on the cog menu, and then "{stacktrace}".',
  'component_navigation.status.failed_X.admin.help':
    'The {type} has failed. You can find more details below by clicking on the cog menu, and then "{stacktrace}".',
  'component_navigation.status.failed_branch':
    'The last analysis on this project ({branch}) failed.',
  'component_navigation.status.failed_branch_X':
    'The last {type} on this project ({branch}) failed.',
  'component_navigation.status.failed_branch.admin.link':
    'The last analysis on this project ({branch}) failed. More details available on the {url} page.',
  'component_navigation.status.failed_branch_X.admin.link':
    'The last {type} on this project ({branch}) failed. More details available on the {url} page.',
  'component_navigation.status.failed_branch.admin.help':
    'The last analysis on this project ({branch}) failed. You can find more details below by clicking on the cog menu, and then "{stacktrace}".',
  'component_navigation.status.failed_branch_X.admin.help':
    'The last {type} on this project ({branch}) failed. You can find more details below by clicking on the cog menu, and then "{stacktrace}".',
  'component_navigation.status.last_blocked_due_to_bad_license_X':
    'Last analysis blocked due to an invalid license, which has since been corrected. Please reanalyze this {0}.',

  'component_navigation.pr_deco.error_detected_X':
    "We've detected an issue with your configuration. Your {productName} instance won't be able to perform any pull request decoration. {action}",
  'component_navigation.pr_deco.action.check_project_settings':
    'Please check your project settings.',
  'component_navigation.pr_deco.action.contact_project_admin':
    'Please contact your project administrator.',

  'background_tasks.page': 'Background tasks',
  'background_tasks.page.description':
    'This page allows monitoring of the queue of tasks running asynchronously on the server. It also gives access to the history of finished tasks and their status. Analysis report processing is the most common kind of background task. Learn more about <link>Background Tasks</link>.',

  'background_tasks.currents_filter.ONLY_CURRENTS': 'Only Latest Analysis',

  'background_tasks.date_filter': 'Date',

  'background_tasks.table.status': 'Status',
  'background_tasks.table.task': 'Task',
  'background_tasks.table.id': 'ID',
  'background_tasks.table.submitted': 'Submitted',
  'background_tasks.table.started': 'Started',
  'background_tasks.table.finished': 'Finished',
  'background_tasks.table.duration': 'Duration',
  'background_tasks.table.nodeName': 'Node',

  'background_tasks.filter_by_component_x': 'Filter by Component "{component}"',
  'background_tasks.cancel_task': 'Cancel Task',
  'background_tasks.cancel_task.text': 'Are you sure you want to cancel this pending task?',
  'background_tasks.cancel_all_tasks': 'Cancel All Pending Tasks',
  'background_tasks.cancel_all_tasks.text': 'Are you sure you want to cancel all pending tasks?',
  'background_tasks.cancel_all_tasks.submit': 'Cancel All',
  'background_tasks.scanner_context': 'Scanner Context',
  'background_tasks.show_scanner_context': 'Show Scanner Context',
  'background_tasks.show_actions_for_task_x_in_list': 'Show actions for task in row {0}',
  'background_tasks.show_stacktrace': 'Show Error Details',
  'background_tasks.show_warnings': 'Show Warnings',
  'background_tasks.error_message': 'Error Message',
  'background_tasks.error_stacktrace.title': 'Error Details: {project} [{type}]',
  'background_tasks.error_stacktrace': 'Error Details',
  'background_tasks.pending': 'pending',
  'background_tasks.pending_time': 'Age of oldest pending task: {time}',
  'background_tasks.pending_time.description':
    'How long the oldest pending background task has been waiting in the queue. This is not an estimate of the time needed to process the remaining tasks.',
  'background_tasks.failures': 'still failing',
  'background_tasks.date_and_time': '{date} - {time}',
  'background_tasks.submitted_by_x': 'By {submitter}',

  'background_tasks.number_of_workers': 'Number of Workers:',
  'background_tasks.number_of_workers.warning':
    'Configuring additional workers without first vertically scaling your server could have negative performance impacts.',
  'background_tasks.change_number_of_workers': 'Edit CE Workers',
  'background_tasks.change_number_of_workers.hint':
    'If your queue backs up behind the analysis reports from large projects, increasing the number of Compute Engine workers will allow you to take full advantage of having configured increased Compute Engine memory on a multi-core server (vertical scaling).',
  'background_tasks.add_more_workers': 'Speed up analysis with parallel processing',
  'background_tasks.add_more_workers.text':
    'Configure multiple workers for parallel processing of analysis reports in Enterprise Edition.',
  'background_tasks.search_by_task_or_component': 'Search by Task or Component',
  'background_tasks.failing_count':
    'Count of projects where processing of most recent analysis report failed.',
  'background_tasks.retry_failed_tasks':
    'Some projects data reload failed. Refer to the <link>documentation</link> for steps to retry.',

  //------------------------------------------------------------------------------
  //
  // Project Dump
  //
  //------------------------------------------------------------------------------
  'project_dump.page': 'Import / export',
  'project_dump.page.description1':
    'Moving a project from one {productName} instance to another is a 3 step operation:',
  'project_dump.page.description2':
    'Export the project, copy the generated dump on the target server, and finally import that dump from this page on the target {productName} instance.',
  'project_dump.page.description_without_import1':
    'Export project issues, measures and measure history for import into an Enterprise Edition or higher instance of the same version and similar configuration. The export file will be generated to the file system. It must then be copied to the target file system for import.',
  'project_dump.page.description_without_import2':
    'The export file will be generated to the file system. It must then be copied to the target file system for import.',
  'project_dump.see_details': 'See Details',
  'project_dump.export': 'Export',
  'project_dump.do_export': 'Export Project',
  'project_dump.can_not_export':
    'This project cannot be exported as no analysis has been run so far.',
  'project_dump.pending_export': 'Export was scheduled on {0}, waiting to be processed.',
  'project_dump.in_progress_export': 'Export is in progress, started {0}.',
  'project_dump.failed_export': 'The last export failed. Please try once again.',
  'project_dump.latest_export_available':
    'Latest project dump was generated on {0}. It can be found on the server, in the following directory:',
  'project_dump.export_available':
    'Project dump was generated. It can be found on the server, in the following directory:',
  'project_dump.export_form_description':
    'Export the project to the file system. The export file will need to be manually copied to the target filesystem.',
  'project_dump.import': 'Import',
  'project_dump.do_import': 'Import Project',
  'project_dump.import_success': 'The project has been successfully imported on {0}.',
  'project_dump.can_not_import':
    'This project can not be imported because it already contains some data.',
  'project_dump.no_file_to_import':
    'This project can not be imported because the dump file is not found.',
  'project_dump.pending_import': 'Import was scheduled on {0}, waiting to be processed.',
  'project_dump.in_progress_import': 'Import is in progress, started {0}.',
  'project_dump.failed_import': 'The last import has failed. Please try once again.',
  'project_dump.import_form_description':
    'A dump has been found on the file system for this project. You can import it by clicking on the button below.',
  'project_dump.import_form_description_disabled':
    'Projects cannot be imported. This feature is only available starting from Enterprise Edition.',

  //------------------------------------------------------------------------------
  //
  // NEW CODE DEFINITION
  //
  //------------------------------------------------------------------------------
  'new_code_definition.question': 'Instance default new code definition:',
  'new_code_definition.previous_version': 'Previous version',
  'new_code_definition.previous_version.usecase':
    'Recommended for <b>projects following regular versions or releases.</b>',
  'new_code_definition.previous_version.description':
    'Any code that has changed since the previous version is considered new code.',

  'new_code_definition.number_days': 'Number of days',
  'new_code_definition.number_days.specify_days': 'Specify a number of days',
  'new_code_definition.number_days.usecase':
    'Recommended for <b>projects following continuous delivery.</b>',
  'new_code_definition.number_days.description':
    'Any code that has changed in the last x days is considered new code. If no action is taken on a new issue after x days, this issue will become part of the overall code.',

  'new_code_definition.reference_branch.notice':
    'The main branch will be set as the reference branch when the project is created. You will be able to choose another branch as the reference branch when your project will have more branches.',

  'new_code_definition.auto_update.branch.message':
    'The new code definition of the following branch(es) was automatically changed on {date}, following a {productName} update, as it was exceeding the maximum value: {branchesList} {link}',
  'new_code_definition.auto_update.branch.list_item':
    '{branchName}: Number of days was changed from {previousDays} to {days}.',
  'new_code_definition.auto_update.global.message':
    'The global new code definition was automatically changed from {previousDays} to {days} days on {date}, following a {productName} update, as it was exceeding the maximum value. {link}',
  'new_code_definition.auto_update.ncd_page.message':
    'The number of days was automatically changed from {previousDays} to {days} on {date}, following a {productName} update, as it was exceeding the maximum value. {link}',
  'new_code_definition.auto_update.project.message':
    "This project's new code definition was automatically changed from {previousDays} to {days} days on {date}, following a {productName} update, as it was exceeding the maximum value. {link}",
  'new_code_definition.auto_update.review_link': 'Review new code definition',
  'new_code_definition.change_notice': 'Changes will take effect after the next analysis.',
  'new_code_definition.page.title': 'New Code',

  'new_code_definition.specific_setting.previous_version.label': 'Previous version',
  'new_code_definition.specific_setting.previous_version.description':
    'Any code that has changed since the previous version is considered new code. Recommended for <b>projects following regular versions or releases.</b>',
  'new_code_definition.specific_setting.number_of_days.label': 'Number of days',
  'new_code_definition.specific_setting.number_of_days.description':
    'Any code that has changed in the last x days is considered new code. If no action is taken on a new issue after x days, this issue will become part of the overall code. Recommended for <b>projects following continuous delivery.</b>',
  'new_code_definition.specific_setting.number_of_days.input.label': 'Define the number of days',
  'new_code_definition.specific_setting.number_of_days.input.error':
    'Please provide a whole number between {min} and {max}.',

  'new_code_definition.specific_setting.reference_branch.label': 'Reference branch',
  'new_code_definition.specific_setting.reference_branch.description':
    'Choose a reference branch as the baseline for the new code. Recommended for <b>projects using feature branches.</b>',
  'new_code_definition.specific_setting.reference_branch.input.label': 'Choose branch',
  'new_code_definition.specific_setting.reference_branch.input.help.main':
    'The branch you selected will need its own new code definition to prevent it from using itself as a reference',

  'new_code_definition.specific_setting.specific_analysis.label': 'Specific analysis',
  'new_code_definition.specific_setting.specific_analysis.description':
    'Choose an analysis as the baseline for the new code.',
  'new_code_definition.specific_setting.specific_analysis.warning.label':
    'This option has been deprecated but remains available through the Web API',
  'new_code_definition.specific_setting.specific_analysis.warning.description':
    'Choosing the "Specific analysis" option from the {productName} UI is not recommended by Sonar.',

  //------------------------------------------------------------------------------
  //
  // BRANCHES
  //
  //------------------------------------------------------------------------------
  'branches.main_branch': 'Main Branch',
  'branches.see_the_pr': 'See the PR',
  'branches.see_the_pr_on_x': 'See the PR on {dop}',

  //------------------------------------------------------------------------------
  //
  // BRANCH-LIKE NAVIGATION
  //
  //------------------------------------------------------------------------------
  'branch_like_navigation.manage': 'Manage branches and Pull Requests',
  'branch_like_navigation.search_for_branch_like': 'Search for branches or Pull Requests...',
  'branch_like_navigation.list': 'Branches and Pull Requests',
  'branch_like_navigation.pull_requests': 'Pull Requests',
  'branch_like_navigation.pull_requests_targeting': 'Pull Requests targeting "{branch}"',
  'branch_like_navigation.orphan_pull_requests': 'Orphan Pull Requests',
  'branch_like_navigation.orphan_pull_requests.tooltip':
    'When the base of a Pull Request is deleted, this Pull Request becomes orphan.',
  'branch_like_navigation.for_merge_into_x_from_y': 'for merge into {target} from {branch}',
  'branch_like_navigation.for_merge_into_x_from_y.title': 'for merge into {target} from {branch}',
  'branch_like_navigation.no_branch_support.title':
    'Get the most out of SonarQube Server with branch and PR/MR analysis',
  'branch_like_navigation.no_branch_support.title.pr':
    'Get the most out of SonarQube Server with branch and PR analysis',
  'branch_like_navigation.no_branch_support.title.mr':
    'Get the most out of SonarQube Server with branch and MR analysis',
  'branch_like_navigation.no_branch_support.content':
    'With Developer Edition you can analyze every pull/merge request. You can also watch the quality of your release branches by analyzing each one individually in SonarQube Server.',
  'branch_like_navigation.no_branch_support.content_x.pr':
    'With Developer Edition you can analyze every pull request and get the results in {alm}. You can also watch the quality of your release branches by analyzing each one individually in SonarQube Server.',
  'branch_like_navigation.no_branch_support.content_x.mr':
    'With Developer Edition you can analyze every merge request and get the results in {alm}. You can also watch the quality of your release branches by analyzing each one individually in SonarQube Server.',
  'branch_like_navigation.only_one_branch.title':
    'Learn how to analyze branches in SonarQube Server',
  'branch_like_navigation.only_one_branch.content':
    'Quickly set up branch analysis and get separate insights for each of your branches and Pull Requests.',
  'branch_like_navigation.only_one_branch.documentation': 'Branches documentation',
  'branch_like_navigation.only_one_branch.pr_analysis': 'Pull Request analysis',
  'branch_like_navigation.tutorial_for_ci': 'Show me how to set up my CI',

  'project_settings.category.jira_binding': 'Jira',
  'project_settings.jira_binding.header': 'Jira',
  'project_settings.jira_binding.bound': 'Connected',
  'project_settings.jira_binding.not_bound': 'Not connected',
  'project_settings.jira_binding.description.bound':
    '<p>You can now push SonarQube issues directly to Jira, display relevant release-related Jira information within SonarQube. For any errors, follow our <link>troubleshooting steps</link>.</p>',
  'project_settings.jira_binding.description.not_bound':
    '<p>Enable seamless issue management and workflow visibility.</p>  <p>Push SonarQube issues directly to Jira and display relevant release-related Jira information within SonarQube <link>by setting up your connection</link></p>',
  'project_settings.jira_binding.key': 'Project key:',
  'project_settings.jira_binding.remove_binding': "Remove jira connection for project: ''{name}''",
  'project_settings.jira_binding.disconnect': 'Disconnect',
  'project_settings.jira_binding.create_binding.title': 'Select a Jira project',
  'project_settings.jira_binding.create_binding.description':
    'By default, you will be able to push all possible issue types',
  'project_settings.jira_binding.edit_binding.title': 'Change Jira project binding?',
  'project_settings.jira_binding.edit_binding.description':
    "Issues previously pushed to ''{name}'' and earlier will be preserved, but all new issues will be pushed to your new Jira project.",
  'project_settings.jira_binding.organization_not_bound':
    'Cannot connect until you bind your instance to Jira in <link>Administration -> Integrations</link>',
  'project_settings.jira_binding.no_permissions':
    'To bind to a Jira project, your instance admin must grant binding permissions to project admins',
  'project_settings.jira_binding.bound.no_permissions':
    'To edit or delete this binding, your instance admin must grant binding permissions to project admins in the instance settings.',
  'project_settings.jira.binding.bind_success': "''{sqProject}'' has been connected to Jira",
  'project_settings.jira.binding.update_bind_success':
    "You have successfully changed your Jira connection to ''{name}''",
  'project_settings.jira.binding.unbind_success': "''{sqProject}'' has been disconnected from Jira",
  'project_settings.jira_binding.work_types.at_least_one_required':
    'At least one work type must be selected',
  'project_settings.jira_binding.work_types.mandatory_custom_fields':
    'Mandatory custom fields: {fields}',
  'project_settings.jira_binding.work_types.mandatory_fields_warning.title':
    'Some work item types can’t be pushed from SonarQube',
  'project_settings.jira_binding.work_types.mandatory_fields_warning.text':
    'SonarQube can’t create Jira work items with mandatory custom fields because it can’t automatically assign values to them. Remove the mandatory settings for those custom fields in Jira first.',
  'project_settings.jira.binding.work_types.save_failed':
    'Failed to save permitted Jira work types. Please try again later.',
  'project_settings.jira.binding.work_types.saved_successfully':
    'Permitted Jira work types were updated.',
  'project_settings.jira_binding.work_types.title':
    'Choose work types that can be pushed from SonarQube to Jira',
  'project_settings.jira_binding.unbind_confirm.title':
    'Do you want to disconnect this Jira project?',
  'project_settings.jira_binding.unbind_confirm.description':
    '{count} SonarQube {count, plural, one {issue} other {issues}} and corresponding Jira work items will no longer be synchronized. However, existing Jira work items will not be deleted.',
  'project_settings.jira_binding.unbind_confirm.alert':
    'Previous connections cannot be restored. Rebinding or creating a new project binding with Jira can lead to duplicate Jira work items.',

  //------------------------------------------------------------------------------
  //
  // PROJECT NAVIGATION
  //
  //------------------------------------------------------------------------------
  'project_navigation.analysis_status.failed': 'The last analysis has failed.',
  'project_navigation.analysis_status.warnings': 'The last analysis has warnings.',
  'project_navigation.analysis_status.pending': 'New analysis pending',
  'project_navigation.analysis_status.in_progress': 'New analysis in progress',
  'project_navigation.analysis_status.details_link': 'See details',
  'project_navigation.analysis_status.details_link.label': 'See details about the last analysis',
  'project_navigation.binding_status.view_on_x': 'View on {dop}',
  'project_navigation.binding_status.bound_to_x': 'Bound to {dop}',
  'project_navigation.binding_status.not_bound': 'Not bound',
  'project_navigation.binding_status.not_bound.tooltip':
    'To enable automatically configured PR decoration and privacy settings based on your DevOps platform, ask your admin to bind this project',
  'project_navigation.binding_status.bind': 'Bind project',
  'project_navigation.binding_status.bind.tooltip':
    'Enable automatically configured PR decoration and privacy settings based on your DevOps platform by binding your project',

  //------------------------------------------------------------------------------
  //
  // PROJECT BRANCH SELECTOR
  //
  //------------------------------------------------------------------------------

  'project_branch_selector.title': 'Branches and pull requests',
  'project_branch_selector.search': 'Search branches or pull requests',
  'project_branch_selector.none': 'No results',
  'project_branch_selector.link.all': 'View all',
  'project_branch_selector.link.branches': 'View all branches',
  'project_branch_selector.link.pull_requests': 'View all {pull_requests}',

  //------------------------------------------------------------------------------
  //
  // PROJECT "UPDATE KEY" PAGE
  //
  //------------------------------------------------------------------------------
  'update_key.old_key': 'Old Key',
  'update_key.new_key': 'New Key',
  'update_key.are_you_sure_to_change_key': 'Are you sure you want to change key of "{0}"?',
  'project_quality_profiles.page': 'Quality profiles',
  'project_quality_profiles.agentic_recommendation':
    'Use the recommended {agenticQpDocLink} quality profile for agent-related projects',
  'ai_generated_code_protected.title': 'Your AI-generated code is protected',
  'ai_generated_code_protected.description':
    'The quality gate used by this project is qualified for AI Code Assurance.',
  'ai_generated_code_not_protected.title':
    'Protect your AI-generated code with ‘AI Code Assurance’',
  'ai_generated_code_not_protected.description':
    'The quality gate used by this project is not qualified for AI Code Assurance.',

  //------------------------------------------------------------------------------
  //
  // PROJECT (RESOURCE) DELETION PAGE
  //
  //------------------------------------------------------------------------------

  'project_deletion.delete_resource_confirmation': 'Are you sure you want to delete "{name}"?',
  'project_deletion.resource_deleted': "Project ''{name}'' has been successfully deleted.",
  'projects_management.delete_selected_warning': "You're about to delete {0} selected items.",
  'projects_management.delete_all_warning': "You're about to delete all {0} items.",
  'projects_management.project_has_been_successfully_created':
    'Project {project} has been successfully created.',
  'projects_management.select_project': 'Select project {0}',
  'projects_management.show_actions_for_x': 'Show actions for project {0}',
  'projects_management.filter_by_component': 'Filter by component',
  'projects_management.filter_by_visibility': 'Filter by visibility',
  'application.info.title': 'Application information',
  'application.about.title': 'About this Application',
  'application.info.empty_description': 'No description added for this application.',
  'quality_profile.summary_additional': '{count} more {count, plural, one {rule} other {rules}}',
  'quality_profile.summary_fewer': '{count} {count, plural, one {rule} other {rules}}',
  'quality_profile.summary_differences1':
    'Compared to {comparedProfile} profile, {profile} includes {additional} and is missing {fewer}.',
  'quality_profile.summary_differences_additional_only':
    'Compared to {comparedProfile} profile, {profile} includes {additional}.',
  'quality_profile.summary_differences_fewer_only':
    'Compared to {comparedProfile} profile, {profile} is missing {fewer}.',
  'quality_profile.x_rules': '{count} rule(s)',
  'quality_profile.lang_deprecated_x_rules': '{name}, {count} deprecated rule(s)',
  'quality_profile.x_active_rules': '{0} active rules',
  'quality_profile.x_inactive_rules': '{0} inactive rules',
  'quality_profile.rules.breakdown': 'Rule breakdown',
  'quality_profile.rules.cct_categories_title': 'Code categories',
  'quality_profile.rules.software_qualities_title': 'Software qualities',
  'quality_profile.rules.see_x_active_x_rules': 'See {0} active {1} rules',
  'quality_profile.rules.see_x_inactive_x_rules': 'See {0} inactive {1} rules',
  'quality_profile.empty_comparison': 'The quality profiles are equal.',
  'toggle_tip.aria_label.sca_condition':
    'More information about Software Composition Analysis (SCA) related condition.',

  //------------------------------------------------------------------------------
  //
  // PROJECT PROVISIONING
  //
  //------------------------------------------------------------------------------
  'provisioning.no_analysis_on_main_branch': '"{0}" branch has not been analyzed yet.',
  'provisioning.no_analysis_on_main_branch.bad_configuration':
    '"{0}" branch has not been analyzed yet and you have multiple branches already. It looks like it is not your {1}, check your configuration.',
  'provisioning.only_provisioned': 'Only Provisioned',
  'provisioning.only_provisioned.tooltip':
    'Provisioned projects are projects that have been created, but have not been analyzed yet.',
  'provisioning.no_analysis.application':
    'No analysis has been performed since creation. Analyze a project to see information here.',
  'provisioning.permission_synch_in_progress':
    'Project permissions are being synchronized from {0}.',
};
