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

export const portfoliosMessages = {
  'portfolios.page': 'Portfolios',
  'portfolio_dashboards.nav': 'Dashboards',
  'portfolio_dashboards.page': 'All dashboards',
  'portfolio_dashboards.page.description':
    'List of all dashboards in this portfolio including built-in and custom dashboards. {br} Learn more about <link>viewing and managing portfolio dashboards</link>',
  'portfolio_dashboards.page.private_portfolio_message':
    'Anyone with access to this portfolio can view, create, and edit dashboards.',
  'portfolio_dashboards.page.public_portfolio_message':
    'Anyone can view. Only authenticated users can create and edit dashboards.',
  'portfolio_dashboards.health.page': 'Portfolio health dashboard',
  'portfolio_dashboards.all.page': 'All dashboards',
  'portfolio_dashboards.create_dashboard': 'Create custom dashboard',
  'portfolio_dashboards.search_placeholder': 'Search for dashboard...',
  'portfolio_dashboards.number_of_dashboards':
    '<b>{count}</b> {count, plural, one {dashboard} other {dashboards}}',
  'portfolio_dashboard.widget.releasability_rating_over_time': 'Releasability rating over time',
  'portfolio_dashboard.widget.line_chart.aria_label': 'Line chart showing {metric} over time',
  'portfolio_dashboard.widget.tooltip.count': 'Project count: {count}',
  'portfolio_dashboard.modal.permission_access.private_portfolio_description':
    'Visible and editable by anyone with browse access to this private portfolio.',
  'portfolio_dashboard.modal.permission_access.public_portfolio_description':
    'Anyone can view. Only authenticated users can create and edit dashboards.',

  // Portfolio dashboard list toasts
  'portfolio_dashboard.list.toast.create_success': 'Dashboard "{dashboardName}" has been created.',
  'portfolio_dashboard.list.toast.create_error': 'We could not create your dashboard. Try again.',
  'portfolio_dashboard.list.toast.edit_success': 'Dashboard "{dashboardName}" has been updated.',
  'portfolio_dashboard.list.toast.delete_success': 'Dashboard "{dashboardName}" has been deleted.',
  'portfolio_dashboard.list.toast.duplicate_success':
    'Dashboard "{dashboardName}" has been duplicated.',
  'portfolio_dashboard.list.toast.duplicate_error':
    'We could not duplicate your dashboard. Try again.',
  'portfolio_dashboard.list.error.description': 'We could not load dashboards. Try again later.',
  'portfolio_dashboard.list.title': 'All dashboards',
  'portfolio_dashboard.built_in.introduction.title': 'Introducing portfolio dashboards',
  'portfolio_dashboard.built_in.introduction.description':
    'Dive into metrics by exploring the Built-in dashboard or creating your own.',
  'portfolio_dashboard.breakdown.back_to_dashboard': 'Back to dashboard',
  'portfolio_dashboard.breakdown.data_refreshing': 'Refreshing data',
  'portfolio_dashboard.breakdown.empty_state.no_projects': 'No projects to display',
  'portfolio_dashboard.breakdown.empty_state.zero_issue_count.description':
    'Only projects with an issue count greater than zero are shown',
  'portfolio_dashboard.breakdown.empty_state.no_computed_rating.description':
    'Projects require a second analysis to generate a rating',
  'portfolio_dashboard.breakdown.empty_state.no_computed_rating.label': 'No rating computed',
  'portfolio_dashboard.breakdown.empty_state.no_data.title': 'No data available to display',
  'portfolio_dashboard.breakdown.empty_state.application.title':
    'Widget data aggregation is not currently supported for applications',
  'portfolio_dashboard.breakdown.empty_state.application.description':
    'Project level data is shown below if available',
  'portfolio_dashboard.breakdown.permissions.none_accessible_rule':
    'You do not have permissions to browse the {total} {total, plural, one {project that has} other {projects that have}} issues matching this rule.',
  'portfolio_dashboard.breakdown.permissions.none_accessible':
    'You do not have permissions to browse the {total} matching {total, plural, one {project} other {projects}}.',
  'portfolio_dashboard.breakdown.permissions.browse_matching':
    'Your permissions allow you to browse {visible} out of the {total} matching {total, plural, one {project} other {projects}}.',
  'portfolio_dashboard.breakdown.table.label': 'Breakdown by projects',
  'portfolio_dashboard.breakdown.table.search_placeholder': 'Search for project...',
  'portfolio_dashboard.breakdown.not_found.title': 'Breakdown not available',
  'portfolio_dashboard.breakdown.not_found.rule_required': 'Select a rule to see its breakdown.',
  'portfolio_dashboard.breakdown.not_found.unknown_rule':
    'The selected rule is not present in this widget.',
  'portfolio_dashboard.breakdown.not_found.unknown_segment':
    'The selected segment is not present in this widget.',
  'portfolio_dashboard.breakdown.not_found.unsupported_widget':
    'This widget does not support breakdown.',
  'portfolio_dashboard.breakdown.viewing_filter.description': 'Viewing:',
  'portfolio_dashboard.breakdown.slice_filter.description': 'Viewing slice:',
  'portfolio_dashboard.breakdown.slice_filter.all': 'All',
  'portfolio_dashboard.breakdown.slice_filter.dimension_with_value':
    '<dim>{dimension} |</dim> <b>{value}</b>',
  'portfolio_dashboard.breakdown.slice_filter.trigger_aria':
    'Change {dimension}, currently {value}',
  'portfolio_dashboard.breakdown.top_list.rule_details.subtitle': '{language} · Rule ID: {ruleKey}',
  'portfolio_dashboard.breakdown.top_list.rule_details.subtitle_no_language': 'Rule ID: {ruleKey}',
  'portfolio_dashboard.breakdown.top_list.rule_details.view_rule': 'View rule details',
  'portfolios.breakdown.list.project_name': 'Project name',
  'portfolio_dashboard.custom.error.description':
    'We could not load this dashboard. Try again later.',
  'portfolio_dashboard.custom.error.invalid_layout.description':
    "This dashboard's saved layout is invalid or corrupted and cannot be shown.",
  'portfolio_dashboard.custom.error.invalid_layout.title': 'Dashboard layout is invalid',
  'portfolio_dashboard.custom.error.title': 'Something went wrong',
  'portfolio_dashboard.custom.toast.save_success': 'Dashboard saved.',
  'portfolio_dashboard.custom.not_found.back_to_list': 'Back to all dashboards',
  'portfolio_dashboard.custom.not_found.description':
    'This dashboard may have been deleted or the link is incorrect.',
  'portfolio_dashboard.custom.not_found.title': 'Dashboard not found',
  'portfolio_dashboard.context_filter.label': 'Context',
  'portfolio_dashboard.context_filter.entire_portfolio': 'Entire portfolio',
  'portfolio_dashboard.context_filter.entire_portfolio_description': "Everything in ''{name}''",
  'portfolio_dashboard.context_filter.go_to_overview': "Go to ''{name}'' Overview",
  'portfolio_dashboard.context_filter.go_to_summary': "Go to ''{name}'' Summary",
  'portfolio_dashboard.context_filter.qualifier.APP': 'Application',
  'portfolio_dashboard.context_filter.qualifier.SVW': 'Sub portfolio',
  'portfolio_dashboard.context_filter.search_placeholder':
    'Search for sub-portfolios and applications...',
  'portfolio_dashboard.context_filter.section_header':
    'Drill down into a sub-portfolio or application',
  'portfolio_dashboard.context_filter.trigger_aria': '{context}: {value}',
  'portfolio_dashboard.context_filter.truncated_results':
    'Use search to find more sub-portfolios and applications.',
  'portfolio_dashboard.custom.toast.save_error': 'We could not save your dashboard. Try again.',

  //------------------------------------------------------------------------------
  //
  // PORTFOLIOS
  //
  //------------------------------------------------------------------------------
  'portfolio.app.empty': 'This application is empty.',
  'portfolio.app.no_lines_of_code': 'All projects in this application are empty',
  'portfolio.activity_link': 'See full history of analyses',
  'portfolio.details': 'Portfolio Details',
  'portfolio.details.breakdown': 'Breakdown by projects, applications, and nested portfolios',

  'portfolio.metric_domain.security': 'Security',
  'portfolio.metric_domain.security_review': 'Security Review',

  //------------------------------------------------------------------------------
  //
  // METRIC DOMAINS HELP TEXT
  //
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  //
  // Enterprise Server Extension
  //
  //------------------------------------------------------------------------------

  'views.all': 'All',
  'views.recompute': 'Recompute',
  'views.recompute_all': 'Recompute All',
  'views.create_new': 'Create Portfolio',
  'views.deleted_project': 'Deleted project',
  'views.delete.view': 'Delete Portfolio',
  'views.remove_x': 'Remove {qualifier}',
  'views.do_you_want_to_delete_x': 'Are you sure that you want to delete "{portfolio}"?',
  'views.do_you_want_to_remove_x': 'Are you sure that you want to remove "{portfolio}"?',
  'views.edit': 'Edit',
  'views.list': 'Portfolios',
  'views.mode.standard': 'Standard',
  'views.mode.local': 'Reference',
  'views.move': 'Move',
  'views.move.select.new.parent.view': 'Select destination',
  'views.move.subview': 'Move "{portfolio}" into',
  'views.application.branches': 'Select branches to compute',
  'views.new_portfolio': 'Add Portfolio',
  'views.new_application': 'Add Application',
  'views.new_child_to': 'Add Portfolio to "{portfolio}"',
  'views.new_application_to': 'Add Application to "{portfolio}"',
  'views.none': 'No portfolios',
  'views.open_dashbard': 'Open Dashboard',
  'views.referenced_x': 'Referenced {qualifier}',

  'views.structure.nav': 'Portfolio structure navigation menu',

  //
  // When updating the line below, please also update com.sonar.views.batch.ViewFilters.languageFilter(View)
  //
  'views.projects.selection_mode': 'Projects and branches selection mode',
  'views.projects.selection_mode.NONE': 'None',
  'views.projects.selection_mode.NONE.description':
    'No project branches are associated to this portfolio.',
  'views.projects.selection_mode.MANUAL': 'Manual',
  'views.projects.selection_mode.MANUAL.root': 'Manual',
  'views.projects.selection_mode.MANUAL.description':
    'This portfolio contains only manually selected project branches.',
  'views.projects.selection_mode.MANUAL.branches_selection': 'Edit selected branches',
  'views.projects.selection_mode.MANUAL.branches_selection.description':
    'Only branches excluded from purge are available for selection',
  'views.projects.selection_mode.REGEXP': 'By regular expression',
  'views.projects.selection_mode.REGEXP.root': 'By regular expression',
  'views.projects.selection_mode.REGEXP.description':
    'This portfolio contains the {branch} branch of every project matching {regexp}.',
  'views.projects.selection_mode.REST': 'All Remaining Projects',
  'views.projects.selection_mode.REST.root': 'All Projects',
  'views.projects.selection_mode.REST.description':
    'This portfolio contains the {branch} branch of every project that does not belong to any other sub-portfolio, referenced portfolio, or referenced application, within this hierarchy.',
  'views.projects.selection_mode.TAGS': 'By tags',
  'views.projects.selection_mode.TAGS.root': 'By tags',
  'views.projects.selection_mode.TAGS.description':
    'This portfolio contains the {branch} branch of every project marked by the following tags: {tags}.',
  'views.projects.selection_mode.main_branch': 'main',
  'views.already_selected_in': '"{0}" is already selected in "{1}"',
  'views.search': 'Search',
  'views.view': 'Portfolio',
  'views.key.description':
    'If specified, this value is used as the key instead of generating it from the name of the Portfolio.',
  'views.key.valid_characters':
    'Only letters, digits, dashes, dots, colons and underscores can be used, with at least one non-digit.',
  'views.project_already_selected_in_x': 'Already manually selected in "{0}"',
  'views.project_already_selected.help':
    'Ensure that each project/branch is included only once in the portfolio hierarchy. The portfolio computation will fail otherwise. Please note that projects may still be selected multiple times, if a dynamic selection mode is used (by tag or by regular expression).',
  'views.app_x_already_selected':
    'Application "{appName}" was already manually added to this hierarchy.',
  'views.app_already_selected.help':
    'Ensure that each application/branch is included only once in the portfolio hierarchy. The portfolio computation will fail otherwise.',

  'portfolio.edit_selection_mode': 'Edit selection mode',
  'portfolio.selection_mode': 'Project selection mode',
  'portfolio.regexp': 'Regexp',
  'portfolio.regexp.description':
    'A valid regular expression, eg. ".*Business" to match project names or keys that end with "Business".',
  'portfolio.tags': 'Tag selection',
  'portfolio.branch': 'Branch selection',
  'portfolio.branch.description':
    'The branch name that will be selected for every project if it exists. Leave empty to select the main branch.',

  'portfolio.refresh_failure.title': 'Portfolio recomputation failed',
  'portfolio.refresh_failure.generic_description': 'The latest portfolio recomputation failed.',
  'portfolio.refresh_failure.duplicate_details':
    'Duplicate project branches exist in the following portfolios:',
  'portfolio.refresh_failure.documentation': 'Learn how to avoid duplications in portfolios',
  'portfolio.refresh_failure.details': 'Details: {errorMessage}',
  'portfolio.refresh_failure.edit_definition':
    'Remove one of the duplicate project branches from the portfolio tree, then recompute the portfolio. {link}',
  'portfolio.refresh_failure.edit_definition.link': 'Edit portfolio definition',
  'portfolio.refresh_failure.fix':
    'Remove one of the duplicate project branches from the portfolio tree, then recompute the portfolio.',
  'portfolio.refresh_failure.generic_edit_definition':
    'Review the error details and recompute the portfolio. {link}',
  'portfolio.refresh_failure.generic_fix':
    'Review the error details, then recompute the portfolio.',

  'portfolios.search': 'Search for portfolios...',
  'portfolios.search_in_structure': 'Search in structure...',
  'portfolios.explore_portfolios': 'Explore Portfolios',
  'portfolios.search_all_portfolios': 'Search all Portfolios',
  'portfolios.exclude_sub_portfolios': 'Exclude sub-portfolios',
  'portfolios.create_portfolio': 'Create Portfolio',
  'portfolios.edit_portfolio': 'Edit Portfolio',

  'portfolios.empty.title.filtered.favorite':
    "We couldn't find any results matching selected criteria in your favorites.",
  'portfolios.empty.title.filtered.all': "We couldn't find any results matching selected criteria.",
  'portfolios.empty.title.unfiltered.favorite': "You don't have any favorite portfolios yet.",
  'portfolios.empty.title.unfiltered.all': 'There are no portfolios yet.',

  'portfolios.empty.description.filtered.favorite':
    'Would you like to search among all portfolios?',
  'portfolios.empty.description.filtered.all':
    'Try changing your search query to get some results.',
  'portfolios.empty.description.unfiltered.favorite':
    'To easily access portfolios your are interested in, mark them as favorite.',
  'portfolios.empty.description.unfiltered.all':
    'Portfolios offer an overview of the quality of all projects within each of them.',

  'portfolio_overview.title': 'Overview',
  'portfolio_overview.description':
    'A summary of information from the project branches that was chosen for this portfolio. To learn more about how portfolio ratings are calculated, see {link}.',
  'portfolio_overview.description.link': 'managing portfolios documentation',

  'portfolio_overview.breakdown': 'Portfolio Breakdown',
  'portfolio_overview.intro':
    'A detailed list of ratings for this portfolio and the projects, applications, and nested portfolios contained within it that you are allowed to browse. Switch between new code and overall code to see the ratings. Learn more about <link>portfolio breakdowns</link>.',

  'portfolio_overview.empty': 'This portfolio is empty.',
  'portfolio_overview.empty.no_edit_permission':
    "You don't have permission to edit this portfolio's definition.",
  'portfolio_overview.empty.description':
    'Add projects and applications to your portfolio definition to compute quality metrics.',
  'portfolio_overview.no_lines_of_code': 'All projects in this portfolio are empty',
  'portfolio_overview.not_computed': 'This portfolio is not yet computed.',
  'portfolio_overview.need_recompute':
    'Measures on new code have been added. Recompute the portfolio to see the new measures.',

  'portfolio_overview.risk.no_measure': 'Not yet computed',

  'portfolio_overview.projects_distribution': 'Projects distribution',
  'portfolio_overview.projects_x': '{0} Projects',
  'portfolio_overview.lines_of_code_x': '{count} Lines of code',
  'portfolio_overview.activity': 'Activity',
  'portfolio_overview.measures': 'Measures',
  'portfolio_overview.language_breakdown': 'Language Breakdown',
  'portfolio_overview.metric_trend': 'Metric trend',
  'portfolio_overview.metric_trend.table.caption':
    '{name} metric trend by month ({count, plural, one {# month} other {# months}})',
  'portfolio_overview.metric_trend.table.date': 'Date',
  'portfolio_overview.metric_trend.table.rating': 'Rating',
  'portfolio_overview.metric_trend.table.no_data': 'No trend data available',
  'portfolio_overview.risk': 'Risk',
  'portfolio_overview.overall_code': 'Overall Code',
  'portfolio_overview.new_code': 'New Code',
  'portfolio_overview.project_branches_x': '{0} selected project branches',
  'portfolio_overview.project_branches_all': 'All selected project branches',
  'portfolio_overview.project_branches_rating': '{link} in {rating}',
  'portfolio_overview.see_all': 'See All',
  'portfolio_overview.cannot_see_all.help':
    'You do not have access to all projects in this portfolio',

  'portfolio_overview.new_code_definition':
    'The metrics below show ratings on both New Code (code that has been added or changed according to your New Code definition) and Overall Code. Focusing on the new code ensures the code you write today is clean and safe. {link}.',
  'portfolio_overview.new_code_definition.link': 'Learn more about New vs Overall Code',

  'portfolio_overview.releasability.title': 'Releasability',
  'portfolio_overview.releasability.description':
    'Ratio of passing quality gates over failing ones. The quality gate of a project can have conditions both on New Code and Overall Code.',
  'portfolio_overview.releasability.rating.help':
    'This rating is based on the ratio of passing quality gates over failing ones. The quality gate of a project can have conditions both on New Code and Overall Code.',
  'portfolio_overview.releasability.portfolio_health': 'Portfolio health',
  'portfolio_overview.releasability.pagination': '{0} of {1}',
  'portfolio_overview.releasability.no_failing_projects':
    'None of the projects have a failing quality gate.',
  'portfolio_overview.releasability.project_inaccessible':
    'You do not have access to any of the failing project branches.',

  'portfolio_overview.reliability_rating.title': 'Reliability',
  'portfolio_overview.reliability_rating.description':
    'Average reliability rating. Issues in this domain mark code where you will get behavior other than what was expected.',

  'portfolio_overview.security_rating.title': 'Security',
  'portfolio_overview.security_rating.description':
    'Average security rating. Issues in this domain mark potential weaknesses to hackers.',

  'portfolio_overview.security_review_rating.title': 'Security Review',
  'portfolio_overview.security_review_rating.description':
    'Average security review rating. This domain represents potential security risks in the form of hotspots and their review status.',

  'portfolio_overview.sqale_rating.title': 'Maintainability',
  'portfolio_overview.sqale_rating.description':
    'Average maintainability rating. Issues in this domain mark code that will be more difficult to update competently than it should.',

  'portfolio_overview.sca_rating_any_issue.title': 'Dependency Risks',
  'portfolio_overview.sca_rating_any_issue.description':
    'Average dependency risk rating. Issues in this domain mark dependencies with known vulnerabilities, malicious code, or prohibited licenses.',
};
