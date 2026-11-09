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

export const measuresMessages = {
  'overview.page': 'Overview',
  'summary.page': 'Summary',
  'overview.dashboard.not_available.title': 'Overview dashboard is not available for pull requests',
  'overview.dashboard.not_available.description':
    "Overview dashboards are only available for long-lived branches. Switch to the target branch, {branch}, to view project health, or check the PR's analysis summary.",
  'overview.dashboard.not_available.switch_to_target_branch': 'Switch to target branch',
  'overview.dashboard.not_available.go_to_pr_analysis_summary': 'Go to PR analysis summary',

  //------------------------------------------------------------------------------
  //
  // DASHBOARD
  //
  //------------------------------------------------------------------------------

  'dashboard.project.not_found': 'The requested project could not be found',
  'dashboard.project.not_found.2':
    'Either it has never been analyzed successfully or it has been deleted.',
  'dashboard.portfolio.not_found': 'The requested portfolio could not be found',
  'dashboard.portfolio.not_found.2':
    'Either its parent has not been recomputed or it has been deleted.',

  // Dashboard shared (DashboardTable, DashboardKebabMenu, DashboardDetailsModal in feature-dashboards)
  'dashboard.dashboard_name': 'Dashboard name',
  'dashboard.list.table.aria_label': 'Dashboards table',
  'dashboard.list.table.column.last_edited': 'Last edited',
  'dashboard.list.table.column.creator': 'Creator',
  'dashboard.list.no_results': 'No dashboards found.',
  'dashboard.list.removed_user': 'Removed user',
  'dashboard.list.actions.aria_label': 'Dashboard actions for {dashboardName}',
  'dashboard.list.actions.duplicate': 'Duplicate',
  'dashboard.list.actions.delete': 'Delete dashboard',
  'dashboard.edit_dashboard': 'Edit dashboard',
  'dashboard.about_this_dashboard': 'About this dashboard',
  'dashboard.implicit_section': 'Overview',
  'dashboard.add_widget': 'Add widget',
  'dashboard.add_widget_modal.title': 'Add new widget',
  'dashboard.add_widget_modal.add_to_dashboard': 'Add to dashboard',
  'dashboard.edit_widget_modal.title': 'Edit widget',
  'dashboard.edit_widget_modal.save': 'Save changes',
  'dashboard.add_widget_modal.apply_filters': '2. Apply filters',
  'dashboard.add_widget_modal.apply_filters.warning':
    'Select a visualization and metric first to filter your data',
  'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.metric_overall_code_only':
    "''{metric}'' metric is only available for the overall code scope.",
  'dashboard.add_widget_modal.customize_visualization': '3. Customize visualization',
  'dashboard.add_widget_modal.customize_visualization.checkbox.show_breakdown.description':
    'Only appears if the quality gate fails. Displays the number of failed conditions in new and overall code separately.',
  'dashboard.add_widget_modal.customize_visualization.checkbox.show_breakdown.header':
    'Show failed conditions breakdown',
  'dashboard.add_widget_modal.customize_visualization.checkbox.show_legend': 'Show legend',
  'dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator':
    'Show trend indicator and sparkline',
  'dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator.help_text':
    'Displays change over the last 30 days.',
  'dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator.issue_count_unavailable':
    'Not available for issue count metrics on new code.',
  'dashboard.add_widget_modal.customize_visualization.rating_badge_info':
    'The badge automatically displays based on your metric. No further customization is needed.',
  'dashboard.add_widget_modal.customize_visualization.top_list_info':
    'No customization options are available for the top list visualization.',
  'dashboard.add_widget_modal.customize_visualization.warning':
    'Select a visualization and metric first to enable customization options.',
  'dashboard.add_widget_modal.define_widget.metric.issue_count': 'Issue count',
  'dashboard.widget.count.issue_density.unit': 'issues / 1K LOC',
  'dashboard.add_widget_modal.define_widget.metric.line_count': 'Line count',
  'dashboard.add_widget_modal.define_widget.metric.project_count': 'Project count',
  'dashboard.add_widget_modal.define_widget.metric.security_hotspot_count':
    'Security hotspot count',
  'dashboard.widget.header.title.issues_closed_tooltip':
    'Total issues closed in the last 30 days.<br></br><br></br>Issues are considered closed when they no longer appear in subsequent analysis. <br></br><br></br>This metric <b>excludes</b> open, accepted, and false positive issues.<br></br><br></br><link>Learn more about metrics</link>',
  'dashboard.widget.header.tooltip.mttr.title': 'Mean time to resolve (MTTR) issues',
  'dashboard.widget.header.tooltip.recent_mttr.title':
    'Mean time to resolve (MTTR) newly introduced issues',
  'dashboard.widget.header.tooltip.sca_mttr.title': 'Mean time to resolve (MTTR) dependency risks',
  'dashboard.widget.header.title.mttr_tooltip':
    'Average time to resolve issues in the last 30 days.<br></br><br></br>Includes issues that are closed (no longer appear in a subsequent analysis) in the last 30 days.<br></br><br></br>This metric <b>excludes</b> open, accepted, and false positive issues.<br></br><br></br><link>Learn more about metrics</link>',
  'dashboard.widget.header.title.recent_mttr_tooltip':
    'Average time to resolve issues that were introduced and detected in the last 30 days, and closed during that same period.<br></br><br></br>An issue is considered closed when it no longer appears in subsequent analysis.<br></br><br></br>This metric <b>excludes</b> open, accepted, and false positive issues.<br></br><br></br><link>Learn more about metrics</link>',
  'dashboard.widget.header.title.sca_mttr_tooltip':
    'Average time to resolve dependency risks in the last 30 days.<br></br><br></br>Includes dependency risks that are closed (no longer appear in a subsequent analysis) and those that are marked safe within the last 30 days.<br></br><br></br>This metric <b>excludes</b> confirmed and false positive dependency risks.<br></br><br></br><link>Learn more about metrics</link>',
  'dashboard.widget.header.title.issue_density_tooltip':
    'The number of issues relative to lines of code, normalized as issues per 1K LOC.<br></br><br></br>Issue density helps you compare projects more fairly, regardless of size.<br></br><br></br><link>Learn more about metrics</link>',
  'dashboard.add_widget_modal.define_widget.visualization': 'Visualization',
  'dashboard.add_widget_modal.define_widget.visualization.select': 'Select visualization',
  'dashboard.add_widget_modal.define_widget.visualization.group.single_value': 'Single value',
  'dashboard.add_widget_modal.define_widget.visualization.group.charts': 'Charts',
  'dashboard.add_widget_modal.define_widget.visualization.donut_chart': 'Donut chart',
  'dashboard.add_widget_modal.define_widget.visualization.line_chart': 'Line chart',
  'dashboard.add_widget_modal.define_widget.visualization.pie_chart': 'Pie chart',
  'dashboard.add_widget_modal.define_widget.visualization.top_list': 'Top list',
  'dashboard.add_widget_modal.define_widget.top_list.limit': 'Number of rows',
  'dashboard.add_widget_modal.define_widget.top_list.limit.five': 'Top 5',
  'dashboard.add_widget_modal.define_widget.top_list.limit.ten': 'Top 10',
  'dashboard.add_widget_modal.define_widget.top_list.limit.fifteen': 'Top 15',
  'dashboard.add_widget_modal.define_widget.top_list.rank_by': 'Rank by',
  'dashboard.top_list.aria_label': 'Top {limit} ranked list',
  'dashboard.top_list.count_link.aria_label': '{label}: {count}',
  'dashboard.top_list.column.rank_by.rule': 'Rule',
  'dashboard.top_list.column.metric.issue_count': 'Issues',
  'dashboard.top_list.column.trend': 'Trend',
  'dashboard.top_list.column.trend.aria_label': 'More information about issue count trends',
  'dashboard.top_list.column.trend.tooltip':
    'Compares the current issue count with the count from 30 days ago.',
  'dashboard.top_list.title.rank_by.rule': 'rules',
  'dashboard.top_list.title.metric.issue_count': 'issues',
  'dashboard.top_list.widget_title': 'Top {limit} {rankBy} by {metric}',
  'dashboard.widget.title.over_time': '{title} over time',
  'dashboard.add_widget_modal.define_widget.visualization.count': 'Count',
  'dashboard.add_widget_modal.define_widget.visualization.rating_badge': 'Badge',
  'dashboard.add_widget_modal.define_widget.metric': 'Metric',
  'dashboard.add_widget_modal.define_widget.metric.select': 'Select metric',
  'dashboard.add_widget_modal.define_widget.slice_by': 'Slice by',
  'dashboard.add_widget_modal.define_widget.slice_by.select': 'Select a slice',
  'dashboard.add_widget_modal.define_widget.group_by': 'Group by',
  'dashboard.line_chart.group_by.label': 'Group by',
  'dashboard.line_chart.group_by.none': 'None',
  'dashboard.line_chart.group_by.severity': 'Severity',
  'dashboard.line_chart.group_by.software_quality': 'Software Quality',
  'dashboard.line_chart.group_by.status': 'Status',
  'dashboard.line_chart.group_by.rule': 'Rule',
  'dashboard.add_widget_modal.define_widget.slice.by_software_quality': 'By Software Quality',
  'dashboard.add_widget_modal.define_widget.slice.by_type': 'By Type',
  'dashboard.add_widget_modal.define_widget.slice.by_severity': 'By Severity',
  'dashboard.add_widget_modal.define_widget.slice.by_code_attribute': 'By Code Attribute',
  'dashboard.add_widget_modal.define_widget.slice.by_status': 'By Status',
  'dashboard.add_widget_modal.define_widget.slice.by_quality_gate_status': 'By quality gate status',
  'dashboard.add_widget_modal.define_widget.slice_by.pie_requires_category':
    'Pie charts require a category to divide data into slices.',
  'dashboard.add_widget_modal.define_widget.slice.by_language': 'By Language',
  'dashboard.add_widget_modal.define_widget.slice.by_rule': 'By Rule',
  'dashboard.add_widget_modal.define_widget.slice.by_review_priority': 'By Review Priority',
  'dashboard.add_widget_modal.define_widget.slice.by_review_status': 'By Review Status',
  'dashboard.add_widget_modal.define_widget.slice.by_security_category': 'By Security Category',
  'dashboard.add_widget_modal.define_widget.slice.by_coverage': 'By Coverage',
  'dashboard.add_widget_modal.define_widget.slice.by_duplications': 'By Duplications',
  'dashboard.add_widget_modal.define_widget.facet_type.select': 'Select facet type',
  'dashboard.add_widget_modal.define_widget': '1. Define your widget',
  'dashboard.add_widget_modal.define_widget.description':
    'Start by choosing a visualization, then decide which metrics to show. Learn more about <link>metric definitions.</link>',
  'dashboard.add_widget_modal.apply_filters.pie_software_quality_slice_help':
    'Software quality filters are not available when the chart is sliced by software quality.',
  'dashboard.add_widget_modal.apply_filters.pie_type_slice_help':
    'Type filters are not available when the chart is sliced by type.',
  'dashboard.add_widget_modal.apply_filters.pie_hotspot_count_filter_help':
    'Filters are not available for security hotspot charts.',
  'dashboard.add_widget_modal.apply_filters.pie_hotspot_review_status_slice_filter_help':
    'Status filter is not available when the chart is already grouped by review status.',
  'dashboard.add_widget_modal.apply_filters.pie_filter.all_issues': 'All issues',
  'dashboard.add_widget_modal.apply_filters.pie_filter.security_issues': 'Security issues',
  'dashboard.add_widget_modal.apply_filters.pie_filter.reliability_issues': 'Reliability issues',
  'dashboard.add_widget_modal.apply_filters.pie_filter.maintainability_issues':
    'Maintainability issues',
  'dashboard.add_widget_modal.apply_filters.pie_filter.all_hotspots': 'All hotspots',
  'dashboard.add_widget_modal.apply_filters.pie_filter.hotspots_to_review': 'To review',
  'dashboard.add_widget_modal.apply_filters.pie_filter.hotspots_fixed': 'Fixed',
  'dashboard.add_widget_modal.apply_filters.pie_filter.hotspots_safe': 'Safe',
  'dashboard.add_widget_modal.apply_filters.pie_filter.no_filter': 'No filter',
  'dashboard.add_widget_modal.apply_filters_section.pie_filter.label': 'Filter',
  'dashboard.pie_chart.header.title.portfolio_projects_by_quality_gate':
    'Projects by quality gate status',
  'dashboard.pie_chart.header.join_by': 'by',
  'dashboard.pie_chart.header.metric.issue_count': 'Issues',
  'dashboard.pie_chart.header.metric.hotspot_count': 'Security Hotspots',
  'dashboard.pie_chart.header.metric.line_count': 'Lines',
  'dashboard.pie_chart.header.metric.project_count': 'Projects',
  'dashboard.pie_chart.header.metric.quality_gate': 'Quality gate',
  'dashboard.pie_chart.header.slice.impact_software_qualities': 'Software Quality',
  'dashboard.pie_chart.header.slice.impact_severities': 'Severity',
  'dashboard.pie_chart.header.slice.clean_code_attribute_categories': 'Code Attribute',
  'dashboard.pie_chart.header.slice.issue_statuses': 'Status',
  'dashboard.pie_chart.header.slice.languages': 'Language',
  'dashboard.pie_chart.header.slice.rules': 'Rule',
  'dashboard.pie_chart.header.slice.review_priority': 'Priority',
  'dashboard.pie_chart.header.slice.review_status': 'Review status',
  'dashboard.pie_chart.header.slice.security_category': 'Security Category',
  'dashboard.pie_chart.header.slice.language': 'Language',
  'dashboard.pie_chart.header.slice.coverage': 'Coverage',
  'dashboard.pie_chart.header.slice.duplications': 'Duplications',
  'dashboard.pie_chart.header.slice.project_status': 'Quality gate status',
  'dashboard.sparkline.aria.trend_down':
    'Downward trend of {percent} from the first to the last value.',
  'dashboard.add_widget_modal.apply_filters_section.select.scope.label': 'Scope',
  'dashboard.add_widget_modal.apply_filters_section.select.scope.option.overall_code':
    'Overall code',
  'dashboard.add_widget_modal.apply_filters_section.select.scope.option.new_code': 'New code',
  'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.line_count':
    'Line count is only available for overall code scope',
  'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.issue_count_history':
    'Scope filtering is not available for issue count metrics.',
  'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.line_chart_metric_overall_code_only':
    "Line charts and the ''{metric}'' metric are only available for overall code scope.",
  'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.new_code_unavailable':
    'New code scope is not available for this metric.',
  'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.quality_gate_status':
    'Quality gate status is not filterable by scope.',
  'dashboard.add_widget_modal.apply_filters_section.select.time_range.label': 'Time range',
  'dashboard.add_widget_modal.apply_filters_section.select.time_range.option.last_12_months':
    'Last 12 months',
  'dashboard.add_widget_modal.apply_filters_section.select.time_range.option.last_6_months':
    'Last 6 months',
  'dashboard.add_widget_modal.apply_filters_section.select.time_range.option.last_3_months':
    'Last 3 months',
  'dashboard.add_widget_modal.apply_filters_section.select.time_range.option.last_month':
    'Last month',
  'dashboard.add_widget_modal.apply_filters_section.checkbox.show_legend': 'Show legend',
  'dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator.overall_code_only':
    '(Overall code only)',
  'dashboard.add_widget_modal.apply_filters_section.select.severity.label': 'Severity',
  'dashboard.add_widget_modal.apply_filters_section.select.severity.legacy_range_notice':
    'The {severity} setting is no longer available. Select a new severity.',
  'dashboard.add_widget_modal.apply_filters_section.select.severity.placeholder':
    'Select severities',
  'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label':
    'Software quality',
  'dashboard.add_widget_modal.apply_filters_section.select.software_quality.placeholder':
    'Select software quality',
  'dashboard.add_widget_modal.apply_filters_section.software_quality.all': 'All',
  'dashboard.add_widget_modal.apply_filters_section.select.status.label': 'Status',
  'dashboard.add_widget_modal.apply_filters_section.select.status.placeholder': 'Select statuses',
  'dashboard.widget.error.description': 'Something went wrong while fetching results',
  'dashboard.widget.trend_indicator.badge.absolute': '{change}',
  'dashboard.widget.trend_indicator.badge.relative': '{change}',
  'dashboard.line_chart.limited_history_warning': 'Data available from {date} onwards.',
  'dashboard.line_chart.single_data': 'Only one data point available to display',
  'dashboard.line_chart.single_data_series':
    'Some series have only one data point available to display',
  'dashboard.chart.legend.more': '+{count} more',
  'dashboard.chart.other_n': 'Other ({count})',
  'dashboard.drag_to_reorder': 'Drag to reorder',
  'dashboard.edit_widget': 'Edit widget',
  'dashboard.edit_section_title': 'Edit section',
  'dashboard.delete_section_title': 'Delete Section',
  'dashboard.delete_section_confirm':
    'Are you sure you want to delete this section? This will permanently remove the section and all its widgets.',
  'dashboard.modal.permission_access.title': 'Permissions and access',
  'dashboard.view_all_dashboards': 'View all dashboards',
  'dashboard.download_schema': 'Save dashboard schema',
  'dashboard.download_pdf': 'Download dashboard as PDF',
  'dashboard.add_widget_modal.define_widget.metric.issue_density': 'Issue density',
  'dashboard.add_widget_modal.define_widget.metric.mttr': 'MTTR for issues',
  'dashboard.widget.title.mttr_with_software_quality': 'MTTR for {softwareQuality} issues',
  'dashboard.add_widget_modal.define_widget.metric.recent_mttr': 'MTTR for newly introduced issues',
  'dashboard.widget.title.recent_mttr_with_software_quality':
    'MTTR for newly introduced {softwareQuality} issues',
  'dashboard.add_widget_modal.define_widget.metric.resolved_issues': 'Issues closed',
  'dashboard.add_widget_modal.define_widget.metric.sca_mttr': 'MTTR for dependency risks',
  'dashboard.add_widget_modal.preview.placeholder':
    'Select a visualization and metric to see a preview',
  'dashboard.collapse': 'Collapse',
  'dashboard.delete_section': 'Delete section',
  'dashboard.delete_widget': 'Delete widget',
  'dashboard.drag_section_to_reorder': 'Drag section to reorder',
  'dashboard.edit_section': 'Edit section',
  'dashboard.expand': 'Expand',
  'dashboard.section_actions': 'Section actions',
  'dashboard.section_name': 'Section name',
  'dashboard.section_name_placeholder': 'Give this section a name',
  'dashboard.section_description': 'Description',
  'dashboard.section_description_placeholder': 'Include an optional description for this section',
  'dashboard.section_creation_help':
    'Use sections to organize widgets into groups. You can add widgets and customize the layout after creating the section.',
  'dashboard.sparkline.aria.flat': 'Trend is flat; the first and last values are the same.',
  'dashboard.sparkline.aria.increase_from_zero': 'Trend increased from zero to {value}.',
  'dashboard.sparkline.aria.no_historical_data': 'No historical data to show the trend.',
  'dashboard.sparkline.aria.trend_up':
    'Upward trend of {percent} from the first to the last value.',
  'dashboard.widget.error': "We couldn't load this data",
  'dashboard.widget.loading_visualization': 'Loading visualization',
  'dashboard.widget.no_data': 'No data to display yet',
  'dashboard.widget.trend_indicator.badge.no_change': 'No change',
  'dashboard.widget.trend_indicator.badge.unavailable': 'Trend unavailable',
  'dashboard.widget.trend_indicator.description.snapshot':
    'Compares the current value with the value from 30 days ago.',
  'dashboard.widget.trend_indicator.description.rolling_average':
    'Compares the current 30-day average with the latest available 30-day average on or before 30 days ago.',
  'dashboard.widget.trend_indicator.description.resolved_issues':
    'Compares issues closed during the latest 30 days with the previous 30 days.',
  'dashboard.widget.trend_indicator.description.resolved_issues.current_period_incomplete':
    'Compares issues closed during the latest 30 days with the previous 30 days. A trend requires 60 days of history. The current value includes data since {date}.',
  'dashboard.widget.trend_indicator.description.resolved_issues.insufficient_history':
    'Compares issues closed during the latest 30 days with the previous 30 days. A trend requires 60 days of history. Data available from {date}.',
  'dashboard.widget.trend_indicator.description.rolling_average.insufficient_history':
    'Compares the latest 30-day average with the previous 30-day average. A trend requires 60 days of history. Data available from {date}.',
  'dashboard.widget.trend_indicator.view_activity': 'View activity',
  'dashboard.widget.trend_indicator.no_historical_data':
    'No historical data available for this metric',
  'dashboard.widget.trend_indicator.insufficient_history':
    'Not enough historical data to calculate a trend. Data available from {date}.',
  'dashboard.widget.trend_indicator.insufficient_history_no_date':
    'Not enough historical data to calculate a trend.',
  'dashboard.widget.trend_indicator.insufficient_history_60_days':
    'Trend requires at least 60 days of history to compare the latest 30 days with the previous 30 days. Data available from {date}.',
  'dashboard.widget.trend_indicator.vs_last_30_days': 'vs last 30 days',
  'dashboard.widget_actions': 'Widget actions',
  'dashboard.empty.title': 'Your dashboard is currently empty',
  'dashboard.empty.title_non_member': 'This dashboard is currently empty',
  'dashboard.empty.description': 'Enter edit mode to add widgets and start building your view.',
  'dashboard.empty.learn_more': 'Learn more about customizing dashboards',
  'dashboard.empty.description_non_member':
    'The owner has not yet added any content to this dashboard.',
  'dashboard.empty.learn_more_non_member': 'Learn more about custom dashboards',
  'dashboard.modal.delete_dashboard.title': 'Delete dashboard',
  'dashboard.modal.delete_dashboard.description':
    'Are you sure you want to delete the dashboard, "{dashboardName}"? This action is irreversible.',
  'dashboard.create_custom_dashboard': 'Create custom dashboard',
  'dashboard.edit_dashboard_title': 'Edit name and description',
  'dashboard.type.built_in': 'Built-in',
  'dashboard.type.custom': 'Custom',
  'dashboard.schema_version.error.description':
    'This dashboard was created with a newer version and cannot be displayed. Refresh the page to load the latest version.',
  'dashboard.schema_version.error.title': 'Dashboard unavailable',
  'overview.project_key.tooltip.TRK':
    'Your project key is a unique identifier for your project. If you are using Maven, make sure the key matches the "groupId:artifactId" format.',
  'overview.project_key.tooltip.APP':
    'Your application key is a unique identifier for your application.',

  //--------------------------------------------------------------------------------------------------------------------
  //
  // METRIC TYPES
  //
  //--------------------------------------------------------------------------------------------------------------------

  'metric.type.INT': 'Integer',
  'metric.type.FLOAT': 'Float',
  'metric.type.PERCENT': 'Percent',
  'metric.type.BOOL': 'Boolean',
  'metric.type.STRING': 'String',
  'metric.type.MILLISEC': 'Milliseconds',
  'metric.type.DATA': 'Data',
  'metric.type.LEVEL': 'Level',
  'metric.type.DISTRIB': 'Distribution',
  'metric.type.RATING': 'Rating',
  'metric.type.SCA_RISK': 'Dependency Risk Severity',
  'metric.type.WORK_DUR': 'Work Duration',

  'metric.level.ERROR': 'Failed',
  'metric.level.WARN': 'Warning',
  'metric.level.OK': 'Passed',
  'metric.level.NONE': 'None',

  //------------------------------------------------------------------------------
  //
  // METRICS
  //
  //------------------------------------------------------------------------------

  'metric.abstractness.description': 'Abstractness',
  'metric.abstractness.name': 'Abstractness',
  'metric.accessors.description': 'Accessors',
  'metric.accessors.name': 'Accessors',
  'metric.alert_status.description': 'The project status with regard to its quality gate.',
  'metric.alert_status.name': 'Quality gate status',
  'metric.authors_by_line.description': 'Authors by line',
  'metric.authors_by_line.name': 'Authors by Line',
  'metric.blocker_violations.description': 'Blocker issues',
  'metric.blocker_violations.name': 'Blocker Issues',
  'metric.branch_coverage.description': 'Condition coverage',
  'metric.branch_coverage.name': 'Condition coverage',
  'metric.bugs.description': 'Bugs',
  'metric.bugs.name': 'Bugs',
  'metric.bugs.short_name': 'Bugs',
  'metric.ca.name': 'Afferent Couplings',
  'metric.ce.name': 'Efferent Couplings',
  'metric.classes.description': 'Classes',
  'metric.classes.name': 'Classes',
  'metric.code_smells.description': 'Code Smells',
  'metric.code_smells.name': 'Code smells',
  'metric.code_smells.short_name': 'Code smells',
  'metric.new_bugs_severity.name': 'Bugs severity',
  'metric.new_bugs_severity.short_name': 'Bugs severity',
  'metric.new_code_smells_severity.name': 'Code smells severity',
  'metric.new_code_smells_severity.short_name': 'Code smells severity',
  'metric.new_vulnerabilities_severity.name': 'Vulnerabilities severity',
  'metric.new_vulnerabilities_severity.short_name': 'Vulnerabilities severity',
  'metric.new_reliability_issue_severity.name': 'Reliability severity',
  'metric.new_reliability_issue_severity.short_name': 'Reliability severity',
  'metric.new_security_issue_severity.name': 'Security severity',
  'metric.new_security_issue_severity.short_name': 'Security severity',
  'metric.new_maintainability_issue_severity.name': 'Maintainability severity',
  'metric.new_maintainability_issue_severity.short_name': 'Maintainability severity',
  'metric.cognitive_complexity.description': 'Cognitive complexity',
  'metric.cognitive_complexity.name': 'Cognitive Complexity',
  'metric.commented_out_code_lines.description': 'Commented lines of code',
  'metric.commented_out_code_lines.name': 'Commented-Out LOC',
  'metric.comment_blank_lines.description': 'Comments that do not contain comments',
  'metric.comment_blank_lines.name': 'Blank Comments',
  'metric.comment_lines.description': 'Number of comment lines',
  'metric.comment_lines.name': 'Comment Lines',
  'metric.comment_lines_density.description': 'Comments balanced by ncloc + comment lines',
  'metric.comment_lines_density.name': 'Comments (%)',
  'metric.comment_lines_density.short_name': 'Comments',
  'metric.complexity.description': 'Cyclomatic complexity',
  'metric.complexity.name': 'Cyclomatic complexity',
  'metric.conditions_by_line.description': 'Conditions by line',
  'metric.conditions_by_line.name': 'Conditions by Line',
  'metric.conditions_to_cover.description': 'Conditions to cover',
  'metric.conditions_to_cover.name': 'Conditions to cover',
  'metric.confirmed_issues.description': 'Confirmed issues',
  'metric.confirmed_issues.name': 'Confirmed issues',
  'metric.coverage.description': 'Coverage by tests',
  'metric.coverage.description.positive': 'Overall code has sufficient test coverage',
  'metric.coverage.name': 'Coverage',
  'metric.coverage_line_hits_data.description': 'Coverage hits by line',
  'metric.coverage_line_hits_data.name': 'Coverage Hits by Line',
  'metric.covered_conditions.description': 'Covered conditions',
  'metric.covered_conditions.name': 'Covered Conditions',
  'metric.covered_conditions_by_line.description': 'Covered conditions by line',
  'metric.covered_conditions_by_line.name': 'Covered Conditions by Line',
  'metric.covered_lines.description': 'Covered lines',
  'metric.covered_lines.name': 'Covered Lines',
  'metric.critical_violations.description': 'Critical issues',
  'metric.critical_violations.name': 'Critical Issues',
  'metric.development_cost.description': 'Development cost',
  'metric.development_cost.name': 'Development Cost',
  'metric.directories.description': 'Directories',
  'metric.directories.name': 'Directories',
  'metric.distance.description': 'Distance',
  'metric.distance.name': 'Distance',
  'metric.dit.description': 'Depth in Inheritance Tree',
  'metric.dit.name': 'Depth in Tree',
  'metric.dsm.description': 'Dependency Matrix',
  'metric.dsm.name': 'Dependency Matrix',
  'metric.duplicated_blocks.description': 'Duplicated blocks',
  'metric.duplicated_blocks.name': 'Duplicated blocks',
  'metric.duplicated_files.description': 'Duplicated files',
  'metric.duplicated_files.name': 'Duplicated files',
  'metric.duplicated_lines.description': 'Duplicated lines',
  'metric.duplicated_lines.name': 'Duplicated lines',
  'metric.duplicated_lines_density.description': 'Duplicated lines balanced by statements',
  'metric.duplicated_lines_density.name': 'Duplicated Lines (%)',
  'metric.duplicated_lines_density.short_name': 'Duplications',
  'metric.duplicated_lines_density.extra_short_name': 'Density',
  'metric.duplications_data.description': 'Duplications details',
  'metric.duplications_data.name': 'Duplication Details',
  'metric.efficiency.description': 'Efficiency',
  'metric.efficiency.name': 'Efficiency',
  'metric.effort_to_reach_maintainability_rating_a.description':
    'Effort to reach maintainability rating A',
  'metric.effort_to_reach_maintainability_rating_a.name':
    'Effort to Reach Maintainability Rating A',
  'metric.effort_to_reach_maintainability_rating_a.extra_short_name': 'Effort to reach A',
  'metric.effort_to_reach_software_quality_maintainability_rating_a.description':
    'Effort to reach maintainability rating A',
  'metric.effort_to_reach_software_quality_maintainability_rating_a.name':
    'Effort to Reach Maintainability Rating A',
  'metric.effort_to_reach_software_quality_maintainability_rating_a.extra_short_name':
    'Effort to reach A',
  'metric.false_positive_issues.description': 'False positive issues',
  'metric.false_positive_issues.name': 'False positive issues',
  'metric.files.description': 'Number of files',
  'metric.files.name': 'Files',
  'metric.file_cycles.description': 'File cycles',
  'metric.file_cycles.name': 'File Cycles',
  'metric.file_edges_weight.description': 'File edges weight',
  'metric.file_edges_weight.name': 'File Edges Weight',
  'metric.file_feedback_edges.description': 'Suspect file dependencies',
  'metric.file_feedback_edges.name': 'Suspect File Dependencies',
  'metric.file_tangles.description': 'Files tangles',
  'metric.file_tangles.name': 'File Tangles',
  'metric.file_tangle_index.description': 'File tangle index',
  'metric.file_tangle_index.name': 'File Tangle Index',
  'metric.functions.description': 'Functions',
  'metric.functions.name': 'Functions',
  'metric.generated_lines.description': 'Number of generated lines',
  'metric.generated_lines.name.suffix': 'generated lines',
  'metric.generated_lines.name': 'Generated Lines',
  'metric.generated_ncloc.description': 'Generated non Commenting Lines of Code',
  'metric.generated_ncloc.name.suffix': 'generated lines of code',
  'metric.generated_ncloc.name': 'Generated Lines of Code',
  'metric.has_rating_X': 'Has rating: {0}',
  'metric.no_rating': 'Has no rating',
  'metric.info_violations.description': 'Info issues',
  'metric.info_violations.name': 'Info Issues',
  'metric.instability.description': 'Instability',
  'metric.instability.name': 'Instability',
  'metric.it_branch_coverage.description': 'Condition coverage by integration tests',
  'metric.it_branch_coverage.name': 'IT Condition Coverage',
  'metric.it_conditions_by_line.description': 'IT conditions by line',
  'metric.it_conditions_by_line.name': 'IT Conditions by Line',
  'metric.it_conditions_to_cover.description': 'Conditions to cover by integration tests',
  'metric.it_conditions_to_cover.name': 'IT Conditions to Cover',
  'metric.it_coverage.description': 'Integration tests coverage',
  'metric.it_coverage.name': 'IT Coverage',
  'metric.it_coverage_line_hits_data.description': 'Coverage hits by line by integration tests',
  'metric.it_coverage_line_hits_data.name': 'IT Coverage Hits by Line',
  'metric.it_covered_conditions_by_line.description': 'IT covered conditions by line',
  'metric.it_covered_conditions_by_line.name': 'IT Covered Conditions by Line',
  'metric.it_lines_to_cover.description': 'Lines to cover by integration tests',
  'metric.it_lines_to_cover.name': 'IT Lines to Cover',
  'metric.it_line_coverage.description': 'Line coverage by integration tests',
  'metric.it_line_coverage.name': 'IT Line Coverage',
  'metric.it_uncovered_conditions.description': 'Uncovered conditions by integration tests',
  'metric.it_uncovered_conditions.name': 'IT Uncovered Conditions',
  'metric.it_uncovered_lines.description': 'Uncovered lines by integration tests',
  'metric.it_uncovered_lines.name': 'IT Uncovered Lines',
  'metric.last_commit_date.name': 'Date of Last Commit',
  'metric.last_commit_datetimes_by_line.description': 'Last commit dates by line',
  'metric.last_commit_datetimes_by_line.name': 'Last Commit Dates by Line',
  'metric.lcom4.description': 'Lack of Cohesion of Functions',
  'metric.lcom4.name': 'LCOM4',
  'metric.lcom4_blocks.description': 'LCOM4 blocks',
  'metric.lcom4_blocks.name': 'LCOM4 Blocks',
  'metric.lcom4_distribution.description': 'Class distribution /LCOM4',
  'metric.lcom4_distribution.name': 'Class Distribution / LCOM4',
  'metric.lines.description': 'Lines',
  'metric.lines.name': 'Lines',
  'metric.lines_to_cover.description': 'Lines to cover',
  'metric.lines_to_cover.name': 'Lines to cover',
  'metric.line_coverage.description': 'Line coverage',
  'metric.line_coverage.name': 'Line coverage',
  'metric.maintainability.description': 'Maintainability',
  'metric.maintainability.name': 'Maintainability',
  'metric.major_violations.description': 'Major issues',
  'metric.major_violations.name': 'Major Issues',
  'metric.minor_violations.description': 'Minor issues',
  'metric.minor_violations.name': 'Minor Issues',
  'metric.mule_configuration_complexity_rating.description':
    'Rating based on complexity of Mule configuration file',
  'metric.mule_configuration_complexity_rating.name': 'Mule Configuration Complexity Rating',
  'metric.mule_configuration_files.description': 'Number of Mule configuration files',
  'metric.mule_configuration_files.name': 'Mule Configuration Files',
  'metric.mule_dw.description': 'Number of DataWeave transformations',
  'metric.mule_dw.name': 'Mule DataWeave Transformations',
  'metric.mule_flows.description': 'Number of Mule flows',
  'metric.mule_flows.name': 'Mule Flows',
  'metric.mule_subflows.description': 'Number of Mule sub-flows',
  'metric.mule_subflows.name': 'Mule Sub-flows',
  'metric.ncloc.name': 'Lines of code',
  'metric.ncloc.description': 'Non commenting lines of code',
  'metric.ncloc_language_distribution.description':
    'Non Commenting Lines of Code Distributed By Language',
  'metric.ncloc_language_distribution.name': 'Lines of Code Per Language',
  'metric.new_blocker_violations.description': 'New Blocker issues',
  'metric.new_blocker_violations.name': 'New Blocker Issues',
  'metric.new_blocker_violations.short_name': 'Blocker Issues',
  'metric.new_branch_coverage.description': 'Condition coverage of new/changed code',
  'metric.new_branch_coverage.name': 'Condition Coverage on New Code',
  'metric.new_branch_coverage.extra_short_name': 'Condition coverage',
  'metric.new_bugs.description': 'New Bugs',
  'metric.new_bugs.name': 'New Bugs',
  'metric.new_bugs.short_name': 'Bugs',
  'metric.new_code_smells.description': 'New Code Smells',
  'metric.new_code_smells.name': 'New Code Smells',
  'metric.new_code_smells.short_name': 'Code smells',
  'metric.new_conditions_to_cover.description': 'Conditions to cover on new code',
  'metric.new_conditions_to_cover.name': 'Conditions to Cover on New Code',
  'metric.new_conditions_to_cover.extra_short_name': 'Conditions to cover',
  'metric.new_coverage.description': 'Coverage of new/changed code',
  'metric.new_coverage.description.positive': 'New code has sufficient test coverage',
  'metric.new_coverage.name': 'Coverage on New Code',
  'metric.new_coverage.short_name': 'Coverage',
  'metric.new_critical_violations.description': 'New Critical issues',
  'metric.new_critical_violations.name': 'New Critical Issues',
  'metric.new_critical_violations.short_name': 'Critical Issues',
  'metric.new_development_cost.description': 'Development cost on new code',
  'metric.new_development_cost.name': 'Development Cost on New Code',
  'metric.new_duplicated_blocks.name': 'Duplicated Blocks on New Code',
  'metric.new_duplicated_blocks.extra_short_name': 'Duplicated blocks',
  'metric.new_duplicated_blocks.description': 'Duplicated blocks on new code',
  'metric.new_duplicated_lines.name': 'Duplicated Lines on New Code',
  'metric.new_duplicated_lines.extra_short_name': 'Duplicated lines',
  'metric.new_duplicated_lines.description': 'Duplicated Lines on New Code',
  'metric.new_duplicated_lines_density.description':
    'Duplicated lines (%) on new code balanced by statements',
  'metric.new_duplicated_lines_density.description.positive': 'New code has limited duplications',
  'metric.new_duplicated_lines_density.name': 'Duplicated Lines (%) on New Code',
  'metric.new_duplicated_lines_density.short_name': 'Duplications',
  'metric.new_duplicated_lines_density.extra_short_name': 'Density',
  'metric.new_info_violations.description': 'New Info issues',
  'metric.new_info_violations.name': 'New Info Issues',
  'metric.new_info_violations.short_name': 'Info Issues',
  'metric.new_it_branch_coverage.description':
    'Integration tests condition coverage of new/changed code',
  'metric.new_it_branch_coverage.name': 'Condition Coverage by IT on New Code',
  'metric.new_it_conditions_to_cover.description': 'New conditions to cover by integration tests',
  'metric.new_it_conditions_to_cover.name': 'Conditions to Cover by IT on New Code',
  'metric.new_it_coverage.description': 'Integration tests coverage of new/changed code',
  'metric.new_it_coverage.name': 'Coverage by IT on New Code',
  'metric.new_it_lines_to_cover.description': 'Lines to cover on new code by integration tests',
  'metric.new_it_lines_to_cover.name': 'Lines to Cover by IT on New Code',
  'metric.new_it_line_coverage.description':
    'Integration tests line coverage of added/changed code',
  'metric.new_it_line_coverage.name': 'Line Coverage by IT on New Code',
  'metric.new_it_uncovered_conditions.description':
    'New conditions that are not covered by integration tests',
  'metric.new_it_uncovered_conditions.name': 'Uncovered Conditions by IT on New Code',
  'metric.new_it_uncovered_lines.description':
    'New lines that are not covered by integration tests',
  'metric.new_it_uncovered_lines.name': 'Uncovered Lines by IT on New Code',
  'metric.new_lines_to_cover.description': 'Lines to cover on new code',
  'metric.new_lines_to_cover.name': 'Lines to Cover on New Code',
  'metric.new_lines_to_cover.extra_short_name': 'Lines to cover',
  'metric.new_line_coverage.description': 'Line coverage of added/changed code',
  'metric.new_line_coverage.name': 'Line Coverage on New Code',
  'metric.new_line_coverage.extra_short_name': 'Line coverage',
  'metric.new_maintainability_rating.description': 'Maintainability rating on new code',
  'metric.new_maintainability_rating.name': 'Maintainability Rating on New Code',
  'metric.new_maintainability_rating.extra_short_name': 'Rating',
  'metric.new_software_quality_maintainability_rating.description':
    'Maintainability rating on new code',
  'metric.new_software_quality_maintainability_rating.name': 'Maintainability Rating on New Code',
  'metric.new_software_quality_maintainability_rating.extra_short_name': 'Rating',
  'metric.new_major_violations.description': 'New Major issues',
  'metric.new_major_violations.name': 'New Major Issues',
  'metric.new_major_violations.short_name': 'Major Issues',
  'metric.new_minor_violations.description': 'New Minor issues',
  'metric.new_minor_violations.name': 'New Minor Issues',
  'metric.new_minor_violations.short_name': 'Minor Issues',
  'metric.new_lines.name': 'New lines',
  'metric.new_lines.description': 'New lines',
  'metric.new_lines.short_name': 'Lines',
  'metric.new_ncloc.name': 'New lines of code',
  'metric.new_ncloc.description': 'Non commenting lines of code on new code',
  'metric.new_ncloc.short_name': 'Lines of code',
  'metric.new_overall_branch_coverage.description':
    'Condition coverage of new/changed code by all tests',
  'metric.new_overall_branch_coverage.name': 'Overall Condition Coverage on New Code',
  'metric.new_overall_conditions_to_cover.description': 'New conditions to cover by all tests',
  'metric.new_overall_conditions_to_cover.name': 'Overall Conditions to Cover on New Code',
  'metric.new_overall_coverage.description': 'Overall coverage of new/changed code',
  'metric.new_overall_coverage.name': 'Overall Coverage on New Code',
  'metric.new_overall_lines_to_cover.description': 'New lines to cover by all tests',
  'metric.new_overall_lines_to_cover.name': 'Overall Lines to Cover on New Code',
  'metric.new_overall_line_coverage.description':
    'Line coverage of added/changed code by all tests',
  'metric.new_overall_line_coverage.name': 'Overall Line Coverage on New Code',
  'metric.new_overall_uncovered_conditions.description':
    'New conditions that are not covered by any test',
  'metric.new_overall_uncovered_conditions.name': 'Overall Uncovered Conditions on New Code',
  'metric.new_overall_uncovered_lines.description': 'New lines that are not covered by any tests',
  'metric.new_overall_uncovered_lines.name': 'Overall Uncovered Lines on New Code',
  'metric.new_reliability_rating.description': 'Reliability rating on new code',
  'metric.new_reliability_rating.name': 'Reliability Rating on New Code',
  'metric.new_reliability_rating.extra_short_name': 'Rating',
  'metric.new_software_quality_reliability_rating.description': 'Reliability rating on new code',
  'metric.new_software_quality_reliability_rating.name': 'Reliability Rating on New Code',
  'metric.new_software_quality_reliability_rating.extra_short_name': 'Rating',
  'metric.new_reliability_remediation_effort.description':
    'Reliability remediation effort on new code',
  'metric.new_reliability_remediation_effort.name': 'Reliability Remediation Effort on New Code',
  'metric.new_reliability_remediation_effort.extra_short_name': 'Remediation effort',
  'metric.new_sca_count_any_issue.description': 'Dependency risks',
  'metric.new_sca_count_any_issue.name': 'New dependency risks',
  'metric.new_sca_count_any_issue.short_name': 'Dependency risks',
  'metric.new_sca_count_any_security.description': 'Dependency security risks',
  'metric.new_sca_count_any_security.name': 'New dependency security risks',
  'metric.new_sca_count_vulnerability.description': 'Number of dependencies with vulnerabilities',
  'metric.new_sca_count_vulnerability.name': 'New vulnerable dependency risks',
  'metric.new_sca_count_licensing.description': 'Prohibited license dependency risks',
  'metric.new_sca_count_licensing.name': 'New prohibited license dependency risks',
  'metric.new_sca_count_malware.description': 'Malicious package dependency risks',
  'metric.new_sca_count_malware.name': 'New malicious package dependency risks',
  'metric.new_sca_rating_any_issue.name': 'New dependency risk rating',
  'metric.new_sca_rating_any_security.name': 'New dependency security risk rating',
  'metric.new_sca_rating_vulnerability.name': 'New dependency risk rating for vulnerabilities',
  'metric.new_sca_rating_licensing.name': 'New dependency risk rating for licenses',
  'metric.new_sca_rating_malware.name': 'New dependency risk rating for malicious packages',
  'metric.new_sca_severity_any_issue.name': 'New dependency risk severity',
  'metric.new_sca_severity_any_security.name': 'New dependency security risk severity',
  'metric.new_sca_severity_vulnerability.name': 'New dependency vulnerability severity',
  'metric.new_sca_severity_licensing.name': 'New dependency with prohibited license',
  'metric.new_sca_severity_malware.name': 'New dependency malicious package severity',
  'metric.new_software_quality_reliability_remediation_effort.description':
    'Reliability remediation effort on new code',
  'metric.new_software_quality_reliability_remediation_effort.name':
    'Reliability Remediation Effort on New Code',
  'metric.new_software_quality_reliability_remediation_effort.extra_short_name':
    'Remediation effort',
  'metric.new_security_hotspots.description': 'New Security Hotspots',
  'metric.new_security_hotspots.name': 'New Security Hotspots',
  'metric.new_security_hotspots.short_name': 'Security hotspots',
  'metric.new_security_hotspots_reviewed.description':
    'Percentage of Security Hotspots Reviewed on New Code',
  'metric.new_security_hotspots_reviewed.description.positive':
    'All new security hotspots are reviewed',
  'metric.new_security_hotspots_reviewed.name': 'Security Hotspots Reviewed on New Code',
  'metric.new_security_hotspots_reviewed.short_name': 'Security hotspots reviewed',
  'metric.new_security_hotspots_reviewed_status.description':
    'Security Review Reviewed Status on New Code',
  'metric.new_security_hotspots_reviewed_status.name':
    'Security Review Reviewed Status on New Code',
  'metric.new_security_hotspots_to_review_status.description':
    'Security Review To Review Status on New Code',
  'metric.new_security_hotspots_to_review_status.name':
    'Security Review To Review Status on New Code',
  'metric.new_security_rating.description': 'Security rating on new code',
  'metric.new_security_rating.name': 'Security Rating on New Code',
  'metric.new_security_rating.extra_short_name': 'Rating',
  'metric.new_software_quality_security_rating.description': 'Security rating on new code',
  'metric.new_software_quality_security_rating.name': 'Security Rating on New Code',
  'metric.new_software_quality_security_rating.extra_short_name': 'Rating',
  'metric.new_security_remediation_effort.description': 'Security remediation effort on new code',
  'metric.new_security_remediation_effort.name': 'Security Remediation Effort on New Code',
  'metric.new_security_remediation_effort.extra_short_name': 'Remediation effort',
  'metric.new_software_quality_security_remediation_effort.description':
    'Security remediation effort on new code',
  'metric.new_software_quality_security_remediation_effort.name':
    'Security Remediation Effort on New Code',
  'metric.new_software_quality_security_remediation_effort.extra_short_name': 'Remediation effort',
  'metric.new_security_review_rating.description': 'Security Review Rating on New Code',
  'metric.new_security_review_rating.name': 'Security Review Rating on New Code',
  'metric.new_security_review_rating.extra_short_name': 'Rating',
  'metric.new_sqale_debt_ratio.description': 'Technical Debt Ratio of new/changed code.',
  'metric.new_sqale_debt_ratio.name': 'Technical Debt Ratio on New Code',
  'metric.new_sqale_debt_ratio.short_name': 'Debt Ratio on new code',
  'metric.new_sqale_debt_ratio.extra_short_name': 'Debt ratio',
  'metric.new_software_quality_maintainability_debt_ratio.description':
    'Technical Debt Ratio of new/changed code.',
  'metric.new_software_quality_maintainability_debt_ratio.name': 'Technical Debt Ratio on New Code',
  'metric.new_software_quality_maintainability_debt_ratio.short_name': 'Debt Ratio on new code',
  'metric.new_software_quality_maintainability_debt_ratio.extra_short_name': 'Debt ratio',
  'metric.new_technical_debt.description': 'Added technical debt',
  'metric.new_technical_debt.name': 'Added Technical Debt',
  'metric.new_technical_debt.short_name': 'Added Debt',
  'metric.new_technical_debt.extra_short_name': 'Debt',
  'metric.new_software_quality_maintainability_remediation_effort.description':
    'Added technical debt',
  'metric.new_software_quality_maintainability_remediation_effort.name': 'Added Technical Debt',
  'metric.new_software_quality_maintainability_remediation_effort.short_name': 'Added Debt',
  'metric.new_software_quality_maintainability_remediation_effort.extra_short_name': 'Debt',
  'metric.new_uncovered_conditions.description': 'Uncovered conditions on new code',
  'metric.new_uncovered_conditions.name': 'Uncovered Conditions on New Code',
  'metric.new_uncovered_conditions.extra_short_name': 'Uncovered conditions',
  'metric.new_uncovered_lines.description': 'Uncovered lines on new code',
  'metric.new_uncovered_lines.name': 'Uncovered Lines on New Code',
  'metric.new_uncovered_lines.extra_short_name': 'Uncovered lines',
  'metric.new_violations.description': 'New issues',
  'metric.new_violations.description.positive': 'New code has 0 issues',
  'metric.new_violations.name': 'New Issues',
  'metric.new_vulnerabilities.description': 'New Vulnerabilities',
  'metric.new_vulnerabilities.name': 'New Vulnerabilities',
  'metric.new_vulnerabilities.short_name': 'Vulnerabilities',
  'metric.noc.description': 'Number of Children',
  'metric.noc.name': 'Number of Children',
  'metric.open_issues.description': 'Open issues',
  'metric.open_issues.name': 'Open issues',
  'metric.overall_branch_coverage.description': 'Condition coverage by all tests',
  'metric.overall_branch_coverage.name': 'Overall Condition Coverage',
  'metric.overall_conditions_by_line.description': 'Overall conditions by all tests and by line',
  'metric.overall_conditions_by_line.name': 'Overall Conditions by Line',
  'metric.overall_conditions_to_cover.description': 'Conditions to cover by all tests',
  'metric.overall_conditions_to_cover.name': 'Overall Conditions to Cover',
  'metric.overall_coverage.description': 'Overall test coverage',
  'metric.overall_coverage.name': 'Overall Coverage',
  'metric.overall_coverage_line_hits_data.description': 'Coverage hits by all tests and by line',
  'metric.overall_coverage_line_hits_data.name': 'Overall Coverage Hits by Line',
  'metric.overall_covered_conditions_by_line.description':
    'Overall covered conditions by all tests and by line',
  'metric.overall_covered_conditions_by_line.name': 'Overall Covered Conditions by Line',
  'metric.overall_lines_to_cover.description': 'Lines to cover by all tests',
  'metric.overall_lines_to_cover.name': 'Overall Lines to Cover',
  'metric.overall_line_coverage.description': 'Line coverage by all tests',
  'metric.overall_line_coverage.name': 'Overall Line Coverage',
  'metric.overall_uncovered_conditions.description': 'Uncovered conditions by all tests',
  'metric.overall_uncovered_conditions.name': 'Overall Uncovered Conditions',
  'metric.overall_uncovered_lines.description': 'Uncovered lines by all tests',
  'metric.overall_uncovered_lines.name': 'Overall Uncovered Lines',
  'metric.packages.description': 'Packages',
  'metric.packages.name': 'Packages',
  'metric.package_cycles.description': 'Package cycles',
  'metric.package_cycles.name': 'Package Cycles',
  'metric.package_edges_weight.description': 'Package edges weight',
  'metric.package_edges_weight.name': 'Package Edges Weight',
  'metric.package_feedback_edges.description': 'Package dependencies to cut',
  'metric.package_feedback_edges.name': 'Package Dependencies to Cut',
  'metric.package_tangles.description': 'File dependencies to cut',
  'metric.package_tangles.name': 'File Dependencies to Cut',
  'metric.package_tangle_index.description': 'Package tangle index',
  'metric.package_tangle_index.name': 'Package Tangle Index',
  'metric.portability.description': 'Portability',
  'metric.portability.name': 'Portability',
  'metric.prioritized_rule_issues.name': 'Issues from prioritized rules',
  'metric.prioritized_rule_issues.description': 'Issues from prioritized rules',
  'metric.profile.description': 'Selected quality profile',
  'metric.profile.name': 'Profile',
  'metric.profile_version.description': 'Selected quality profile version',
  'metric.profile_version.name': 'Profile Version',
  'metric.projects.description': 'Number of project branches',
  'metric.projects.name': 'Project branches',
  'metric.project_branch_count.name': 'Project branches',
  'metric.matched_project_branch_count.name': 'Matched project branches',
  'metric.public_api.description': 'Public API',
  'metric.public_api.name': 'Public API',
  'metric.public_documented_api_density.description':
    'Public documented classes and functions balanced by ncloc',
  'metric.public_documented_api_density.name': 'Public Documented API (%)',
  'metric.public_undocumented_api.description':
    'Public undocumented classes, functions and variables',
  'metric.public_undocumented_api.name': 'Public Undocumented API',
  'metric.quality_gate_details.description':
    'The project detailed status with regard to its quality gate',
  'metric.quality_gate_details.name': 'Quality gate details',
  'metric.quality_profiles.description': 'Details of quality profiles used during analysis',
  'metric.quality_profiles.name': 'Profiles',
  'metric.reliability.description': 'Reliability',
  'metric.reliability.name': 'Reliability',
  'metric.reliability_rating.description': 'Reliability rating',
  'metric.reliability_rating.description.positive': 'Overall code has no critical bugs',
  'metric.reliability_rating.name': 'Reliability Rating',
  'metric.reliability_rating.extra_short_name': 'Rating',
  'metric.reliability_rating.tooltip.A': 'Reliability rating is A when there are no bugs.',
  'metric.reliability_rating.tooltip.B':
    'Reliability rating is B when there is at least one minor bug.',
  'metric.reliability_rating.tooltip.C':
    'Reliability rating is C when there is at least one major bug.',
  'metric.reliability_rating.tooltip.D':
    'Reliability rating is D when there is at least one critical bug.',
  'metric.reliability_rating.tooltip.E':
    'Reliability rating is E when there is at least one blocker bug.',
  'metric.releasability_rating.description': 'Releasability Rating',
  'metric.releasability_rating.name': 'Releasability rating',
  'metric.sca_count_any_issue.description': 'Dependency risks',
  'metric.sca_count_any_issue.name': 'Dependency risks',
  'metric.sca_count_any_issue.short_name': 'Dependency risks',
  'metric.sca_count_any_security.description': 'Dependency security risks',
  'metric.sca_count_any_security.name': 'Dependency security risks',
  'metric.sca_count_vulnerability.description': 'Number of dependencies with vulnerabilities',
  'metric.sca_count_vulnerability.name': 'Vulnerable dependency risks',
  'metric.sca_count_licensing.description': 'Prohibited license dependency risks',
  'metric.sca_count_licensing.name': 'Prohibited license dependency risks',
  'metric.sca_count_malware.description': 'Malicious packages dependency risks',
  'metric.sca_count_malware.name': 'Malicious package dependency risks',
  'metric.sca_rating_any_issue.name': 'Dependency risk rating',
  'metric.sca_rating_any_security.name': 'Dependency security risk rating',
  'metric.sca_rating_vulnerability.name': 'Dependency risk rating for vulnerabilities',
  'metric.sca_rating_licensing.name': 'Dependency risk rating for licenses',
  'metric.sca_rating_malware.name': 'Dependency risk rating for malicious packages',
  'metric.sca_severity_any_issue.name': 'Dependency risk severity',
  'metric.sca_severity_any_security.name': 'Dependency security risk severity',
  'metric.sca_severity_vulnerability.name': 'Dependency vulnerability severity',
  'metric.sca_severity_licensing.name': 'Dependency with prohibited license',
  'metric.sca_severity_malware.name': 'Dependency malicious package severity',
  'metric.new_sca_severity_any_issue.description.positive':
    'No new dependency risk with severity greater or equal to low',
  'metric.new_bugs_severity.description.positive':
    'No new bugs with severity greater or equal to minor',
  'metric.new_code_smells_severity.description.positive':
    'No new code smells with severity greater or equal to major',
  'metric.new_vulnerabilities_severity.description.positive':
    'No new vulnerabilities with severity greater or equal to minor',
  'metric.new_reliability_issue_severity.description.positive':
    'No new reliability issues with severity greater or equal to low',
  'metric.new_security_issue_severity.description.positive':
    'No new security issues with severity greater or equal to low',
  'metric.new_maintainability_issue_severity.description.positive':
    'No new maintainability issues with severity greater or equal to medium',
  'metric.software_quality_releasability_rating.description': 'Releasability Rating',
  'metric.software_quality_releasability_rating.name': 'Releasability rating',
  'metric.software_quality_reliability_rating.description': 'Reliability rating',
  'metric.software_quality_reliability_rating.description.positive':
    'Overall code has no critical reliability issues',
  'metric.software_quality_reliability_rating.name': 'Reliability Rating',
  'metric.software_quality_reliability_rating.extra_short_name': 'Rating',
  'metric.software_quality_reliability_rating.tooltip.A':
    'Reliability rating is A when there are no reliability issues above info severity.',
  'metric.software_quality_reliability_rating.tooltip.B':
    'Reliability rating is B when there is at least one low reliability issue.',
  'metric.software_quality_reliability_rating.tooltip.C':
    'Reliability rating is C when there is at least one medium reliability issue.',
  'metric.software_quality_reliability_rating.tooltip.D':
    'Reliability rating is D when there is at least one high reliability issue.',
  'metric.software_quality_reliability_rating.tooltip.E':
    'Reliability rating is E when there is at least one blocker reliability issue.',
  'metric.reliability_remediation_effort.description': 'Reliability Remediation Effort',
  'metric.reliability_remediation_effort.name': 'Reliability Remediation Effort',
  'metric.reliability_remediation_effort.extra_short_name': 'Remediation effort',
  'metric.software_quality_reliability_remediation_effort.description':
    'Reliability Remediation Effort',
  'metric.software_quality_reliability_remediation_effort.name': 'Reliability Remediation Effort',
  'metric.software_quality_reliability_remediation_effort.extra_short_name': 'Remediation effort',
  'metric.reopened_issues.description': 'Reopened issues',
  'metric.reopened_issues.name': 'Reopened Issues',
  'metric.revisions_by_line.description': 'Revisions by line',
  'metric.revisions_by_line.name': 'Revisions by Line',
  'metric.rfc.description': 'Response for Class',
  'metric.rfc.name': 'Response for Class',
  'metric.rfc_distribution.description': 'Class distribution /RFC',
  'metric.rfc_distribution.name': 'Class Distribution / RFC',
  'metric.sca_rating.tooltip.A':
    'Dependency Risk rating is A when there are no dependency risks, or when there are only risks with Info severity.',
  'metric.sca_rating.tooltip.B':
    'Dependency Risk rating is B when there is at least one dependency risk with Low severity.',
  'metric.sca_rating.tooltip.C':
    'Dependency Risk rating is C when there is at least one dependency risk with Medium severity.',
  'metric.sca_rating.tooltip.D':
    'Dependency Risk rating is D when there is at least one dependency risk with High severity.',
  'metric.sca_rating.tooltip.E':
    'Dependency Risk rating is E when there is at least one dependency risk with Blocker severity.',
  'metric.security_hotspots.description': 'Security Hotspots',
  'metric.security_hotspots.full_description':
    'Security-sensitive code that requires manual review to assess whether or not a vulnerability exists.',
  'metric.security_hotspots.name': 'Security hotspots',
  'metric.security_hotspots_reviewed.description': 'Percentage of Security Hotspots Reviewed',
  'metric.security_hotspots_reviewed.description.positive': 'All security hotspots are reviewed',
  'metric.security_hotspots_reviewed.name': 'Security hotspots reviewed',
  'metric.security_hotspots_reviewed_status.description': 'Security Review Reviewed Status',
  'metric.security_hotspots_reviewed_status.name': 'Security Review Reviewed Status',
  'metric.security_hotspots_to_review_status.description': 'Security Review To Review Status',
  'metric.security_hotspots_to_review_status.name': 'Security Review To Review Status',
  'metric.security_rating.description': 'Security rating',
  'metric.security_rating.description.positive': 'Overall code has no vulnerabilities',
  'metric.security_rating.name': 'Security Rating',
  'metric.security_rating.extra_short_name': 'Rating',
  'metric.security_rating.tooltip.A': 'Security rating is A when there are no vulnerabilities.',
  'metric.security_rating.tooltip.B':
    'Security rating is B when there is at least one minor vulnerability.',
  'metric.security_rating.tooltip.C':
    'Security rating is C when there is at least one major vulnerability.',
  'metric.security_rating.tooltip.D':
    'Security rating is D when there is at least one critical vulnerability.',
  'metric.security_rating.tooltip.E':
    'Security rating is E when there is at least one blocker vulnerability.',
  'metric.software_quality_security_rating.description': 'Security rating',
  'metric.software_quality_security_rating.description.positive':
    'Overall code has no security issues',
  'metric.software_quality_security_rating.name': 'Security Rating',
  'metric.software_quality_security_rating.extra_short_name': 'Rating',
  'metric.software_quality_security_rating.tooltip.A':
    'Security rating is A when there are no security issues above info severity.',
  'metric.software_quality_security_rating.tooltip.B':
    'Security rating is B when there is at least one low security issue.',
  'metric.software_quality_security_rating.tooltip.C':
    'Security rating is C when there is at least one medium security issue.',
  'metric.software_quality_security_rating.tooltip.D':
    'Security rating is D when there is at least one high security issue.',
  'metric.software_quality_security_rating.tooltip.E':
    'Security rating is E when there is at least one blocker security issue.',
  'metric.security_remediation_effort.description': 'Security remediation effort',
  'metric.security_remediation_effort.name': 'Security Remediation Effort',
  'metric.security_remediation_effort.extra_short_name': 'Remediation effort',
  'metric.software_quality_security_remediation_effort.description': 'Security remediation effort',
  'metric.software_quality_security_remediation_effort.name': 'Security Remediation Effort',
  'metric.software_quality_security_remediation_effort.extra_short_name': 'Remediation effort',
  'metric.security_review_rating.description': 'Security Review Rating',
  'metric.security_review_rating.name': 'Security Review Rating',
  'metric.security_review_rating.extra_short_name': 'Rating',
  'metric.security_review_rating.tooltip.A':
    'Security Review rating is A when at least 80% of Security Hotspots are reviewed.',
  'metric.security_review_rating.tooltip.B':
    'Security Review rating is B when less than 80% of Security Hotspots are reviewed.',
  'metric.security_review_rating.tooltip.C':
    'Security Review rating is C when less than 70% of Security Hotspots are reviewed.',
  'metric.security_review_rating.tooltip.D':
    'Security Review rating is D when less than 50% of Security Hotspots are reviewed.',
  'metric.security_review_rating.tooltip.E':
    'Security Review rating is E when less than 30% of Security Hotspots are reviewed.',
  'metric.skipped_tests.description': 'Number of skipped unit tests',
  'metric.skipped_tests.name': 'Skipped Unit Tests',
  'metric.skipped_tests.short_name': 'Skipped',
  'metric.sqale_debt_ratio.description':
    'Ratio of the actual technical debt compared to the estimated cost to develop the whole source code from scratch',
  'metric.sqale_debt_ratio.name': 'Technical Debt Ratio',
  'metric.sqale_debt_ratio.short_name': 'Debt ratio',
  'metric.software_quality_maintainability_debt_ratio.description':
    'Ratio of the actual technical debt compared to the estimated cost to develop the whole source code from scratch',
  'metric.software_quality_maintainability_debt_ratio.name': 'Technical Debt Ratio',
  'metric.software_quality_maintainability_debt_ratio.short_name': 'Debt ratio',
  'metric.sqale_index.description':
    'Total effort (in minutes) to fix all the issues on the component and therefore to comply to all the requirements.',
  'metric.sqale_index.name': 'Technical Debt',
  'metric.sqale_index.short_name': 'Debt',
  'metric.software_quality_maintainability_remediation_effort.description':
    'Total effort (in minutes) to fix all the issues on the component and therefore to comply to all the requirements.',
  'metric.software_quality_maintainability_remediation_effort.name': 'Technical Debt',
  'metric.software_quality_maintainability_remediation_effort.short_name': 'Debt',
  'metric.sqale_rating.description': 'A-to-E rating based on the technical debt ratio',
  'metric.sqale_rating.name': 'Maintainability Rating',
  'metric.sqale_rating.extra_short_name': 'Rating',
  'metric.maintainability_rating.description': 'A-to-E rating based on the technical debt ratio',
  'metric.maintainability_rating.name': 'Maintainability Rating',
  'metric.maintainability_rating.extra_short_name': 'Rating',
  'metric.sqale_rating.tooltip':
    'Maintainability rating is {0} when the technical debt ratio is greater than {1}',
  'metric.sqale_rating.tooltip.A':
    'Maintainability rating is A when the technical debt ratio is less than {0}',
  'metric.software_quality_maintainability_rating.description':
    'A-to-E rating based on the technical debt ratio',
  'metric.software_quality_maintainability_rating.name': 'Maintainability Rating',
  'metric.software_quality_maintainability_rating.extra_short_name': 'Rating',
  'metric.software_quality_maintainability_rating.tooltip':
    'Maintainability rating is {0} when the technical debt ratio is greater than {1}',
  'metric.software_quality_maintainability_rating.tooltip.A':
    'Maintainability rating is A when the technical debt ratio is less than {0}',
  'metric.statements.description': 'Number of statements',
  'metric.statements.name': 'Statements',
  'metric.suspect_lcom4_density.description': 'Density of classes having LCOM4>1',
  'metric.suspect_lcom4_density.name': 'Suspect LCOM4 Density',
  'metric.tests.description': 'Number of unit tests',
  'metric.tests.name': 'Unit tests',
  'metric.test_data.description': 'Unit tests details',
  'metric.test_data.name': 'Unit Test Details',
  'metric.test_errors.description': 'Number of unit test errors',
  'metric.test_errors.name': 'Unit Test Errors',
  'metric.test_errors.short_name': 'Errors',
  'metric.test_execution_time.description': 'Execution duration of unit tests',
  'metric.test_execution_time.name': 'Unit Test Duration',
  'metric.test_execution_time.short_name': 'Duration',
  'metric.test_failures.description': 'Number of unit test failures',
  'metric.test_failures.name': 'Unit Test Failures',
  'metric.test_failures.short_name': 'Failures',
  'metric.test_success_density.description': 'Density of successful unit tests',
  'metric.test_success_density.name': 'Unit Test Success (%)',
  'metric.test_success_density.short_name': 'Success',
  'metric.uncovered_conditions.description': 'Uncovered conditions',
  'metric.uncovered_conditions.name': 'Uncovered conditions',
  'metric.uncovered_lines.description': 'Uncovered lines',
  'metric.uncovered_lines.name': 'Uncovered lines',
  'metric.usability.description': 'Usability',
  'metric.usability.name': 'Usability',
  'metric.violations.description': 'Issues',
  'metric.violations.name': 'Issues',
  'metric.violations.short_name': 'Issues',
  'metric.vulnerabilities.description': 'Vulnerabilities',
  'metric.vulnerabilities.name': 'Vulnerabilities',
  'metric.vulnerabilities.short_name': 'Vulnerabilities',
  'metric.wont_fix_issues.description': "Won't fix issues",
  'metric.wont_fix_issues.name': "Won't Fix Issues",
  'metric.accepted_issues.description': 'Accepted issues',
  'metric.accepted_issues.name': 'Accepted issues',
  'metric.pull_request_fixed_issues.name': 'Pull request fixed issues',
  'metric.pull_request_fixed_issues.description':
    'Count of issues that would be fixed by the pull request.',
  'metric.new_accepted_issues.name': 'New Accepted Issues',
  'metric.new_accepted_issues.description': 'New accepted issues',
  'metric.high_impact_accepted_issues.name': 'Blocker and High Severity Accepted Issues',
  'metric.high_impact_accepted_issues.description': 'Accepted issues with blocker or high impact',
  'metric.maintainability_issues.name': 'Maintainability Issues',
  'metric.maintainability_issues.description': 'Maintainability issues',
  'metric.maintainability_issues.short_name': 'Maintainability',
  'metric.reliability_issues.name': 'Reliability Issues',
  'metric.reliability_issues.description': 'Reliability issues',
  'metric.reliability_issues.short_name': 'Reliability',
  'metric.security_issues.name': 'Security Issues',
  'metric.security_issues.description': 'Security issues',
  'metric.security_issues.short_name': 'Security',
  'metric.new_maintainability_issues.name': 'New Maintainability Issues',
  'metric.new_maintainability_issues.description': 'New maintainability issues',
  'metric.new_maintainability_issues.short_name': 'New Maintainability',
  'metric.new_reliability_issues.name': 'New Reliability Issues',
  'metric.new_reliability_issues.description': 'New reliability issues',
  'metric.new_reliability_issues.short_name': 'New Reliability',
  'metric.new_security_issues.name': 'New Security Issues',
  'metric.new_security_issues.description': 'New security issues',
  'metric.new_security_issues.short_name': 'New Security',
  'metric.software_quality_blocker_issues.description': 'Blocker Severity issues',
  'metric.software_quality_blocker_issues.name': 'Blocker Severity Issues',
  'metric.software_quality_high_issues.description': 'High Severity issues',
  'metric.software_quality_high_issues.name': 'High Severity Issues',
  'metric.software_quality_info_issues.description': 'Info Severity issues',
  'metric.software_quality_info_issues.name': 'Info Severity Issues',
  'metric.software_quality_medium_issues.description': 'Medium Severity issues',
  'metric.software_quality_medium_issues.name': 'Medium Severity Issues',
  'metric.software_quality_low_issues.description': 'Low Severity issues',
  'metric.software_quality_low_issues.name': 'Low Severity Issues',
  'metric.new_software_quality_blocker_issues.description': 'New Blocker Severity issues',
  'metric.new_software_quality_blocker_issues.name': 'New Blocker Severity Issues',
  'metric.new_software_quality_high_issues.description': 'New High Severity issues',
  'metric.new_software_quality_high_issues.name': 'New High Severity Issues',
  'metric.new_software_quality_info_issues.description': 'New Info Severity issues',
  'metric.new_software_quality_info_issues.name': 'New Info Severity Issues',
  'metric.new_software_quality_medium_issues.description': 'New Medium Severity issues',
  'metric.new_software_quality_medium_issues.name': 'New Medium Severity Issues',
  'metric.new_software_quality_low_issues.description': 'New Low Severity issues',
  'metric.new_software_quality_low_issues.name': 'New Low Severity Issues',
  'metric.software_quality_maintainability_issues.name': 'Maintainability Issues',
  'metric.software_quality_maintainability_issues.short_name': 'Maintainability',
  'metric.software_quality_maintainability_issues.description': 'Maintainability issues',
  'metric.software_quality_reliability_issues.name': 'Reliability Issues',
  'metric.software_quality_reliability_issues.short_name': 'Reliability',
  'metric.software_quality_reliability_issues.description': 'Reliability issues',
  'metric.software_quality_security_issues.name': 'Security Issues',
  'metric.software_quality_security_issues.short_name': 'Security',
  'metric.software_quality_security_issues.description': 'Security issues',
  'metric.new_software_quality_maintainability_issues.name': 'New Maintainability Issues',
  'metric.new_software_quality_maintainability_issues.description': 'New maintainability issues',
  'metric.new_software_quality_reliability_issues.name': 'New Reliability Issues',
  'metric.new_software_quality_reliability_issues.description': 'New reliability issues',
  'metric.new_software_quality_security_issues.name': 'New Security Issues',
  'metric.new_software_quality_security_issues.description': 'New security issues',
  'metric.issues_in_sandbox.name': 'Issues in sandbox',
  'metric.issues_in_sandbox.short_name': 'Issue sandbox',
  'metric.issues_in_sandbox.description':
    'Issue detection is always improving. When SonarQube finds new issues due to an update, they are held here for review before they can affect the quality gate.',
  'metric.new_issues_in_sandbox.name': 'New issues in sandbox',
  'metric.new_issues_in_sandbox.short_name': 'Issue sandbox',
  'metric.new_issues_in_sandbox.description':
    'Issue detection is always improving. When SonarQube finds new issues due to an update, they are held here for review before they can affect the quality gate.',

  //------------------------------------------------------------------------------
  //
  // OVERVIEW
  //
  //------------------------------------------------------------------------------
  'overview.fix_failed_conditions_with_sonarlint':
    'Fix issues before they fail your quality gate with {link}. Power up with connected mode!',
  'overview.new_issues': 'New issues',
  'overview.pull_request.fixed_issues': 'Fixed issues',
  'overview.pull_request.fixed_issues.help': 'Estimation of issues fixed by this PR',
  'overview.pull_request.fixed_issues.disclaimer':
    'Only issues fixed on the files modified by the pull request are taken into account. Issues incidentally fixed on unmodified files are not counted.',
  'overview.pull_request.fixed_issues.disclaimer.2':
    'When the pull request and the target branch are not synchronized, issues introduced on the target branch may be incorrectly considered fixed by the pull request. Rebasing the pull request would give an updated value.',
  'overview.accepted_issues.help': 'Valid issues that were not fixed',
  'overview.quality_gate': 'Quality gate',
  'overview.quality_gate_x': 'Quality gate: {status}',
  'overview.quality_gate.help':
    "A quality gate is a set of measure-based Boolean conditions. It helps you know immediately whether your project is production-ready. If your current status is not Passed, you'll see which measures caused the problem and the values required to pass.",
  'overview.quality_gate.all_conditions_passed': 'All conditions passed',
  'overview.quality_gate.conditions_failed': 'Some conditions failed',
  'overview.quality_gate.run_analysis': 'Run analysis to generate status',
  'summary.x_conditions_failed.formatted':
    '{conditionsFormatted} {conditions, plural, one {condition} other {conditions}} failed',
  'overview.quality_gate.ignored_conditions':
    'Some quality gate conditions on New Code were ignored because of the small number of New Lines',
  'overview.quality_gate.ignored_conditions.tooltip':
    "At the start of a new code period, if very few lines have been added or modified, it might be difficult to reach the desired level of code coverage or duplications. To prevent quality gate failure when there's little that can be done about it, quality gate conditions about duplications in new code and coverage on new code are ignored until the number of new lines is at least 20. An administrator can disable this in the general settings.",
  'overview.quality_gates.conditions.condition_simplification_tour.title':
    'One condition, zero issues',
  'overview.quality_gates.conditions.condition_simplification_tour.content':
    '<p>One single condition in <link>{qualityGateName} quality gate</link> ensures that new code has no issues.</p><p>Every issue in new code must be resolved for a project to pass this quality gate.</p>',
  'overview.quality_gate.show_project_conditions_x': 'Show failed conditions for project {0}',
  'overview.quality_gate.hide_project_conditions_x': 'Hide failed conditions for project {0}',
  'overview.quality_gate.coverage': 'Coverage',
  'overview.quality_gate.duplications': 'Duplications',
  'overview.new_coverage.on_x_new_lines': 'On {link} New Lines to cover.',
  'overview.coverage.on_x_new_lines': 'On {link} lines to cover.',
  'overview.new_duplicated_lines_density.on_x_new_lines': 'On {link} New Lines.',
  'overview.duplicated_lines_density.on_x_new_lines': 'On {link} lines.',
  'overview.quality_gate.required_x': 'Required {operator} {requirement}',
  'overview.quality_gate.required_x_reviewed': 'Required review: {requirement}',
  'overview.quality_profiles': 'Quality profiles used',
  'overview.max_new_code_period_from_x': 'Max New Code from: {0}',
  'overview.started_x': 'Started {0}',
  'overview.set_as_homepage': 'Set as homepage',
  'overview.new_code': 'New Code',
  'overview.overall_code': 'Overall Code',
  'overview.last_analysis_x': 'Last analysis {date}',
  'overview.previous_analysis_x': 'Previous analysis was {0}',
  'overview.see_more_details_on_x_of_y': 'See more details on {0} of {1}',
  'overview.see_more_details_on_x_y': 'See more details on {0} {1}',
  'overview.metric_not_computed': 'Not computed',
  'overview.coverage.no_coverage.description':
    'A few extra steps are needed to set up coverage analysis.',
  'overview.coverage.setup': 'Set up coverage analysis',
  'overview.coverage.not_enough_lines': 'There are not enough lines to compute coverage',
  'overview.external_links': 'External Links',
  'overview.project_key.APP': 'Application Key',
  'overview.project_key.TRK': 'Project Key',
  'overview.activity': 'Activity',
  'overview.activity.graph_shows_data_for_x':
    'This graph shows historical data for {0}. Click on the "Activity" link below to see more information.',
  'overview.accepted_issues': 'Accepted issues',
  'overview.measures.empty_explanation':
    'Measures on New Code will appear after the second analysis of this branch.',
  'overview.measures.same_reference.explanation':
    'This branch is configured to use itself as a reference branch. It will never have New Code.',
  'overview.measures.bad_reference.explanation':
    'This branch could not be compared to its reference branch. See the SCM or analysis report for more details.',
  'overview.measures.bad_setting.link': 'This can be fixed in the {setting_link} setting.',
  'overview.measures.software_impact.total_open_issues': 'Open issues',
  'overview.measures.software_impact.count_tooltip':
    'Issues in code can impact multiple Software Qualities, so the sum of impacts tends to be greater than the total amount of issues.',
  'overview.measures.software_impact.see_list_of_x_open_issues':
    'See the list of {count} open {softwareQuality} issues',
  'overview.measures.software_impact.severity.see_x_open_issues':
    'See {count} open {softwareQuality} issues with {severity} severity',
  'overview.measures.software_impact.severity.HIGH.tooltip': 'High Impact',
  'overview.measures.software_impact.severity.HIGH.improve_tooltip': 'high',
  'overview.measures.software_impact.severity.MEDIUM.tooltip': 'Medium Impact',
  'overview.measures.software_impact.severity.MEDIUM.improve_tooltip': 'medium',
  'overview.measures.software_impact.severity.LOW.improve_tooltip': 'low',
  'overview.measures.software_impact.improve_rating_tooltip':
    'The {softwareQuality} rating is {ratingLabel} when there is at least one issue with {severity} impact on the {_softwareQuality} of your software.',
  'overview.measures.software_impact.improve_rating_tooltip.A':
    'The {softwareQuality} rating is {ratingLabel} when there are no issues above info severity with impact on the {_softwareQuality} of your software.',
  'overview.measures.software_impact.improve_rating_tooltip.MAINTAINABILITY':
    'The Maintainability rating is {ratingLabel} if the code has a relatively higher level of technical debt when compared to the size of the codebase.',
  'overview.measures.software_impact.improve_rating_tooltip.MAINTAINABILITY.A':
    'The Maintainability rating is A if the code has a relatively lower level of technical debt when compared to the size of the codebase.',

  'overview.project.no_lines_of_code': 'This project has no lines of code.',
  'overview.project.empty': 'This project is empty.',
  'overview.project.branch_X_no_lines_of_code': 'The "{0}" branch has no lines of code.',
  'overview.project.branch_X_empty': 'The "{0}" branch of this project is empty.',
  'overview.project.main_branch_no_lines_of_code': 'The main branch has no lines of code.',
  'overview.project.main_branch_empty': 'The main branch of this project is empty.',
  'overview.project.next_steps.set_up_pr_deco_and_ci.admin':
    "To benefit from more of {productName}'s features, {link_ci} and set up DevOps platform integration in your {link_project_settings}.",
  'overview.project.next_steps.set_up_pr_deco_and_ci':
    "To benefit from more of {productName}'s features, {link_ci} and ask a project administrator to set up DevOps platform integration.",
  'overview.project.next_steps.set_up_pr_deco.admin':
    "To benefit from more of {productName}'s features, set up DevOps platform integration in your {link_project_settings}.",
  'overview.project.next_steps.set_up_pr_deco':
    "To benefit from more of {productName}'s features, ask a project administrator to set up DevOps platform integration.",
  'overview.project.next_steps.set_up_ci':
    "To benefit from more of {productName}'s features, {link}.",
  'overview.project.next_steps.links.project_settings': 'project settings',
  'overview.project.next_steps.links.set_up_ci': 'set up analysis in your favorite CI',
  'overview.project.software_impact.has_rating':
    'Software Quality {softwareQuality} has rating {rating}',
  'overview.run_analysis_to_compute.TRK': 'Run new analysis to compute the missing data.',
  'overview.run_analysis_to_compute.APP': 'Analyse all projects to compute the missing data.',
  'overview.missing_project_data':
    'The calculation of counts and ratings for security, reliability, and maintainability has changed, which may impact this {qualifier, select, VW {portfolio after all projects are analyzed} APP {application after all projects are analyzed} other {project after the next analysis}}.  <link>Learn more in SonarQube documentation</link>',

  'overview.period.previous_version': 'Since {0}',

  // Old periods, necessary to display project that haven't been analyzed with new setting (MMF-1579)
  'overview.period.previous_version_only_date': 'Since previous version',
  'overview.period.previous_analysis': 'Since previous analysis',
  'overview.period.days': 'Last {0} days',
  'overview.period.version': 'Since {0}',
  'overview.period.date': 'After {0}',
  'overview.period.manual_baseline': 'Since {0}',

  // New periods (MMF-1579)
  'overview.period.number_of_days': 'From last {0} days',
  'overview.period.specific_analysis': 'Since {0}',
  'overview.period.reference_branch': 'Compared to {0}',

  'overview.failed.badge': '{counter} failed',

  'overview.measures.failed_badge': 'Failed',

  'overview.complexity_tooltip.function': '{0} functions have complexity around {1}',

  'overview.deprecated_profile':
    'This quality profile uses {0} deprecated rules and should be updated.',
  'overview.deleted_profile': '{0} has been deleted since the last analysis.',
  'overview.link_to_x_profile_y': 'Go to {0} profile "{1}"',

  'overview.sonarlint_ad.header':
    'Catch issues before they fail your quality gate with our IDE extension, SonarQube for IDE',
  'overview.sonarlint_ad.details_1': 'The power of Sonar analyzers directly as you type',
  'overview.sonarlint_ad.details_2': 'No need to wait for your PR to pass all checks',
  'overview.sonarlint_ad.details_3': 'Repair flagged issues in real-time with quick fixes',
  'overview.sonarlint_ad.details_4':
    '12 major IDEs supported (including key JetBrains and Microsoft IDEs)',
  'overview.sonarlint_ad.details_5': 'Free forever',
  'overview.sonarlint_ad.learn_more': 'Learn more about SonarQube for IDE',
  'overview.sonarlint_ad.close_promotion': 'Close SonarQube for IDE promotion',

  'overview.badges.get_badge': 'Badges',
  'overview.badges.description.TRK':
    'Show the status of your project metrics on your README or website.',
  'overview.badges.description.VW':
    'Show the status of your portfolio metrics on your README or website.',
  'overview.badges.description.APP':
    'Show the status of your application metrics on your README or website.',
  'overview.badges.type': 'Badge type',
  'overview.badges.metric': 'Customize badge',
  'overview.badges.format': 'Code format',
  'overview.badges.options.formats.md': 'Markdown',
  'overview.badges.options.formats.url': 'Image URL only',
  'overview.badges.measure': 'Metric',
  'overview.badges.measure.alt':
    'This is an image of a standard badge that displays the current status of {metric} of your project.',
  'overview.badges.measure.description.TRK':
    'Displays the current status of one metric of your project.',
  'overview.badges.measure.description.VW':
    'Displays the current status of one metric of your portfolio.',
  'overview.badges.measure.description.APP':
    'Displays the current status of one metric of your application.',
  'overview.badges.quality_gate': 'Quality gate',
  'overview.badges.quality_gate.alt':
    'This is an image of a quality gate badge that displays the current quality gate status of your project.',
  'overview.badges.quality_gate.description.APP':
    'Displays the current quality gate status of your application.',
  'overview.badges.quality_gate.description.TRK':
    'Displays the current quality gate status of your project.',
  'overview.badges.quality_gate.description.VW':
    'Displays the current quality gate status of your portfolio.',
  'overview.badges.ai_code_assurance': 'AI Code Assurance',
  'overview.badges.ai_code_assurance.alt':
    "This is an image of an AI Code Assurance badge that displays the current status of Sonar's AI Code Assurance.",
  'overview.badges.ai_code_assurance.description.TRK':
    "Displays the current status of Sonar's AI Code Assurance of your project.",
  'overview.badges.leak_warning':
    'Project badges can expose your security rating and other measures. Only use project badges in trusted environments.',
  'overview.badges.renew': 'Renew Token',
  'overview.badges.renew.description':
    'If your project badge security token has leaked to an unsafe environment, you can renew it:',
  'overview.badges.copy_snippet': 'Copy the snippet for your selected badge',

  'overview.quality_profiles_update_after_sq_upgrade.message':
    'Update to {productName} {sqVersion} has updated your quality profiles. Issues on your project may have been affected. {link}',
  'overview.quality_profiles_update_after_sq_upgrade.link': 'See more details',

  'overview.activity.variations.new_analysis': 'New analysis:',
  'overview.activity.variations.first_analysis': 'First analysis:',

  'overview.issues.issue_from_update': '{count} from SonarQube update',
  'overview.issues.issue_from_update.tooltip': 'Issues appearing as a result of SonarQube updates',

  //------------------------------------------------------------------------------
  //
  // COMPONENT MEASURES
  //
  //------------------------------------------------------------------------------
  'component_measures.details_are_not_available':
    'Details are not available for estimated measures.',
  'component_measures.domain_x_overview': '{0} Overview',
  'component_measures.domain_overview': 'Overview',
  'component_measures.items': 'items',
  'component_measures.tab.tree': 'Tree',
  'component_measures.tab.list': 'List',
  'component_measures.show_metric_history': 'Show history of this metric',
  'component_measures.tab.treemap': 'Treemap',
  'component_measures.view_as': 'View as',
  'component_measures.legend.color': 'Color:',
  'component_measures.legend.size': 'Size:',
  'component_measures.legend.worse_of_x_y': 'Worse of {0} and {1}',
  'component_measures.legend.help_x': 'Click to toggle visibility for data with rating {0}.',
  'component_measures.legend.only_first_500_files': 'Only showing data for the first 500 files',
  'component_measures.no_history': "There isn't enough data to generate an activity graph.",
  'component_measures.empty': 'No measures.',
  'component_measures.select_files': 'Select files',
  'component_measures.navigate': 'Navigate',
  'component_measures.hidden_best_score_metrics':
    'There are {0} hidden components with a score of {1}.',
  'component_measures.hidden_best_score_metrics_show_label': 'Show hidden components',
  'component_measures.navigation': 'Measures navigation',
  'component_measures.skip_to_navigation': 'Skip to measure navigation',
  'component_measures.see_metric_history': 'See history',
  'component_measures.leak_legend.new_code': 'New Code:',
  'component_measures.awaiting_analysis.name': 'Issues',
  'component_measures.leak_awaiting_analysis.name': 'Issues',

  'component_measures.overview.project_overview.subnavigation': 'Project overview',
  'component_measures.overview.project_overview.title': 'Risk',
  'component_measures.overview.project_overview.description':
    'Get quick insights into the operational risks. For users relying on their keyboard, elements are sorted by the number of lines of code for each file. Any color but green indicates immediate risks: Bugs or Vulnerabilities that should be examined. A position at the top or right of the graph means that the longer-term health may be at risk. Green bubbles at the bottom-left are best.',
  'component_measures.overview.Reliability.description':
    "See bugs' operational risks. For users relying on their keyboard, elements are sorted by volume of bugs per file. The closer a bubble's color is to red, the more severe the worst bugs are. Bubble size indicates bug volume, and each bubble's vertical position reflects the estimated time to address the bugs. Small green bubbles on the bottom edge are best.",
  'component_measures.overview.Security.description':
    "See vulnerabilities' operational risks. For users relying on their keyboard, elements are sorted by volume of vulnerabilities per file. The closer a bubble's color is to red, the more severe the worst vulnerabilities are. Bubble size indicates vulnerability volume, and each bubble's vertical position reflects the estimated time to address the vulnerabilities. Small green bubbles on the bottom edge are best.",
  'component_measures.overview.Maintainability.description':
    "See code smells' long-term risks. For users relying on their keyboard, elements are sorted by the volume of code smells for each file. The closer a bubble's color is to red, the higher the ratio of technical debt is. Bubble size indicates code smell volume, and each bubble's vertical position reflects the estimated time to address the code smells. Small green bubbles on the bottom edge are best.",
  'component_measures.overview.Coverage.description':
    "See missing test coverage's long-term risks. For users relying on their keyboard, elements are sorted by volume of uncovered lines per file. Bubble size indicates the volume of uncovered lines, and each bubble's vertical position reflects the volume of missing coverage. Small bubbles on the bottom edge are best.",
  'component_measures.overview.Duplications.description':
    "See duplications' long-term risks. For users relying on their keyboard, elements are sorted by the number of duplicated blocks per file. Bubble size indicates the volume of duplicated blocks, and each bubble's vertical position reflects the volume of lines in those blocks. Small bubbles on the bottom edge are best.",
  'component_measures.overview.see_data_as_list': 'See the data presented on this chart as a list',

  'component_measures.domain_subnavigation.Reliability.help':
    'Issues in this domain mark code where you will get behavior other than what was expected.',
  'component_measures.domain_subnavigation.Maintainability.help':
    'Issues in this domain mark code that will be more difficult to update competently than it should.',
  'component_measures.domain_subnavigation.Security.help':
    'Issues in this domain mark potential weaknesses to hackers.',
  'component_measures.domain_subnavigation.SecurityReview.help':
    'This domain represents potential security risks in the form of hotspots and their review status.',
  'component_measures.domain_subnavigation.Complexity.help':
    'How simple or complicated the control flow of the application is. Cyclomatic Complexity measures the minimum number of test cases required for full test coverage. Cognitive Complexity is a measure of how difficult the application is to understand',

  'component_measures.subnavigation_category.new_code_category': 'New code',
  'component_measures.subnavigation_category.overall_category': 'Overall code',
  'component_measures.subnavigation_category.tests_category': 'Tests',

  'component_measures.facet_category.overall_category.estimated': 'Estimated after merge',
  'component_measures.not_all_measures_are_shown': 'Not all projects and applications are included',
  'component_measures.not_all_measures_are_shown.help':
    'You do not have access to all projects and/or applications. Measures are still computed based on all projects and applications.',

  'component_measures.metric.new_security_issues.name': 'Issues',
  'component_measures.metric.new_software_quality_security_issues.name': 'Issues',
  'component_measures.metric.new_security_issues.detailed_name': 'New Issues',
  'component_measures.metric.new_software_quality_security_issues.detailed_name': 'New Issues',
  'component_measures.metric.new_vulnerabilities.name': 'Vulnerabilities',
  'component_measures.metric.new_vulnerabilities.detailed_name': 'New Vulnerabilities',
  'component_measures.metric.new_reliability_issues.name': 'Issues',
  'component_measures.metric.new_software_quality_reliability_issues.name': 'Issues',
  'component_measures.metric.new_reliability_issues.detailed_name': 'New Issues',
  'component_measures.metric.new_software_quality_reliability_issues.detailed_name': 'New Issues',
  'component_measures.metric.new_maintainability_issues.name': 'Issues',
  'component_measures.metric.new_software_quality_maintainability_issues.name': 'Issues',
  'component_measures.metric.new_maintainability_issues.detailed_name': 'New Issues',
  'component_measures.metric.new_software_quality_maintainability_issues.detailed_name':
    'New Issues',
  'component_measures.metric.new_code_smells.name': 'Code smells',
  'component_measures.metric.new_code_smells.detailed_name': 'New Code Smells',
  'component_measures.metric.new_violations.name': 'Open issues',
  'component_measures.metric.new_violations.detailed_name': 'New Open Issues',
  'component_measures.metric.new_accepted_issues.name': 'Accepted issues',
  'component_measures.metric.new_accepted_issues.detailed_name': 'New Accepted Issues',
  'component_measures.metric.new_bugs.name': 'Bugs',
  'component_measures.metric.new_bugs.detailed_name': 'New Bugs',
  'component_measures.metric.security_issues.name': 'Issues',
  'component_measures.metric.software_quality_security_issues.name': 'Issues',
  'component_measures.metric.vulnerabilities.name': 'Vulnerabilities',
  'component_measures.metric.reliability_issues.name': 'Issues',
  'component_measures.metric.software_quality_reliability_issues.name': 'Issues',
  'component_measures.metric.bugs.name': 'Bugs',
  'component_measures.metric.maintainability_issues.name': 'Issues',
  'component_measures.metric.software_quality_maintainability_issues.name': 'Issues',
  'component_measures.metric.code_smells.name': 'Code smells',
  'component_measures.metric.violations.name': 'Open issues',
  'component_measures.metric.accepted_issues.name': 'Accepted issues',
  'component_measures.metric.confirmed_issues.name': 'Confirmed issues',
  'component_measures.metric.false_positive_issues.name': 'False positive issues',

  // Metrics
  'metric.releasability_effort.name': 'Total number of projects not production ready',
  'metric.releasability_effort.description': 'Total number of projects not production ready',

  //------------------------------------------------------------------------------
  //
  // CUSTOM MEASURES
  //
  //------------------------------------------------------------------------------
};
