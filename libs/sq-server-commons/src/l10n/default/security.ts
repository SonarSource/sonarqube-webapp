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

export const securityMessages = {
  //------------------------------------------------------------------------------
  //
  // AI CAPABILITIES
  //
  //------------------------------------------------------------------------------

  'ai_capabilities.title': 'AI capabilities',
  'ai_capabilities.description':
    'Enable agents to remediate tech debt, find complex security issues, and automate fix suggestions. By enabling or using AI capabilities, you agree to the <agreementLink>Primary Customer Agreement</agreementLink> and the <privacyLink>Privacy Notice</privacyLink>.',
  'ai_capabilities.enablement_badge.enabled': 'Enabled',
  'ai_capabilities.enablement_badge.not_enabled': 'Not enabled',
  'ai_capabilities_server.vortex.title': 'Vortex',
  'ai_capabilities_server.vortex.description':
    'Empower your AI agents during the Guide and Verify stages of the Agent-Centric Development Cycle (ACDC). Vortex helps reduce downstream rework, improve agent efficiency, and estimate engineering time avoided.',
  'ai_capabilities_server.vortex.guide':
    '<label>Guide:</label> Provides relevant project context, rules, and constraints before an agent writes code.',
  'ai_capabilities_server.vortex.verify':
    '<label>Verify:</label> Analyzes code written by the agent using SonarQube rules and returns findings for the agent to address before a pull request is created.',
  'ai_capabilities_server.vortex.enable.title': 'Enable Vortex',
  'ai_capabilities_server.vortex.enable.description':
    'If enabled, all projects in this instance will benefit from Vortex. By enabling Sonar Vortex, you agree to the <link>Sonar Vortex Supplemental Terms</link>.',
  'ai_capabilities_server.vortex.enabled_callout.title':
    'Vortex requires installation in each developer’s machine',
  'ai_capabilities_server.vortex.enabled_callout.installation_description':
    'Your developers can now Install Vortex for your agent using SonarQube’s plugin, CLI or MCP server. Share the Install Guide below.',
  'ai_capabilities_server.vortex.enabled_callout.dashboard_description':
    'As Vortex is installed and used, the Dashboard will be updated with the ROI, usage and adoption across this instance.',
  'ai_capabilities_server.vortex.enabled_callout.view_dashboard': 'View dashboard',
  'ai_capabilities_server.vortex.enabled_callout.install_guide': 'Install guide',
  'ai_capabilities_server.vortex.promo.badge': 'New',
  'ai_capabilities_server.vortex.promo.heading':
    'Empower your agents to produce better code with fewer tokens and reworks',
  'ai_capabilities_server.vortex.promo.contact_sales': 'Talk to sales',
  'ai_capabilities_server.vortex.promo.activate_feature': 'Activate Feature',
  'ai_capabilities_server.vortex.promo.read_docs': 'Read the docs',
  'ai_capabilities.scheduled_jobs.automatic': 'Automatic',
  'ai_capabilities.llm_providers.title': 'LLM Providers',
  'ai_capabilities.llm_providers.description':
    'Manage the LLM providers shared by all AI features.',
  'ai_capabilities.llm_providers.add': 'Add provider',
  'ai_capabilities.llm_providers.remove': 'Remove provider',
  'ai_capabilities.llm_providers.actions': 'Actions for {name}',
  'ai_capabilities.llm_providers.empty.title': 'No provider yet',
  'ai_capabilities.llm_providers.empty.description': 'Add your first one to get started.',
  'ai_capabilities.llm_providers.table.aria_label': 'Configured LLM providers',
  'ai_capabilities.llm_providers.table.provider': 'Provider',
  'ai_capabilities.llm_providers.table.valid': 'Valid',
  'ai_capabilities.llm_providers.validity.checking': 'Checking if {name} is valid',
  'ai_capabilities.llm_providers.validity.valid': '{name} is valid',
  'ai_capabilities.llm_providers.validity.invalid': '{name} is not valid: {error}',
  'ai_capabilities.llm_providers.validity.invalid.no_reason': 'the provider gave no reason',
  'ai_capabilities.llm_providers.validity.unknown': 'Cannot tell if {name} is valid',
  'ai_capabilities.llm_providers.validity.managed': '{name} is managed by Sonar',
  'ai_capabilities.llm_providers.edit': 'Edit provider',
  'ai_capabilities.llm_providers.limit_reached':
    "You've reached the limit of {count} providers. Remove one to add another.",
  'ai_capabilities.llm_providers.add.disabled_tooltip':
    'Remove a provider to add a new one (limit: {count})',
  'ai_capabilities.llm_providers.added': 'Provider added.',
  'ai_capabilities.llm_providers.updated': 'Provider updated.',
  'ai_capabilities.llm_providers.removed': 'Provider removed.',
  'ai_capabilities.llm_providers.form.add.title': 'Add a new provider',
  'ai_capabilities.llm_providers.form.edit.title': 'Edit provider',
  'ai_capabilities.llm_providers.form.provider': 'Provider',
  'ai_capabilities.llm_providers.form.provider.placeholder': 'Select provider',
  'ai_capabilities.llm_providers.form.name': 'Name',
  'ai_capabilities.llm_providers.form.name.placeholder': 'A name to identify this connection',
  'ai_capabilities.llm_providers.form.secret.placeholder':
    '{0} (leave blank to keep the current value)',
  'ai_capabilities.llm_providers.form.cancel': 'Cancel',
  'ai_capabilities.llm_providers.form.submit.add': 'Add provider',
  'ai_capabilities.llm_providers.form.submit.save': 'Save',
  'ai_capabilities.llm_providers.form.error.connection':
    "Couldn't connect to this provider. Check your details and try again.",
  'ai_capabilities.llm_providers.error.retry': 'Retry',
  'ai_capabilities.llm_providers.headers.name': 'Header name',
  'ai_capabilities.llm_providers.headers.value': 'Value',
  'ai_capabilities.llm_providers.headers.secret': 'Secret',
  'ai_capabilities.llm_providers.headers.delete': 'Delete header {name}',
  'ai_capabilities.llm_providers.headers.add': 'Add custom header',
  'ai_capabilities.llm_providers.supported_models.title':
    'Make sure your provider offers a supported model',
  'ai_capabilities.llm_providers.supported_models.description':
    'Supported models differ by capability:',
  'ai_capabilities.llm_providers.supported_models.hunter_agent': 'Hunter Agent — Claude Opus 4.8',
  'ai_capabilities.llm_providers.supported_models.remediation_agent':
    'Remediation Agent — Claude Opus models, GPT-5.3 Codex, GPT-5.5, GPT-5.6 Sol',
  'ai_capabilities.llm_providers.delete.modal.title': 'Remove provider?',
  'ai_capabilities.llm_providers.delete.modal.description':
    'The provider "{name}" will be removed. AI features using it will stop working until another provider is selected.',
  'ai_capabilities.llm_providers.delete.modal.confirm': 'Remove provider',
  'ai_capabilities.remediation_agent.title': 'Remediation Agent',
  'ai_capabilities.remediation_agent.description':
    'An AI-powered agent that automatically proposes fixes for your issues — creating pull requests for your review and approval. {link}',
  'ai_capabilities.remediation_agent.description.link': 'Learn more in our documentation',
  'ai_capabilities.remediation_agent.description.terms':
    'By enabling or using Remediation Agent, you agree to the <link>Remediation Agent Terms</link>.',
  'ai_capabilities.remediation_agent.provider.title': 'Choose your provider',
  'ai_capabilities.remediation_agent.provider.help':
    'Pick a provider compatible with Remediation Agent. Manage providers in <link>LLM providers</link>.',
  'ai_capabilities.remediation_agent.enable_agent.title': 'Enable agent',
  'ai_capabilities.remediation_agent.enable_agent.disabled_reason': 'Choose a provider first',
  'ai_capabilities.remediation_agent.manual.title': 'Manual remediation',
  'ai_capabilities.remediation_agent.manual.description':
    "Reduce technical debt by selecting issues from your project's issues list and letting the agent propose fixes in a pull request.",
  'ai_capabilities.remediation_agent.scheduled.title': 'Automated remediation',
  'ai_capabilities.remediation_agent.scheduled.description':
    'Reduce technical debt by automatically fixing high-priority issues on your main branch on a schedule.',
  'ai_capabilities.remediation_agent.scheduled.save_success':
    'Scheduled remediation settings saved successfully.',
  'ai_capabilities.remediation_agent.scheduled.save_error':
    'Something went wrong. Failed to save the schedule configuration.',
  'hunter_agent.page': 'Hunter Agent',
  'hunter_agent.enable': 'Enable agent',
  'hunter_agent.description':
    'The SonarQube Hunter Agent is a high-precision detection engine designed to uncover complex, context-dependent problems, complementing your foundational SAST by using playbook-driven reasoning.',
  'ai_capabilities_server.hunter_agent.provider.title': 'Choose your provider',
  'ai_capabilities_server.hunter_agent.provider.help':
    'Pick a provider compatible with Hunter Agent. Manage providers in <link>LLM providers</link>.',
  'ai_capabilities_server.hunter_agent.configure.disabled_reason':
    'Choose a provider and model first.',
  'ai_capabilities_server.hunter_agent.legal_terms_link':
    'By enabling or using the Hunter Agent, you agree to the <link>Hunter Agent Supplemental Terms</link>.',
  'hunter_agent.daily_analysis.title': 'Allow project admins to run scans.',
  'hunter_agent.daily_analysis.description':
    'Enable the Hunter Agent to allow project administrators to run scans on demand or schedule recurring scans of their projects.',
  'hunter_agent.instance_not_enabled.title': 'The Hunter Agent is disabled on this instance',
  'hunter_agent.instance_not_enabled.description.admin':
    'Enable the Hunter Agent to uncover complex, context-dependent problems, complementing your foundational SAST by using playbook-driven reasoning.',
  'hunter_agent.instance_not_enabled.description.member':
    'Ask an administrator of this instance to enable the Hunter Agent to uncover complex, context-dependent problems, complementing your foundational SAST by using playbook-driven reasoning.',
  'hunter_agent.instance_not_enabled.enable_action': 'Enable Hunter Agent',
  'hunter_agent.onboarding.title': 'Hunt Deeper. Secure Completely.',
  'hunter_agent.onboarding.description':
    'Your foundational SAST is essential - but complex, behavioral flaws still slip through. The <b>SonarQube Hunter Agent</b> layers on top of your baseline to catch the sophisticated vulnerabilities standard automation misses.',
  'hunter_agent.onboarding.server.description.member':
    'Ask an instance administrator to talk to sales and add the <b>SonarQube Hunter Agent</b> on top of your baseline to catch the sophisticated vulnerabilities standard automation misses.',
  'hunter_agent.onboarding.bullet.1':
    '<b>Advanced Workflow Protection:</b> Stops business logic bypasses and resource throttling errors.',
  'hunter_agent.onboarding.bullet.2':
    '<b>Broken Access Control:</b> Deep-dive detection for IDOR and authorization flaws.',
  'hunter_agent.onboarding.bullet.3':
    '<b>Auth & Session Security:</b> Catches session fixation and weak recovery flows.',
  'hunter_agent.onboarding.contact_sales': 'Contact sales',
  'hunter_agent.activity.elapsed': 'elapsed',
  'hunter_agent.activity.failure.analysis_timeout':
    'The scan timed out. Contact your SonarQube administrator.',
  'hunter_agent.activity.failure.generic': 'The scan failed. Contact your SonarQube administrator.',
  'hunter_agent.activity.failure.llm_not_accessible':
    'Could not access the LLM. Ask your SonarQube administrator to check the LLM configuration, credentials, and outbound access from the agent to the LLM provider.',
  'hunter_agent.activity.failure.result_publication_failed':
    'Could not publish results. Ask your SonarQube administrator to check the agent services and their connection to SonarQube.',
  'hunter_agent.activity.failure.runtime_unavailable':
    'The agent runtime is unavailable. Ask your SonarQube administrator to check the agent services.',
  'hunter_agent.activity.failure.scm_branch_not_found':
    'The branch could not be found in the source code provider. Check that it still exists.',
  'hunter_agent.activity.failure.scm_credentials_rejected':
    'The source code provider rejected the credentials. Update the connection credentials and try again.',
  'hunter_agent.activity.failure.unsupported_scm_provider':
    "This project's source code provider is not supported by the Hunter Agent.",
  'hunter_agent.activity.failure.repository_too_large':
    "The repository exceeds the Hunter Agent's 3 GB size limit. Reduce the repository size and try again.",
  'hunter_agent.activity.no_data.description':
    'When the Hunter Agent runs on this project, scan details will appear here.',
  'hunter_agent.activity.no_data.title': 'No Hunter Agent activity yet on this project',
  'hunter_agent.activity.not_started': 'Not started',
  'hunter_agent.activity.run_completed': 'Latest run completed',
  'hunter_agent.activity.no_new_findings': 'No new findings',
  'hunter_agent.activity.project_not_applicable':
    'Scan skipped: no relevant attack surface was identified in this project.',
  'hunter_agent.activity.project_not_applicable.description': 'No relevant attack surface',
  'hunter_agent.activity.run_failed': 'Latest run failed',
  'hunter_agent.activity.run_in_progress': 'Run in progress',
  'hunter_agent.activity.started_on': 'Started on {date}',
  'hunter_agent.activity.stepper.analyzing': 'Scanning',
  'hunter_agent.activity.stepper.analyzing.tooltip':
    'Executes deep contextual scans to detect critical flaws like IDOR, broken access control, and business logic vulnerabilities.',
  'hunter_agent.activity.stepper.cloning': 'Cloning',
  'hunter_agent.activity.stepper.cloning.tooltip':
    'Securely clones the target repository to grant the AI engine direct access to the source code.',
  'hunter_agent.activity.stepper.consolidating': 'Consolidating',
  'hunter_agent.activity.stepper.consolidating.tooltip':
    'Aggregates and deduplicates findings from all specialized AI sub-agents into a single, unified issue list.',
  'hunter_agent.activity.stepper.exploring': 'Exploring',
  'hunter_agent.activity.stepper.exploring.tooltip':
    'Analyzes the application architecture to map potential attack surfaces and build a comprehensive threat model.',
  'hunter_agent.activity.stepper.reporting': 'Reporting',
  'hunter_agent.activity.stepper.reporting.tooltip':
    'Automatically exports and logs validated vulnerabilities directly into SonarQube for seamless tracking and remediation.',
  'hunter_agent.activity.table.credits': 'Scan units consumed',
  'hunter_agent.agent_activity_message':
    'In progress and completed scans can be found in the <link>Hunter Agent run history</link>.',
  'hunter_agent.branch_not_scanned.description':
    'Scan this branch to uncover complex, context-dependent problems in your codebase.',
  'hunter_agent.branch_not_scanned.title': "This branch hasn't been scanned yet",
  'hunter_agent.config.update_error': 'Failed to update Hunter Agent configuration.',
  'hunter_agent.config.updated': 'Hunter Agent configuration updated.',
  'hunter_agent.credit_estimation.balance_too_low.branch':
    'Your scan unit balance is too low to run a scan on {branch}.',
  'hunter_agent.credit_estimation.branch_not_analyzed':
    'This branch must be analyzed by SonarQube before its scan cost can be estimated.',
  'hunter_agent.credit_estimation.branch_size': 'Branch size: {size} ({ncloc} lines of code)',
  'hunter_agent.credit_estimation.calculating': 'Calculating scan units needed',
  'hunter_agent.credit_estimation.may_vary':
    'Estimate based on current lines of code. Actual usage per scheduled scan may vary as the branch size changes.',
  'hunter_agent.credit_estimation.title': 'Estimated usage per scan',
  'hunter_agent.credit_estimation.units_needed': '{count, plural, one {unit} other {units}} needed',
  'hunter_agent.daily_analysis.project.description': 'Recurring background scans',
  'hunter_agent.daily_analysis.project.description2':
    'Keep findings fresh by scanning automatically on a regular cadence.',
  'hunter_agent.daily_analysis.project.frequency_label': 'Frequency',
  'hunter_agent.daily_analysis.project.last_day_of_month': 'Runs on last day of month.',
  'hunter_agent.daily_analysis.project.save_button': 'Save schedule',
  'hunter_agent.daily_analysis.project.title': 'Scheduled scans',
  'hunter_agent.latest_job_status.last_scan': 'Last scan {date}',
  'hunter_agent.latest_job_status.next_scan': 'Next scan {date} on branch {branch}',
  'hunter_agent.latest_job_status.no_scans_yet': 'No scans yet.',
  'hunter_agent.latest_job_status.no_scheduled_scans': 'No scheduled scans',
  'hunter_agent.learn_more': 'Learn more about Hunter Agent',
  'hunter_agent.main_branch_not_scanned.description':
    'Scanning the main branch may surface complex issues that block your next release.',
  'hunter_agent.main_branch_not_scanned.recommendation':
    'You may prefer to run the agent on a dedicated branch to review and remediate issues safely.',
  'hunter_agent.manage_scan_schedule': 'Manage scheduling',
  'hunter_agent.not_available_for_branch.action': 'Go to main branch',
  'hunter_agent.not_available_for_branch.description':
    'Select a long-lived branch to run the Hunter Agent.',
  'hunter_agent.not_available_for_branch.title':
    'Hunter Agent not available for PRs and short-lived branches',
  'hunter_agent.project_not_bound.action': 'Set up project binding',
  'hunter_agent.project_not_bound.description.admin':
    'Set up project binding before running the Hunter Agent.',
  'hunter_agent.project_not_bound.description.member':
    'Contact a project administrator to set up project binding before running the Hunter Agent.',
  'hunter_agent.project_not_bound.title': "This project isn't bound to a repository",
  'hunter_agent.results.card.accepted_issues': 'Accepted issues',
  'hunter_agent.results.card.accepted_issues_description':
    "Won't fix for now. They won't affect the quality gate.",
  'hunter_agent.results.card.authentication_session': 'Authentication & session',
  'hunter_agent.results.card.broken_access_control': 'Broken access control',
  'hunter_agent.results.card.business_logic': 'Business logic',
  'hunter_agent.results.card.confirmed_issues': 'Confirmed issues',
  'hunter_agent.results.card.confirmed_issues_description':
    'Valid issues to fix. They may affect the quality gate.',
  'hunter_agent.results.card.open_issues': 'Open issues',
  'hunter_agent.results.card.open_issues_description':
    'To review and qualify. They may affect the quality gate.',
  'hunter_agent.results.heading': 'Latest scan results',
  'hunter_agent.results.issue_count_suffix': '{count, plural, one {issue} other {issues}}',
  'hunter_agent.results.most_severe': 'Most severe:',
  'hunter_agent.results.no_open_issues': 'Nice job! There are no open issues.',
  'hunter_agent.results.tooltip.authentication_session':
    'Broken authentication, session fixation, non-expiring sessions, weak password recovery, missing multi-factor authentication (MFA), and brute-force gaps.',
  'hunter_agent.results.tooltip.broken_access_control':
    'Insecure direct object references (IDOR), missing or incorrect authorization checks, privilege escalation, sensitive data exposure, and cross-site request forgery (CSRF).',
  'hunter_agent.results.tooltip.business_logic':
    'Skipping required workflow steps, abusing repeatable actions, and missing rate limits.',
  'hunter_agent.results.tooltip.documentation': 'Learn more in the documentation',
  'hunter_agent.results.view_all_findings': 'View all findings',
  'hunter_agent.run_now.branch_label': 'Branch to scan',
  'hunter_agent.run_now.error': 'Could not start the scan. Please try again.',
  'hunter_agent.run_now.error.422':
    'A scan is already in progress. Please wait for it to complete.',
  'hunter_agent.run_now.success':
    'Scan started. Track its progress on the Hunter Agent "Run history" tab.',
  'hunter_agent.run_now_button': 'Scan now',
  'hunter_agent.run_now_button.not_admin.tooltip': 'Only project administrators can start scans.',
  'hunter_agent.scan_modal.about_to_scan.branch': 'You are about to run a scan on {branch}.',
  'hunter_agent.scan_modal.balance_too_low':
    'Your scan unit balance is too low to run a scan on this branch.',
  'hunter_agent.scan_modal.branch_not_analyzed.branch':
    '{branch} must be analyzed by SonarQube before it can be scanned.',
  'hunter_agent.scan_modal.contact_sales': 'Contact sales',
  'hunter_agent.scan_modal.contact_sales_hint':
    'Contact Sonar sales to increase your scan units balance.',
  'hunter_agent.scan_modal.setup_binding': 'Set up binding',
  'hunter_agent.scan_modal.title': 'Confirm scan',
  'hunter_agent.scan_modal.title.balance_too_low': 'Balance too low',
  'hunter_agent.credit_estimation.base_units_available':
    '{count, plural, one {unit available} other {units available}}',
  'hunter_agent.credit_estimation.overage_units_available':
    '{count, plural, one {overage unit available} other {overage units allowed}}',
  'hunter_agent.credit_estimation.overage_units_used':
    '{count, plural, one {overage unit used} other {overage units used}}',
  'hunter_agent.scan_modal.activate_overage': 'Activate overage',
  'hunter_agent.scan_modal.activate_overage_hint.admin':
    'Activate overage to exceed your yearly limit, or <salesLink>talk to sales</salesLink> to increase your balance.',
  'hunter_agent.scan_modal.activate_overage_hint.member':
    'Ask an instance administrator to activate overage to exceed your limit, or <salesLink>talk to sales</salesLink> to increase your balance.',
  'hunter_agent.scan_modal.increase_overage_hint.admin':
    'Increase your overage limit, or <salesLink>talk to sales</salesLink> to increase your balance.',
  'hunter_agent.scan_modal.increase_overage_hint.member':
    'Ask an instance administrator to increase the overage limit, or <salesLink>talk to sales</salesLink> to increase your balance.',
  'hunter_agent.scan_modal.manage_overage': 'Manage overage',
  'hunter_agent.scan_modal.overage_about_to_scan.branch':
    'This scan of {branch} will use overage scan units.',
  'hunter_agent.scan_modal.overage_invoice_hint':
    'This will be added to your next invoice. You may also <salesLink>talk to sales</salesLink> to increase your balance.',
  'hunter_agent.scan_modal.overage_limit_reached':
    'Your scan unit balance is too low and you reached your overage limit.',
  'hunter_agent.schedule.manage_overage': 'Manage overage',
  'hunter_agent.schedule.overage_available':
    '{count, number} overage scan {count, plural, one {unit} other {units}} available',
  'hunter_agent.schedule.overage_description':
    'Once you reach your plan’s scan limit, scheduled scans will automatically use overage units up to your set limit. Additional charges will apply to your next invoice.',
  'hunter_agent.schedule.overage_enabled': 'Hunter Agent overage enabled',
  'hunter_agent.tab_activity': 'Run history',
  'hunter_agent.tab_activity.heading': 'Past jobs',
  'hunter_agent.tab_results': 'Scan results',
  'ai_capabilities.remediation_agent.scheduled.frequency': 'Frequency',
  'ai_capabilities.remediation_agent.scheduled.frequency.at': 'at',
  'ai_capabilities.remediation_agent.scheduled.frequency.on': 'on',
  'ai_capabilities.remediation_agent.scheduled.frequency.daily': 'Daily',
  'ai_capabilities.remediation_agent.scheduled.frequency.weekly': 'Weekly',
  'ai_capabilities.remediation_agent.scheduled.next_run_hint': '{date} at {time} {timeZone}',
  'ai_capabilities.remediation_agent.scheduled.day_of_week': 'Day of week',
  'ai_capabilities.remediation_agent.scheduled.hour': 'Hour',
  'ai_capabilities.remediation_agent.scheduled.timezone': 'Timezone',
  'ai_capabilities.remediation_agent.scheduled.timezone.placeholder': 'Europe/Paris (UTC+2)',
  'ai_capabilities.remediation_agent.scheduled.run_schedule': 'Run schedule',
  'ai_capabilities.remediation_agent.scheduled.pause_if_open_prs_reach':
    'Pause when open PRs reach',
  'ai_capabilities.remediation_agent.scheduled.pause_if_open_prs_reach.tooltip':
    'The agent pauses creating new PRs when this number is reached. Existing PRs from other sources are not counted.',
  'ai_capabilities.remediation_agent.scheduled.pause_if_open_prs_reach.tooltip.aria_label':
    'More info',
  'ai_capabilities.remediation_agent.scheduled.dont_pause': "Don't pause",
  'ai_capabilities.remediation_agent.scheduled.run_summary':
    'Next run: {nextRun} · Will open 1 PR for up to 5 issues in every selected repo · {pauseInfo}',
  'ai_capabilities.remediation_agent.scheduled.run_summary.dont_pause': "Doesn't pause",
  'ai_capabilities.remediation_agent.scheduled.run_summary.pauses_when':
    'Pauses when {maxOpenPRs} PRs are open',
  'ai_capabilities.remediation_agent.scheduled.project_selection.title':
    'Choose which projects should have automated remediation',
  'ai_capabilities.remediation_agent.scheduled.project_selection.all.label': 'All projects',
  'ai_capabilities.remediation_agent.scheduled.project_selection.all.help':
    'Enable on all existing and future projects',
  'ai_capabilities.remediation_agent.scheduled.project_selection.some.label':
    'Only selected projects',
  'ai_capabilities.remediation_agent.scheduled.project_selection.some.help':
    'Enable on selected projects only',
  'ai_capabilities.remediation_agent.scheduled.project_selection.some.note':
    'Automated remediation will not be automatically enabled on new projects.',
  'ai_capabilities.remediation_agent.scheduled.monday': 'Monday',
  'ai_capabilities.remediation_agent.scheduled.tuesday': 'Tuesday',
  'ai_capabilities.remediation_agent.scheduled.wednesday': 'Wednesday',
  'ai_capabilities.remediation_agent.scheduled.thursday': 'Thursday',
  'ai_capabilities.remediation_agent.scheduled.friday': 'Friday',
  'ai_capabilities.remediation_agent.scheduled.saturday': 'Saturday',
  'ai_capabilities.remediation_agent.scheduled.sunday': 'Sunday',
  'ai_capabilities.enabled': 'Enabled',
  'ai_capabilities.disabled': 'Disabled',
  'ai_capabilities.project.manual.available':
    'Manual remediation is enabled for your SonarQube instance.',
  'ai_capabilities.project.manual.not_available':
    'Manual remediation is not enabled for your SonarQube instance. Please contact your administrator to enable the feature.',
  'ai_capabilities.project.manual.not_available.admin':
    'Manual remediation is not enabled for your SonarQube instance.',
  'ai_capabilities.project.manual.not_available.admin_cta': 'Enable Manual remediation',

  'ai_capabilities.remediation_agent.add_on_promo.badge': 'New',
  'ai_capabilities.remediation_agent.add_on_promo.heading': 'Your backlog, fixed while you build.',
  'ai_capabilities.remediation_agent.add_on_promo.body':
    'Remediation Agent turns issues into ready-to-review pull requests, so tech debt clears in the background. Your team just reviews and merges.',
  'ai_capabilities.remediation_agent.add_on_promo.bullet.manual.label': 'Manual',
  'ai_capabilities.remediation_agent.add_on_promo.bullet.manual':
    '{label}: Pick issues from your backlog and let the agent propose fixes in a PR.',
  'ai_capabilities.remediation_agent.add_on_promo.bullet.scheduled.label': 'Scheduled',
  'ai_capabilities.remediation_agent.add_on_promo.bullet.scheduled':
    '{label}: Auto-create PRs to fix backlog issues on a cadence.',
  'ai_capabilities.remediation_agent.add_on_promo.bullet.pr.label': 'On failing PRs',
  'ai_capabilities.remediation_agent.add_on_promo.bullet.pr':
    '{label}: When the Quality Gate fails, the agent proposes fixes before you merge.',
  'ai_capabilities.remediation_agent.add_on_promo.cta.sales': 'Talk to sales',
  'ai_capabilities.remediation_agent.add_on_promo.cta.docs': 'Read the docs',
  'ai_capabilities.remediation_agent.add_on_promo.illustration_alt': '',
  'ai_capabilities.remediation_agent.consumption.warning.title':
    'Remediation Agent nearing its monthly limit',
  'ai_capabilities.remediation_agent.consumption.danger.title':
    'Remediation Agent monthly limit reached',
  'ai_capabilities.remediation_agent.consumption.activate.warning.body.admin':
    'Your instance has used {used} of its {limit} monthly Remediation Agent suggestions. Activate overage now{resetDate, select, none {} other {, or wait until it resets on {resetDate}}}.',
  'ai_capabilities.remediation_agent.consumption.activate.warning.body.nonadmin':
    'Your instance has used {used} of its {limit} monthly Remediation Agent suggestions. Contact an instance admin to activate overage and avoid interruptions{resetDate, select, none {} other { before it resets on {resetDate}}}.',
  'ai_capabilities.remediation_agent.consumption.activate.danger.body.admin':
    'Your instance has used all {limit} monthly Remediation Agent suggestions. Activate overage to resume now{resetDate, select, none {} other {, or wait until it resets on {resetDate}}}.',
  'ai_capabilities.remediation_agent.consumption.activate.danger.body.nonadmin':
    'Your instance has used all {limit} monthly Remediation Agent suggestions, so new jobs are paused. Contact an instance admin to activate overage{resetDate, select, none {} other {, or wait until it resets on {resetDate}}}.',
  'ai_capabilities.remediation_agent.consumption.manage.warning.body.admin':
    'Your instance has used {used} of its {limit} Remediation Agent overage credits. Increase overage to avoid interruptions{resetDate, select, none {} other { before it resets on {resetDate}}}.',
  'ai_capabilities.remediation_agent.consumption.manage.warning.body.nonadmin':
    'Your instance has used {used} of its {limit} Remediation Agent overage credits. Contact an instance admin to increase overage and avoid interruptions{resetDate, select, none {} other { before it resets on {resetDate}}}.',
  'ai_capabilities.remediation_agent.consumption.manage.danger.body.admin':
    'Your instance has used all {limit} monthly Remediation Agent overage credits, so new jobs are paused. Increase overage to resume now{resetDate, select, none {} other {, or wait until it resets on {resetDate}}}.',
  'ai_capabilities.remediation_agent.consumption.manage.danger.body.nonadmin':
    'Your instance has used all {limit} monthly Remediation Agent overage credits, so new jobs are paused. Contact an instance admin to increase overage and avoid interruptions{resetDate, select, none {} other { before it resets on {resetDate}}}.',
  'ai_capabilities.remediation_agent.consumption.cta.activate': 'Activate overage',
  'ai_capabilities.remediation_agent.consumption.cta.manage': 'Manage overage',
  'ai_capabilities.remediation_agent.consumption.no_overage.warning.body':
    'Your instance has used {used} of its {limit} monthly Remediation Agent suggestions. New jobs will pause once the limit is reached{resetDate, select, none {} other {, until it resets on {resetDate}}}.',
  'ai_capabilities.remediation_agent.consumption.no_overage.danger.body':
    'Your instance has used all {limit} monthly Remediation Agent suggestions, so new jobs are paused{resetDate, select, none {} other { until they reset on {resetDate}}}.',
  'ai_capabilities.remediation_agent.issue.assign_to_agent.limit_reached_toggletip':
    'Monthly limit reached. New Remediation Agent jobs are paused.',
  'ai_capabilities.project.not_available':
    'Automated remediation is not enabled for this project. Please contact your administrator to enable the feature.',
  'ai_capabilities.project.not_available.admin':
    'Automated remediation is not enabled for this project.',
  'ai_capabilities.project.not_available.admin_cta': 'Enable Automated remediation',
  'ai_capabilities.project.remediation_agent.description':
    'This setting allows project administrators to customize the automated schedule for their project. The default can be adjusted in the {link}.',
  'ai_capabilities.project.remediation_agent.settings_link': 'AI capabilities settings',
  'ai_capabilities.project.remediation_agent.use_default': 'Use default schedule',
  'ai_capabilities.project.remediation_agent.customize': 'Customize for this project',
  'ai_capabilities.project.remediation_agent.customize.description':
    'Override the default schedule with a custom frequency for this project.',
  'ai_capabilities.project.remediation_agent.run_summary':
    'Next run: {nextRun} · Will open 1 PR for up to 5 issues in this repo · {pauseInfo}',
  'ai_capabilities.project.remediation_agent.update.success': 'Automated scheduler updated.',
  'ai_capabilities.project.remediation_agent.disabled.success':
    'Automated scheduler has been disabled for this project.',
  'ai_capabilities.project.remediation_agent.reset.success':
    'The project will use the default schedule.',
  'ai_capabilities.project.remediation_agent.reset.error':
    'Something went wrong. Failed to update the project configuration.',
  'ai_capabilities.project.default_schedule_summary':
    'Default schedule: {frequency} at {hour} {timezone}',
  'ai_capabilities.project.default_schedule_summary.weekly':
    'Default schedule: {frequency} on {dayOfWeek} at {hour} {timezone}',
  'ai_capabilities.project.max_open_prs_summary': 'Max open PRs: {count}',
  'ai_capabilities.project.remediation_agent.not_bound':
    "Remediation Agent is not enabled for this project. Please contact your organization's admin to enable Remediation Agent.",
  'ai_capabilities.project.remediation_agent.not_bound.admin':
    'Remediation Agent is not enabled for this project.',
  'ai_capabilities.project.remediation_agent.not_bound.admin_cta':
    'Enable Remediation Agent for this project',
  'ai_capabilities.project.remediation_agent.project_not_bound_to_scm':
    "This project isn't bound to a repository. Contact your organization admin to set up project binding so Remediation Agent can run.",
  'ai_capabilities.project.remediation_agent.project_not_bound_to_scm.admin':
    "This project isn't bound to a repository.",
  'ai_capabilities.project.remediation_agent.project_not_bound_to_scm.admin_cta':
    'Set up project binding',

  // DevOps Platform permission warning — surfaces the outcome of
  // GET /api/v2/dop-translation/permission-checks (see SONAR-31624/31625/31628).
  'ai_capabilities.remediation_agent.issue.assign_to_agent.permission_blocked_toggletip':
    "Remediation Agent can't run on this project's DevOps Platform. See the warning above for details.",
  'ai_capabilities.remediation_agent.issue.assign_to_agent.info_toggletip':
    'Select issues to have Remediation Agent fix them and open pull requests on your behalf. Up to {maxIssues} issues per run.',
  'ai_capabilities.remediation_agent.issue.assign_to_agent.info_toggletip.secondary':
    'Only supported languages and rules apply.',
  'ai_capabilities.remediation_agent.issue.assign_to_agent.info_toggletip.aria_label':
    'About Assign to Agent',
  'ai_capabilities.remediation_agent.dop_permission_warning.update_permissions_cta':
    'Update permissions',
  'ai_capabilities.remediation_agent.dop_permission_warning.required_permissions_link':
    'required permissions',
  'ai_capabilities.remediation_agent.dop_permission_warning.connections.summary':
    '{count, plural, one {# connection} other {# connections}}',
  'ai_capabilities.remediation_agent.dop_permission_warning.connections.show': 'Show',
  'ai_capabilities.remediation_agent.dop_permission_warning.connections.hide': 'Hide',
  'ai_capabilities.remediation_agent.dop_permission_warning.dop_row.status.sufficient': 'OK',
  'ai_capabilities.remediation_agent.dop_permission_warning.dop_row.status.insufficient':
    'Missing permissions',
  'ai_capabilities.remediation_agent.dop_permission_warning.dop_row.status.check_failed':
    'Check failed',
  'ai_capabilities.remediation_agent.dop_permission_warning.dop_row.status.unknown':
    'Cannot verify',
  'ai_capabilities.remediation_agent.dop_permission_warning.dop_row.status.unsupported_token_type':
    'Wrong token type',

  // Yellow banner (UNKNOWN — Azure DevOps advisory). One copy across all scopes.
  'ai_capabilities.remediation_agent.dop_permission_warning.yellow.title':
    'Check your Azure DevOps permissions',
  'ai_capabilities.remediation_agent.dop_permission_warning.yellow.description':
    "We can't verify Azure DevOps permissions automatically. Make sure your personal access token has Code (Read and write) and Pull Request (Contribute) before running the agent. See the {link}",

  // Red banners (INSUFFICIENT / CHECK_FAILED). Split by scope only — instance vs project.
  'ai_capabilities.remediation_agent.dop_permission_warning.red.instance.title':
    'Remediation Agent is missing permissions',
  'ai_capabilities.remediation_agent.dop_permission_warning.red.instance.description':
    "Remediation Agent doesn't have the permissions it needs on one or more DevOps Platforms to clone repositories, create branches, and open pull requests. Please see the {link}.",
  'ai_capabilities.remediation_agent.dop_permission_warning.red.project.title':
    'Remediation Agent is missing permissions',
  'ai_capabilities.remediation_agent.dop_permission_warning.red.project.description':
    "Remediation Agent is connected to {platform}, but doesn't have all the permissions it needs to clone repositories, create branches, and open pull requests. Please see the {link}.",

  // Token-type banner (UNSUPPORTED_TOKEN_TYPE — a GitLab integration bound with a Project or
  // Group Access Token instead of a Personal Access Token). Split by scope only — instance vs
  // project.
  'ai_capabilities.remediation_agent.dop_permission_warning.token_type.instance.title':
    'Remediation Agent needs a personal access token',
  'ai_capabilities.remediation_agent.dop_permission_warning.token_type.instance.description':
    'Remediation Agent found one or more GitLab integrations using a Project or Group Access Token. It needs a Personal Access Token belonging to a real GitLab user to clone repositories, create branches, and open pull requests. Please see the {link}.',
  'ai_capabilities.remediation_agent.dop_permission_warning.token_type.project.title':
    'Remediation Agent needs a personal access token',
  'ai_capabilities.remediation_agent.dop_permission_warning.token_type.project.description':
    'Remediation Agent is connected to {platform} using a Project or Group Access Token, but it needs a Personal Access Token belonging to a real GitLab user to clone repositories, create branches, and open pull requests. Please see the {link}.',

  //------------------------------------------------------------------------------
  //
  // VORTEX DASHBOARD
  //
  //------------------------------------------------------------------------------

  'vortex_dashboard.title': 'Vortex dashboard',
  'vortex_dashboard.nav_item': 'Vortex',
  'vortex_dashboard.description.paragraph1':
    "Vortex saves engineering time and tokens by providing your agents with context (Guide) before code is written, and fixing issues (Verify) as it's being written.",
  'vortex_dashboard.description.paragraph2':
    "This dashboard breaks down each project's savings as Vortex is being used. Read our documentation to <link>learn more about Vortex</link>.",
  'vortex_dashboard.configuration': 'Configuration',
  'vortex_dashboard.period.label': 'Period',
  'vortex_dashboard.period.last_7_days': 'Last 7 days',
  'vortex_dashboard.period.last_30_days': 'Last 30 days',
  'vortex_dashboard.period.last_90_days': 'Last 90 days',
  'vortex_dashboard.period.last_365_days': 'Last 365 days',

  'vortex_dashboard.install_guide_callout.title': 'You can now start using Vortex',
  'vortex_dashboard.install_guide_callout.description':
    'Your instance has enabled Vortex for all projects. Follow our install guide below to start saving.',
  'vortex_dashboard.install_guide_callout.action': 'Vortex install guide',

  'vortex_dashboard.impact_roi.title': 'Impact and ROI',
  'vortex_dashboard.impact_roi.error': 'Unable to load this metric right now.',
  'vortex_dashboard.impact_roi.calculation_link': 'How is this calculated?',
  'vortex_dashboard.impact_roi.calculation_summary': 'Calculation summary',
  'vortex_dashboard.impact_roi.calculation_label': 'Calculation',

  'vortex_dashboard.impact_roi.guide.heading': 'Vortex Guide',
  'vortex_dashboard.impact_roi.guide.value': '± {value}',
  'vortex_dashboard.impact_roi.guide.value_label': 'prevented issues',
  'vortex_dashboard.impact_roi.guide.tooltip_title': 'Prevented issues (Guide)',
  'vortex_dashboard.impact_roi.guide.tooltip_description':
    '<p>Prevented issues are an estimated outcome of Vortex Guide in Sonar’s Agent Centric Development Cycle (ACDC).</p><p>Vortex Guide gives AI agents relevant context, guardrails, standards, and constraints to help their output meet your organization’s requirements before, and as your agent writes code.</p><p>Without this context, agents may produce functionally correct code that does not align with your coding standards, architecture, or security posture.</p>',

  'vortex_dashboard.impact_roi.verify.heading': 'Vortex Verify',
  'vortex_dashboard.impact_roi.verify.value_label': 'resolved issues',
  'vortex_dashboard.impact_roi.verify.tooltip_title': 'Resolved issues (Verify)',
  'vortex_dashboard.impact_roi.verify.tooltip_description':
    '<p>Resolved issues are a measured outcome of Vortex Verify in Sonar’s Agent Centric Development Cycle (ACDC).</p><p>As an agent writes code, Vortex Verify analyzes the change using SonarQube rules and returns findings for the agent to address.</p><p>An issue is counted as resolved when it is found in one analysis and no longer appears after the agent updates the code and Vortex verifies it again.</p><p>This helps address issues before the change reaches a pull request, reducing downstream rework.</p>',

  'vortex_dashboard.impact_roi.engineering_time.heading': 'Engineering time saved',
  'vortex_dashboard.impact_roi.engineering_time.value_label': 'hours saved',
  'vortex_dashboard.impact_roi.engineering_time.tooltip_title': 'Estimated time saved',
  'vortex_dashboard.impact_roi.engineering_time.tooltip_description':
    '<p>An estimate of engineering time Vortex helped avoid by catching or preventing issues earlier.</p><p>It uses Sonar’s remediation effort and conservative assumptions about review and rework.</p>',

  'vortex_dashboard.impact_roi.tokens.heading': 'Tokens saved',
  'vortex_dashboard.impact_roi.tokens.value_label': 'tokens saved',
  'vortex_dashboard.impact_roi.tokens.tooltip_title': 'Estimated tokens saved',
  'vortex_dashboard.impact_roi.tokens.tooltip_description':
    'An estimate of tokens Vortex helped avoid by providing focused context instead of requiring the agent to explore more of the codebase.',

  'vortex_dashboard.impact_roi.badge.estimate': 'Estimate',
  'vortex_dashboard.impact_roi.badge.measured': 'Measured',
  'vortex_dashboard.impact_roi.badge.estimate_description':
    'This value is calculated from observed Vortex activity and conservative assumptions about what may have happened without it. It is not a directly observed outcome.',
  'vortex_dashboard.impact_roi.badge.measured_description':
    'This value is based on activity Vortex directly observed, such as an issue resolved between analyses or rules supplied to the agent.',

  'vortex_dashboard.impact_roi.engineering_time_modal.title':
    'How engineering time saved is calculated',
  'vortex_dashboard.impact_roi.engineering_time_modal.intro':
    'Engineering time saved is an estimate of rework Vortex helped avoid before code reached review or CI.',
  'vortex_dashboard.impact_roi.engineering_time_modal.methodology':
    'We calculate it from Vortex Guide and Verify activity using Sonar rule remediation effort and conservative assumptions. It is not a measure of individual developer time.',
  'vortex_dashboard.impact_roi.engineering_time_modal.total_label': 'Total estimated time saved',
  'vortex_dashboard.impact_roi.engineering_time_modal.total_formula':
    'Guide contribution + Verify contribution',
  'vortex_dashboard.impact_roi.engineering_time_modal.guide_contribution_title':
    'Guide contribution (Estimated prevention)',
  'vortex_dashboard.impact_roi.engineering_time_modal.guide_contribution_description':
    'When Guide provides project rules, we estimate the rework avoided if an issue would otherwise have reached review.',
  'vortex_dashboard.impact_roi.engineering_time_modal.guide_formula':
    'Estimated prevented issues × likelihood the issue would otherwise reach review × (Sonar remediation effort + review time)',
  'vortex_dashboard.impact_roi.engineering_time_modal.verify_contribution_title':
    'Verify contribution (Resolved issues)',
  'vortex_dashboard.impact_roi.engineering_time_modal.verify_contribution_description':
    'When Verify finds an issue and a later analysis no longer finds it, we estimate the rework avoided by addressing it during the agent workflow.',
  'vortex_dashboard.impact_roi.engineering_time_modal.verify_formula':
    'Likelihood the issue would otherwise be fixed × adjusted Sonar remediation effort + likelihood it would reach review × one estimated review round-trip',
  'vortex_dashboard.impact_roi.engineering_time_modal.whats_included': "What's included?",
  'vortex_dashboard.impact_roi.engineering_time_modal.whats_included.items':
    '<li><b>Sonar remediation effort:</b> the standard estimated time associated with fixing each Sonar rule.</li><li><b>Review time:</b> a conservative estimate of the review, fix, and re-review loop avoided.</li><li><b>Conservative adjustments:</b> probabilities and batching adjustments prevent the estimate from treating every finding as a full, separate rework cycle.</li>',
  'vortex_dashboard.impact_roi.engineering_time_modal.guardrail_title': 'Guardrail / trust note',
  'vortex_dashboard.impact_roi.engineering_time_modal.guardrail_description':
    'We estimate that issues would otherwise have been caught in your normal pull request workflow—not caused an incident or breach. We count shared review effort once per agent activity, rather than once for every issue.',

  'vortex_dashboard.impact_roi.tokens_modal.title': 'How tokens saved is calculated',
  'vortex_dashboard.impact_roi.tokens_modal.intro':
    'Tokens saved is an estimate of the agent input tokens Vortex helped avoid.',
  'vortex_dashboard.impact_roi.tokens_modal.methodology':
    'Vortex reduces unnecessary codebase exploration and compresses large command output before it is added to the agent’s context.',
  'vortex_dashboard.impact_roi.tokens_modal.total_label': 'Estimated tokens saved',
  'vortex_dashboard.impact_roi.tokens_modal.total_formula': 'Navigation savings',
  'vortex_dashboard.impact_roi.tokens_modal.navigation_title':
    'Navigation savings (Focused codebase navigation)',
  'vortex_dashboard.impact_roi.tokens_modal.navigation_description':
    'When Vortex answers a structural codebase question, we estimate the tokens the agent would otherwise have used to search and read code, then subtract the size of Vortex’s response.',
  'vortex_dashboard.impact_roi.tokens_modal.formula':
    'max(0, (Estimated exploration tokens − Vortex response tokens) × Context amplification factor*)',
  'vortex_dashboard.impact_roi.tokens_modal.amplification_footnote':
    '*Context amplification factor: Information added to an agent’s context may be sent again in later requests. The amplification factor estimates that repeated input cost, using a conservative fixed value.',
  'vortex_dashboard.impact_roi.tokens_modal.trust_note_title': 'Trust note',
  'vortex_dashboard.impact_roi.tokens_modal.trust_note':
    'The response size and compression byte change are observed. The tokens the agent would otherwise have used, and the effect of context amplification, are estimated—so this metric is labelled Estimated.',

  'vortex_dashboard.adoption_coverage.title': 'Adoption and Coverage',
  'vortex_dashboard.adoption_coverage.error': 'Unable to load this section right now.',
  'vortex_dashboard.adoption_coverage.admin_only_note':
    'Project-level breakdowns are available to system administrators.',

  'vortex_dashboard.adoption_coverage.project_coverage.heading': 'Vortex activity',
  'vortex_dashboard.adoption_coverage.project_coverage.description':
    'Share of active projects during the selected date range that used Vortex.',
  'vortex_dashboard.adoption_coverage.project_coverage.center_label': 'Using Vortex',
  'vortex_dashboard.adoption_coverage.project_coverage.outer_label':
    '{activeCount} / {totalCount} projects',
  'vortex_dashboard.adoption_coverage.project_coverage.legend.active': 'Using',
  'vortex_dashboard.adoption_coverage.project_coverage.legend.inactive': 'Not using',
  'vortex_dashboard.adoption_coverage.project_coverage.toggletip.title': 'What counts as activity?',
  'vortex_dashboard.adoption_coverage.project_coverage.toggletip.description':
    'For this chart, a project is active if it had at least one analysis on its default branch or a long-lived branch, or if it used Vortex during the selected date range. Pull request analyses alone do not count as activity.',

  'vortex_dashboard.adoption_coverage.capability_coverage.heading': 'Vortex capability coverage',
  'vortex_dashboard.adoption_coverage.capability_coverage.description':
    'Breakdown of projects using Vortex by capabilities they use.',
  'vortex_dashboard.adoption_coverage.capability_coverage.outer_label': 'projects using Vortex',
  'vortex_dashboard.adoption_coverage.capability_coverage.legend.both': 'Guide + Verify',
  'vortex_dashboard.adoption_coverage.capability_coverage.legend.guide_only': 'Guide only',
  'vortex_dashboard.adoption_coverage.capability_coverage.legend.verify_only': 'Verify only',
  'vortex_dashboard.adoption_coverage.capability_coverage.no_activity': 'No activity yet',

  'vortex_dashboard.project_activity.title': 'Top project activity',
  'vortex_dashboard.project_activity.error': 'Unable to load this section right now.',
  'vortex_dashboard.project_activity.no_activity': 'No activity yet',
  'vortex_dashboard.project_activity.no_projects': 'No projects yet',
  'vortex_dashboard.project_activity.column.project': 'Project',
  'vortex_dashboard.project_activity.column.vortex_calls': 'Vortex calls',
  'vortex_dashboard.project_activity.column.issues_resolved': 'Issues resolved',
  'vortex_dashboard.project_activity.column.eng_time_saved': 'Eng time saved (hrs)',
  'vortex_dashboard.project_activity.column.tokens_saved': 'Tokens saved',
  'vortex_dashboard.project_activity.column.latest_activity': 'Latest Vortex activity',
  'vortex_dashboard.project_activity.vortex_calls_value':
    '{count, plural, one {# call} other {# calls}}',
  'vortex_dashboard.project_activity.guide_calls': 'Guide: {count}',
  'vortex_dashboard.project_activity.verify_calls': 'Verify: {count}',
  'vortex_dashboard.project_activity.footer':
    'Viewing {count} of {total, plural, one {# project} other {# projects}}.',
  'vortex_dashboard.project_activity.view_all': 'View all projects',

  'vortex_dashboard.project_activity_page.title': 'Project activity',
  'vortex_dashboard.project_activity_page.description':
    'All project activity in this instance is sorted by "Vortex Calls" in descending order.',
  'vortex_dashboard.project_activity_page.error': 'Unable to load project activity right now.',
  'vortex_dashboard.project_activity_page.empty': 'No project activity yet.',
  'vortex_dashboard.project_activity_page.footer':
    'Viewing <b>{count}</b> of <b>{total}</b> {total, plural, one {project} other {projects}}.',
  'agent_activity.status.pending': 'Pending',
  'agent_activity.status.in_progress': 'In progress',
  'agent_activity.status.in_progress.description': 'Please wait...',
  'agent_activity.status.completed': 'Completed',
  'agent_activity.status.failed': 'Failed',
  'remediation_agent.error.unknown': 'An error occurred',
  'remediation_agent.error.unknown.context':
    'The job could not be completed. Please try again later.',
  'remediation_agent.error.agent_execution_failed': 'Agent stopped unexpectedly',
  'remediation_agent.error.agent_execution_failed.context':
    'Something went wrong while the agent was processing this job. Please try again later.',
  'remediation_agent.error.agent_execution_timeout': 'Agent timed out',
  'remediation_agent.error.agent_execution_timeout.context':
    'The agent did not finish processing this job in time. Please try again later.',
  'remediation_agent.error.agent_cost_limit_reached': 'Processing limit reached',
  'remediation_agent.error.agent_cost_limit_reached.context':
    'The agent reached its processing limit for this job. If this happens frequently, contact your instance administrator.',
  'remediation_agent.error.base_branch_retrieval_failed': 'Base branch not found',
  'remediation_agent.error.base_branch_retrieval_failed.context':
    'The repository’s base branch could not be determined. Check that the branch configured for this project exists in the repository.',
  'remediation_agent.error.branch_creation_failed': 'Fix branch could not be created',
  'remediation_agent.error.branch_creation_failed.context':
    'The agent could not create a branch for the fix. Check that the DevOps platform integration can create branches in this repository.',
  'remediation_agent.error.checkout_failed': 'Commit could not be checked out',
  'remediation_agent.error.checkout_failed.context':
    'The agent could not check out the commit for this analysis, usually because the branch was rebased or force-pushed. Re-run the analysis.',
  'remediation_agent.error.db_error': 'Internal error',
  'remediation_agent.error.db_error.context': 'An internal error occurred. Please try again later.',
  'remediation_agent.error.dispatch_failed': 'Job could not be dispatched',
  'remediation_agent.error.dispatch_failed.context':
    'The agent job could not be queued for processing. Please try again.',
  'remediation_agent.error.dispatch_timeout': 'Job dispatch timed out',
  'remediation_agent.error.dispatch_timeout.context':
    'The job took too long to prepare and dispatch to the agent. Please try again later.',
  'remediation_agent.error.entity_initialization_failed': 'Job setup failed',
  'remediation_agent.error.entity_initialization_failed.context':
    'An internal error occurred while setting up the job. Please try again later.',
  'remediation_agent.error.fetch_issues_failed': 'Failed to retrieve issues',
  'remediation_agent.error.fetch_issues_failed.context':
    'The agent could not retrieve the issue details. Please try again later.',
  'remediation_agent.error.git_clone_failed': 'Repository could not be cloned',
  'remediation_agent.error.git_clone_failed.context':
    'The agent could not access the repository. Check that repository permissions are correct and that the branch still exists.',
  'remediation_agent.error.git_permission_denied': 'Repository permission denied',
  'remediation_agent.error.git_permission_denied.context':
    'The DevOps platform integration does not have the required repository permissions. Ask an instance administrator to grant permission to read the repository, create branches, and create pull or merge requests.',
  'remediation_agent.error.llm_configuration_invalid': 'AI service configuration is invalid',
  'remediation_agent.error.llm_configuration_invalid.context':
    'The configured AI provider or model is not supported or is invalid. Ask an instance administrator to review the configuration.',
  'remediation_agent.error.llm_configuration_missing': 'AI service is not configured',
  'remediation_agent.error.llm_configuration_missing.context':
    'An AI provider or model has not been configured for remediation. Ask an instance administrator to complete the AI service configuration.',
  'remediation_agent.error.llm_model_key_invalid': 'AI API key is invalid or unauthorized',
  'remediation_agent.error.llm_model_key_invalid.context':
    'The AI API key configured for this instance is invalid or unauthorized. Ask an instance administrator to update the AI credentials.',
  'remediation_agent.error.llm_provider_unreachable': 'AI service unavailable',
  'remediation_agent.error.llm_provider_unreachable.context':
    'The AI service is unavailable. Confirm that the provider is available or check with your instance administrator that the provider is configured correctly.',
  'remediation_agent.error.llm_quota_exceeded': 'AI service quota reached',
  'remediation_agent.error.llm_quota_exceeded.context':
    'The AI service quota has been reached. Ask an instance administrator to review the provider account limits.',
  'remediation_agent.error.llm_rate_limit_exceeded': 'AI service rate limit reached',
  'remediation_agent.error.llm_rate_limit_exceeded.context':
    'The AI service rate limit was exceeded. Please try again later.',
  'remediation_agent.error.llm_validation_failed': 'AI service credentials are unavailable',
  'remediation_agent.error.llm_validation_failed.context':
    'The credentials configured for the AI model are missing or no longer valid. Ask an instance administrator to review the configuration.',
  'remediation_agent.error.no_issues_after_filter': 'No fixable issues found',
  'remediation_agent.error.no_issues_after_filter.context':
    'No issues could be processed after filtering. They may already have been resolved or may not be supported for automatic remediation.',
  'remediation_agent.error.no_patches_applied': 'No fixes could be generated',
  'remediation_agent.error.no_patches_applied.context':
    'The agent could not produce a valid fix. The issue may be too complex or use unsupported patterns.',
  'remediation_agent.error.no_repository_url': 'No repository configured',
  'remediation_agent.error.no_repository_url.context':
    'This project is not linked to a repository. Ask an instance administrator to configure the project binding.',
  'remediation_agent.error.orchestrator_internal_error': 'Internal processing error',
  'remediation_agent.error.orchestrator_internal_error.context':
    'An internal error occurred while processing the job. Please try again later. If the problem persists, contact support.',
  'remediation_agent.error.pull_request_creation_failed': 'Pull request could not be created',
  'remediation_agent.error.pull_request_creation_failed.context':
    'The agent generated a fix but could not open a pull or merge request. Check the DevOps platform integration permissions.',
  'remediation_agent.error.quota_exceeded': 'Processing quota reached',
  'remediation_agent.error.quota_exceeded.context':
    'The processing quota for this instance has been reached. Ask an instance administrator to review the quota.',
  'remediation_agent.error.repository_too_large': 'Repository too large',
  'remediation_agent.error.repository_too_large.context':
    'The repository is larger than the size limit configured for this instance. Ask an instance administrator to review the limit.',
  'remediation_agent.error.run_creation_failed': 'Job initialization failed',
  'remediation_agent.error.run_creation_failed.context':
    'An internal error occurred while initializing the job. Please try again later.',
  'remediation_agent.error.runtime_capacity_timeout': 'Agent capacity unavailable',
  'remediation_agent.error.runtime_capacity_timeout.context':
    'The agent could not start because processing capacity remained unavailable. Please try again later.',
  'remediation_agent.error.source_files_not_found': 'Source files not found',
  'remediation_agent.error.source_files_not_found.context':
    'The agent could not find the issue files on the checked-out branch. Check that the project’s main branch contains the analyzed source files, then analyze again.',
  'remediation_agent.error.submodules_not_supported': 'Git submodules are not supported',
  'remediation_agent.error.submodules_not_supported.context':
    'This repository uses Git submodules, which are not currently supported by the remediation agent.',
  'remediation_agent.error.hunter_plan_unsound': 'No safe fix could be found',
  'remediation_agent.error.hunter_plan_unsound.context':
    'The agent reviewed its own plan and judged it unsafe to apply, so no pull request was opened.',
  'remediation_agent.error.hunter_findings_unreadable': 'Finding could not be read',
  'remediation_agent.error.hunter_findings_unreadable.context':
    'The agent could not read the Hunter Agent finding it was given. Please try again later.',
  'remediation_agent.error.hunter_model_probe_failed': 'AI service did not respond',
  'remediation_agent.error.hunter_model_probe_failed.context':
    'The configured AI model failed a start-up check. Verify the AI provider configuration and try again.',
  'agent_activity.status.skipped': 'Skipped',
  'agent_activity.status.skipped.description': 'No changes since last run',

  //------------------------------------------------------------------------------
  //
  // DEPENDENCIES, BILL OF MATERIALS, SCA
  //
  //------------------------------------------------------------------------------

  'dependencies.analysis.failed': 'Dependency analysis failed',
  'dependencies.analysis.outdated': 'Latest dependency analysis attempt failed',
  'dependencies.analysis.completed': 'Results may be missing due to analysis errors',
  'dependencies.analysis.completed_body':
    'There may be dependency risks in your project that have not yet been detected. Please address the following errors and scan again.',
  'dependencies.analysis.callout_body':
    'A new scan may detect additional dependency risks if the analysis errors are resolved.',
  'dependencies.analysis.callout_view_errors': 'View errors',
  'dependencies.analysis.dependency_files_analyzed':
    '<highlighted>{count}</highlighted> dependency {count, plural, one {file} other {files}} were analyzed.',
  'dependencies.analysis.show_unfiltered_items': 'Show all risks',

  'dependencies.list.title':
    '<highlighted>{count}</highlighted> {count, plural, one {dependency} other {dependencies}}',
  'dependencies.list.name_search.title':
    '<highlighted>{count}</highlighted> matching {count, plural, one {dependency} other {dependencies}}',
  'dependencies.learn_more_link': 'Learn more about dependency analysis',
  'dependencies.empty_state.title':
    'No {branchType, select, pullRequest {new dependencies in this pull request} other {dependencies found in this branch}}',
  'dependencies.empty_state.body':
    'We analyzed the manifest/lock files we found but no {branchType, select, pullRequest {new } other {}}dependencies were found.',
  'dependencies.no_result_state.title': "We couldn't find any results matching selected criteria",
  'dependencies.no_result_state.body': 'Try to change filters to get some results.',
  'dependencies.risks.project.no_analysis.title':
    'The next project analysis will start populating the list of dependency risks',
  'dependencies.risks.project.no_analysis.body':
    'For a complete list of dependency risks, make sure each project in this application has been analyzed at least once since the SCA feature was enabled.',
  'dependencies.project.no_analysis.title':
    'The next project analysis will start populating the list of dependencies',
  'dependencies.project.no_analysis.body':
    'For a complete list of dependencies, make sure each project in this application has been analyzed at least once since the SCA feature was enabled.',
  'dependencies.no_analysis.learn_more_link': 'Configuring your projects for SCA analysis',
  'dependencies.project.dependencies.error_loading_analysis':
    'Error loading analysis data: {error}',
  'dependencies.error_state.title': 'Something went wrong',
  'dependencies.error_state.body.1': 'We had trouble loading the bill of materials.',
  'dependencies.error_state.body.2': 'Try to analyze the branch again later.',
  'dependencies.expandable_text.link.full_text': 'Show more',
  'dependencies.expandable_text.link.less_text': 'Show less',
  'dependencies.skip_to_filters': 'Skip to filters page',
  'dependencies.filters.clear_all': 'Clear filters',
  'dependencies.list.export_as_sbom.dropdown.button': 'Export SBOM',
  'dependencies.list.export_as_sbom.dropdown.header.label': 'Software Bill Of Materials (SBOM)',
  'dependencies.list.export_as_sbom.dropdown.header.helptext':
    ' This will export a SBOM for all of your dependencies.',
  'dependencies.list.export_as_sbom.type.cyclonedx': 'CycloneDX',
  'dependencies.list.export_as_sbom.type.spdx_23': 'SPDX v2.3',
  'dependencies.list.export_as_sbom.type.spdx_30': 'SPDX v3.0',
  'dependencies.list.export_as_sbom.format.xml': 'XML',
  'dependencies.risk.fixed_release_missing':
    'Information about where it was introduced is no longer available.',
  'dependencies.risk.header.risk_severity': 'Severity of impact',
  'dependencies.risk.header.risk_severity.info_button_label':
    'More information about severity of impact',
  'dependencies.risk.header.risk_severity.intro': 'How is the severity impact calculated?',
  'dependencies.risk.header.first_detected': 'First detected',
  'dependencies.risk.header.what_is_the_risk': "What's the risk?",
  'dependencies.risk.header.how_can_i_fix_it': 'How can I fix it?',
  'dependencies.risk.header.activity': 'Activity',
  'dependencies.risk.what.basicInfo.published': 'Published on {date}',
  'dependencies.risk.what.basicInfo.updated': 'Updated on {date}',
  'dependencies.risk.what.basicInfo.withdrawnAt': 'Report withdrawn {date}',
  'dependencies.risk.what.basicInfo.severity': 'CVSS score',
  'dependencies.risk.what.basicInfo.no_severity': 'Unscored',
  'dependencies.risk.what.basicInfo.severity.info_button_label':
    'More information about CVSS score',
  'dependencies.risk.what.basicInfo.severity.tooltip':
    'CVSS (Common Vulnerability Scoring System) is a standardized metric that assesses the severity of software vulnerabilities on a scale of 0-10.',
  'dependencies.risk.what.basicInfo.severity.tooltip.link': 'Learn more about CVSS',
  'dependencies.risk.what.basicInfo.chanceOfFutureExploitation': 'Chance of future exploitation',
  'dependencies.risk.what.basicInfo.chanceOfFutureExploitation.epss': '(EPSS)',
  'dependencies.risk.what.basicInfo.chanceOfFutureExploitation.epss.probabilityRankings.highSeverity':
    'High risk severity threshold',
  'dependencies.risk.what.basicInfo.chanceOfFutureExploitation.epss.probabilityRankings.mediumSeverity':
    'Medium risk severity threshold',
  'dependencies.risk.what.basicInfo.chanceOfFutureExploitation.epss.probabilityRankings.medianVulnerability':
    'Median vulnerability',
  'dependencies.risk.what.basicInfo.chanceOfFutureExploitation.epss.probabilityRankings.thisVulnerability':
    'This vulnerability',
  'dependencies.risk.what.basicInfo.chanceOfFutureExploitation.info_button_label':
    'More information about chance of future exploitation',
  'dependencies.risk.what.basicInfo.chanceOfFutureExploitation.epss.tooltip.epss_description':
    'EPSS (Exploit Prediction Scoring System) v{version} estimates the percentage likelihood of a software vulnerability being exploited in the wild over the next 30 days, from 0 to 100%, and a percentile rank of how that likelihood compares to all other assessed vulnerabilities.',
  'dependencies.risk.what.basicInfo.chanceOfFutureExploitation.epss.tooltip.risk_calculation_description':
    'Sonar uses EPSS score alongside other factors to calculate risk severity. For medium severity risks, EPSS must be >=0.5% and CVSS must be >= 4.0, for high severity risks, EPSS must be >=5% and CVSS must be >=7.0.',
  'dependencies.risk.what.basicInfo.chanceOfFutureExploitation.epss.tooltip.link':
    'Learn more about EPSS v{version}',
  'dependencies.risk.what.basicInfo.cwe.weaknesses': 'Weaknesses',
  'dependencies.risk.what.basicInfo.knownExploited': 'Known exploited',
  'dependencies.risk.what.basicInfo.knownExploited.kev': '(KEV)',
  'dependencies.risk.what.basicInfo.knownExploited.info_button_label':
    'More information about known exploited vulnerabilities',
  'dependencies.risk.what.basicInfo.knownExploited.kev.tooltip':
    'KEV (Known Exploited Vulnerabilities) is a list of vulnerabilities that have been confirmed to be actively exploited in the wild',
  'dependencies.risk.what.basicInfo.knownExploited.kev.tooltip.link': 'Learn more about KEV',
  'dependencies.risk.what.basicInfo.reportType.cve': 'NVD',
  'dependencies.risk.what.basicInfo.reportType.epss': 'EPSS',
  'dependencies.risk.what.basicInfo.reportType.ghsa': 'GHSA',
  'dependencies.risk.what.insights.insights_from_maintainer': 'Insights from the maintainer',
  'dependencies.risk.what.insights.insights_from_maintainer.body':
    'Sonar works with the maintainer of this dependency to uphold secure development practices and provide first-party insights on vulnerabilities that are identified.',
  'dependencies.risk.what.insights.provided_by_maintainer': 'Provided by the maintainer of {purl}',
  'dependencies.risk.what.insights.likelihood_to_be_affected': 'Likelihood to be affected',
  'dependencies.risk.what.insights.build_tool_dev_dependency_usage':
    'Build tool / dev dependency usage',
  'dependencies.risk.what.insights.build_tool_dev_dependency_usage.vulnerable': 'Vulnerable',
  'dependencies.risk.what.insights.build_tool_dev_dependency_usage.not_vulnerable':
    'Not vulnerable',
  'dependencies.risk.what.insights.workaround_available': 'Workaround available',
  'dependencies.risk.what.insights.faq.real_false_positive':
    'Is this a real vulnerability or a false positive?',
  'dependencies.risk.what.insights.faq.real_false_positive.real':
    'This is a real vulnerability that may affect users.',
  'dependencies.risk.what.insights.faq.real_false_positive.false_positive':
    'This is a false positive.',
  'dependencies.risk.what.insights.faq.vulnerability_exploitable':
    'Is this vulnerability exploitable when the package is used as a build tool or dev/test dependency?',
  'dependencies.risk.what.insights.faq.workaround_available':
    'For users who are unable to upgrade to a supported release, is there a workaround available?',
  'dependencies.risk.what.insights.faq.only_if_certain_methods_in_use':
    'Does this vulnerability apply only if certain methods, classes, or functionality are in use?',
  'dependencies.risk.what.insights.faq.how_likely_to_be_affected':
    'When using an affected version of this package as intended, how likely are users to be affected?',
  'dependencies.risk.what.insights.faq.other_conditions':
    'Are there any other conditions that users should check for to determine if they are vulnerable?',
  'dependencies.risks.affected_dependency.number_of_risks': 'Risks ({count})',
  'dependencies.risks.affected_dependency.view_all_risks':
    'View all {count} risks for this dependency',
  'dependencies.risk.what.license.category_prohibited':
    '{license} is considered a {category} license which is prohibited by the {profile} license profile.',
  'dependencies.risk.what.license.license_prohibited':
    '{license} is prohibited by the {profile} license profile.',
  'dependencies.risk.what.license.more': 'More about copyleft licenses',
  'dependencies.risk.comment.explain_why': 'Explain your decision',
  'dependencies.risk.comment.error': 'An unexpected error occurred.',

  'dependencies.bill_of_materials': 'Dependencies',
  'dependencies.labels.severity_dependency_license.description':
    'Sonar marks all license violations as high severity. The actual risk to your organization may vary based on your policy, and how this application is distributed and deployed.',
  'dependencies.properties.import_type': 'Dependency type',
  'dependencies.properties.import_type.direct': 'Direct',
  'dependencies.properties.import_type.transitive': 'Transitive',
  'dependencies.properties.scope': 'Dependency scope',
  'dependencies.properties.scope.development': 'Development',
  'dependencies.properties.scope.plural':
    '{scope} and {count} {count, plural, one {other} other {others}}',
  'dependencies.properties.scope.production': 'Production',
  'dependencies.properties.status': 'Status',
  'dependencies.properties.license': 'License',
  'dependencies.properties.license.label.nonstandard':
    'This is a nonstandard license not tracked by SPDX.',
  'dependencies.properties.license.label.nonstandard_link': 'Learn more about SPDX licenses',
  'dependencies.properties.license.label.none':
    "This software has no declared license, and should be treated as 'All rights reserved'.",
  'dependencies.properties.newly_introduced.releases': 'New dependencies',
  'dependencies.properties.newly_introduced.risks': 'Risks in new dependencies',
  'dependencies.properties.newly_introduced.title': 'New code',
  'dependencies.properties.risks': 'Risks',
  'dependencies.properties.identified_using': 'Identified using',
  'dependencies.properties.identified_using.plural':
    '{file} and {count} {count, plural, one {other} other {others}}',
  'dependencies.properties.identified_using.tooltip': 'View files used to identify this dependency',
  'dependencies.properties.identified_using.description':
    'This dependency was identified using references found in the following files:',
  'dependencies.properties.package_manager': 'Package manager',
  'dependencies.properties.project': 'Project',
  'dependencies.details.not_found.title': 'Dependency not found',
  'dependencies.details.not_found.body':
    'The dependency you are trying to view may not exist anymore, or there may be a problem with its identifier. Try to locate it again in the bill of materials.',
  'dependencies.details.not_found.go_back_text': 'Go back to bill of materials',
  'dependencies.details.chain.title': 'How is {dependency} brought into {projectBranchLabel}?',
  'dependencies.details.chain.transitive_label':
    'Dependency chains resolved using <b>{lockfile}</b>',
  'dependencies.details.chain.paths_label': '{count} {count, plural, one {path} other {paths}}',
  'dependencies.details.chain_group_label': 'Dependency Group',
  'dependencies.details.chains_none_label':
    'No dependency chains were found. For more details view {link}.',
  'dependencies.details.chains_none_missing_lockfile_label':
    'A lockfile is required for complete dependency details and accurate analysis. As a best practice, Sonar recommends committing the lockfile to your source control system to ensure it is present when analysis is run. For more details view {link}',
  'dependencies.details.chains_none_missing_lockfile_link': 'analyzing projects for dependencies.',
  'dependencies.details.other_versions': '{count} other releases in use',
  'dependencies.details.other_versions.description':
    "{count} other releases of this package are used in ''{branchName}''",
  'dependencies.package_managers.CARGO': 'Cargo',
  'dependencies.package_managers.COCOAPODS': 'CocoaPods',
  'dependencies.package_managers.COMPOSER': 'Packagist', // Composer is the tool, packagist is the package manager
  'dependencies.package_managers.CONAN': 'Conan',
  'dependencies.package_managers.GOLANG': 'Go',
  'dependencies.package_managers.MAVEN': 'Maven',
  'dependencies.package_managers.NPM': 'npm',
  'dependencies.package_managers.NUGET': 'NuGet',
  'dependencies.package_managers.PYPI': 'PyPI',
  'dependencies.package_managers.GEM': 'Gem',
  'dependencies.package_managers.UNKNOWN': 'Unknown',
  'dependencies.package_managers.VCPKG': 'vcpkg',

  'dependencies.risks.breadcrumb.branch_label': 'Branch:',
  'dependencies.risks.breadcrumb.pull_request_label': 'Pull request:',
  'dependencies.risks.comments_count': '{count} {count, plural, one {comment} other {comments}}',
  'dependencies.risks.sort_by': 'Sort by',
  'dependencies.risks.sort_by.severity': 'Risk severity',
  'dependencies.risks.sort_by.cvss_score': 'CVSS score',
  'dependencies.risks.sort_by.creation_date': 'Creation date',
  'dependencies.risks.no_dependencies_risks': 'No dependency risks',
  'dependencies.risks.header.number_of_risks.risks_in':
    '{risksCount} {risksCount, plural, one {risk} other {risks}} in',
  'dependencies.risks.header.number_of_risks.releases_count':
    '{releasesCount} {newlyIntroduced, select, true {new } other {}}{releasesCount, plural, one {dependency} other {dependencies}}',
  'dependencies.risks.sort_by.sort_order': 'Sort order {order}',
  'dependencies.risks.sort_by.sort_order.asc': 'ascending',
  'dependencies.risks.sort_by.sort_order.desc': 'descending',
  'dependencies.risks.number_of_risks':
    '{count} {count, plural, one {dependency risk} other {dependency risks}}',
  'dependencies.risks.number_of_severities': '{count} {severity}',
  'dependencies.risks.unknown': 'Unknown dependency risk',
  'dependencies.risks.unknown.tooltip':
    'Dependency risk cannot be calculated for packages from unknown origin.',
  'dependencies.risks.unknown_package.description':
    '{name} is not a package known by an upstream package manager. Unrecognized packages might not have undergone necessary security checks, or might be malicious.',
  'dependencies.risks.unknown_release.description':
    '{release} is not a release of {name} that is known by an upstream package manager. Unrecognized releases might not have undergone necessary security checks, or might be malicious.',

  'dependencies.risks.status.accept': 'Accepted',
  'dependencies.risks.status.accept.description':
    'This finding is valid, but it may not be fixed for a while.',
  'dependencies.risks.status.confirm': 'Confirmed',
  'dependencies.risks.status.confirm.description':
    'This finding has been reviewed and the risk is valid.',
  'dependencies.risks.status.fixed': 'Fixed',
  'dependencies.risks.status.fixed.description':
    'This previously unfixed dependency risk is no longer being detected.',
  'dependencies.risks.status.open': 'Open',
  'dependencies.risks.status.open.description': 'This finding has not yet been reviewed.',
  'dependencies.risks.status.safe': 'Safe',
  'dependencies.risks.status.safe.description':
    'This finding does not pose a risk. No fix is needed.',
  'dependencies.risks.status.unknown': 'Unknown status',
  'dependencies.risks.status.comment.placeholder.optional': 'Share why (optional)',
  'dependencies.risks.status.comment.placeholder.required': 'Please share (required)',
  'dependencies.risks.status_x_click_to_change':
    'Dependency risk status: {status}, click to change',
  'dependencies.risks.status_x_click_to_change_for_y':
    'Dependency risk status: {status} for {riskTitle}, click to change',
  'dependencies.risks.assignee_for_risk': 'Assignee for {riskTitle}',
  'dependencies.risks.bulk_change.select_all': 'Select all dependency risks',
  'dependencies.risks.bulk_change.select_risk': 'Select {riskTitle}',
  'dependencies.risks.bulk_change.modify': 'Change',
  'dependencies.risks.bulk_change.selected': '{count} selected',
  'dependencies.risks.bulk_change.too_many_selected':
    'You can modify up to {max} dependency risks at once.',
  'dependencies.risks.bulk_change.title': 'Modify selected risks',
  'dependencies.risks.bulk_change.description':
    'Apply changes to {count} selected {count, plural, one {dependency risk} other {dependency risks}}.',
  'dependencies.risks.bulk_change.assignee': 'Bulk change assignee',
  'dependencies.risks.bulk_change.assignee.mixed_organizations':
    'Bulk assignment requires all selected risks to belong to the same organization.',
  'dependencies.risks.bulk_change.severity': 'Change severity',
  'dependencies.risks.bulk_change.status': 'Change status',
  'dependencies.risks.bulk_change.success': 'Bulk change applied.',
  'dependencies.risks.bulk_change.error': 'Bulk change failed.',

  'dependencies.risks.all': 'All risks',
  'dependencies.risks.type': 'Risk type',
  'dependencies.risks.type.license': 'Prohibited license',
  'dependencies.risks.type.license.upgrade_callout.body':
    'Upgrade to set license profiles and manage risk from open source licenses.',
  'dependencies.risks.type.license.upgrade_callout.header': 'Manage license risk with Enterprise',
  'dependencies.risks.type.license.no_profile_tooltip': 'No license profile configured.',
  'dependencies.risks.type.license.no_profile_tooltip.icon':
    'License risks not available for this project.',
  'dependencies.risks.type.license.no_profile_learn_more': 'Learn more',
  'dependencies.risks.type.license.no_profile_empty_state.body':
    'No prohibited license risks are available because no license profile has been applied to this project.',
  'dependencies.risks.type.license_prohibited_description':
    'Dependencies with license {license} should not be used',
  'dependencies.risks.type.vulnerability': 'Vulnerability',
  'dependencies.risks.type.malware': 'Malicious package',
  'dependencies.risks.not_fixable_by_agent.tooltip':
    'This risk is not currently fixable by the remediation agent.',
  'dependencies.risk': 'Dependency Risk',
  'dependencies.risks': 'Dependency risks',
  'dependencies.risks.reachability': 'Reachability',
  'dependencies.risks.reachability.more_locations': 'Show additional files ({count})',
  'dependencies.risks.reachability.snippet_message':
    'Your code directly calls this vulnerable function, making this risk reachable.',
  'dependencies.risks.reachability.title': 'This vulnerability is reachable',
  'dependencies.risks.reachability.tooltip':
    'Sonar found a place where your code calls vulnerable code',
  'dependencies.risks.reachable': 'Reachable',
  'dependencies.risks.reachable_false': 'Unreachable',
  'dependencies.risks.reachable_false.tooltip':
    'Sonar did not find a direct call from your code into vulnerable code. A dependency may still call this transitively',
  'dependencies.risks.reachable_not_analyzed': 'Not analyzed',
  'dependencies.risks.reachable_not_analyzed.tooltip':
    'Sonar did not analyze this vulnerability for reachability.',
  'dependencies.risks.empty_state.title':
    'No {branchType, select, pullRequest {new } other {}}open dependency risks were found',
  'dependencies.risks.empty_state.body':
    'This may be because your project has no {branchType, select, pullRequest {new } other {}}dependencies, all dependencies are risk-free, or an error occurred during analysis.',
  'dependencies.risks.details.not_found.title': 'Dependency risk not found',
  'dependencies.risks.details.not_found.body':
    'The dependency risk you are trying to view may not exist anymore, or there may be a problem with its identifier.',
  'dependencies.risks.details.not_found.go_back_text': 'Go back to all risks',
  'dependencies.risks.details.license_profile_missing.title': 'License profile not found',
  'dependencies.risks.details.license_profile_missing.body':
    'The license profile associated with this dependency risk is no longer available. Please ensure that a valid license profile is assigned to the project and rescan.',
  'dependencies.risks.affected_dependency': 'Affected dependency',
  'dependencies.risks.more': '+{count} more',
  'dependencies.risks.activity.initial_activity': 'Dependency risk first detected',
  'dependencies.risks.severity': 'Risk severity',
  'dependencies.risks.severity.help.icon': 'More information about risk severity',
  'dependencies.risks.severity.help.intro':
    'Sonar assesses a severity for dependency risks based on the type of risk.',
  'dependencies.risks.severity.help.license.heading': 'Prohibited licenses',
  'dependencies.risks.severity.help.license.body':
    'All prohibited license risks are defined as HIGH severity.',
  'dependencies.risks.severity.help.vulnerability.heading': 'Vulnerabilities',
  'dependencies.risks.severity.help.vulnerability.body':
    'Vulnerabilities are given a holistic severity rating based on the vulnerability severity (as defined by CVSS), known exploitation (as defined by CISA KEV), and probable future exploitation (as defined by EPSS).',
  'dependencies.risks.severity.help.malware.body':
    'Malicious packages are always given a BLOCKER severity rating by default.',
  'dependencies.risks.severity.help.manual_update':
    "This risk's severity was manually changed to {severity}. To see the history of severity changes for this risk, view the <link>activity tab.</link>",
  'dependencies.risks.severity.help.warning_title': 'Severity review recommended',
  'dependencies.risks.severity.help.warning_msg':
    "This risk's severity was manually changed to {manualSeverity}, but new data shows its calculated severity has now increased to {originalSeverity}. We recommend reviewing the risk to confirm if the prior override to {manualSeverity} is still appropriate. To see the history of severity changes for this risk, view the <link>activity tab</link>.",
  'dependencies.risks.severity.help.warning_dismiss': 'Mark as reviewed',
  'dependencies.risks.severity.calculated': 'Calculated',
  'dependencies.risks.severity.overridden': 'Overridden',
  'dependencies.risks.severity.user_override': 'User override',
  'dependencies.risks.severity.picker_header':
    'Please note: If the severity rating for this risk is manually changed, it will no longer be updated automatically by Sonar, even if the data used in our severity calculation changes.',
  'dependencies.risks.severity.quality.button.static': '{severity} severity impact on {quality}.',
  'dependencies.risks.severity.quality.button.dropdown':
    '{severity} severity impact on {quality} for {riskTitle}.',
  'dependencies.risks.severity.BLOCKER.description': 'Known as exploited (KEV)',
  'dependencies.risks.severity.LOW.description': 'All other non-withdrawn vulnerabilities',
  'dependencies.risks.severity.INFO.description': 'Confirmed false positive or withdrawn',
  'dependencies.risks.cvss_score': 'CVSS: {score}',
  'dependencies.risks.cvss_withdrawn': 'CVSS: N/A (withdrawn)',
  'dependencies.risks.no_cvss_score': 'CVSS: Unscored (pending)',
  'dependencies.risks.cvss_title': 'CVSS score',
  'dependencies.risks.cvss_severity_critical': 'Critical',
  'dependencies.risks.cvss_severity_high': 'High',
  'dependencies.risks.cvss_severity_medium': 'Medium',
  'dependencies.risks.cvss_severity_low': 'Low',
  'dependencies.risks.cvss_severity_none': 'None',
  'dependencies.risks.epss_title': 'EPSS probability',
  'dependencies.risks.epss.awaiting': 'Awaiting EPSS score',
  'dependencies.risks.epss.awaiting_details':
    'Risk severity may change once EPSS is available (typically 24 hours after CVE is published)',
  'dependencies.risks.epss.withdrawn': 'N/A (withdrawn)',
  'dependencies.risks.fix_level': 'Fix level',
  'dependencies.risks.fix_level.no_fix': 'No known fix',
  'dependencies.risks.quality': 'Software quality',
  'dependencies.risks.quality.SECURITY': 'Security',
  'dependencies.risks.quality.SECURITY.description': 'Security quality description',
  'dependencies.risks.quality.MAINTAINABILITY': 'Maintainability',
  'dependencies.risks.quality.MAINTAINABILITY.description': 'Maintainability quality description',
  'dependencies.risks.status.help':
    'Dependency risks can be confirmed (marked as problems that need fixed), accepted (technical debt to fix later), or marked safe (not a risk based on other factors).',
  'dependencies.risks.status.help.icon': 'More information about risk statuses',
  'dependencies.risks.status.learn_more': 'Learn more about managing dependency risks.',
  'dependencies.risks.reanalyze': 'Reanalyze',
  'dependencies.risks.reanalyze.success': 'Branch queued for reanalysis',
  'dependencies.risks.reanalyze.error': 'Failure queueing branch for reanalysis',
  'dependencies.risks.security_category': 'Security category',
  'dependencies.risks.filter_category': 'Category',
  'dependencies.risks.last_analysis': 'Last analysis {date}',
  'dependencies.risks.cwe.unknown': 'No CWE associated',
  'dependencies.risk.how.title': 'Update the dependency',
  'dependencies.risk.how.body':
    'If an updated version of the dependency that fixes the vulnerability is available, update to that version. Always test your application thoroughly after updating a dependency to ensure nothing breaks.',
  'dependencies.risk.how.view_prompt': 'View AI fix prompt',
  'dependencies.risk.how.hide_prompt': 'Hide AI fix prompt',
  'dependencies.risk.how_introduced_tab': 'Where is it?',
  'dependencies.risk.how.find_alternative': 'Find an alternative',
  'dependencies.risk.how.find_alternative.vulnerability_body':
    'If no update is available, consider switching to an alternative dependency that provides the same functionality but without the vulnerability.',
  'dependencies.risk.how.find_alternative.license_body':
    'Because this dependency’s license is prohibited by the {profile} license profile, you will need to find a different dependency to meet your needs.',
  'dependencies.risk.how.license.view_allowed': 'View licenses allowed for this project',
  'dependencies.risk.how.fix.complete': 'Complete fix',
  'dependencies.risk.how.fix.partial': 'Partial fix',
  'dependencies.risk.how.fix.none': 'Affected version',
  'dependencies.risk.how.wait_for_fix': 'Wait for a fix',
  'dependencies.risk.how.wait_for_fix.body':
    'You are using the latest version of this dependency, and no newer version is available to address the vulnerability. If you trust that the dependency is actively maintained and expect a fix to be released soon, it may be reasonable to wait for the update.',

  'dependencies.risk.how.fix_body.version_in_use.complete':
    "This is the version of the dependency you're using, but it is not affected.",
  'dependencies.risk.how.fix_body.version_in_use.unknown':
    "This is the version of the dependency you're using, but we have no data on it. It may or may not be affected.",
  'dependencies.risk.how.fix_body.version_in_use.default':
    "This is the affected version of the dependency you're using.",

  'dependencies.risk.how.fix_body.nearest_partial':
    'This is the nearest version that fixes this vulnerability, but it has {vulnerabilityIdCount} other {vulnerabilityIdCount, plural, one {vulnerability} other {vulnerabilities}}.',
  'dependencies.risk.how.fix_body.nearest_complete':
    'This is the nearest version without any known vulnerabilities.',

  'dependencies.risk.how.fix_body.latest_partial':
    'This is the latest version that fixes this vulnerability, but it has {vulnerabilityIdCount} other {vulnerabilityIdCount, plural, one {vulnerability} other {vulnerabilities}}.',
  'dependencies.risk.how.fix_body.latest_complete':
    'This is the latest version without any known vulnerabilities.',

  'dependencies.risk.how.fix_body.latest_stable.complete':
    'This is the latest non-prerelease version without any known vulnerabilities.',
  'dependencies.risk.how.fix_body.latest_stable.partial':
    'This is the latest non-prerelease version that fixes this vulnerability, but it has {vulnerabilityIdCount} other {vulnerabilityIdCount, plural, one {vulnerability} other {vulnerabilities}}.',
  'dependencies.risk.how.fix_body.latest_stable.default':
    'This is the latest non-prerelease version but it does not fix this vulnerability{vulnerabilityIdCount, plural, =1 {.} other { and has # other vulnerabilities.}}',

  'dependencies.risk.how.fix_body.latest_prerelease.complete':
    'This is the latest prerelease version without any known vulnerabilities.',
  'dependencies.risk.how.fix_body.latest_prerelease.partial':
    'This is the latest prerelease version that fixes this vulnerability, but it has {vulnerabilityIdCount} other {vulnerabilityIdCount, plural, one {vulnerability} other {vulnerabilities}}.',
  'dependencies.risk.how.fix_body.latest_prerelease.default':
    'This is the latest prerelease version but it does not fix this vulnerability{vulnerabilityIdCount, plural, =1 {.} other { and has # other vulnerabilities.}}',

  'dependencies.risk.how.no_guidance':
    'Remediation guidance is not yet available in Sonar for this vulnerability. You will need to manually determine if there is an unaffected release available that you can update to. Please check the “What’s the risk” information for guidance on affected versions.',

  'dependencies.risk.how.malware.body':
    "While each instance of a malicious package is different, here are some general principles to help guide you. <li>Immediately inform your information security team.</li><li>Remove the package from your project by uninstalling it and removing it from your dependency files.</li><li>Rotate all secrets and credentials that may have been exposed, including API keys, passwords, tokens, and certificates. Do this from a different, secure computer.</li><li>Review your system for compromise by checking for unexpected processes, network connections, or file modifications. Consider restoring from a clean backup or reimaging affected systems.</li><li>Update to a safe version if one exists, or find an alternative package. Check the package's repository and security advisories for guidance.</li><li>Scan your codebase for any malicious code that may have been injected into your project files during the package's execution.</li><li>Review your security practices including how you vet dependencies and consider using tools that scan for malicious packages before installation.</li>",

  'dependencies.risk.how.withdrawn':
    'This advisory has been withdrawn by the source as the report was found to be invalid. Sonar shows this record for transparency, but no patch or remediation is needed.',
  'dependencies.package_managers.SWIFT': 'Swift Package Manager',
  'dependencies.lightwell_fixability.nav': 'Lightwell Network',
  'dependencies.lightwell_fixability.page': 'Lightwell upgrades',
  'dependencies.lightwell_fixability.see_backport_candidates': 'See Clearinghouse candidates',
  'dependencies.lightwell_fixability.hero.kicker': 'Lightwell · fixability · Medium or higher',
  'dependencies.lightwell_fixability.header.project_count':
    '{count, plural, one {# project} other {# projects}}',
  'dependencies.lightwell_fixability.header.risk_count':
    '{count, plural, one {# open dependency risk, Medium or higher} other {# open dependency risks, Medium or higher}}',
  'dependencies.lightwell_fixability.hero.title': 'How your open risks can be fixed',
  'dependencies.lightwell_fixability.hero.description':
    'Lightwell means more risks are fixable without an incompatible upgrade.',
  'dependencies.lightwell_fixability.hero.description_tooltip':
    'SonarQube tells you what is exposed. Lightwell helps you fix more risks without an incompatible upgrade. Toggle the table below to see the difference it makes on this portfolio.',
  'dependencies.lightwell_fixability.hero.bar_label.baseline': 'Upstream fixes only',
  'dependencies.lightwell_fixability.hero.bar_label.with_lightwell': 'With Lightwell',
  'dependencies.lightwell_fixability.hero.summary.no_risk':
    'This portfolio has no open dependency risks — there is nothing to fix.',
  'dependencies.lightwell_fixability.hero.summary.no_help':
    "Lightwell doesn't help with any medium or higher risks in this portfolio.",
  'dependencies.lightwell_fixability.hero.summary.clause_no_fix':
    '{count, plural, one {# risk that previously had no known fix} other {# risks that previously had no known fix}}',
  'dependencies.lightwell_fixability.hero.summary.clause_major':
    '{count, plural, one {# risk that previously required a major upgrade} other {# risks that previously required a major upgrade}}',
  'dependencies.lightwell_fixability.hero.summary.total_easier':
    '{count, plural, one {makes # total risk easier to solve} other {makes # total risks easier to solve}}',
  'dependencies.lightwell_fixability.hero.summary.no_clauses': 'Lightwell {totalClause}.',
  'dependencies.lightwell_fixability.hero.summary.with_clauses':
    'Lightwell provides an upgrade for {clauseList}, and {totalClause}.',
  'dependencies.lightwell_fixability.hero.zero_count.value':
    '{count} of {total} ({percent}%) projects',
  'dependencies.lightwell_fixability.hero.zero_count.label_via_same_patch':
    'can reach zero open risks with <b>drop-in</b> replacements',
  'dependencies.lightwell_fixability.hero.zero_count.label_via_patch':
    'can reach zero open risks with <b>patch</b> or easier upgrades',
  'dependencies.lightwell_fixability.hero.zero_count.label_via_minor':
    'can reach zero open risks with <b>minor</b> or easier upgrades',
  'dependencies.lightwell_fixability.hero.zero_count.label_via_major':
    'can reach zero open risks with <b>major</b> or easier upgrades',
  'dependencies.lightwell_fixability.hero.zero_count.delta':
    '{count, plural, one {Lightwell added # project that reaches zero.} other {Lightwell added # projects that reach zero.}}',
  'dependencies.lightwell_fixability.empty_state.title': 'No open dependency risks were found',
  'dependencies.lightwell_fixability.empty_state.body':
    'Every project in this portfolio is clear of open dependency risks, Medium severity or higher.',
  'dependencies.lightwell_fixability.toggle.with': 'With Lightwell',
  'dependencies.lightwell_fixability.toggle.without': 'Without Lightwell',
  'dependencies.lightwell_fixability.segment.same_patch_fixable': 'Drop-in replacement',
  'dependencies.lightwell_fixability.segment.patch_fixable': 'Fixable by patch upgrade',
  'dependencies.lightwell_fixability.segment.minor_fixable': 'Fixable by minor upgrade',
  'dependencies.lightwell_fixability.segment.major_upgrade_only': 'Needs a major upgrade',
  'dependencies.lightwell_fixability.segment.no_fix_available': 'No known fix',
  'dependencies.lightwell_fixability.tiles.title.same_patch_fixable': 'Drop-in replacement',
  'dependencies.lightwell_fixability.tiles.no_change': "Lightwell doesn't change this.",
  'dependencies.lightwell_fixability.tiles.inflow_source.patch':
    '{count, plural, one {# risk with only a patch upgrade} other {# risks with only a patch upgrade}}',
  'dependencies.lightwell_fixability.tiles.inflow_source.minor':
    '{count, plural, one {# risk with only a minor upgrade} other {# risks with only a minor upgrade}}',
  'dependencies.lightwell_fixability.tiles.inflow_source.major':
    '{count, plural, one {# risk with only a major upgrade} other {# risks with only a major upgrade}}',
  'dependencies.lightwell_fixability.tiles.inflow_source.no_fix':
    '{count, plural, one {# risk with no upstream fix} other {# risks with no upstream fix}}',
  'dependencies.lightwell_fixability.tiles.inflow.same_patch':
    '{count, plural, one {Lightwell adds a same-version fix for {sources}.} other {Lightwell adds # same-version fixes for {sources}.}}',
  'dependencies.lightwell_fixability.tiles.inflow.patch':
    '{count, plural, one {Lightwell adds a patch fix for {sources}.} other {Lightwell adds # patch fixes for {sources}.}}',
  'dependencies.lightwell_fixability.tiles.inflow.minor':
    '{count, plural, one {Lightwell adds a minor fix for {sources}.} other {Lightwell adds # minor fixes for {sources}.}}',
  'dependencies.lightwell_fixability.tiles.inflow.major':
    '{count, plural, one {Lightwell adds a major-upgrade fix for {sources}.} other {Lightwell adds # major-upgrade fixes for {sources}.}}',
  'dependencies.lightwell_fixability.tiles.outflow.patch':
    '{count, plural, one {Lightwell makes # upgrade easier that previously required a patch upgrade.} other {Lightwell makes # upgrades easier that previously required a patch upgrade.}}',
  'dependencies.lightwell_fixability.tiles.outflow.minor':
    '{count, plural, one {Lightwell makes # upgrade easier that previously required a minor upgrade.} other {Lightwell makes # upgrades easier that previously required a minor upgrade.}}',
  'dependencies.lightwell_fixability.tiles.outflow.major':
    '{count, plural, one {Lightwell makes # upgrade easier that previously required a major upgrade.} other {Lightwell makes # upgrades easier that previously required a major upgrade.}}',
  'dependencies.lightwell_fixability.tiles.outflow.no_fix':
    '{count, plural, one {Lightwell provides a fix for # risk that previously had none.} other {Lightwell provides a fix for # risks that previously had none.}}',
  'dependencies.lightwell_fixability.table.title': 'How each project can be fixed',
  'dependencies.lightwell_fixability.table.description':
    'Search narrows the list below. Sorting and the toggle apply to the whole portfolio.',
  'dependencies.lightwell_fixability.table.search_placeholder': 'Search projects',
  'dependencies.lightwell_fixability.table.no_results': 'No projects match your search',
  'dependencies.lightwell_fixability.table.column.project': 'Project',
  'dependencies.lightwell_fixability.table.column.composition': 'Composition',
  'dependencies.lightwell_fixability.table.column.same_patch_fixable': 'Drop-in',
  'dependencies.lightwell_fixability.table.column.patch_fixable': 'Patch upgrade',
  'dependencies.lightwell_fixability.table.column.minor_fixable': 'Minor upgrade',
  'dependencies.lightwell_fixability.table.column.lightwell_fixable': 'Lightwell fix',
  'dependencies.lightwell_fixability.table.column.major_upgrade_only': 'Major upgrade',
  'dependencies.lightwell_fixability.table.column.no_fix': 'No fix',
  'dependencies.lightwell_fixability.table.bucket_link_aria':
    '{count, plural, one {View # risk fixable by {fixLevel} for {project}} other {View # risks fixable by {fixLevel} for {project}}}',
  'dependencies.lightwell_fixability.table.column.fixed_by_minor': 'Fixed by minor',
  'dependencies.lightwell_fixability.table.column.fixed_by_minor_tooltip_with_lightwell':
    'Share of open risk fixable today without a major upgrade — via a patch, minor release, or Lightwell.',
  'dependencies.lightwell_fixability.table.column.fixed_by_minor_tooltip_without_lightwell':
    'Share of open risk fixable today without a major upgrade — via a patch or minor release.',
  'dependencies.lightwell_fixability.table.column.fixed_by_major': 'Fixed by major',
  'dependencies.lightwell_fixability.table.column.fixed_by_major_tooltip_with_lightwell':
    'Share of open risk fixable today by any upgrade, major included — via a patch, minor release, major release, or Lightwell.',
  'dependencies.lightwell_fixability.table.column.fixed_by_major_tooltip_without_lightwell':
    'Share of open risk fixable today by any upgrade, major included — via a patch, minor, or major release.',
  'dependencies.lightwell_fixability.table.percent_fixed': '{percent}%',
  'dependencies.lightwell_fixability.table.composition_aria_label':
    'Fixability breakdown for {project}: {total} total open risks',
  'dependencies.lightwell_fixability.table.exposure_sub':
    '{direct} direct · {transitive} transitive',
  'dependencies.lightwell_backport_candidates.nav': 'Lightwell Clearinghouse',
  'dependencies.lightwell_backport_candidates.page': 'Lightwell Clearinghouse candidates',
  'dependencies.lightwell_backport_candidates.header.package_count':
    '{count, plural, one {# package} other {# packages}}',
  'dependencies.lightwell_backport_candidates.header.risk_count':
    "{count, plural, one {# open risk medium or above with no fix on the line you're on} other {# open risks medium or above with no fix on the line you're on}}",
  'dependencies.lightwell_backport_candidates.leverage.packages_label': 'packages',
  'dependencies.lightwell_backport_candidates.leverage.risks_label':
    'open medium-or-above risks they account for',
  'dependencies.lightwell_backport_candidates.leverage.ratio_label':
    'risks closed per package remediated',
  'dependencies.lightwell_backport_candidates.leverage.ratio_value': '{ratio}×',
  'dependencies.lightwell_backport_candidates.leverage.explainer':
    'Ranked by severity blended with usage across the portfolio (<code>score = 0.6×severity + 0.4×usage</code>).',
  'dependencies.lightwell_backport_candidates.table.title': 'Backport candidates',
  'dependencies.lightwell_backport_candidates.table.reset_sort': 'Reset to ranked order',
  'dependencies.lightwell_backport_candidates.table.search_placeholder': 'Search packages',
  'dependencies.lightwell_backport_candidates.table.no_results': 'No packages match your search',
  'dependencies.lightwell_backport_candidates.table.column.rank': '#',
  'dependencies.lightwell_backport_candidates.table.column.package': 'Package & version in use',
  'dependencies.lightwell_backport_candidates.table.column.risks': 'Risks it would close',
  'dependencies.lightwell_backport_candidates.table.column.projects_affected': 'Projects affected',
  'dependencies.lightwell_backport_candidates.table.column.highest_severity': 'Highest severity',
  'dependencies.lightwell_backport_candidates.table.column.advisories': 'Advisory IDs',
  'dependencies.lightwell_backport_candidates.table.advisories_more': 'and {count} more',
  'dependencies.lightwell_backport_candidates.table.column.why_stuck': "Why it's stuck",
  'dependencies.lightwell_backport_candidates.table.severity_count': '{count} {severity}',
  'dependencies.lightwell_backport_candidates.table.version_in_use':
    'version in use {version} · {packageManager}',
  'dependencies.lightwell_backport_candidates.table.why.major_upgrade_only':
    'Nearest upstream fix is {version}, a major upgrade. No Lightwell release fixes {count, plural, one {this risk} other {these risks}} yet.',
  'dependencies.lightwell_backport_candidates.table.why.fixable_magnitude_unknown':
    'Nearest upstream fix is {version}, upgrade size unknown. No Lightwell release fixes {count, plural, one {this risk} other {these risks}} yet.',
  'dependencies.lightwell_backport_candidates.table.why.no_fix_available':
    'No upstream fix exists for {count, plural, one {this risk} other {these risks}}, and no Lightwell release fixes {count, plural, one {it} other {them}} yet.',
  'dependencies.lightwell_backport_candidates.empty_state.title':
    'No backport candidates were found',
  'dependencies.lightwell_backport_candidates.empty_state.body':
    'Every package with an open risk in this portfolio already has an upstream fix or a Lightwell release — none need a Clearinghouse request.',

  //------------------------------------------------------------------------------
  //
  // SCA LICENSE PROFILES
  //
  //------------------------------------------------------------------------------

  'sca.container_images.page': 'Container images',
  'sca.container_images.page.description':
    'Scan container images to find vulnerabilities and malicious packages. <link>Learn more about container scanning</link>.',
  'sca.container_images.last_analysis': '<b>Last analysis:</b> {date}',
  'sca.container_images.digest': '<b>Digest:</b> {digest}',
  'sca.container_images.select_digest': 'Select image tag and digest',
  'sca.container_images.search': 'Search image repositories',
  'sca.container_images.table': 'Image repositories',
  'sca.container_images.column.image': 'Image repository',
  'sca.container_images.column.last_analysis': 'Last analysis',
  'sca.container_images.column.risks': 'Risks',
  'sca.container_images.column.most_severe': 'Most severe',
  'sca.container_images.column.tag': 'Tag',
  'sca.container_images.column.tag.help':
    'This is the tag most recently scanned by Sonar. It is not necessarily the newest published tag in the repository.',
  'sca.container_images.column.scan_digest': 'Scan digest',
  'sca.container_images.images': 'Images',
  'sca.container_images.images.count': '<b>{count}</b> {count, plural, one {image} other {images}}',
  'sca.container_images.image_repositories.count':
    '<b>{count}</b> {count, plural, one {image repository} other {image repositories}}',
  'sca.container_images.empty.title': 'Scan your first container image',
  'sca.container_images.empty.description':
    'No images have been analyzed yet. Run the scanner on an image you’ve built or pulled, locally or in CI, and the results will appear here.',
  'sca.container_images.risks.empty.title':
    'No open vulnerabilities or malicious packages were found',
  'sca.container_images.risks.empty.body':
    'This may be because this container image has no packages, all packages are risk-free, or an error occurred during analysis.',
  'sca.licenses.page': 'License profiles',
  'sca.licenses.page.intro':
    'A license profile is a collection of policies that define which licenses are allowed or prohibited for the dependencies used by your projects. If a dependency with a prohibited license is found during an analysis, it will be identified as a dependency risk. For more details see the documentation for {docsLink}.',
  'sca.licenses.page.no_profiles.title':
    "Dependency licenses won't be analyzed until a license profile is created.",
  'sca.licenses.page.no_profiles.body':
    "In order to analyze a project's licenses, it must be assigned a license profile. You can manually choose which projects to analyze or set a default profile for all projects.",
  'sca.licenses.create_profile': 'Create profile',
  'sca.licenses.details_page.intro':
    'License profiles are used to set policies that define which licenses are allowed or prohibited for the dependencies used by your projects. If a dependency with a prohibited license is found during an analysis, it will be identified as a dependency risk.',
  'sca.licenses.license_override_applied':
    'The default policy for {licenseCategory} licenses is <b>{defaultPolicy}</b>. You have overridden the default policy to <b>{policy}</b>.',
  'sca.licenses.default_policy.body':
    'This is your {defaultBadge} license profile. All projects that are not manually assigned another profile will use this one.',
  'sca.licenses.default_policy.no_default':
    'You have not set a default license profile. If a license profile is set as default, all of your projects will use the profile during analysis, unless they are manually assigned to another one.',
  'sca.licenses.default_policy.nothing_allowed':
    'This license profile is set as default, but no licenses or categories of licenses have been allowed. In this state, analysis will show developers that all licenses are prohibited. If you don’t intend to immediately configure which licenses are allowed, we recommend you wait to set this profile as the default until after configuration.',
  'sca.licenses.policy.nothing_allowed':
    'This license profile has no licenses or categories of licenses which have been allowed. In this state, analysis will show developers that all licenses are prohibited. If you don’t intend to immediately configure which licenses are allowed, we recommend you wait to set this profile as the default until after configuration.',
  'sca.licenses.profile.create_help': 'Create a new license profile to manage your licenses.',
  'sca.licenses.profile.actions.set_default': 'Set as default',
  'sca.licenses.profile.actions.remove_default': 'Remove as default',
  'sca.licenses.profile.actions.edit_configuration': 'Edit configuration',
  'sca.licenses.profile.actions.label': 'Actions',
  'sca.licenses.profile.actions.view_configuration': 'View configuration',
  'sca.licenses.profile.search_licenses': 'Search licenses',
  'sca.licenses.profile.rename_modal.title': 'Rename license profile',
  'sca.licenses.profile.rename_modal.body': 'Enter a new name for the license profile.',
  'sca.licenses.profile.delete_modal.title': 'Delete license profile',
  'sca.licenses.profile.delete_modal.body':
    'Are you sure you want to delete this license profile? Any associated projects will revert to the default license profile or will not have any license profile applied if no default exists.',
  'sca.licenses.profile.properties.name': 'License Profile',
  'sca.licenses.profile.properties.updated_at': 'Updated',
  'sca.licenses.profile.properties.license_count': 'License Count',
  'sca.licenses.profile.properties.license_name': 'License',
  'sca.licenses.profile.properties.license_category': 'Category',
  'sca.licenses.profile.properties.license_policy': 'Policy',
  'sca.licenses.profile.properties.license_policy.allowed': 'Allowed',
  'sca.licenses.profile.properties.license_policy.prohibited': 'Prohibited',
  'sca.licenses.profile.current_default': 'Current default: {defaultPolicy}',
  'sca.licenses.profile.categories.title': 'License category policies',
  'sca.licenses.profile.categories.help':
    'Save configuration time by choosing license categories to allow by default. You can always customize individual license policies even if you allow a category by default.',
  'sca.licenses.profile.categories.manage': 'Manage categories',
  'sca.licenses.profile.projects_using': 'Projects using this profile',
  'sca.licenses.set_category_modal.title': 'Set default license policies',
  'sca.licenses.set_category_modal.body':
    'Sonar has categorized many common open source licenses based on their characteristics to make policy setting easier for you. Setting a default policy by category enables you to quickly allow or prohibit all licenses in that category. Don’t worry, you can always set policies for individual licenses as needed.',

  'sca.licenses.category.copyleft_weak.name': 'Weak copyleft',
  'sca.licenses.category.copyleft_strong.name': 'Strong copyleft',
  'sca.licenses.category.copyleft_network.name': 'Network copyleft',
  'sca.licenses.category.copyleft_maximal.name': 'Maximal copyleft',
  'sca.licenses.category.permissive_standard.name': 'Standard permissive',
  'sca.licenses.category.permissive_amateur.name': 'Non-standard permissive',
  'sca.licenses.category.uncategorized.name': 'Other',
  'sca.licenses.category.filter_by_category': 'Filter by category',
  'sca.licenses.profile.filter_by_policy': 'Filter by policy',
  'sca.licenses.profile.policy_select.aria_label': 'Policy for {name}',
  'sca.licenses.license_override.more_info.aria_label': 'More information about {name}',

  'sca.licenses.category.permissive_standard':
    'This category includes the most commonly used permissive licenses. Permissive licenses grant broad permissions to use, and modify, with very minimal obligations (primarily attribution). Licenses in this category have all the essential elements of permissive open source licenses. Example standard permissive licenses include the MIT and Apache software licenses.',
  'sca.licenses.category.permissive_amateur':
    'This category includes permissive licenses that lack one or more essential elements of modern permissive open source licenses, or impose complex or confusing requirements. Many use unclear, jocular, or incomplete language. These licenses can be considered less legally predictable to use. Example amateur permissive licenses include the Artistic 1.0 and the WTFPL software licenses.',
  'sca.licenses.category.copyleft_weak':
    'Weak copyleft licenses require sharing your changes and additions to the licensed software when you give copies to others. Example weak copyleft licenses include the GNU LGPL and the Mozilla Public License software licenses.',
  'sca.licenses.category.copyleft_strong':
    'In addition to the requirements of the weak copyleft licenses, strong copyleft licenses require you to share larger programs that you build with the licensed software when you give copies to others. Example strong copyleft licenses include the GNU GPL license.',
  'sca.licenses.category.copyleft_network':
    'In addition to the requirements of strong copyleft licenses, network copyleft licenses require you to share larger programs that you build with the licensed software not just when you give copies to others, but also when you run the software for others to use over the Internet or another network. Example network copyleft licenses include the GNU AGPL and the Server-Side-Public License software licenses.',
  'sca.licenses.category.copyleft_maximal':
    'Maximal copyleft licenses answer the question “When does the license require you to share?” differently than other families. Maximal copyleft licenses require you to share software you make with others, and to license that software alike when you do. Example maximal copyleft licenses include the Parity and Reciprocal software licenses.',
  'sca.licenses.category.uncategorized':
    'Many detectable licenses do not fall into one of the standard categories, usually because they have non-standard requirements. These non-standard requirements may include limitations on commercial use, morality clauses, requirements of commercial license purchase based on any number of factors, or unusual reporting requirements. Software may also be unlicensed, with the authors reserving all rights. Any license in  the ‘Other’ category needs to be individually reviewed and configured based on the specific license terms and use case.',
  'sca.licenses.category.policy_not_configurable': 'Policies cannot be set for this category.',
  'sca.licenses.project.title': 'License profile',
  'sca.licenses.project.info':
    'A {licenseProfileDocUrl} is a collection of policies that define which licenses are allowed or prohibited for the dependencies used by your projects. Dependency licenses will only be analyzed if a default license profile is created, or if projects are manually assigned to a license profile. If a dependency with a prohibited license is found during an analysis, it will be identified as a {dependencyRiskDocUrl}.',
  'sca.licenses.project.choose':
    'Choose which license profile to assign to this project or create a new profile from the {licenseProfilesUrl} page.',
  'sca.quality_gates.metric.sca_severity_vulnerability': 'Dependency vulnerability severity',
  'sca.quality_gates.metric.sca_severity_licensing': 'Dependency with prohibited license',
  'sca.quality_gates.metric.sca_severity_malware': 'Dependency with malicious code',
  'sca.quality_gates.metric.sca_severity_any_issue': 'Dependency risk severity',
  'sca.quality_gates.metric.sca_severity_any_security': 'Dependency security risk severity',
  'sca.quality_gates.metric.sca_severity_licensing.description':
    "All prohibited license risks are classified as high severity by Sonar. Therefore, this condition will cause the quality gate to fail if any of a project's dependencies use a license that is prohibited by the project's License Profile.",
  'sca.quality_gates.metric.sca_severity_malware.description':
    'All malicious code risks are classified as blocker severity by Sonar.',
  //------------------------------------------------------------------------------
  //
  // SCA REPORT PAGE
  //
  //------------------------------------------------------------------------------
  'sca.sbom.report': 'Software Bill of Materials (SBOM)',
  'sca.risk.report': 'Advanced Security dependency risks report',
  'sca.risk.report.name': 'Dependency risks report',

  'sca.dependencies.key_changes.heading': "Key changes for ''{branchName}''",
  'sca.dependencies.key_changes.selection_cards.aria_label': 'Select risk category to view',
  'sca.dependencies.key_changes.newly_introduced.label': '{count} Newly Introduced Risks',
  'sca.dependencies.key_changes.newly_introduced.no_risks':
    'This pull request does not create any new dependency risks.',
  'sca.dependencies.key_changes.newly_introduced.has_risks':
    'This pull request would create {count} new dependency risks in the default branch.',
  'sca.dependencies.key_changes.fixed.label': '{count} Fixed Risks',
  'sca.dependencies.key_changes.fixed.no_risks':
    'This pull request does not fix any dependency risks.',
  'sca.dependencies.key_changes.fixed.has_risks':
    'This pull request would eliminate {count} existing dependency risks from the default branch.',
  'sca.dependencies.key_changes.fixed.read_only':
    'This list is read-only. For more details see {link}.',
  'sca.dependencies.key_changes.no_changes':
    'This pull request does not create or fix any dependency risks.',

  'sca.dependencies.key_changes.beta_callout.title': 'Key changes view now in Beta',
  'sca.dependencies.key_changes.beta_callout.description':
    'Find what risks your pull request introduces, and which ones it fixes. <link>Share feedback with us</link>',
  //------------------------------------------------------------------------------
  //
  // ARCHITECTURE PAGE
  //
  //------------------------------------------------------------------------------
  'architecture.project_too_big.title': 'Project too big to display',
  'architecture.project_too_big.body': "This project is too big and can't be displayed.",
  'architecture.page.deviations': 'Deviations',
  'architecture.page.coverage': 'Coverage',
  'architecture.page.model': 'Intended architecture',
  'architecture.page.model.coverage.badge': 'Coverage: {percentage}%',
  'architecture.page.model.coverage.tooltip':
    'Percentage of leaf artifacts (classes and files) covered by the intended architecture',
  'architecture.page.coverage.description':
    'Architecture coverage is the amount of code in the main branch that is managed by the intended architecture. It gets updated after each analysis.',
  'architecture.page.discovery': 'Current architecture',
  'architecture.page.discovery.copy_component_path_to_clipboard':
    'Copy the component path to the clipboard',
  'architecture.page.model.visual.title': 'Intended architecture',
  'architecture.page.model.visual.title.edit_mode': "Edit ''{label}''",
  'architecture.page.model.visual.title.view_mode': "View ''{label}''",
  'architecture.page.model.visual.legend': 'Legend',
  'architecture.page.model.visual.legend.title': 'How to read the map',
  'architecture.page.model.visual.legend.bullet.1':
    'Classes/files are recursively grouped within their packages/folders/modules',
  'architecture.page.model.visual.legend.bullet.2':
    "The element's size and position represent the structure of the project (topology)",
  'architecture.page.model.visual.legend.bullet.3':
    'Elements are ordered left to right according to their relationships',
  'architecture.page.model.visual.legend.bullet.4':
    'Elements in one column have no relationships among themselves',
  'architecture.page.model.intended.how_it_works': 'How it works',
  'architecture.page.model.intended.legend.description':
    'Add the components that are the most important, generally the top ones (no need to go deep) for your application, and define their relationship. SonarQube will continuously verify them. Here is how it works:',
  'architecture.page.model.intended.legend.bullet.1':
    'Only added components (and their sub-components) are verified',
  'architecture.page.model.intended.legend.bullet.2': 'Relations defined means they are allowed',
  'architecture.page.model.intended.legend.bullet.3':
    'Relations not defined means they are not allowed',
  'architecture.page.model.intended.legend.bullet.4':
    'Relations can only be defined between sibling components',
  'architecture.page.model.intended.legend.bullet.5': 'Relations are inherited by children',
  'architecture.page.model.visual.button.add_component.label': 'Add component',
  'architecture.page.model.navigation_guard.title': 'You have unsaved changes',
  'architecture.page.model.navigation_guard.message':
    'If you leave now, your progress will be lost. Are you sure you want to discard your changes?',
  'architecture.page.model.navigation_guard.leave': 'Exit without saving',
  'architecture.page.model.navigation_guard.stay': 'Keep editing',
  'architecture.page.dashboard.model.description_view_only':
    'An architecture administrator should define the intended architecture to detect deviations.',
  'architecture.page.dashboard.has_disabled_rules':
    'Some rules can be activated to raise issues on deviations and flaws.',
  'architecture.page.dashboard.resources_link':
    'What is architecture in SonarQube and how to use it?',
  'architecture.page.dashboard.view_disabled_rules': 'View rules',
  'architecture.page.model.saved': 'Saved successfully',
  'architecture.page.model.unsaved_changes': 'You have unsaved changes.',
  'architecture.page.model.seed.empty_model.title': 'Your intended architecture is empty',
  'architecture.page.model.seed.empty_model.message':
    'Generate a draft from the top-level components and relationships for {language} or start from scratch.',
  'architecture.page.model.seed.empty_language.title':
    'The {language} intended architecture is empty',
  'architecture.page.model.seed.empty_language.message':
    'Generate a draft from the top-level components and relationships or start from scratch.',
  'architecture.page.model.seed.action': 'Generate draft',
  'architecture.page.model.seed.start_from_scratch': 'Start from scratch',
  'architecture.page.model.no_architecture_available':
    "This project doesn't have an intended architecture defined. Architecture administrators are able to create it.",
  'architecture.page.model.visual.detail_view.simple': 'Simple',
  'architecture.page.model.visual.detail_view.detailed': 'Detailed',
  'architecture.page.model.errors.constraint.duplicate':
    'A relationship between "{source}" and "{target}" is already allowed.',
  'architecture.page.model.errors.constraint.same_source_and_target':
    'A relationship between the same source and target is invalid.',
  'architecture.page.model.errors.constraint.source_and_target_are_not_siblings':
    'A component cannot be related to a component that is not a sibling.',
  'architecture.page.model.errors.constraint.direct_cycle': 'Cyclic relationships are not allowed.',
  'architecture.page.model.errors.group.empty_label':
    'A component cannot have an empty name: {groupKey}.',
  'architecture.page.model.errors.group.duplicate_sibling_labels':
    'Two sibling components cannot have the same name: "{groupKey}".',
  'architecture.page.model.errors.invalid_model': 'Unable to change model. {errors}',
  'architecture.page.model.errors.save_failed': 'Failed to save the model.',
  'architecture.page.model.errors.delete_failed': 'Failed to delete the model.',
  'architecture.page.model.errors.group.name_must_be_alphanumeric':
    'A component name can only contain alphanumeric characters and dashes.',
  'architecture.page.model.errors.group.name_conflicts_with_artifact':
    "A component name cannot be the same as an existing artifact's name.",
  'architecture.page.model.modal.delete_component.title': 'Delete component',
  'architecture.page.model.modal.delete_component.confirm': 'Are you sure?',
  'architecture.page.model.modal.delete_component.delete_button': 'Delete and save',
  'architecture.page.model.modal.delete_component.cancel_button': 'Cancel',
  'architecture.page.model.modal.move_component.title': "Move ''{label}''",
  'architecture.page.model.modal.move_component.description':
    'Move the component and its code artifacts.',
  'architecture.page.model.modal.move_component.current_location': 'Current location: ',
  'architecture.page.model.modal.move_component.new_location': 'New location:',
  'architecture.page.model.modal.move_component.warning':
    'When moving the component, all sibling relationships will be lost.',
  'architecture.page.model.modal.move_component_name_placeholder': 'Enter component name...',
  'architecture.page.model.modal.move_component.disabled_duplicate':
    'This component has a child with the same name.',
  'architecture.page.model.modal.move_component.disabled_current_location':
    'You cannot move this component to its own location.',
  'architecture.page.model.modal.move_component.disabled_selected':
    'You cannot move this component to itself.',
  'architecture.page.model.modal.move_component.disabled_descendant':
    'You cannot move this component into one of its own children.',
  'architecture.page.model.modal.move_component.disabled_kind_language_root':
    'You cannot move this component to the language root.',
  'architecture.page.model.modal.rename_component.title': "Rename ''{label}''",
  'architecture.page.model.modal.rename_component.new_name': 'New name',
  'architecture.page.model.visual.no_components_available': 'No components can be added',
  'architecture.page.model.spotlight.interface_design': 'Interface Design',
  'architecture.page.model.spotlight.component_structure': 'Component structure',
  'architecture.page.model.spotlight.description': 'Description',
  'architecture.page.model.node_no_description': 'No description.',
  'architecture.page.model.spotlight.enable_interfaces': 'Enable interfaces',
  'architecture.page.model.spotlight.patterns': 'Patterns',
  'architecture.page.model.pattern_select.label': 'Apply a pattern',
  'architecture.page.model.pattern_select.no_pattern': 'No pattern',
  'architecture.page.model.pattern_select.empty':
    'There are no patterns defined. <link>Go to Patterns</link>',
  'architecture.page.model.pattern_badge.has_pattern': 'Pattern applied',
  'architecture.page.model.pattern_confirm.title': 'Assign pattern?',
  'architecture.page.model.pattern_confirm.message':
    'Assigning a pattern will remove all child components of this group. Are you sure you want to continue?',
  'architecture.page.model.edit.hint':
    'Drag a component to another to define a relationship. Any missing relationship is considered forbidden.',
  'architecture.page.model.edit.orphan_warning.title': 'Warning',
  'architecture.page.model.edit.orphan_warning.description':
    'Some components have no relationships defined:',
  'architecture.page.model.edit.orphan_warning.stay': 'Continue editing',
  'architecture.page.model.edit.orphan_warning.save': 'Save anyway',
  'architecture.page.model.edit.interface_warning.description':
    'Without at least one interface member, all components will be inaccessible from the outside.',
  'architecture.page.model.modal.add_component.description':
    'Add a new component to your architecture model.',
  'architecture.page.model.modal.add_subcomponent.description':
    'Add a new sub-component to {parentName}.',
  'architecture.page.model.modal.choose_existing_component': 'Choose an existing component',
  'architecture.page.model.modal.choose_existing_subcomponent': 'Choose an existing sub-component',
  'architecture.page.model.modal.name_in_intended_architecture': 'Name in intended architecture',
  'architecture.page.model.view_details': 'View details',
  'architecture.page.model.interface_badge.has_hidden_children':
    '{count, plural, one {# hidden group} other {# hidden groups}}',
  'architecture.page.model.interface_member': 'Interface member',
  'architecture.page.model.non_interface_member': 'Non-interface member',
  'architecture.page.model.spotlight.interfaces_warning':
    'Interface design is enabled. All child components are unreachable by default — enable individual components as interface members to make them accessible from outside.',
  'architecture.page.tangles': 'Tangles',
  'architecture.page.tangle': 'Tangle Details',
  'architecture.page.tangles.count':
    '{count, plural, one {<bold>1</bold> Tangle} other {<bold>{count}</bold> Tangles}}',
  'architecture.page.weak_tangles': 'Weak Tangles',
  'architecture.page.weak_tangle': 'Weak Tangle Details',
  'architecture.page.weak_tangles.count':
    '{count, plural, one {<bold>1</bold> Weak Tangle} other {<bold>{count}</bold> Weak Tangles}}',
  'architecture.page.split_responsibilities': 'Split responsibilities',
  'architecture.page.split_responsibility': 'Split responsibility details',
  'architecture.page.split_responsibilities.count':
    '{count, plural, one {<bold>1</bold> split responsibility component} other {<bold>{count}</bold> split responsibility components}}',
  'architecture.page.oversized': 'Oversized',
  'architecture.page.oversized.count':
    '{count, plural, one {<bold>1</bold> oversized component} other {<bold>{count}</bold> oversized components}}',
  'architecture.page.oversized_detail': 'Oversized component details',
  'architecture.oversized.issue_name': 'Oversized component {index}',
  'architecture.oversized.detail_breadcrumb':
    '{container} · {children, plural, one {# child} other {# children}}',
  'architecture.oversized.table.name': 'Name',
  'architecture.oversized.table.children': 'Children',
  'architecture.oversized.table.component': 'Component',
  'architecture.oversized.table.empty': 'No oversized components found',
  'architecture.oversized.not_found.title': 'This oversized component no longer exists',
  'architecture.oversized.not_found.go_back_text': 'Back to oversized components',
  'architecture.oversized.dismissible.interpret_visualization.message':
    'An oversized component contains too many subcomponents. This can make it harder to understand. Consider moving some of the subcomponents out of the oversized component, or grouping them inside new subcomponent(s).',
  'architecture.split_responsibility.issue_name': 'Split responsibility {index}',
  'architecture.split_responsibility.detail_breadcrumb':
    '{container} · depth {depth} · {fragments} fragments · {classes} classes',
  'architecture.split_responsibility.subtitle':
    '{depth} · {fragments} fragments · {classes} classes · {container}',
  'architecture.split_responsibility.table.name': 'Name',
  'architecture.split_responsibility.table.depth': 'Highest depth',
  'architecture.split_responsibility.table.fragments': 'Fragments',
  'architecture.split_responsibility.table.classes': 'Classes',
  'architecture.split_responsibility.table.component': 'Component',
  'architecture.split_responsibility.table.empty': 'No split responsibility components found',
  'architecture.split_responsibility.not_found.title': 'This split responsibility no longer exists',
  'architecture.split_responsibility.not_found.go_back_text': 'Back to split responsibility',
  'architecture.split_responsibility.dismissible.interpret_visualization.message':
    'This view highlights components whose child components are disconnected from each other, suggesting they carry mixed responsibilities. Resolve it by moving disconnected fragments into a new sibling component or rethinking the containment structure.',
  'architecture.page.smells': 'Smells',
  'architecture.page.smells_description':
    'Shows architecture problems that tend to worsen over time. Left unaddressed, they increase coupling and make changes harder to localize.',
  'architecture.page.deviations_card': 'Deviations',
  'architecture.page.structural_flaws': 'Flaws',
  'architecture.page.deviations_card_description':
    'Shows how much and where the codebase diverges from the intended architecture. Deviations appear in structure, which describes how elements are organized, and in relationships, which describe how elements depend on each other.',
  'architecture.page.structural_flaws_description':
    'Shows problems in the codebase that exist regardless of the intended architecture. A common example is a tangle, where several files or classes form overlapping cyclic dependencies and each can reach the others through dependency links.',
  'architecture.page.disallowed_dependencies': 'Relationships',
  'architecture.page.disallowed_dependencies_full': 'Relationship deviations',
  'architecture.page.disallowed_dependencies.count':
    '{count, plural, one {<bold>1</bold> Relationship dependency} other {<bold>{count}</bold> Relationship dependencies}}',
  'architecture.disallowed_dependencies.table.depth': 'Depth',
  'architecture.disallowed_dependencies.table.weight': 'Occurrences',
  'architecture.disallowed_dependencies.table.issues': 'Open issues',
  'architecture.page.misplaced_components': 'Structure',
  'architecture.page.misplaced_components_full': 'Structural deviations',
  'architecture.page.misplaced_components.count':
    '{count, plural, one {<bold>1</bold> Structural deviation} other {<bold>{count}</bold> Structural deviations}}',
  'architecture.page.deviations.no_data': 'No deviations found',
  'architecture.no_graph_file.message':
    'No data available. Please run an analysis first, or see the analysis logs for more information.',
  'architecture.unsupported_language.message': 'No supported languages found for this project.',
  'architecture.error.message': "Sorry, Currently a project of this size isn't supported.",
  'architecture.patterns.list.error':
    "Sorry, we couldn't load the patterns. Please try again later.",
  'architecture.patterns.list.title': 'Patterns',
  'architecture.patterns.nav': 'Patterns',
  'architecture.patterns.list.empty': 'There are no patterns defined yet.',
  'architecture.patterns.delete.error.in_use':
    "This pattern can't be deleted because it's being used by one or more projects.",
  'architecture.patterns.delete.error.generic':
    "Sorry, we couldn't delete the pattern. Please try again later.",
  'architecture.patterns.create': 'Create Pattern',
  'architecture.patterns.edit.title': "Edit ''{name}''",
  'architecture.patterns.edit.load.error':
    "Sorry, we couldn't open that pattern. Please try again later.",
  'architecture.patterns.edit.saved': 'Pattern saved successfully.',
  'architecture.patterns.edit.unsaved_changes': 'You have unsaved changes.',
  'architecture.patterns.edit.spotlight.name': 'Pattern name',
  'architecture.patterns.edit.spotlight.name.placeholder': 'Pattern name',
  'architecture.patterns.edit.spotlight.enable_interfaces': 'Enable interface design',
  'architecture.patterns.edit.spotlight.interface_design': 'Interface design',
  'architecture.patterns.edit.spotlight.structure.title': 'Structure',
  'architecture.patterns.edit.spotlight.structure.label': 'Add child component',
  'architecture.patterns.edit.spotlight.structure.placeholder': "'<name>'",
  'architecture.tangles.title':
    '{containersCount} {containerWord} and {elementsCount} {elementWord}{filename}',
  'architecture.tangles.title.filename': ' inside {filename}',
  'architecture.tangles.subtitle': '{containers} • {elements} • in {container}',
  'architecture.tangles.table.name': 'Name',
  'architecture.tangles.table.packages': 'Packages',
  'architecture.tangles.table.namespaces': 'Namespaces',
  'architecture.tangles.table.folders': 'Folders',
  'architecture.tangles.table.classes': 'Classes',
  'architecture.tangles.table.files': 'Files',
  'architecture.tangles.table.component': 'Component',
  'architecture.tangles.table.empty': 'No tangles found',
  'architecture.tangles.not_found.title': 'This tangle no longer exists',
  'architecture.tangles.not_found.go_back_text': 'Back to tangles',
  'architecture.common.not_found.body':
    'It may have been removed or renumbered after a new analysis. Go back to the list to find the current items.',
  'architecture.tangles.issue_name': 'Tangle {index}',
  'architecture.weak_tangles.issue_name': 'Weak Tangle {index}',
  'architecture.weak_tangles.table.empty': 'No weak tangles found',
  'architecture.weak_tangles.not_found.title': 'This weak tangle no longer exists',
  'architecture.weak_tangles.not_found.go_back_text': 'Back to weak tangles',
  'architecture.weak_tangle.dismissible.interpret_visualization.message':
    'A Weak Tangle is a relationship cycle between containers where no files or classes are directly entangled. Remove the flagged relationships (dashed lines) that go against the overall direction, or extract the involved components to reverse the relationship direction.',
  'architecture.tangle.directive.create.button': 'Request removal',
  'architecture.tangle.directive.remove.button': 'Cancel removal',
  'architecture.tangle.directive.create.description':
    'An issue will be raised every time this dependency is detected in the code so that developers can remove it.',
  'architecture.tangle.directive.remove.description':
    'An issue is raised every time this dependency is detected in the code so that developers can remove it.',
  'architecture.tangle.directive.create.title': 'Request removal?',
  'architecture.tangle.directive.absent.description':
    'No directive exists to remove this dependency.',
  'architecture.tangle.directive.deletion.success': 'Dependency removal cancelled',
  'architecture.directives.error.ecosystem_unresolved':
    "Cannot determine the project's primary language. Please reload and try again.",
  'architecture.discovery.spotlight.no_incoming_dependencies': 'No incoming dependencies',
  'architecture.discovery.spotlight.no_outgoing_dependencies': 'No outgoing dependencies',
  'architecture.discovery.spotlight.parent_no_dependencies_message':
    'Select a child item on the graph to see its dependencies.',
  'architecture.search.x_found': '{count} found',
  'architecture.search.more': 'Top results shown. Refine for more.',
  'architecture.discovery.rollup.button.on': 'Simple',
  'architecture.discovery.rollup.button.off': 'Detailed',
  'architecture.discovery.rollup.button.disabled_tooltip':
    'Select a component or relationship to switch between Simple and Detailed views',
  'architecture.misplaced_components.table.misplaced_component': 'Component',
  'architecture.misplaced_components.table.depth': 'Depth',
  'architecture.misplaced_components.table.weight': 'Occurrences',
  'architecture.misplaced_components.table.issues': 'Open issues',
  'architecture.directive.creation.success': 'Directive created successfully',
  'architecture.directives.nav': 'Directives',
  'architecture.directives.page': 'Directives',
  'architecture.directives.count': '{count, plural, one {1 directive} other {{count} directives}}',
  'architecture.directives.empty': 'No directives',
  'architecture.directives.info':
    'An architecture directive is an instruction to change the code, such as removing a relationship, or moving or renaming a component. Once created, it raises code issues shown in the deviations list. The directive completes and disappears once the code is fixed.',
  'architecture.directives.table.type': 'Type',
  'architecture.directives.type.relationship': 'Relationship',
  'architecture.directives.type.move': 'Move',
  'architecture.directives.type.rename': 'Rename',
  'architecture.directives.create.button': 'Create directive',
  'architecture.directives.delete.button': 'Delete directive',
  'architecture.project_relationships.nav': 'Exit points',
  'architecture.list.delete.confirm.title': 'Delete',
  'architecture.list.delete.confirm.body': "Are you sure you want to delete ''{name}''?",
  'architecture.external_interfaces.modal.save_error':
    "Sorry, we couldn't save the system component. Please try again later.",
  'architecture.external_interfaces.list.delete.confirm.title': 'Delete system component',
  'architecture.external_interfaces.list.delete.confirm.body':
    "Deleting the system component ''{name}'' will also remove it from any project relationships where it is currently used. This can't be undone.",
  'architecture.organization.cross_project.title': 'Cross-project architecture',
  'architecture.enterprise_settings.nav': 'Architecture',
  'architecture.enterprise_settings.title': 'Architecture settings',
  'architecture.enterprise_settings.checkbox.title': 'Enable enterprise architecture features',
  'architecture.enterprise_settings.checkbox.help':
    'Controls whether enterprise architecture features are available, including patterns, SDKs, cross-project relationships, and the project-level Directives and Exit points pages.',
  'architecture.enterprise_settings.enabled': 'Enterprise architecture features enabled.',
  'architecture.enterprise_settings.disabled': 'Enterprise architecture features disabled.',
  'architecture.external_interfaces.nav': 'System components',
  'architecture.sdks.nav': 'SDKs',
  'architecture.sdks.list.title': 'SDKs',
  'architecture.sdks.list.description':
    "Helps detect cross-project relationships for components SonarQube doesn't support natively, like custom frameworks, internal libraries, and SDKs. Add a code signature found in projects that call into the target component. SonarQube will automatically include those relationships in the system architecture.",
  'architecture.sdks.list.info': 'SDKs information',
  'architecture.sdks.list.empty': 'There are no SDKs defined yet.',
  'architecture.sdks.list.error': "Sorry, we couldn't load the SDKs. Please try again later.",
  'architecture.sdks.create': 'Create SDK',
  'architecture.sdks.list.column.name': 'Name',
  'architecture.sdks.list.column.key': 'Key',
  'architecture.sdks.list.column.target': 'Target',
  'architecture.sdks.list.column.language': 'Language',
  'architecture.sdks.list.column.signature': 'Code signature',
  'architecture.sdks.list.delete.confirm.title': 'Delete SDK',
  'architecture.sdks.list.delete.confirm.body':
    "Deleting the SDK ''{name}'' will remove its detection signature. This can't be undone.",
  'architecture.sdks.list.delete.error':
    "Sorry, we couldn't delete the SDK. Please try again later.",
  'architecture.sdks.form.create_title': 'Create SDK',
  'architecture.sdks.form.edit_title': 'Edit SDK',
  'architecture.sdks.form.name': 'Name',
  'architecture.sdks.form.target_component': 'Target component',
  'architecture.entry_points.form.target_entry_point.empty':
    'No entry points found for this component. Define them under Architecture > SDKs, then reanalyze.',
  'architecture.entry_points.form.target_entry_point.load_error':
    "Sorry, we couldn't load entry points for this component. Please try again later.",
  'architecture.sdks.form.signatures': 'Detection signature',
  'architecture.sdks.form.signature.language': 'Language',
  'architecture.sdks.form.signature.language.configured': 'Signature configured',
  'architecture.sdks.form.signature.query': 'Code signature',
  'architecture.sdks.form.save_error': "Sorry, we couldn't save the SDK. Please try again later.",
  'architecture.relationships.validate.breadcrumb': 'Exit points',
  'architecture.relationships.validate.title': 'Exit points',
  'architecture.relationships.validate.description':
    "An exit point is a location in this project's code that calls or depends on another project or system, such as an outbound HTTP call. Map each exit point to its corresponding entry point in another application to trace cross-project dependencies across the full system.",
  'architecture.relationships.validate.save_success': 'Relationships saved',
  'architecture.relationships.validate.save_error': 'Failed to save relationships',
  'architecture.relationships.validate.builtin_matches': 'Built-in',
  'architecture.relationships.validate.sdk_matches': 'Custom from SDKs',
  'architecture.relationships.validate.sdk_boundary_column': 'SDK found',
  'architecture.relationships.validate.exit_points.empty': 'No exit points found for this project.',
  'architecture.relationships.validate.exit_points.unregistered':
    'This project is not registered as an architecture component, so exit points cannot be loaded.',
  'architecture.relationships.validate.exit_points.load_error':
    "Sorry, we couldn't load exit points for this project. Please try again later.",
  'architecture.relationships.validate.boundary_column': 'Exit point',
  'architecture.relationships.validate.target_column': 'Target',
  'architecture.relationships.validate.target_component_label': 'Target component',
  'architecture.relationships.validate.target_component_placeholder': 'Select a component',
  'architecture.relationships.validate.entry_point_label': 'Entry point',
  'architecture.relationships.validate.entry_point_placeholder': 'Select an entry point',
  'architecture.relationships.validate.entry_point_incomplete':
    'Select an entry point to finish mapping this exit point.',
  'architecture.relationships.validate.automapped_badge': 'Auto-mapped',
  'architecture.relationships.validate.automapped_tooltip':
    "This mapping was found automatically and can't be modified.",
  'architecture.organization.empty': 'No organization-wide architecture data available.',
  'architecture.organization.node.exit_points_matched_count':
    '{matched}/{total, plural, one {# exit point matched} other {# exit points matched}}',
  'architecture.organization.node.unconnected_projects':
    '{count, plural, one {# project without relationships detected} other {# projects without relationships detected}}',
  'architecture.organization.node.unconnected_system_components':
    '{count, plural, one {# system component without relationships detected} other {# system components without relationships detected}}',
  'architecture.organization.node.unconnected.more': 'and {count} more',
  'architecture.organization.edge.dependency_count':
    '{count, plural, one {# dependency} other {# dependencies}}',
  'architecture.organization.legend': 'Legend',
  'architecture.organization.legend.description':
    "Shows the projects analyzed by SonarQube and the relationships detected between them. A relationship appears when an exit point in one project matches an entry point in another. Add missing ones from a project's exit points page, or define an SDK for unsupported tools.",
  'architecture.organization.legend.title': 'Projects are grouped top to bottom:',
  'architecture.organization.legend.bullet.1': 'Projects with relationships',
  'architecture.organization.legend.bullet.2': 'Projects with unmatched exit points',
  'architecture.organization.legend.bullet.3': 'System components without relationships',
  'architecture.organization.legend.bullet.4': 'Projects without relationships detected',

  // Discovery page
  'architecture.discovery.dismissible.explore_codebase.title': 'Explore the map of your codebase',
  'architecture.discovery.dismissible.explore_codebase.message.0':
    'Zoom and pan to understand the topology of the project.',
  'architecture.discovery.dismissible.explore_codebase.message.1':
    'Select an element to focus on its relationships.',
  'architecture.discovery.dismissible.explore_codebase.action': 'Got it',
  'architecture.page.discovery.selected_node_not_found': '"{nodeKey}" not found',

  // Intended architecture (model) page
  'architecture.page.model.actions.delete_architecture': 'Delete intended architecture',
  'architecture.page.model.modal.delete_architecture.title': 'Delete intended architecture?',
  'architecture.page.model.modal.delete_architecture.confirm':
    'You are about to delete the intended architecture for this project. Previous changes will be lost and cannot be recovered. This allows you to start from scratch.',
  'architecture.page.model.modal.delete_architecture.delete_button': 'Delete intended architecture',
  'architecture.page.model.modal.delete_architecture.cancel_button': 'Do not delete',
  'architecture.page.model.pattern_badge.tooltip': 'Pattern: {name}',
  'architecture.page.model.source.server.badge': 'Server managed',
  'architecture.page.model.source.server.badge.tooltip':
    "This intended architecture is saved in SonarQube for the whole project, so it's the same on every branch and pull request.",
  'architecture.page.model.source.file.badge': 'Read only · From repository file',
  'architecture.page.model.source.file.badge.tooltip':
    "Managed by the architecture file in the repository. It can't be edited here.",
  'architecture.page.model.source.file.unavailable':
    "We couldn't load the intended architecture used by the last analysis, so the one saved here is shown read-only. Reload the page to try again.",
  'architecture.page.model.source.file.change_source':
    'You can also <link>change where the intended architecture comes from</link>.',
  'architecture.page.model.source.file.file_unusable':
    'The last analysis found no usable architecture file, so it ran without an intended architecture. Add or fix the file in the repository and run a new analysis.',
  'architecture.page.model.source.file.title': 'Read only',
  'architecture.page.model.source.file.branch':
    "This intended architecture is read from the architecture file in the repository, so it can't be changed here. To change it, update the file and run a new analysis.",
  'architecture.page.model.source.file.pending':
    "This project's intended architecture is defined by the architecture file in the repository, so it can't be changed here. It will be shown once an analysis reads the file.",
  'architecture.page.model.source.file.pull_request':
    "This pull request's intended architecture is read from the architecture file in its branch, so it can't be changed here. To change it, update the file and run a new analysis.",
  'architecture.page.model.source.file.main_branch_fallback':
    "This branch or pull request has no analysed intended architecture, so the main branch's is shown. It is read from the architecture file in the repository and can't be changed here. To change it, update the file and run a new analysis.",

  // Tangles
  'architecture.tangle.directive.removal.title': 'Removal Requested',
  'architecture.tangle.dismissible.interpret_visualization.message':
    'A Tangle is a set of files or classes caught in a cycle where each can reach every other through relationship chains. Remove the flagged relationships (dashed lines) that go against the overall direction to break the cycles, or split the code to avoid the entanglement.',

  // Directives
  'architecture.directives.create.error': 'Failed to save relationship. Please try again.',
  'architecture.directives.delete.error': 'Failed to delete relationship. Please try again.',

  // External interfaces (system components)
  'architecture.external_interfaces.list.title': 'System components',
  'architecture.external_interfaces.list.empty': 'There are no system components defined yet.',
  'architecture.external_interfaces.list.error':
    "Sorry, we couldn't load the system components. Please try again later.",
  'architecture.external_interfaces.create': 'Create system component',
  'architecture.external_interfaces.modal.create_title': 'Create system component',
  'architecture.external_interfaces.modal.edit_title': 'Rename system component',
  'architecture.external_interfaces.modal.name_label': 'Name',
  'architecture.external_interfaces.modal.type_label': 'Type',
  'architecture.external_interfaces.type.app': 'Application',
  'architecture.external_interfaces.type.db': 'Database',
  'architecture.external_interfaces.type.queue': 'Queue',
  'architecture.external_interfaces.type.other': 'Other',

  // Issues count badge (used in deviation drill-downs)
  'architecture.issues.count': '{count, plural, one {1 issue} other {{count} issues}}',

  //------------------------------------------------------------------------------
  //
  // PROJECT AICA PAGE
  //
  //------------------------------------------------------------------------------
  'ai_generated_code.page': 'AI-generated code',
  'ai_generated_code.contains_code.title': 'Contains AI-Generated Code',
  'ai_generated_code.contains_code': 'Contains AI-generated Code',
  'ai_generated_code.description':
    '<p>Select this option if your project contains AI-generated code.</p><p>This is the first step to obtain Sonar’s <link>AI Code Assurance</link>.</p>',
  'ai_generated_code.change_quality_gate': 'Change quality gate',
  'ai_generated_code.autodetect': 'Autodetect AI-Generated Code',
  'ai_generated_code.autodetect.description':
    'Select this option to allow SonarQube Server to <link>autodetect AI-generated code</link> in this project. This feature currently supports organizations using GitHub and GitHub Copilot, and relies on the “GitHub Copilot Business” Organization permission from the GitHub App.',
  'ai_generated_code.autodetect.label': 'Autodetect AI-generated code in this project',
  'ai_generated_code.autodetect.turned_off_globally':
    'This setting is turned off globally for this SonarQube Server instance. It cannot be turned on for this project.',
  'ai_generated_code.autodetect.detected_code':
    'This project may contain AI-generated code. Some contributors in this project used GitHub Copilot recently. We recommend that you activate "Contains AI-generated code" below to benefit from Sonar\'s AI Code Assurance.',
  'ai_generated_code.review_profiles.title': 'Review this project’s quality profiles',
  'ai_generated_code.review_profiles.title.aica_on':
    'AI Code Assurance is on. Consider reviewing this project’s quality profiles.',
  'ai_generated_code.review_profiles.description':
    '<b>{agenticQualityProfileName}</b> and <b>Sonar way</b> are the recommended quality profiles for AI generated code. Although it is not a mandatory step, we suggest you review your quality profiles to ensure protection.',
  'ai_generated_code.review_profiles.button': 'Review quality profiles',
  'ai_generated_code.review_profiles.link': 'Learn why in the documentation',

  // ----------------------------------------------------------------------------
  //
  // Security Reports
  //
  // ----------------------------------------------------------------------------

  'securityreport.name': 'Security Reports',
  'securityreport.description_x':
    'Track Issues impacting Security and Security Hotspots in your {component}. To learn more about security reports, visit our {link}',
  'securityreport.description_x.link': 'user guide.',
  'securityreport.activate_rules':
    'Activate rules in this category to detect more security hotspots',
  'securityreport.activate_rules.link': 'See all rules related to this category',
  'securityreport.activate_hotspot_rules.link':
    'See all security hotspot rules related to this category',
  'securityreport.activate_rules.more_info': 'Activate rules',
  'securityreport.cwe.description':
    'The Common Weakness Enumeration (CWE™) is a community-developed list of software weaknesses. It provides a common reference, and as a baseline for weakness identification, mitigation, and prevention efforts.',
  'securityreport.cwe.show': 'Show CWE distribution',
  'securityreport.list.rank': 'Rank',
  'securityreport.list.requirements': 'Requirements',
  'securityreport.list.requirements.help':
    'Issues and Hotspots may map to multiple requirements. For this reason the total number of Issues and Security Hotspots in this report might be superior to project metrics.',
  'securityreport.list.cwe': 'CWEs',
  'securityreport.list.cwe.help':
    'Issues and Hotspots may map to multiple CWEs. For this reason the total number of Issues and Security Hotspots in this report might be superior to project metrics.',
  'securityreport.list.categories': 'Categories',
  'securityreport.list.categories.help':
    'Issues and Security Hotspots may appear in multiple categories. This means that the sum of Issues or Security Hotspots in this section might be greater than the total number of Issues or Security Hotspots in the Project itself.',
  'securityreport.list.vulnerabilities': 'Security',
  'securityreport.list.security_hotspots': 'Security Hotspots',
  'securityreport.list.dependency_risks': 'Dependency Risks',
  'securityreport.line.reviewed': 'Reviewed',
  'securityreport.owaspTop10': 'OWASP Top 10',
  'securityreport.owaspMobileTop10': 'OWASP Mobile Top 10',
  'securityreport.owaspLlmTop10': 'OWASP Top 10 for LLM',
  'securityreport.owaspMasvs': 'OWASP MASVS',
  'securityreport.pciDss': 'PCI DSS',
  'securityreport.owaspAsvs': 'OWASP ASVS',
  'securityreport.cweTop25': 'CWE Top 25',
  'securityreport.sonarsourceSecurity': 'Sonar',
  'securityreport.stig': 'STIG',
  'securityreport.casa': 'CASA',
  'securityreport.cra': 'EU CRA',
  'compliancereport.navigation.filter.title': 'Browse by standard type',
  'compliancereport.navigation.filter.all': 'All standards',
  'compliancereport.navigation.filter.security': 'Security-focused',
  'compliancereport.navigation.filter.regulatory': 'Regulatory',
  'compliancereport.navigation.filter.accessibility': 'Accessibility',
  'compliancereport.navigation.filter.select_from': 'Select from:',
  'compliancereport.overview.title': 'Compliance reports',
  'compliancereport.unavailable_for_pull_request.title':
    'Compliance reports are not available for pull requests',
  'compliancereport.unavailable_for_pull_request.description':
    'Compliance reporting is tracked exclusively on long-lived branches. Switch to the main branch or select another long-lived branch above.',
  'compliancereport.unavailable_for_pull_request.action': 'Switch to main branch',
  'compliancereport.misra': 'MISRA',
  'compliancereport.misra.description':
    'Identify and address issues based on <link>MISRA</link> guidelines. The report results are generated based on relevant active MISRA rules for this project.',
  'compliancereport.misra.banner.title': 'MISRA analysis is not available for this project',
  'compliancereport.misra.no_active_rules.admin.description':
    'To generate a MISRA report, select a Sonar MISRA quality profile or a custom C/C++ quality profile with MISRA rules activated. Then re-run analysis. Learn more about <link>MISRA rules and quality profiles.</link>',
  'compliancereport.misra.no_active_rules.admin.label': 'Go to quality profiles',
  'compliancereport.misra.no_active_rules.member.description':
    "Ask your project administrator to select a Sonar MISRA quality profile or activate MISRA rules for this project's C/C++ quality profile. Then re-run analysis. You can view this project's quality profiles in the Project Information page. Learn more about <link>MISRA rules and quality profiles.</link>",
  'compliancereport.misra.no_active_rules.member.label': 'View quality profiles',
  'compliancereport.misra.no_c_family_code.description':
    'For MISRA results to appear, your project must include C/C++ code and use a C/C++ quality profile with MISRA rules activated.',
  'compliancereport.misra.no_c_family_code.label':
    'Learn more about MISRA rules and quality profiles',
  'compliancereport.wcag': 'WCAG',
  'compliancereport.wcag.description':
    'Identify and address accessibility issues based on the <link>Web Content Accessibility Guidelines</link> (WCAG). The report results are generated based on relevant active accessibility rules for this project.',
  'compliancereport.wcag.issue_count_label': 'accessibility',
  'compliancereport.category.classification': 'Classification',
  'compliancereport.category.classification.help':
    'Issues may belong to multiple classifications. This means that the total number of issues in this report might be greater than the total number of issues in the project itself.',
  'compliancereport.category.categories': 'Categories',
  'compliancereport.category.categories.help':
    'Issues may appear in multiple categories. This means that the sum of issues in this section might be greater than the total number of issues in the project itself.',
  'compliancereport.category.issues': 'Issues',
  'compliancereport.total_issues': '{Category} issues to address',
  'compliancereport.total_issues_button': 'View all {Category} issues',
  'securityreport.overall.vulnerabilities': 'Overall Security',
  'securityreport.overall.review_rating': 'Overall Security Review',
  'securityreport.review_rating': 'Security Review',
  'securityreport.review_rating_help': 'Based on the percentage of reviewed Security Hotspots',
  'securityreport.report.description':
    'Security Issues and Security Hotspots conforming to the {0}.',
  'securityreport.report.owaspTop10': 'OWASP Top 10 report',
  'securityreport.report.owaspMobileTop10': 'OWASP Mobile Top 10 report',
  'securityreport.report.owaspLlmTop10': 'OWASP Top 10 for LLM report',
  'securityreport.report.owaspMasvs': 'OWASP Mobile Application Security Verification Standard',
  'securityreport.report.pciDss': 'PCI DSS',
  'securityreport.report.owaspAsvs': 'OWASP Application Security Verification Standard',
  'securityreport.report.cweTop25': 'CWE Top 25 report',
  'securityreport.report.sonarsourceSecurity': 'SonarSource standard',
  'securityreport.report.stig': 'DISA Security Technical Implementation Guides',
  'securityreport.report.casa': 'CASA',
  'securityreport.report.cra': 'EU Cyber Resilience Act (CRA)',
  'securityreport.context.portfolio': 'portfolio',
  'securityreport.context.project': 'project',
  'securityreport.download.pdf': 'Download security report {pdf}',
  'securityreport.download.pdf.modal.title': 'Download Security report PDF',
  'securityreport.download.pdf.modal.description':
    'The Security report PDF provides an overview of Security issues and Security Hotspots for both New Code and Overall Code in your project.{br}{br}Additionally, you can customize which Security standards are included in the report.',
  'securityreport.download.pdf.modal.submit_button_label': 'Download PDF',
  'securityreport.download.pdf.modal.selected_count': '[{count}] Security standard(s) selected',
  'securityreport.download.pdf.modal.selection_label':
    'Choose Security standards to include in PDF',
  'securityreport.download.pdf.modal.default_selection_text':
    'Includes Security standards: Sonar, OWASP Top 10 2025, CWE Top 25 2024, and OWASP Top 10 for LLM 2026',
  'securityreport.download.pdf.modal.custom_selection_text':
    'Choose one or more from the list of available Security standards',
  'securityreport.download.pdf.modal.custom_selection_label': 'Select Security standard(s)',
  'securityreport.download.pdf.modal.custom_selection_select_all': 'Select all',
  'securityreport.download.pdf.modal.download_option.label.default': 'Default',
  'securityreport.download.pdf.modal.download_option.label.custom': 'Custom selection',
  'securityreport.standard.summary':
    'Security issues and Security Hotspots conforming to {standard} security categories, ordered by impact. The report results are generated based on relevant active security rules in your {qualifier}.',
  'securityreport.standard.summary.cra':
    'Identify and remediate security gaps relative to the EU <link>Cyber Resilience Act</link> (CRA). This report tracks your progress across Annex I requirements, highlighting exactly where your software diverges from the standard.',
  'securityreport.standard.summary.cra.information':
    'Information: To meet EU Cyber Resilience Act requirements, please enable <advancedSecurityLink>SonarQube Advanced Security</advancedSecurityLink>. This provides the Software Bill of Materials (SBOM) and dependency analysis necessary for a compliant security posture.',
  'securityreport.not_covered.warning':
    'Not all {0} requirements can be detected using static analysis. Furthermore, some requirements that can be detected using static analysis are not yet supported by our analyzers. An empty or hidden requirement does not mean that the requirement is fulfilled.',
  'securityreport.not_covered.warning.count': 'Currently, we analyze {0} requirements.',
  'securityreport.total_vulnerabilities': 'Security issues to address',
  'securityreport.total_hotspots': 'Security Hotspots that need review',
  'securityreport.total_dependency_risks': 'Dependency Risks',
  'securityreport.total_vulnerabilities.screen_reader':
    '{count} Security {count, plural, one {Vulnerability} other {Vulnerabilities}} to address',
  'securityreport.total_hotspots.screen_reader':
    '{count} Security {count, plural, one {Hotspot} other {Hotspots}} that need review',
  'securityreport.total_dependency_risks.screen_reader':
    '{count} Dependency {count, plural, one {Risk} other {Risks}} to address',
  'securityreport.level': 'Level {0}',
  'securityreport.label.version': 'Select {0} version',
  'securityreport.label.owaspAsvs_level': 'Select OWASP ASVS level',
  'securityreport.overview.title': 'Security reports overview',
  'securityreport.overview.hotspots_deprecated_warning':
    'The concept of Security Hotspots is deprecated. Security Hotspot findings will appear as security issues / vulnerabilities. <link>Learn more in the documentation</link>',
  'securityreport.overview.description':
    'Track Security issues and Security Hotspots in your {qualifier}. Security Reports require an analysis to reflect any changes done to issues. Learn more about Security Reports in our <link>user guide.</link>',
  'securityreport.overview_metric.security_rating.title': '{qualifier} overall Security rating',
  'securityreport.overview_metric.security_review_rating.title':
    '{qualifier} overall Security Review rating',
  'securityreport.overview_metric.security_rating.description':
    'Based on issues marked as potential weaknesses to hackers',
  'securityreport.overview_metric.security_review_rating.description':
    'Based on the percentage of hotspots reviewed',
  'securityreport.overview_metric.sca_rating_any_security.title':
    '{qualifier} overall Dependency Security Risk rating',
  'securityreport.overview_metric.sca_rating_any_security.description':
    'Based on severity of dependency security risks',
  'securityreport.overview_metric.sca_rating_malware.title':
    '{qualifier} overall Malicious Package Risk rating',
  'securityreport.overview_metric.sca_rating_malware.description':
    'Based on severity of malicious package risks',
  'sca.container_images.tag_label': 'Tag',
  'sca.container_images.empty.start_setup': 'Start Setup',
  'sca.container_images.empty.steps': 'Scan setup instructions',
  'sca.container_images.empty.download.title': 'Download the scanner',
  'sca.container_images.empty.download.action': 'Download scanner',
  'sca.container_images.empty.install.description':
    'In a terminal, make the downloaded binary executable, then run it from its folder or add it to your PATH.',
  'sca.container_images.empty.install.linux': 'Linux x64 example',
  'sca.container_images.empty.install.copy': 'Copy Linux installation commands',
  'sca.container_images.empty.install.windows': 'Windows x64 example',
  'sca.container_images.empty.install.windows.copy': 'Copy Windows installation command',
  'sca.container_images.empty.install.note':
    'Replace the version placeholder with the version in the downloaded file name. Run the scanner from its folder or add it to your PATH.',
  'sca.container_images.empty.scan.title': 'Set credentials and run a scan',
  'sca.container_images.empty.scan.description':
    'Set your user token, then run these commands in a Unix shell. Use CI secrets for automated scans. The image must be available locally, for example after docker build or docker pull.',
  'sca.container_images.empty.scan.copy': 'Copy credential and scan commands',
  'sca.container_images.empty.token': 'Create a user token',
  'sca.container_images.empty.results.title': 'See the results here',
  'sca.container_images.empty.results.description':
    'After the scan completes, results will appear in Container images.',
  'sca.container_images.empty.supported':
    'Supported base images: Red Hat Enterprise Linux, Debian 11+, Ubuntu, and Alpine.',
};
