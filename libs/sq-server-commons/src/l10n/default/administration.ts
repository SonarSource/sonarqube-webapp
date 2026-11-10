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

export const administrationMessages = {
  'organization.ai_agents.scheduled_jobs.frequency.monthly': 'Monthly',
  'global_permissions.page': 'Global permissions',
  'global_permissions.page.description':
    'Grant and revoke permissions to make changes at the global level. These permissions include editing quality profiles, executing analysis, and performing global system administration.',
  'settings.page': 'General settings',
  'settings.page.description': 'Edit global settings for this {instance} instance.',
  'permissions.page': 'Permissions',

  //------------------------------------------------------------------------------
  //
  // Admin notification
  //
  //------------------------------------------------------------------------------
  'admin_notification.update.new_patch':
    'There’s an update available for your {productName} instance. Please update to make sure you benefit from the latest security and bug fixes.',
  'admin_notification.update.new_version':
    'There’s a new version of {productName} available. Update to the latest version to access new updates and features.',
  'admin_notification.update.current_version_inactive':
    'You’re running a version of {productName} that is no longer active. Please update to an active version as soon as possible.',
  'admin_notification.update.new_sqcb_version':
    'Keep your instance current and get the {link}, available now.',
  'admin_notification.update.latest': 'latest {productName}',
  'admin_notification.update.new_sqs_version_when_running_sqcb.banner':
    'There’s a new version of SonarQube Server available.',
  'admin_notification.update.new_sqs_version_when_running_sqcb.modal':
    'New SonarQube Server version available',
  'admin_notification.update.new_sqs_version_when_running_sqcb.upgrade':
    'Upgrade to SonarQube Server and get access to enterprise features',

  //------------------------------------------------------------------------------
  //
  // SETTINGS
  //
  //------------------------------------------------------------------------------
  'settings.key_x': 'Key: {0}',
  'settings.not_set': '(not set)',
  'settings.state.saving': 'Saving...',
  'settings.state.saved': 'Saved!',
  'settings.state.confirmation.title':
    '{value, select, true {Activate} false {Deactivate} other {Save}} "{name}"?',
  'settings.state.validation_failed': 'Validation failed. {0}',
  'settings.state.value_cant_be_empty':
    'Provide a value or use "Reset" to set the value to the default one.',
  'settings.state.value_cant_be_empty_no_default': 'Provide a value.',
  'settings.state.url_not_valid': '{url} is not a valid URL',
  'settings.boolean.true': 'True',
  'settings.boolean.false': 'False',
  'settings.default.no_value': "'<no value>'",
  'settings.default.complex_value': "'<complex value>'",
  'settings.default.password': "'<password>'",
  'settings.reset_confirm.title': 'Reset Setting',
  'settings.reset_confirm.description': 'Are you sure that you want to reset this setting?',
  'settings.definition.reset': 'Reset "{0}" to default values',
  'settings.definition.delete_value': 'Delete value "{1}" for setting "{0}"',
  'settings.definitions.delete_fields': 'Delete row {1} for setting "{0}"',
  'settings.deprecated_setting_warning':
    'This feature is deprecated and will be removed in a future release',

  'settings.search.placeholder': 'Find in settings',

  'settings.json.format': 'Format JSON',
  'settings.json.format_error': 'Formatting requires valid JSON. Please fix it and retry.',

  'settings.analysis_scope.introduction':
    'Narrow the focus by configure what will be analyzed and how. Learn more about <link>analysis scope</link>.',
  'settings.analysis_scope.wildcards.introduction':
    'You can set analysis parameters by using the following <link>wild card patterns</link>:',
  'settings.analysis_scope.wildcards.zero_more_char': 'Match zero or more characters',
  'settings.analysis_scope.wildcards.zero_more_dir': 'Match zero or more directories',
  'settings.analysis_scope.wildcards.single_char': 'Match a single character',

  'settings.new_code_period.category': 'New code',

  'settings.projects.default_visibility_of_new_projects': 'Default visibility of new projects:',
  'settings.projects.change_visibility_form.label': 'Change default visibility of new projects',
  'settings.projects.change_visibility_form.header': 'Set Default Visibility of New Projects',
  'settings.projects.change_visibility_form.warning':
    'This will not change the visibility of already existing projects.',
  'settings.projects.change_visibility_form.warning.github':
    'This will not change the visibility of already existing projects. Additionally, projects bound to GitHub will not be affected by this option and will be ignored.',
  'settings.projects.change_visibility_form.warning.gitlab':
    'This will not change the visibility of already existing projects. Additionally, projects bound to GitLab will not be affected by this option and will be ignored.',
  'settings.projects.change_visibility_form.submit': 'Change Default Visibility',

  'settings.almintegration.title': 'DevOps Platform Integrations',
  'settings.almintegration.description':
    "DevOps Platform integrations allow {productName} to interact with your DevOps Platform. This enables things like authentication, or providing analysis details and a quality gate to your Pull Requests directly in your DevOps Platform's interface.",
  'settings.almintegration.empty.server_base_url':
    'You need to set the Server Base URL in General > {serverBaseUrl} to have correct links from the DevOps Platform to your {productName} instance.',
  'settings.almintegration.empty.server_base_url.setting_link': 'Server Base URL',
  'settings.almintegration.tab.github': 'GitHub',
  'settings.almintegration.tab.bitbucket': 'Bitbucket',
  'settings.almintegration.tab.azure': 'Azure DevOps',
  'settings.almintegration.tab.gitlab': 'GitLab',
  'settings.almintegration.github.info':
    'You need to install a GitHub App with specific settings and permissions to enable Pull Request Decoration on your Organization or Repository. {link}',
  'settings.almintegration.github.additional_permission':
    'If quality gate status reporting fails on private projects, you might need to add an additional permission to the GitHub App. {link}',
  'settings.almintegration.bitbucketcloud.info':
    '{productName} needs you to create an {oauth} in your Bitbucket Cloud workspace settings to report the quality gate status on Pull Requests. It needs to be a private client with {permission} permission. An OAuth callback URL is required by Bitbucket Cloud but not used by {productName} so any URL works. {doc_link}',
  'settings.almintegration.bitbucketcloud.oauth': 'OAuth client',
  'settings.almintegration.empty.azure':
    'Create your first Azure DevOps configuration to start analyzing your repositories on {productName}.',
  'settings.almintegration.empty.bitbucket':
    'Create your first Bitbucket configuration to start analyzing your repositories on {productName}.',
  'settings.almintegration.empty.github':
    'Create your first GitHub configuration to start analyzing your repositories on {productName}.',
  'settings.almintegration.empty.gitlab':
    'Create your first GitLab configuration to start analyzing your repositories on {productName}.',
  'settings.almintegration.create': 'Create configuration',
  'settings.almintegration.create.manual': 'Configure manually',
  'settings.almintegration.create.tooltip':
    'Upgrade to {link} to integrate with multiple {alm} instances.',
  'settings.almintegration.create.tooltip.link': 'Enterprise Edition',
  'settings.almintegration.github.manifest.create': 'Create GitHub App',
  'settings.almintegration.github.manifest.title': 'Create a GitHub App automatically',
  'settings.almintegration.github.manifest.info':
    'SonarQube will pre-configure a GitHub App with the required permissions and webhook for you.',
  'settings.almintegration.github.manifest.name.help':
    'A unique name for this DevOps Platform configuration in SonarQube.',
  'settings.almintegration.github.manifest.name.placeholder': 'your-sonar-organization-name',
  'settings.almintegration.github.manifest.organization': 'GitHub organization',
  'settings.almintegration.github.manifest.organization.help':
    'The GitHub organization the App will be created under. Leave empty to create it under your personal account.',
  'settings.almintegration.github.manifest.organization.placeholder':
    'your-github-organization-name',
  'settings.almintegration.github.manifest.continue': 'Continue to GitHub',
  'settings.almintegration.github.manifest.also_auth':
    'Also set up GitHub authentication (sign-in) with this App',
  'settings.almintegration.github.manifest.also_devops':
    'Also set up the DevOps Platform integration (project import) with this App',
  'settings.almintegration.github.manifest.success':
    'The GitHub App for configuration "{0}" was created successfully.',
  'settings.almintegration.github.manifest.error':
    'Failed to create the GitHub App through the manifest flow. {0}',
  'settings.almintegration.github.manifest.installed':
    'The GitHub App was created and installed successfully.',
  'settings.almintegration.github.manifest.install_requested':
    'The GitHub App was created. Its installation is pending approval from an organization owner.',
  'settings.almintegration.check_configuration': 'Check configuration',
  'settings.almintegration.check_configuration_x': 'Check configuration "{0}"',
  'settings.almintegration.edit_configuration': 'Edit configuration "{0}"',
  'settings.almintegration.delete_configuration': 'Delete configuration "{0}"',
  'settings.almintegration.checking_configuration': 'Checking configuration',
  'settings.almintegration.configuration_valid': 'Configuration valid',
  'settings.almintegration.configuration_invalid':
    'You have the following errors in your configuration:',
  'settings.almintegration.could_not_validate': 'Could not validate this configuration.',

  // Remediation Agent capability status (SONAR-32166) — third item in the existing capability
  // row on each DevOps Platform Integrations connection card, beside "Quality gate status
  // reporting" and "Import repositories...". Same icon vocabulary, and the existing "Check
  // configuration" action (re)runs this check — there is no separate refresh control. Reuses
  // ai_capabilities.remediation_agent.dop_permission_warning.* copy for the Azure-advisory
  // (yellow) and GitLab-token-type banners; the strings below are new to this surface.
  'settings.almintegration.remediation_agent.title': 'Create branches and pull requests',
  'settings.almintegration.remediation_agent.description':
    'Required for Remediation Agent to clone repositories, create branches, and open pull requests.',
  'settings.almintegration.remediation_agent.status.missing_permissions': 'Missing permissions',
  'settings.almintegration.remediation_agent.status.unable_to_verify': 'Unable to verify',
  'settings.almintegration.remediation_agent.unable_to_verify_description':
    "We couldn't reach your DevOps Platform to run the check. Select Check configuration to try again.",
  'settings.almintegration.remediation_agent.app_missing_permissions':
    'The GitHub App must request {permissions}. <nowrap><link>Required permissions</link>.</nowrap>',
  'settings.almintegration.remediation_agent.gitlab_missing_scope':
    'The GitLab personal access token must have the api scope. <nowrap><link>Required permissions</link>.</nowrap>',
  'settings.almintegration.remediation_agent.installations.summary':
    "{count, plural, one {Can't create branches and pull requests on # installation.} other {Can't create branches and pull requests on # installations.}}",
  'settings.almintegration.remediation_agent.installations.show': 'Show',
  'settings.almintegration.remediation_agent.installations.hide': 'Hide',
  'settings.almintegration.remediation_agent.installations.incomplete':
    "We couldn't check every installation. Select Check configuration to try again.",
  'settings.almintegration.remediation_agent.installations.none':
    'No installations were found for this GitHub App.',
  'settings.almintegration.remediation_agent.installations.remaining':
    '{count, plural, one {+# more installation} other {+# more installations}}',
  'settings.almintegration.remediation_agent.installations.settings_link': 'Installation settings',
  'settings.almintegration.delete.header': 'Delete configuration',
  'settings.almintegration.delete.message':
    'Are you sure you want to delete the {id} configuration?',
  'settings.almintegration.delete.info':
    '{0} projects will no longer get Pull Request Decorations.',
  'settings.almintegration.delete.no_info':
    'An unknown number of projects will no longer get Pull Request Decorations.',
  'settings.almintegration.form.app_id.github.help':
    "The App ID is found on your GitHub App's page on GitHub at Settings > Developer Settings > GitHub Apps",
  'settings.almintegration.form.header.create': 'Create a configuration',
  'settings.almintegration.form.header.edit': 'Edit the configuration',
  'settings.almintegration.form.name.azure': 'Configuration name',
  'settings.almintegration.form.name.azure.help':
    'Give your configuration a clear and succinct name. This name will be used at project level to identify the correct configured Azure instance for a project.',
  'settings.almintegration.form.choose_bitbucket_variant':
    'Select which variant you want to configure',
  'settings.almintegration.form.name.bitbucket': 'Configuration name',
  'settings.almintegration.form.name.bitbucket.help':
    'Give your configuration a clear and succinct name. This name will be used at project level to identify the correct configured Bitbucket instance for a project.',
  'settings.almintegration.form.name.bitbucketcloud.help':
    'Give your configuration a clear and succinct name. This name will be used at project level to identify the correct configured Bitbucket Cloud instance for a project.',
  'settings.almintegration.form.name.github': 'Configuration name',
  'settings.almintegration.form.name.github.help':
    'Give your configuration a clear and succinct name. This name will be used at project level to identify the correct configured GitHub App for a project.',
  'settings.almintegration.form.name.gitlab': 'Configuration name',
  'settings.almintegration.form.name.gitlab.help':
    'Give your configuration a clear and succinct name. This name will be used at project level to identify the correct configured GitLab instance for a project.',
  'settings.almintegration.form.workspace.bitbucketcloud': 'Workspace ID',
  'settings.almintegration.form.workspace.bitbucketcloud.error':
    "Workspace ID's can only contain lowercase letters, numbers, dashes, and underscores.",
  'settings.almintegration.form.workspace.bitbucketcloud.help':
    'The workspace ID is part of your bitbucket cloud URL {example}',
  'settings.almintegration.form.oauth_key.bitbucketcloud.help':
    'Bitbucket generates the Client ID when you create your OAuth client. You can find it in your Bitbucket Cloud workspace settings under OAuth clients.',
  'settings.almintegration.form.oauth_secret.bitbucketcloud.help':
    'Bitbucket generates the Client Secret when you create your OAuth client. You can find it in your Bitbucket Cloud workspace settings under OAuth clients.',
  'settings.almintegration.form.url.azure': 'Azure DevOps URL',
  'settings.almintegration.form.url.azure.help1':
    'For Azure DevOps Server, provide the full collection URL:',
  'settings.almintegration.form.url.azure.help2':
    'For Azure DevOps Services, provide the full organization URL:',
  'settings.almintegration.form.url.bitbucket': 'Bitbucket Data Center URL',
  'settings.almintegration.form.url.bitbucket.help':
    'Example: https://bitbucket-datacenter.your-company.com',
  'settings.almintegration.form.url.github': 'GitHub API URL',
  'settings.almintegration.form.url.github.help1': 'Example for GitHub Enterprise:',
  'settings.almintegration.form.url.github.help2': 'If using GitHub.com:',
  'settings.almintegration.form.url.github.private_key_warning':
    'For security reasons, please make sure to provide the GitHub App private key to update the URL.',
  'settings.almintegration.form.url.gitlab': 'GitLab API URL',
  'settings.almintegration.form.url.gitlab.help': 'Provide the GitLab API URL. For example:',
  'settings.almintegration.form.url.pat_warning':
    'For security reasons, please make sure to provide the Personal Access Token to update the URL.',
  'settings.almintegration.form.app_id': 'GitHub App ID',
  'settings.almintegration.form.client_id.github': 'Client ID',
  'settings.almintegration.form.client_id.github.help':
    "The Client ID is found on your GitHub App's page.",
  'settings.almintegration.form.client_secret.github': 'Client Secret',
  'settings.almintegration.form.client_secret.github.help':
    "The Client secret is found on your GitHub App's page.",
  'settings.almintegration.form.client_id.bitbucketcloud': 'Client ID',
  'settings.almintegration.form.client_secret.bitbucketcloud': 'Client Secret',
  'settings.almintegration.form.private_key': 'Private Key',
  'settings.almintegration.form.private_key.github.help':
    "Your GitHub App's private key. You can generate a .pem file from your GitHub App's page under Private keys. Copy and paste the whole contents of the file here.",
  'settings.almintegration.form.webhook_secret.github': 'Webhook Secret',
  'settings.almintegration.form.webhook_secret.github.help':
    'Leave this field empty unless you are using GitHub Code Scanning Alert feature. See documentation for more details.',
  'settings.almintegration.form.personal_access_token': 'Personal Access Token',
  'settings.almintegration.form.personal_access_token.azure.help':
    '{productName} needs a {pat} to report the quality gate status on Pull Requests in Azure DevOps. To create this token, we recommend using a dedicated Azure DevOps account with administration permissions. The token itself needs {permission} permissions. {doc_link}',
  'settings.almintegration.form.personal_access_token.azure.help.url': 'Personal Access Token',
  'settings.almintegration.form.personal_access_token.gitlab.help':
    '{productName} needs a {pat} to report the quality gate status on Merge Requests in GitLab. To create this token, we recommend using a dedicated GitLab account with {permission} permission to all target projects. The token itself needs the {scope} scope. {doc_link}',
  'settings.almintegration.form.personal_access_token.gitlab.help.url': 'Personal Access Token',
  'settings.almintegration.form.personal_access_token.bitbucket.help':
    '{productName} needs a {pat} to report the quality gate status on Pull Requests in Bitbucket Data Center. To create this token, we recommend using a dedicated Bitbucket Data Center account with administration permissions. The token itself needs {permission} permission. {doc_link}',
  'settings.almintegration.form.personal_access_token.bitbucket.help.url': 'Personal Access Token',
  'settings.almintegration.form.save': 'Save configuration',
  'settings.almintegration.form.secret.field': 'This field is hidden for security reasons.',
  'settings.almintegration.form.secret.update_field': 'Update field value',
  'settings.almintegration.form.secret.update_field_x': 'Update {0} value',
  'settings.almintegration.form.secret.can_encrypt': 'You can encrypt this value. {learn_more}',
  'settings.almintegration.feature.status_reporting.title': 'Quality gate status reporting',
  'settings.almintegration.feature.status_reporting.description_pr':
    "Add analysis and a quality gate to your Pull Requests directly in your DevOps Platform's interface.",
  'settings.almintegration.feature.status_reporting.description_pr_and_commits':
    "Add the quality gate status to your Pull Requests and on analyzed commits directly in your DevOps Platform's interface.",
  'settings.almintegration.feature.status_reporting.description_mr':
    "Add analysis and a quality gate to your Merge Requests directly in your DevOps Platform's interface.",
  'settings.almintegration.feature.pr_decoration.disabled': 'Disabled',
  'settings.almintegration.feature.pr_decoration.disabled.no_branches':
    'Upgrade to {link} to enable this feature.',
  'settings.almintegration.feature.pr_decoration.disabled.no_branches.link': 'Developer Edition',
  'settings.almintegration.feature.alm_repo_import.title':
    'Import repositories from your DevOps Platform',
  'settings.almintegration.feature.alm_repo_import.description':
    'Select repositories from your DevOps Platform, and import them into {productName}.',
  'settings.almintegration.feature.alm_repo_import.disabled': 'Disabled',
  'settings.almintegration.feature.alm_repo_import.disabled.no_url':
    'This feature is disabled because your configured instance has no URL.',
  'settings.almintegration.tabs.authentication_moved':
    'You can delegate authentication to this DevOps Platform. The relevant settings are under the {link} section.',

  // Authentication Common
  'settings.authentication.title': 'Authentication',
  'settings.authentication.custom_message_information':
    'You can define a custom log-in message to appear on the log-in page to help your users authenticate. The relevant settings are available under the {link} section.',
  'settings.authentication.custom_message_information.link': 'General',
  'settings.authentication.description':
    'The following settings allow you to delegate authentication via SAML, or any of the following DevOps Platforms: GitHub, GitLab, and Bitbucket.',
  'settings.authentication.help':
    'For details on how to set up authentication, check out the {link}.',
  'settings.authentication.legacy_help.github':
    'Compatibility with GitHub OAuth App is deprecated and will be removed in a future release. Please check out the {link} for information on how to update your configuration.',
  'settings.authentication.help.link': 'documentation',
  'settings.authentication.form.create': 'Create configuration',
  'settings.authentication.form.create.manual': 'Configure manually',
  'settings.authentication.form.edit': 'Edit',
  'settings.authentication.form.delete': 'Delete',
  'settings.authentication.form.delete.tooltip':
    'You can only delete a configuration if it is disabled.',
  'settings.authentication.form.loading': 'Loading configuration',
  'settings.authentication.form.enable': 'Enable configuration',
  'settings.authentication.form.disable': 'Disable configuration',
  'settings.authentication.form.disable.tooltip':
    'You can not disable this configuration while using Automatic Provisioning. You must be in Just-in-Time Provisioning mode to disable this configuration.',
  'settings.authentication.form.provisioning': 'Provisioning',
  'settings.authentication.form.provisioning_at_login':
    'Just-in-Time user and group provisioning (default)',
  'settings.authentication.form.other_provisioning_enabled':
    'Already enabled for another provider.  Only one identity provider can have automatic users and groups provisioning enabled.',
  'settings.authentication.form.settings.save_success': 'Settings saved successfully.',
  'settings.authentication.confirm_auto_provisioning.header':
    'Automatic provisioning has been enhanced',
  'settings.authentication.confirm_auto_provisioning.description1':
    'Your current version of automatic provisioning has been suspended and you must confirm a provisioning method.',
  'settings.authentication.confirm_auto_provisioning.description2':
    'Automatic provisioning has now been enhanced with the 10.7 release. For more details, read our {documentation}.',
  'settings.authentication.confirm_auto_provisioning.question': 'Select your provisioning method',
  'settings.authentication.confirm_auto_provisioning.confirm_choice': 'Confirm choice',
  'settings.authentication.confirm_auto_provisioning.auto.label':
    'Enhanced automatic provisioning (recommended)',
  'settings.authentication.confirm_auto_provisioning.auto.help':
    'Now synchronizes users, groups, permissions and project visibility',
  'settings.authentication.confirm_auto_provisioning.jit.label': 'Just-in-Time provisioning',
  'settings.authentication.confirm_auto_provisioning.jit.help':
    'Synchronises users and groups only',

  // GITHUB
  'settings.authentication.github.form.create': 'New GitHub Configuration',
  'settings.authentication.github.form.edit': 'Edit GitHub Configuration',
  'settings.authentication.github.appid_x': 'App ID: {applicationId}',
  'settings.authentication.github.confirm.AUTO_PROVISIONING': 'Switch to automatic provisioning',
  'settings.authentication.github.confirm.JIT': 'Switch to Just-in-Time provisioning',
  'settings.authentication.github.confirm.insecure': 'Potentially insecure configuration',
  'settings.authentication.github.confirm.AUTO_PROVISIONING.description':
    'Once you transition to automatic provisioning, groups, users, group memberships, and permissions on GitHub projects will be inherited from GitHub. You will no longer have the ability to edit them within {productName}. Do you want to proceed with this change?',
  'settings.authentication.github.confirm.JIT.description':
    'Switching to Just-in-Time provisioning removes the automatic synchronization of users, groups, and group memberships. Users are provisioned and group memberships are updated only at user login. Are you sure?',
  'settings.authentication.github.provisioning_change.confirm_changes': 'Confirm change',
  'settings.authentication.github.provisioning_change.insecure_config':
    "Please be aware that your configuration is potentially insecure because you didn't add any organization to the allowlist. If your GitHub App is public, anyone can install it and gain access to your instance.",
  'settings.authentication.github.configuration': 'GitHub Configuration',
  'settings.authentication.github.form.not_configured': 'GitHub App is not configured',
  'settings.authentication.github.form.legacy_configured':
    'Compatibility with GitHub OAuth Apps is deprecated and will be removed in a future release. As such, your current configuration will continue to work but some features will no longer be available. We recommend that you create a new GitHub App configuration. This will automatically replace your current GitHub OAuth App configuration. {documentation}',
  'settings.authentication.github.form.legacy_configured.link':
    'Learn more about how to create a GitHub App configuration',
  'settings.authentication.github.enable_first':
    'Enable your GitHub configuration for more provisioning options.',
  'settings.authentication.github.form.allowedOrganizations.name': 'Organizations',
  'settings.authentication.github.form.allowedOrganizations.description':
    'Only members of these organizations will be able to authenticate to the server. ⚠ if not set, users from any organization where the GitHub App is installed will be able to login to this {productName} instance.',
  'settings.authentication.github.form.apiUrl.name': 'The API url for a GitHub instance.',
  'settings.authentication.github.form.apiUrl.description':
    'The API url for a GitHub instance. https://api.github.com/ for GitHub.com, https://github.company.com/api/v3/ when using GitHub Enterprise',
  'settings.authentication.github.form.applicationId.name': 'App ID',
  'settings.authentication.github.form.applicationId.description':
    "The App ID is found on your GitHub App's page on GitHub at Settings > Developer Settings > GitHub Apps.",
  'settings.authentication.github.form.clientId.name': 'Client ID',
  'settings.authentication.github.form.clientId.description':
    'Client ID provided by GitHub when registering the application.',
  'settings.authentication.github.form.clientSecret.name': 'Client Secret',
  'settings.authentication.github.form.clientSecret.description':
    'Client password provided by GitHub when registering the application.',
  'settings.authentication.github.form.privateKey.name': 'Private Key',
  'settings.authentication.github.form.privateKey.description':
    "Your GitHub App's private key. You can generate a .pem file from your GitHub App's page under Private keys. Copy and paste the whole contents of the file here.",
  'settings.authentication.github.form.synchronizeGroups.name': 'Synchronize teams as groups',
  'settings.authentication.github.form.synchronizeGroups.description':
    'Synchronize GitHub team with {productName} group memberships when users log in to {productName}. For each GitHub team they belong to, users will be associated to a group of the same name if it exists in {productName}.',
  'settings.authentication.github.form.webUrl.name': 'The WEB url for a GitHub instance.',
  'settings.authentication.github.form.webUrl.description':
    'The WEB url for a GitHub instance. https://github.com/ for GitHub.com, https://github.company.com/ when using GitHub Enterprise.',
  'settings.authentication.github.form.private_key.required_for_url_change':
    'Please provide your private key again to update the API URL or the Web URL.',
  'settings.authentication.github.form.provisioning_with_github':
    'Automatic user, group, and permission provisioning',
  'settings.authentication.github.form.provisioning_with_github_short.autoProvisioning':
    'Automatic provisioning',
  'settings.authentication.github.form.provisioning_with_github_short.jit':
    'Just-in-Time provisioning',
  'settings.authentication.github.form.provisioning_with_github.description':
    'Users, groups and permissions are automatically provisioned from your GitHub organizations. Once activated, users and groups can only be created and modified from your GitHub organizations/teams. Existing local users will be kept and can only be deactivated. {documentation}',
  'settings.authentication.github.form.provisioning_at_login.description':
    'Users and groups are synchronized only when users log in to {productName}. {documentation}',
  'settings.authentication.github.form.provisioning.disabled':
    'Your current edition does not support provisioning with GitHub. See the {documentation} for more information.',
  'settings.authentication.github.form.allowUsersToSignUp.name': 'Allow users to sign up',
  'settings.authentication.github.form.allowUsersToSignUp.description':
    'Allow new users to authenticate. When set to disabled, only existing users will be able to authenticate to the server.',
  'settings.authentication.github.form.projectVisibility.name': 'Provision project visibility',
  'settings.authentication.github.form.projectVisibility.description':
    'Change project visibility based on GitHub repository visibility. If disabled, every provisioned project will be private in {productName} and visible only to users with explicit GitHub permissions for the corresponding repository. Changes take effect at the next synchronization.',
  'settings.authentication.github.synchronize_now': 'Synchronize now',
  'settings.authentication.github.configuration.validation.details': 'View details',
  'settings.authentication.github.configuration.validation.valid.short': 'Configuration is valid.',
  'settings.authentication.github.configuration.validation.valid':
    'Configuration is valid for {0}. {1} organizations will be synced.',
  'settings.authentication.github.configuration.validation.valid_one':
    "Configuration is valid for {0}. Organization '{1}' will be synced.",
  'settings.authentication.github.configuration.validation.invalid':
    'Configuration is invalid. {0}',
  'settings.authentication.github.configuration.validation.invalid_org':
    'Organization "{0}" has the following error: {1}',
  'settings.authentication.github.configuration.validation.details.title': 'Configuration validity',
  'settings.authentication.github.configuration.validation.details.valid_label': 'Valid',
  'settings.authentication.github.configuration.validation.details.invalid_label': 'Invalid',
  'settings.authentication.github.configuration.validation.details.org_not_found':
    '{0} (not found or app not installed)',
  'settings.authentication.github.configuration.roles_mapping.description':
    'When synchronizing users and groups, {productName} assigns permissions based on GitHub user and team roles. You can customize the mapping of permissions. The new mapping will take effect at the next synchronization.',
  'settings.authentication.github.configuration.roles_mapping.save_success':
    'GitHub roles mapping saved successfully.',
  'settings.authentication.github.configuration.roles_mapping.dialog.custom_roles_description':
    'When a custom role name added here matches an existing GitHub custom role in any of your organizations, the mapping applies to all users with this custom role. If an existing GitHub custom role has no exact match in this list, the permissions of its inherited base role are mapped.',

  // GITLAB
  'settings.authentication.gitlab.configuration': 'GitLab Configuration',
  'settings.authentication.gitlab.form.not_configured': 'GitLab App is not configured',
  'settings.authentication.gitlab.form.create': 'New GitLab Configuration',
  'settings.authentication.gitlab.form.edit': 'Edit GitLab Configuration',
  'settings.authentication.gitlab.form.applicationId.name': 'Application ID',
  'settings.authentication.gitlab.form.applicationId.description':
    'Application ID provided by GitLab when registering the application.',
  'settings.authentication.gitlab.form.url.name': 'GitLab URL',
  'settings.authentication.gitlab.form.url.description': 'URL to access GitLab.',
  'settings.authentication.gitlab.form.secret.name': 'Secret',
  'settings.authentication.gitlab.form.secret.description':
    'Secret provided by GitLab when registering the application.',
  'settings.authentication.gitlab.form.secret.required_for_url_change':
    'Please provide your secret again to update the URL.',
  'settings.authentication.gitlab.form.synchronizeGroups.name': 'Synchronize user groups',
  'settings.authentication.gitlab.form.synchronizeGroups.description':
    'For each GitLab group they belong to, the user will be associated to a group with the same name (if it exists) in {productName}. If enabled, the GitLab OAuth 2 application will need to provide the api scope.',
  'settings.authentication.gitlab.form.allowedGroups.name': 'Allowed groups',
  'settings.authentication.gitlab.form.allowedGroups.description.JIT':
    "Provision only the specified groups and their subgroups by adding each root group's exact GitLab URL slug",
  'settings.authentication.gitlab.form.allowedGroups.description.AUTO_PROVISIONING':
    'You can restrict provisioning to specific groups.',
  'settings.authentication.gitlab.form.allowedGroups.placeholder': 'gitlab-group-slug',
  'settings.authentication.gitlab.form.allowedGroups.allow_all.label': 'Allow all groups',
  'settings.authentication.gitlab.form.allowedGroups.allow_all.help':
    'Provision all private and public groups',
  'settings.authentication.gitlab.form.allowedGroups.allow_all.warning':
    'Allowing all groups is less secure. SonarQube syncs all available GitLab groups, potentially granting unintended access. Use this only if you trust the entire GitLab instance.',
  'settings.authentication.gitlab.form.allowedGroups.allow_specific.label': 'Allow specific groups',
  'settings.authentication.gitlab.form.allowedGroups.allow_specific.help':
    "Provision only the specified groups and their subgroups by adding each root group's exact GitLab URL slug",
  'settings.authentication.gitlab.form.allowUsersToSignUp.name': 'Allow users to sign up',
  'settings.authentication.gitlab.form.allowUsersToSignUp.description':
    'Allow new users to authenticate. When set to disabled, only existing users will be able to authenticate to the server.',
  'settings.authentication.gitlab.form.allowUsersToSignUp.info':
    'Allow users to sign up is enabled. To prevent any GitLab user from logging in, also enable group synchronization and restrict access to specific groups.',
  'settings.authentication.gitlab.form.provisioningToken.name': 'Provisioning token',
  'settings.authentication.gitlab.form.provisioningToken.description':
    'Token used for user provisioning. It can be either a group or personal access token and must have visibility on the groups to be provisioned.',
  'settings.authentication.gitlab.applicationId.name': 'App ID: {0}',
  'settings.authentication.gitlab.enable_first':
    'Enable your GitLab configuration for more provisioning options.',
  'settings.authentication.gitlab.provisioning_at_login':
    'Just-in-Time user provisioning (default)',
  'settings.authentication.gitlab.provisioning_at_login.description':
    'Users are synchronized only when users log in to {productName}. {documentation}',
  'settings.authentication.gitlab.description.JIT.learn_more':
    'Learn more about Just-in-Time provisioning with GitLab',
  'settings.authentication.gitlab.description.AUTO_PROVISIONING.learn_more':
    'Learn more about automatic provisioning with GitLab',
  'settings.authentication.gitlab.confirm.AUTO_PROVISIONING': 'Switch to automatic provisioning',
  'settings.authentication.gitlab.confirm.JIT': 'Switch to Just-in-Time provisioning',
  'settings.authentication.gitlab.confirm.AUTO_PROVISIONING.description':
    'Once you transition to automatic provisioning users, groups and permissions on GitLab projects will be inherited from GitLab. You will no longer have the ability to edit them within {productName}. Do you want to proceed with this change?',
  'settings.authentication.gitlab.confirm.JIT.description':
    'Switching to Just-in-Time provisioning removes the automatic synchronization of users, groups and permissions. Users are provisioned and updated only at user login. Are you sure?',
  'settings.authentication.gitlab.confirm.insecure': 'Potentially insecure configuration',
  'settings.authentication.gitlab.provisioning_change.confirm_changes': 'Confirm change',
  'settings.authentication.gitlab.provisioning_change.insecure_config':
    "Please be aware that your configuration is potentially insecure because you didn't add any groups to the allowlist and you allowed users to sign up. Anyone can install it and gain access to your instance.",
  'settings.authentication.gitlab.form.provisioning_with_gitlab':
    'Automatic user, group, and permission provisioning',
  'settings.authentication.gitlab.form.provisioning_with_gitlab.description':
    'Users, groups and permissions are automatically provisioned from GitLab. Once activated, users and groups can only be created and modified from GitLab. Existing local users will be kept and can only be deactivated. {documentation}',
  'settings.authentication.gitlab.form.provisioning.disabled':
    'Your current edition does not support provisioning with GitLab. See the {documentation} for more information.',
  'settings.authentication.gitlab.configuration.unsaved_changes': 'You have unsaved changes.',
  'settings.authentication.gitlab.configuration.valid.JIT':
    'Configuration is valid for Just-in-Time provisioning.',
  'settings.authentication.gitlab.configuration.valid.AUTO_PROVISIONING':
    'Configuration is valid for Automatic provisioning.',
  'settings.authentication.gitlab.configuration.roles_mapping.description':
    'When synchronizing users and groups, {productName} assigns permissions based on Gitlab user roles. You can customize the mapping of permissions. The new mapping will take effect at the next synchronization.',
  'settings.authentication.gitlab.configuration.roles_mapping.save_success':
    'GitLab roles mapping saved successfully.',
  'settings.authentication.gitlab.configuration.roles_mapping.dialog.custom_roles_description':
    'When a custom role name added here matches an existing GitLab custom role in any of your groups or projects, the mapping applies to all users with this custom role. If an existing GitLab custom role has no exact match in this list, the permissions of its inherited base role are mapped.',

  // BITBUCKET
  'settings.authentication.gitlab.configuration.insecure':
    'BitBucket Authentication allows users to sign up, but no list of allowed workspaces was provided. This is potentially insecure. We recommend entering a list of allowed workspaces. {documentation}',

  // COMMON
  'settings.authentication.configuration.validity_check_loading': 'Checking the configuration',
  'settings.authentication.configuration.test': 'Test configuration',
  'settings.authentication.synchronization_pending': 'Synchronization is pending.',
  'settings.authentication.synchronization_in_progress': 'Synchronization is in progress.',
  'settings.authentication.synchronization_successful.with_warning':
    'Last synchronization was done {date} ago with warnings. {details}',
  'settings.authentication.synchronization_details_link': 'More details',
  'settings.authentication.synchronization_successful': 'Last synchronization was done {0} ago.',
  'settings.authentication.synchronization_failed_short': 'Last synchronization failed. {details}',
  'settings.authentication.synchronization_failed': 'Last synchronization failed {0} ago.',
  'settings.authentication.configuration.roles_mapping.dialog.title': 'Global {0} role mapping',
  'settings.authentication.configuration.roles_mapping.title': 'Role permission mapping',
  'settings.authentication.configuration.roles_mapping.button_label': 'Edit mapping',
  'settings.authentication.configuration.roles_mapping.dialog.roles_column': 'Roles',
  'settings.authentication.configuration.roles_mapping.dialog.delete_custom_role':
    'Delete custom role {0}',
  'settings.authentication.configuration.roles_mapping.dialog.add_custom_role': 'Add custom role:',
  'settings.authentication.configuration.roles_mapping.role_exists': 'Role already exists.',
  'settings.authentication.configuration.roles_mapping.empty_custom_role':
    'Custom roles should have some permissions.',

  // SAML
  'settings.authentication.form.create.saml': 'New SAML configuration',
  'settings.authentication.form.edit.saml': 'Edit SAML configuration',
  'settings.authentication.saml.configuration': 'SAML Configuration',
  'settings.authentication.saml.confirm.scim': 'Switch to automatic provisioning',
  'settings.authentication.saml.confirm.jit': 'Switch to Just-in-Time provisioning',
  'settings.authentication.saml.confirm.scim.description':
    'Once you transition to automatic provisioning, groups, users and group memberships will be managed by your identity provider. You will no longer have the ability to edit them within {productName}. Do you want to proceed with this change?',
  'settings.authentication.saml.confirm.jit.description':
    'Switching to Just-in-Time provisioning removes all information provided while automatic provisioning through SCIM was active. These changes cannot be reverted. Are you sure?',
  'settings.authentication.saml.form.not_configured': 'SAML is not configured',
  'settings.authentication.saml.form.test': 'Test configuration',
  'settings.authentication.saml.form.provisioning_at_login':
    'Just-in-Time user and group provisioning (default)',
  'settings.authentication.saml.form.provisioning_at_login.sub':
    'Use this option if your identity provider does not support the SCIM protocol.',
  'settings.authentication.saml.form.provisioning_with_scim':
    'Automatic user and group provisioning with SCIM',
  'settings.authentication.saml.form.provisioning_with_scim.sub':
    'Preferred option when using a supported identity provider.',
  'settings.authentication.saml.form.provisioning_with_scim.description':
    'Users and groups are automatically provisioned from your identity provider using the SCIM protocol. Once activated, managed users and groups can only be modified from your identity provider. Existing local users and groups will be kept.',
  'settings.authentication.saml.form.provisioning_with_scim.description.doc':
    'For a list of supported providers and more details on automatic provisioning, see {documentation}.',
  'settings.authentication.saml.form.provisioning.disabled':
    'Your current edition does not support provisioning with SCIM. See the {documentation} for more information.',
  'settings.authentication.saml.enable_first':
    'Enable your SAML configuration to benefit from automatic user provisioning options.',

  'settings.pr_decoration.binding.category': 'DevOps Platform Integration',
  'settings.pr_decoration.binding.no_bindings':
    'A system administrator needs to enable this feature in the global settings.',
  'settings.pr_decoration.binding.no_bindings.admin':
    'Set up a {link} first before you and your team can enable Pull Request Decoration.',
  'settings.pr_decoration.binding.no_bindings.link': 'global configuration',
  'settings.pr_decoration.binding.title': 'DevOps Platform Integration',
  'settings.pr_decoration.binding.description':
    'Display your quality gate status directly in your DevOps Platform.',
  'settings.pr_decoration.binding.check_configuration': 'Check configuration',
  'settings.pr_decoration.binding.check_configuration.failure':
    'You have the following errors in your configuration:',
  'settings.pr_decoration.binding.check_configuration.failure.check_global_settings':
    'Please check your {link}.',
  'settings.pr_decoration.binding.check_configuration.failure.check_global_settings.link':
    'global settings',
  'settings.pr_decoration.binding.check_configuration.contact_admin':
    'Please contact your system administrator.',
  'settings.pr_decoration.binding.check_configuration.success': 'Configuration valid.',
  'settings.pr_decoration.binding.form.name': 'Configuration name',
  'settings.pr_decoration.binding.form.name.help':
    'Each DevOps Platform instance must be configured globally first, and given a unique name. Pick the instance your project is hosted on.',
  'settings.pr_decoration.binding.form.monorepo': 'Enable monorepository support',
  'settings.pr_decoration.binding.form.monorepo.help':
    'Enable this setting if your project is part of a monorepository. {doc_link}',
  'settings.pr_decoration.binding.form.monorepo.warning':
    'This setting must be enabled for all {productName} projects that are part of a monorepository.',
  'settings.pr_decoration.binding.form.azure.project': 'Project name',
  'settings.pr_decoration.binding.form.azure.project.help':
    "The name of the Azure DevOps project containing your repository. You can find this name on your project's Overview page.",
  'settings.pr_decoration.binding.form.azure.repository': 'Repository name',
  'settings.pr_decoration.binding.form.azure.repository.help':
    "The name of your Azure DevOps repository. You can find this name on your project's Repos page.",
  'settings.pr_decoration.binding.form.azure.inline_pr_annotations':
    'Enable Inline Pull Request Annotations',
  'settings.pr_decoration.binding.form.azure.inline_pr_annotations.help':
    'When activated, issues within each file are annotated with relevant issue details.',
  'settings.pr_decoration.binding.form.github.repository': 'Repository name',
  'settings.pr_decoration.binding.form.github.repository.help':
    "The full name of your repository, including the organization. You can find this name in your repository's URL. This name is case-sensitive!",
  'settings.pr_decoration.binding.form.github.summary_comment_setting':
    'Enable analysis summary under the GitHub Conversation tab',
  'settings.pr_decoration.binding.form.github.summary_comment_setting.help':
    'When enabled, a summary is displayed under the GitHub Conversation tab. Notifications may be sent by GitHub depending on your settings.',
  'settings.pr_decoration.binding.form.bitbucket.repository': 'Project key',
  'settings.pr_decoration.binding.form.bitbucket.repository.help':
    'The project key is part of your Bitbucket Data Center repository URL. This is case-sensitive!',
  'settings.pr_decoration.binding.form.bitbucket.slug': 'Repository slug',
  'settings.pr_decoration.binding.form.bitbucket.slug.help':
    'The repository slug is part of your Bitbucket Data Center repository URL. This slug is case-sensitive!',
  'settings.pr_decoration.binding.form.bitbucketcloud.repository': 'Repository slug',
  'settings.pr_decoration.binding.form.bitbucketcloud.repository.help':
    'The repository slug is part of your Bitbucket Cloud repository URL.',

  'settings.pr_decoration.binding.form.gitlab.repository': 'Project ID',
  'settings.pr_decoration.binding.form.gitlab.repository.help':
    'The Project ID is a numerical unique identifier for your project. You can find it on your Project Overview.',

  // Design and Architecture

  // Mode
  'settings.mode.title': 'Mode',
  'settings.mode.description.line1':
    'There are two options to reflect the health of all the projects in this instance: {mqrLink} and {standardLink}',
  'settings.mode.description.line2':
    'Changing the mode will change how issues are categorized and ranked based on the results of the analysis.',
  'settings.mode.checking_instance': 'Checking your instance...',
  'settings.mode.instance_conditions_from_other_mode':
    'Some of the quality gates in this instance are using metrics that belong to the {isStandardMode, select, true {Standard Experience} other {Multi-Quality Rule Mode}}. You will be able to update them once you save the changes.',
  'settings.mode.standard.name': 'Standard Experience',
  'settings.mode.mqr.name': 'Multi-Quality Rule (MQR) Mode',
  'settings.mode.standard.description.line1':
    'Offers the traditional use of the rule types: bugs, code smells, and vulnerabilities, categorized with a single type and severity for each rule.',
  'settings.mode.standard.description.line2':
    'This approach focuses on assigning severity to a rule and its issues based on the single software quality (for example, security, reliability or maintainability) it has the largest impact on. This is the rule categorization used in {productName} 9.9 LTA and earlier.',
  'settings.mode.mqr.description.line1':
    'Aims to more accurately represent the impact software has on all software qualities. Very few issues impact only a single software quality. For instance, most vulnerabilities are also bugs. And vice versa. The MQR mode maps each rule to each of the qualities it impacts, with a separate severity rating for each quality.',
  'settings.mode.mqr.description.line2':
    'This approach focuses on ensuring the impact of an issue on all software qualities is clear, not just the most severe one.',
  'settings.mode.save.warning': 'Save changes to see them reflected in your instance',
  'settings.mode.save':
    'Save the mode. The current mode will be switched to {isStandardMode, select, true {Standard Experience} other {Multi-Quality Rule Mode}}',
  'settings.mode.save.success':
    'This instance is now in {isStandardMode, select, true {Standard Experience} other {Multi-Quality Rule Mode}}.',
  'settings.mode.mqr.advertisement':
    'If your team prefers working with Vulnerabilities, Bugs, and Code Smells, change it in the <a>Mode section</a> of General Settings',
  'settings.mode.standard.advertisement':
    'If your team prefers working with Security, Reliability, and Maintainability issues, change it in the <a>Mode section</a> of General Settings',

  // Early access features
  'settings.early_access.title': 'Early access features',
  'settings.early_access.description':
    'Features listed below are offered for free in early access trial at Sonar’s discretion. The trial may be discontinued at any time. Your organization will not be charged for using them during the trial. Terms and conditions may apply.',

  // Sandbox issue settings
  'settings.sandbox_issues.title': 'Sandbox specific issue categories after SonarQube update',
  'settings.sandbox_issues.toggle.label': 'Enable the Sandbox feature for specific issue criteria',
  'settings.sandbox_issues.toggle.description':
    'Automatically assigns the "In sandbox" status to issues caused by SonarQube updates or changes to built-in quality profiles. Excludes issues caused by code modifications. <doc>Learn more in documentation</doc>',
  'settings.sandbox_issues.qualities.title.mqr': 'Choose software quality and severity{required}',
  'settings.sandbox_issues.qualities.title.standard': 'Choose issue type and severity{required}',
  'settings.sandbox_issues.qualities.description.instance':
    'This choice will be saved as default for this instance of SonarQube.',
  'settings.sandbox_issues.qualities.description.project':
    'This choice will be saved for this project only, overriding the instance default.',
  'settings.sandbox_issues.qualities.invalid.mqr': 'Choose software quality and severity',
  'settings.sandbox_issues.qualities.invalid.standard': 'Choose issue type and severity',
  'settings.sandbox_issues.qualities.security.warning':
    '<b>Proceed with caution:</b> security issues significantly elevate the risk of a security breach',
  'settings.sandbox_issues.qualities.reliability.warning':
    '<b>Proceed with caution:</b> reliability issues can lead to unpredictable behaviour and degraded performance of your software',
  'settings.sandbox_issues.choose_severities': 'Choose severity...',
  'settings.sandbox_issues.select_severities_for': 'Select severities for {quality}',
  'settings.sandbox_issues.override_admins.title': 'Project overrides',
  'settings.sandbox_issues.override_admins.label.mqr':
    'Allow project admins to customize software quality and severity',
  'settings.sandbox_issues.override_admins.label.standard':
    'Allow project admins to customize issue type and severity',
  'settings.sandbox_issues.override_admins.helpText':
    'If unchecked, the settings above are enforced on all projects',
  'settings.sandbox_issues.default_enablement.title': 'Default project setting',
  'settings.sandbox_issues.default_enablement.yes.description':
    'Active for all existing and future projects. Can be disabled by project admins',
  'settings.sandbox_issues.default_enablement.no.description':
    'Project admins must manually enable this feature',
  'settings.sandbox_issues.default_enablement.invalid': 'Choose default status',
  'settings.sandbox_issues.deferral_days.title':
    'Automatically transition sandboxed issues to open status',
  'settings.sandbox_issues.deferral_days.description':
    'Number of days a sandboxed issue stays “In sandbox” status before it is automatically transitioned to “Open” status. Use 0 to disable it.',
  'settings.sandbox_issues.deferral_days.unit': 'days',
  'settings.sandbox_issues.deferral_days.invalid': 'Enter 0 or a positive number of days',
  'settings.sandbox_issues.confirm.title':
    'This action might compromise your code. Are you sure you want to proceed?',
  'settings.sandbox_issues.confirm.description':
    'Automatically moving security and/or reliability issues to the sandbox can significantly elevate the risk of security breach, unpredictable behaviour and degraded performance of your software if the issues are not addressed.',
  'settings.sandbox_issues.confirm.question': 'Are you sure you want to proceed?',
  'settings.sandbox_issues.enable.success': 'Sandbox feature is now enabled',
  'settings.sandbox_issues.edit.success': 'Sandbox setting changes were saved successfully',

  // Integrations settings
  'settings.instance_integrations.title': 'Integrations',
  'settings.instance_integrations.start_setup': 'Start setup',

  'settings.slack.header': 'Slack',
  'settings.slack.badge.configured': 'Configured',
  'settings.slack.badge.not_configured': 'Not configured',
  'settings.slack.description':
    '<link>Set up and configure your Slack app</link> by following our documentation. Once configured and installed, you will receive instant slack notifications when your quality gate changes.',
  'settings.slack.start_setup.no_server_base_url_warning':
    'To continue, set your "Server base URL" in the <link>general settings</link>',
  'settings.slack.start_setup.hint': 'Setup can take 5 to 10 minutes.',
  'settings.slack.app_creation.step_title': 'Create your slack app on your workspace',
  'settings.slack.app_creation.helper':
    'You will be asked to first select your workspace and confirm your details before app creation.',
  'settings.slack.app_creation.hint': 'You must have Slack admin permissions.',
  'settings.slack.app_creation.button_label': 'Create app',
  'settings.slack.app_details.step_title':
    'Copy and paste the following app credentials in the below fields',
  'settings.slack.app_details.submit_button_label': 'Save configuration',
  'settings.slack.configuration.header': 'App configuration details',
  'settings.slack.configuration.client_id': 'Client ID',
  'settings.slack.configuration.client_secret': 'Client Secret',
  'settings.slack.configuration.signing_secret': 'Signing Secret',
  'settings.slack.configuration.secret_placeholder': 'Leave field empty to keep current value',
  'settings.slack.install_app.label': 'Install SonarQube for Slack',
  'settings.slack.install_app.hint':
    'Did you know you can install SonarQube for Slack to multiple workspaces?',
  'settings.slack.update_configuration_modal.title': 'Slack configuration',
  'settings.slack.update_configuration_modal.update_button': 'Update configuration',
  'settings.slack.remove_configuration': 'Remove Slack configuration',
  'settings.slack.remove_configuration_modal.title':
    'Delete Slack configuration for this SonarQube instance?',
  'settings.slack.remove_configuration_modal.description':
    '<p>This action deletes all Slack-related data on SonarQube Server. To completely delete the configuration, you must also delete the app on Slack.</p><p>The Slack-related data includes:</p><ul><li>Configurations</li><li>Workspaces</li><li>Subscriptions to projects</li><li>Connected user accounts</li></ul>',

  // Project setting
  'settings.sandbox_issues.project.on.success': 'Sandbox feature is now enabled',
  'settings.sandbox_issues.project.off.success': 'Sandbox feature is now disabled',
  'settings.sandbox_issues.project.edit.success':
    'Sandbox setting was changed successfully for this project',
  'settings.sandbox_issues.project.reset.success': 'The setting was reset to instance default',
  'settings.sandbox_issues.project.default_settings.mqr':
    'Default permitted software qualities and severities:',
  'settings.sandbox_issues.project.default_settings.standard':
    'Default permitted types and severities:',
  'settings.sandbox_issues.project.default_settings.severities':
    '{severities} {count, plural, one {severity} other {severities}}',
  'settings.sandbox_issues.project.qualities.title.mqr':
    'Software quality and severity of issues that are isolated in the sandbox',
  'settings.sandbox_issues.project.qualities.title.standard':
    'Type and severity of issues that are isolated in the sandbox',
  'settings.sandbox_issues.project.qualities.description':
    'Configured at the instance level. Contact your administrator for modifications.',
  'settings.sandbox_issues.project.deferral_days.readonly':
    'Sandboxed issues {days, plural, =0 {are never automatically transitioned to “Open” status} one {are automatically transitioned to “Open” status after # day} other {are automatically transitioned to “Open” status after # days}}. Configured at the instance level. Contact your administrator for modifications.',

  'property.category.announcement': 'Announcement',
  'property.category.general': 'General',
  'property.category.general.email': 'Email',
  'property.category.general.duplications': 'Duplications',
  'property.category.general.differentialViews': 'New Code',
  'property.category.general.localization': 'Localization',
  'property.category.general.databaseCleaner': 'Database Cleaner',
  'property.category.general.looknfeel': 'Look & Feel',
  'property.category.general.issues': 'Issues',
  'property.category.general.qualityGate': 'Quality gate',
  'property.category.general.qualityProfile': 'Quality profile',
  'property.category.general.subProjects': 'Sub-projects',
  'property.category.general.subProjectCreation': 'Project Creation',
  'property.category.almintegration': 'DevOps platform integrations',
  'property.category.authentication': 'Authentication',
  'property.category.ai_code': 'AI-generated code',
  'property.category.organizations': 'Organizations',
  'property.category.security': 'Security',
  'property.category.security.encryption': 'Encryption',
  'property.category.java': 'Java',
  'property.category.differentialViews': 'New code',
  'property.category.codeCoverage': 'Code coverage',
  'property.category.duplications': 'Duplications',
  'property.category.localization': 'Localization',
  'property.category.exclusions': 'Analysis scope',
  'property.category.webhooks': 'Webhooks',
  'property.category.languages': 'Languages',
  'property.category.aicodefix': 'AI CodeFix',
  'property.sonar.issues.issueResolution.global.enabled.description':
    'Enable usage of in-code issue resolution with SONAR-RESOLVE across projects. Disabling this setting will prevent usage of SONAR-RESOLVE on all projects. <docLink>Read more about in-code issue resolution.</docLink>',
  'property.sonar.issues.issueResolution.enabled.disabled_reason':
    'This setting is disabled at the instance level',
  'property.sonar.issues.issueResolution.enabled.name.project': 'Enable in-code issue resolution',
  'property.sonar.issues.issueResolution.enabled.description.project':
    'Enable usage of in-code issue resolution with SONAR-RESOLVE for this project. <docLink>Read more about in-code issue resolution.</docLink>',
  'property.sonar.autodetect.ai.code.confirmation':
    '{value, select, true {<p1>“Autodetect AI-generated code” will be turned on for all projects.</p1><p>This setting can be turned off by project administrators at the project level to prevent the autodetection of AI-generated code in specific projects.</p>} other {<p1>“Autodetect AI-generated code” will be turned off for all projects.</p1><p>Project administrators will no longer be able to activate this setting at the project level.</p>}}',
  'property.sonar.inclusions.name': 'Source File Inclusions',
  'property.sonar.inclusions.description':
    'Patterns used to include some source files and only these ones in analysis.',
  'property.sonar.test.inclusions.name': 'Test File Inclusions',
  'property.sonar.test.inclusions.description':
    'Patterns used to include some test files and only these ones in analysis.',
  'property.sonar.exclusions.name': 'Source File Exclusions',
  'property.sonar.exclusions.description':
    'Patterns used to exclude some source files from analysis.',
  'property.sonar.test.exclusions.name': 'Test File Exclusions',
  'property.sonar.test.exclusions.description':
    'Patterns used to exclude some test files from analysis.',
  'property.sonar.global.exclusions.name': 'Global Source File Exclusions',
  'property.sonar.global.exclusions.description':
    'Patterns used to exclude some source files from analysis. They apply to every project and cannot be overridden.',
  'property.sonar.global.test.exclusions.name': 'Global Test File Exclusions',
  'property.sonar.global.test.exclusions.description':
    'Patterns used to exclude some test files from analysis. They apply to every project and cannot be overridden.',
  'property.category.exclusions.files': 'A. File Exclusions',
  'property.category.exclusions.files.description':
    'Configure the files that should be completely ignored by the analysis.',
  'property.sonar.skippedModules.name': 'Module Exclusions',
  'property.sonar.skippedModules.description':
    'This property is deprecated since version 4.3 and should not be used anymore.',
  'property.sonar.includedModules.name': 'Module Inclusions',
  'property.sonar.includedModules.description':
    'This property is deprecated since version 4.3 and should not be used anymore.',
  'property.category.exclusions.issues': 'D. Issue Exclusions',
  'property.category.exclusions.issues.description':
    'Configure the conditions under which issues should not be reported.',
  'property.category.exclusions.duplications': 'C. Duplication Exclusions',
  'property.category.exclusions.duplications.description':
    'Configure the files that should be ignored by duplication detection.',
  'property.category.exclusions.coverage': 'B. Code Coverage Exclusions',
  'property.category.exclusions.coverage.description':
    'Configure the files that should be ignored by code coverage calculations.',
  'property.sonar.coverage.exclusions.name': 'Coverage Exclusions',
  'property.sonar.coverage.exclusions.description':
    'Patterns used to exclude some files from coverage report.',
  'property.category.technicalDebt': 'Technical debt',
  'property.category.scm': 'SCM',
  'property.category.housekeeping': 'Housekeeping',
  'property.category.housekeeping.general': 'General',
  'property.category.housekeeping.branchesAndPullRequests': 'Branches and Pull Requests',
  'property.category.housekeeping.auditLogs': 'Audit Logs',
  'property.category.housekeeping.dashboards': 'Dashboards',

  'settings.dashboard.retention.title': 'Dashboard history retention',
  'settings.dashboard.retention.description1':
    'Manage how long historical data is kept for project and portfolio dashboards. <bold>Data older than the retention period is automatically deleted.</bold> Longer retention uses more database storage.',
  'settings.dashboard.retention.description2':
    'This setting only affects dashboard history data and does not change data storage for analysis retention or scanner cache cleanup. Learn more about <link>dashboard history retention</link>.',
  'settings.dashboard.retention.community.title': 'Project overview dashboards history retention',
  'settings.dashboard.retention.community.description1':
    'Manage how long historical data is kept for the project overview dashboards. <bold>Data older than the retention period is automatically deleted.</bold> Longer retention uses more database storage.',
  'settings.dashboard.retention.community.description2':
    'This setting only affects dashboard history data and does not change data storage for analysis retention or scanner cache cleanup.',
  'settings.dashboard.retention.coming_soon':
    'Project overview dashboards will launch in a future release. Data collection is enabled by default to prepare your history ahead of time. You can adjust settings below.',
  'settings.dashboard.retention.community.success':
    'Project overview dashboards history retention has been successfully updated.',
  'settings.dashboard.retention.option.365': '365 days (Recommended)',
  'settings.dashboard.retention.option.180': '180 days',
  'settings.dashboard.retention.option.90': '90 days',
  'settings.dashboard.retention.option.custom': 'Custom',
  'settings.dashboard.retention.custom.label': 'Define custom period',
  'settings.dashboard.retention.custom.hint': 'Must be a whole number',
  'settings.dashboard.retention.custom.days_unit': 'days',
  'settings.dashboard.retention.display_limit.title': 'Dashboard display limit',
  'settings.dashboard.retention.display_limit.description':
    'Dashboard charts can display up to 365 days of historical data. Historical data retained beyond this period is available only through the API.',
  'settings.dashboard.retention.reduce_modal.title': 'Reduce dashboard history retention?',
  'settings.dashboard.retention.reduce_modal.description':
    'Dashboard history data older than {days} days will be <bold>permanently deleted immediately</bold>. Increasing the retention period later will not restore this data.',
  'settings.dashboard.retention.reduce_modal.confirm': 'Reduce retention',
  'settings.dashboard.retention.success':
    'Dashboard history retention period has been successfully updated.',
  'settings.dashboard.retention.unsaved_changes':
    'You have unsaved changes to the dashboard retention setting. Are you sure you want to leave?',
  'settings.dashboard.retention.community.unsaved_changes':
    'You have unsaved changes to the project overview dashboards history retention setting. Are you sure you want to leave?',

  'settings.advanced_security.title': 'Advanced Security',
  'settings.advanced_security.description':
    'SonarQube Advanced Security extends your protection to third-party open source code and gives you access to Advanced SAST capabilities.',
  'property.asast.admin.title': 'Advanced SAST (ASAST)',
  'property.asast.admin.description':
    'SonarQube Advanced Security comes with Advanced SAST (ASAST) activated by default for any user to find deeply nested taint vulnerabilities.',
  'property.asast.admin.checkbox.label': 'Enable Advanced SAST (ASAST)',
  'property.sca.admin.title': 'Software Composition Analysis (SCA)',
  'property.sca.admin.description':
    'Activate this option to enable any user to scan their projects for issues in their third-party dependencies, such as vulnerabilities or prohibited licenses, using the Sonar SCA service.',
  'property.sca.admin.description2':
    'By enabling this feature, you agree to the <link>Advanced Security Terms and Conditions</link>',
  'property.sca.admin.checkbox.label': 'Enable Software Composition Analysis (SCA)',
  'property.sca.default.title': 'Analyze all projects',
  'property.sca.confirm.modal.title.enable':
    'You are about to enable Software Composition Analysis (SCA)',
  'property.sca.confirm.modal.description.enable':
    'Software Composition Analysis (SCA) will be available for this instance. Dependency files will be sent to Sonar for analysis as part of every Sonar project analysis.',
  'property.sca.confirm.modal.title.disable':
    'You are about to disable the Software Composition Analysis (SCA) feature',
  'property.sca.confirm.modal.description.disable':
    'Users will not be able to scan their projects for issues in their third-party dependencies any more. Are you sure you want to continue?',

  'property.sca.admin.selftest.title': 'Check connection to the SonarQube SCA service',
  'property.sca.admin.selftest.description':
    'An internet connection to SonarQube SCA services is required to retrieve updated package and vulnerability data to perform analysis.',
  'property.sca.admin.selftest.success': 'Connectivity check passed',
  'property.sca.admin.selftest.failure': 'Unable to communicate with SCA service.',
  'property.sca.admin.selftest.failure.offline': 'You are offline.',
  'property.sca.admin.selftest.recheck': 'Recheck connectivity',
  'property.sca.admin.selftest.checking': 'Checking connectivity',
  'property.sca.admin.selftest.show_details': 'Show details',
  'property.sca.admin.selftest.details.title': 'Self Test Results',
  'property.sca.admin.selftest.details.description':
    'The following information may help diagnose issues with your connectivity to the cloud portion of the SCA service.',

  'property.sca.admin.rescan.title': 'Configure branch rescanning',
  'property.sca.admin.rescan.description':
    'Once a branch has been analyzed, it can be periodically rescanned for new vulnerabilities.',

  'property.sca.admin.enabled.message.title':
    'SCA has been enabled for all projects. Run new analyses to see scan results.',
  'property.sca.admin.enabled.message.body':
    'Next time an analysis runs on one of your projects, the scan will check the project’s dependencies for risks. For information on <link>how to ensure your projects are ready for SCA analysis</link> and more, view our complete configuration guide.',
  'property.sca.admin.enabled.message.link': 'View configuration guide',

  'property.sca.admin.disabled.message.title':
    'SCA has been enabled and will run on a project-by-project basis.',
  'property.sca.admin.disabled.message.body':
    'You must enable SCA for each project you want SCA analysis for. Then, the next time an analysis runs on one of your projects, the scan will check the project’s dependencies for risks. For information on <link>how to ensure your projects are ready for SCA analysis</link> and more, view our complete configuration guide.',

  'property.aicodefix.admin.title': 'Enable AI-generated fix suggestions',
  'property.aicodefix.admin.description':
    'Activate this option to enable users of all or part of the projects to generate an AI-suggested code fix for an issue using the Sonar AI CodeFix service.',
  'property.aicodefix.admin.checkbox.label': 'Enable AI CodeFix',
  'property.aicodefix.admin.acceptTerm.label':
    'By activating this option, you agree to the {terms}',
  'property.aicodefix.admin.acceptTerm.terms': 'AI CodeFix Terms',
  'property.aicodefix.admin.enable.title': 'Choose which projects should have AI CodeFix enabled',
  'property.aicodefix.admin.enable.all.projects.label': 'All projects',
  'property.aicodefix.admin.enable.all.projects.help':
    'Enable AI CodeFix on all existing and future projects',
  'property.aicodefix.admin.enable.some.projects.label': 'Only selected projects',
  'property.aicodefix.admin.enable.some.projects.help':
    'Enable AI CodeFix on selected projects only',
  'property.aicodefix.admin.enable.some.projects.note':
    'AI CodeFix will not be automatically enabled on new projects.',
  'property.aicodefix.admin.promotion.title':
    'This SonarQube Server edition doesn’t support this feature',
  'property.aicodefix.admin.promotion.subtitle': 'Unlock AI-generated fix suggestions',
  'property.aicodefix.admin.promotion.content':
    'Enable users to generate AI-suggested code fixes for issues on selected projects or across all projects using the Sonar AI CodeFix service.',
  'property.aicodefix.admin.promotion.content_2':
    'To have access to AI CodeFix, upgrade to Enterprise edition and above.',
  'property.aicodefix.admin.promotion.more_about_ai_fix_suggestions':
    'More about AI-generated fix suggestions',
  'property.aicodefix.admin.promotion.enterprise_only': 'Enterprise only',
  'property.aicodefix.admin.promotion.checkDocumentation': 'Check documentation',
  'property.sca.cancel.modal.title': 'Are you sure you want to cancel?',
  'property.sca.cancel.modal.description':
    'You have unsaved changes. All unsaved changes will be lost.',
  'property.sca.cancel.modal.continue_editing': 'Continue editing',
  'property.category.External Analyzers': 'External analyzers',

  'permissions.holder': 'Permission holder',
  'permissions.toggletip.more_information': 'Click for more on the "{permission}" permission',
  'permissions.filter.label': 'Filter by permission',

  //------------------------------------------------------------------------------
  //
  // GLOBAL PERMISSIONS
  //
  //------------------------------------------------------------------------------
  'global_permissions.permission': 'Permission',
  'global_permissions.users': 'Users',
  'global_permissions.groups': 'Groups',
  'global_permissions.administer': 'Administer',
  'global_permissions.creator': 'Create',
  'global_permissions.admin': 'Administer System',
  'global_permissions.admin.desc':
    'Ability to perform all administration functions for the instance.',
  'global_permissions.profileadmin': 'Quality profiles',
  'global_permissions.profileadmin.desc': 'Ability to perform any action on quality profiles.',
  'global_permissions.gateadmin': 'Quality gates',
  'global_permissions.gateadmin.desc': 'Ability to perform any action on quality gates.',
  'global_permissions.architectureadmin': 'Architecture',
  'global_permissions.architectureadmin.desc':
    'Ability to manage the intended architecture at the instance level.',
  'global_permissions.scan': 'Execute Analysis',
  'global_permissions.scan.desc':
    '<p>Grants the ability to:</p><ul><li>Retrieve all settings required to run the analysis, including secured credentials like passwords.</li><li>Push analysis results to SonarQube Server.</li><li>Run scans on any project in this SonarQube Server instance, including private ones, regardless of existing project-level permissions.</li></ul>',
  'global_permissions.provisioning': 'Projects',
  'global_permissions.provisioning.desc':
    'Ability to initialize a project so its settings can be configured before the first analysis.',
  'global_permissions.filter_by_x_permission': 'Filter by "{0}" permission',
  'global_permissions.restore_access': 'Restore access',
  'global_permissions.restore_access.message':
    'You will receive {browse} and {administer} permissions on the project. Do you want to continue?',
  'global_permissions.applicationcreator': 'Applications',
  'global_permissions.applicationcreator.desc': 'Ability to create an application.',
  'global_permissions.portfoliocreator': 'Portfolios',
  'global_permissions.portfoliocreator.desc': 'Ability to create a portfolio.',
  'global_permissions.no_actions_available': 'No actions available',

  //------------------------------------------------------------------------------
  //
  // PROJECTS PERMISSIONS
  //
  //------------------------------------------------------------------------------
  'projects_role.criteria.name': 'Name contains',
  'projects_role.criteria.key': 'Key contains',
  'projects_role.role': 'Role Membership For New',
  'projects_role.groups': 'Groups',
  'projects_role.template_name': 'Template Name',
  'projects_role.admin': 'Administer',
  'projects_role.admin.desc':
    'Access project settings and perform administration tasks (for private projects, users also need the "Browse" permission)',
  'projects_role.issueadmin': 'Administer Issues',
  'projects_role.issueadmin.desc':
    'Resolve issues as being "fixed", "accepted" or "false positive", as well as change issue severity. For private projects, users also need the "Browse" permission.',
  'projects_role.securityhotspotadmin': 'Administer Security Hotspots',
  'projects_role.securityhotspotadmin.desc':
    'Resolve a Security Hotspot as reviewed (fixed or safe), reset it as to review (for private projects, users also need the "Browse" permission).',
  'projects_role.architectureadmin': 'Administer Architecture',
  'projects_role.architectureadmin.desc':
    'Ability to manage the intended architecture of projects.',
  'projects_role.user': 'Browse',
  'projects_role.user.desc':
    'Access a project, browse its measures and issues, confirm issues, change the assignee, comment on issues and change tags.',
  'projects_role.codeviewer': 'See Source Code',
  'projects_role.codeviewer.desc':
    'View the project\'s source code (for private projects, users also need the "Browse" permission)',
  'projects_role.scan': 'Execute Analysis',
  'projects_role.scan.desc':
    '<p>Grants the ability to:</p><ul><li>Retrieve all settings required to run the analysis, including secured credentials like passwords.</li><li>Push analysis results to SonarQube Server.</li></ul><br></br><p><b>Note:</b> Users with the "Execute Analysis" permission at the <b>SonarQube Server instance level</b> are able to scan this project, even if they don\'t have any explicit project permissions.</p>',
  'projects_role.bulk_change': 'Bulk Change',
  'projects_role.apply_template': 'Apply Permission Template',
  'projects_role.apply_template_to_x': 'Apply Permission Template To "{0}"',
  'projects_role.apply_template.success': 'Permission template was successfully applied.',
  'projects_role.no_projects':
    'There are currently no results to apply the permission template to.',
  'projects_role.turn_x_to_public': 'Turn "{0}" to Public',
  'projects_role.turn_project_to_public.TRK': 'Turn Project to Public',
  'projects_role.turn_project_to_public.VW': 'Turn Portfolio to Public',
  'projects_role.turn_project_to_public.APP': 'Turn Application to Public',
  'projects_role.are_you_sure_to_turn_project_to_public.TRK':
    'Are you sure you want to turn your project to public?',
  'projects_role.are_you_sure_to_turn_project_to_public.warning.TRK':
    'Everybody will be able to browse and see the source code of your project.',
  'projects_role.are_you_sure_to_turn_project_to_public.VW':
    'Are you sure you want to turn your portfolio to public?',
  'projects_role.are_you_sure_to_turn_project_to_public.warning.VW':
    'Everybody will be able to browse it.',
  'projects_role.are_you_sure_to_turn_project_to_public.APP':
    'Are you sure you want to turn your application to public?',
  'projects_role.are_you_sure_to_turn_project_to_public.warning.APP':
    'Everybody will be able to browse it.',
  'projects_role.public_projects_warning':
    'For public projects, this permission is granted to everyone (including anonymous users) by default. Selections here apply to private projects only.',
  'projects_role.applicationcreator': 'Create Applications',
  'projects_role.applicationcreator.desc':
    'Allow to create applications for non system administrator.',
  'projects_role.portfoliocreator': 'Create Portfolios',
  'projects_role.portfoliocreator.desc': 'Allow to create portfolios for non system administrator.',

  //------------------------------------------------------------------------------
  //
  // PERMISSION TEMPLATES
  //
  //------------------------------------------------------------------------------
  permission_templates: 'Permission templates',
  'permission_templates.page': 'Permission templates',
  'permission_templates.page.description':
    '<link>Manage templates</link> of project permission sets. The default template will be applied to all new projects.',
  'permission_templates.search_placeholder': 'Search for templates...',
  'permission_templates.no_results': 'No permission templates found matching "{query}"',
  'permission_templates.no_templates': 'No permission templates have been created yet.',
  'permission_templates.set_default': 'Set Default',
  'permission_templates.set_default_for': 'Set Default For',
  'permission_templates.provisioning_warning':
    'Please note that permission templates will only affect non-{0} projects due to the enabled automatic provisioning via {0}.',
  'permission_templates.project_creators': 'Creators',
  'permission_templates.project_creators.explanation':
    'When a new project, portfolio or application is created, the user who creates it will receive these permissions.',
  'permission_templates.bulk_apply_permission_template': 'Bulk Apply Permission Template',
  'permission_templates.bulk_apply_permission_template.apply_to_selected':
    "You're about to apply the selected permission template to {0} selected item(s).",
  'permission_templates.bulk_apply_permission_template.apply_to_all':
    "You're about to apply the selected permission template to {0} item(s).",
  'permission_templates.bulk_apply_permission_template.apply_to_managed_projects':
    "You can't apply the selected permission template to the {0} {1} project(s).",
  'permission_templates.bulk_apply_permission_template.apply_to_only_managed_projects':
    "You can't apply permission templates to {0} projects.",
  'permission_templates.select_to_delete': 'You must select at least one item',
  'permission_templates.delete_selected': 'Delete all selected items',
  'permission_templates.show_actions_for_x': 'Show actions for template {0}',
  'permission_templates.set_default_confirmation_title': 'Set Empty Template as Default',
  'permission_templates.set_default_confirmation_description':
    'The template "{template}" assigns no permissions. Newly created resources may be inaccessible. Do you want to set it as the default for {qualifier}?',

  //------------------------------------------------------------------------------
  //
  // MARKETPLACE
  //
  //------------------------------------------------------------------------------
  'marketplace.page': 'Marketplace',
  'marketplace.page.description':
    'Discover the additional benefits offered in SonarQube Server Commercial Editions',
  'marketplace.page.description_best_edition':
    'This edition includes access to all the SonarQube Server-SonarQube for IDE Ecosystem features!',
  'marketplace.page.you_are_running.community': 'You are currently running a Community Build.',
  'marketplace.page.you_are_running.developer': 'You are currently running a Developer Edition.',
  'marketplace.page.you_are_running.enterprise': 'You are currently running an Enterprise Edition.',
  'marketplace.page.you_are_running.datacenter': 'You are currently running a Data Center Edition.',
  'marketplace.page.plugins': 'Plugins',
  'marketplace.page.plugins.description':
    'Plugins available in the Marketplace are not provided or supported by SonarSource. Please reach out directly to their maintainers for support.',
  'marketplace.page.plugins.description2':
    'Installing a plugin is a manual operation. Please refer to the {link}.',
  'marketplace.page.plugins.description2.link': 'documentation',
  'marketplace.plugin_list.no_plugins.all': 'No installed plugins or updates available',
  'marketplace.plugin_list.no_plugins.installed': 'No installed plugins',
  'marketplace.plugin_list.no_plugins.updates': 'No plugin updates available',
  'marketplace.instance_needs_to_be_restarted_to': '{instance} needs to be restarted in order to',
  'marketplace.install_x_plugins': 'install {nb} plugins',
  'marketplace.update_x_plugins': 'update {nb} plugins',
  'marketplace.uninstall_x_plugins': 'uninstall {nb} plugins',
  'marketplace.not_activated': 'Update Center is not activated.',
  'marketplace.all': 'All',
  'marketplace.installed': 'Installed',
  'marketplace.updates_only': 'Updates Only',
  'marketplace.revert': 'Revert',
  'marketplace.install': 'Install',
  'marketplace._installed': 'installed',
  'marketplace.available_under_commercial_license': 'Available under our commercial editions',
  'marketplace.learn_more': 'Learn more',
  'marketplace.request_free_trial': 'Request a free trial',
  'marketplace.homepage': 'Homepage',
  'marketplace.issue_tracker': 'Issue Tracker',
  'marketplace.licensed_under_x': 'Licensed under {license}',
  'marketplace.developed_by_x': 'Developed by {organization}',
  'marketplace.install_pending': 'Install Pending',
  'marketplace.update_pending': 'Update Pending',
  'marketplace.uninstall_pending': 'Uninstall Pending',
  'marketplace.requires_restart': 'This requires a restart',
  'marketplace.updates': 'Updates',
  'marketplace.update_status.COMPATIBLE': 'Compatible',
  'marketplace.update_status.INCOMPATIBLE': 'Incompatible',
  'marketplace.update_status.REQUIRES_SYSTEM_UPGRADE': 'Requires system update',
  'marketplace.update_status.DEPS_REQUIRE_SYSTEM_UPGRADE':
    'Some of dependencies requires system update',
  'marketplace.installing_this_plugin_will_also_install_x':
    'Installing this plugin will also install: {0}',
  'marketplace.show_plugin_changelog': 'See {0} {1} changelog',
  'marketplace.update_to_x': 'Update to {0}',
  'marketplace.uninstall': 'Uninstall',
  'marketplace.i_accept_the': 'I accept the',
  'marketplace.terms_and_conditions': 'Terms and Conditions',
  'marketplace.release_notes': 'Release Notes',
  'marketplace.search': 'Search by features, tags, or categories...',

  'marketplace.risk_consent.title': 'Installation of plugins',
  'marketplace.risk_consent.description':
    'Plugins are not provided by SonarSource and are therefore installed at your own risk. SonarSource disclaims all liability for installing and using such plugins.',
  'marketplace.risk_consent.installation':
    'You can install plugins directly from the list below after you acknowledge the risk.',
  'marketplace.risk_consent.action': 'I understand the risk',

  //------------------------------------------------------------------------------
  //
  // SYSTEM
  //
  //------------------------------------------------------------------------------
  'system.agentic_harness_title': 'Agentic Containers',
  'system.application_nodes_title': 'Application Nodes',
  'system.are_you_sure_to_restart':
    'Are you sure you want to restart the server? The restart will first wait for ongoing background tasks to complete.',
  'system.cluster_log_level.info':
    'Your selection affect all Application nodes but not the Search nodes.',
  'system.copy_id_info': 'Copy ID information',
  'system.current_health_of_x': 'Current health status of {0}',
  'system.current_health.green': 'Status is up',
  'system.current_health.yellow': 'Status is starting',
  'system.current_health.red': 'Status is down',
  'system.download_logs': 'Download Logs',
  'system.download_system_info': 'Download System Info',
  'system.download_x': 'Download {0}',
  'system.forcing_shutdown_not_recommended':
    'Forcing the shutdown is not recommended and can interrupt the processing of analysis reports.',
  'system.hide_intermediate_versions': 'Hide intermediate versions',
  'system.how_to_upgrade': 'How to upgrade?',
  'system.latest_version': 'Latest Version',
  'system.latest_patch': 'Patch Release',
  'system.lta_version': 'Latest LTA Version',
  'system.log_level.warning':
    'This level has performance impacts, please make sure to get back to INFO level once your investigation is done. Please note that when the server is restarted, logging will revert to the level configured in sonar.properties.',
  'system.log_level.warning.short':
    'Current logs level has performance impacts, get back to INFO level.',
  'system.log_level.info': 'Your selection does not affect the Search Engine.',
  'system.logs.access': 'Access Logs',
  'system.logs.app': 'Main Process',
  'system.logs.ce': 'Compute Engine',
  'system.logs.deprecation': 'Deprecation Logs',
  'system.logs.es': 'Search Engine',
  'system.logs.web': 'Web Server',
  'system.logs_level': 'Logs level',
  'system.logs_level.change': 'Change logs level',
  'system.restart_does_not_reload_sonar_properties':
    'Also note that a restart will not reload the sonar.properties file.',
  'system.see_whats_new': "See what's new!",
  'system.release_notes': 'Release Notes',
  'system.released_x': 'Released {0}',
  'system.restart_in_progress': 'Restart in progress',
  'system.restart_server': 'Restart Server',
  'system.instance_restarting': '{instance} restart is in progress. Ongoing {link} are completing.',
  'system.search_nodes_title': 'Search Nodes',
  'system.see_sonarqube_downloads': 'See All {productName} Downloads',
  'system.not_production_database_warning':
    'This server ID is valid only for the embedded database, which should be considered disposable. Consider configuring an external database for long-term use prior to requesting your license.',
  'system.server_id': 'Server ID',
  'system.set_log_level': 'Set logs level',
  'system.show_intermediate_versions': 'Show intermediate versions',
  'system.system_upgrade': 'New update available',
  'system.version': 'Version',
  'system.version_is_availble': '{version} is available',

  //------------------------------------------------------------------------------
  //
  // USERS
  //
  //------------------------------------------------------------------------------
  'users.page': 'Users',
  'users.page.description': 'Create and administer individual users.',
  'users.page.managed_description':
    'Your instance is managed by {provider}. No modification is allowed except for tokens and SCM account information.',
  'users.page.managed_description.recommendation':
    'We recommend that you delete local users to ensure all operations are done on your identity provider. Read more about {link}.',
  'users.page.managing_users': 'managing users',
  'users.deactivate': 'Deactivate',
  'users.deactivate_user': 'Deactivate User',
  'users.deactivate_user.confirmation': 'Are you sure you want to deactivate "{0} ({1})"?',
  'users.delete_user': "Delete user's personal information",
  'users.delete_user.help':
    'A user account cannot be reactivated once their personal information is deleted. {link}',
  'users.delete_user.help.link': 'Learn more',
  'users.create_user': 'Create User',
  'users.create_user.scm_account_new': 'New SCM account',
  'users.create_user.scm_account_x': 'SCM account "{0}"',
  'users.update': 'Update users',
  'users.list': 'Users list',
  'users.update_user': 'Update User',
  'users.cannot_update_delegated_user':
    'You cannot update the name and email of this user, as it is controlled by an external identity provider.',
  'users.minimum_x_characters': 'Minimum {0} characters',
  'users.login_already_used': 'This login is already in use. Please choose another one.',
  'users.login_invalid_characters': 'Login should contain only letters, numbers, and .-_@',
  'users.login_start_with_letter_or_number': 'Login should start with _ or alphanumeric.',
  'users.email': 'Email',
  'users.email.invalid': 'Invalid email',
  'users.last_connection': 'Last connection',
  'users.last_sonarlint_connection': 'Last SonarQube for IDE connection',
  'users.last_sonarlint_connection.help_text':
    'The time of the last connection from SonarQube for IDE indicates that the user used SonarQube for IDE in connected mode.',
  'users.update_users_groups': "Update {0}'s group membership",
  'users.view_users_groups': "View {0}'s group membership",
  'users.update_groups': 'Update Groups',
  'users.update_groups.saml_enabled':
    "Updating a group's membership when SAML is enabled will be temporary. The group membership will be updated the next time the user logs in.",
  'users.view_groups': 'View Groups',
  'users.manage_user': 'Update {0}',
  'users.update_tokens': 'Update tokens',
  'users.update_tokens_for_x': 'Update tokens for user {0}',
  'users.user_name': 'Name',
  'users.activity_filter.label': 'Filter users by activity',
  'users.activity_filter.placeholder': 'All users',
  'users.activity_filter.helptext.sonarqube':
    'Users are considered active if they connected to {productName} at least once in the past 30 days.',
  'users.activity_filter.helptext.sonarlint':
    'Users are considered active with SonarQube for IDE if they used SonarQube for IDE in connected mode at least once in the past 30 days.',
  'users.activity_filter.all_users': 'All users',
  'users.activity_filter.active_sonarlint_users': 'Active users with SonarQube for IDE',
  'users.activity_filter.active_sonarqube_users': 'Active users without SonarQube for IDE',
  'users.activity_filter.inactive_users': 'Inactive users',
  'users.tokens': 'Tokens',
  'users.user_X_tokens': 'Tokens of {user}',
  'users.tokens.sure': 'Sure?',
  'users.tokens.sure_X': 'Are you sure you want to revoke token {token}?',
  'users.tokens.revoke': 'Revoke',
  'users.tokens.revoke_label': 'Revoke token {0}',
  'users.tokens.remove_label': 'Remove expired token {0}',
  'users.no_tokens': 'No tokens',
  'users.generate': 'Generate',
  'users.tokens.PROJECT_ANALYSIS_TOKEN': 'Project Analysis Token',
  'users.tokens.PROJECT_ANALYSIS_TOKEN.short': 'Project',
  'users.tokens.GLOBAL_ANALYSIS_TOKEN': 'Global Analysis Token',
  'users.tokens.GLOBAL_ANALYSIS_TOKEN.short': 'Global',
  'users.tokens.USER_TOKEN': 'User Token',
  'users.tokens.USER_TOKEN.short': 'User',
  'users.tokens.generate': 'Generate Tokens',
  'users.tokens.name': 'Name',
  'users.tokens.enter_name': 'Enter Token Name',
  'users.tokens.type': 'Type',
  'users.tokens.select_type': 'Select Token Type',
  'users.tokens.project': 'Project',
  'users.tokens.select_project': 'Select Project',
  'users.tokens.expires_in': 'Expires in',
  'users.tokens.expiration.30': '30 days',
  'users.tokens.expiration.90': '90 days',
  'users.tokens.expiration.365': '1 year',
  'users.tokens.expiration.0': 'No expiration',
  'users.tokens.new_token_created':
    'New token "{0}" has been created. Make sure you copy it now, you won\'t be able to see it again!',
  'users.new_token': 'New token value',
  'users.change_admin_password.page': 'Change password',
  'users.change_admin_password.instance_is_at_risk': 'Secure your {productName} instance',
  'users.change_admin_password.header': 'Default Administrator credentials are still used',
  'users.change_admin_password.description':
    "Your {productName} instance is still using default administrator credentials. You must change the password for the 'admin' account to secure your {productName} instance.",
  'users.change_admin_password.form.header': "Change the password for user 'admin'",
  'users.change_admin_password.form.success': "The admin user's password was successfully changed.",
  'users.change_admin_password.form.continue_to_app': 'Continue to {productName}',
  'users.filter.by': 'Filter by',

  //------------------------------------------------------------------------------
  //
  // GROUPS
  //
  //------------------------------------------------------------------------------
  'user_groups.page': 'Groups',
  'user_groups.page.description': 'Create and administer groups of users.',
  'user_groups.page.group_header': 'Name',
  'user_groups.page.managed_description':
    'Your instance is managed by {provider}. No modification is allowed.',
  'user_groups.page.managed_description.recommendation':
    'We recommend you delete local groups. All other operations should be done on your identity provider. Read more about {link}.',
  'user_groups.page.managing_groups': 'managing groups',

  //------------------------------------------------------------------------------
  //
  // MAINTENANCE
  //
  //------------------------------------------------------------------------------
  'maintenance.page': 'Maintenance',
  'maintenance.upgrade_failed': 'Update Failed',
  'maintenance.upgrade_failed.text':
    'Database connection cannot be established. Please check database status and JDBC settings.',
  'maintenance.migration_not_supported': 'Migration not supported',
  'maintenance.migration_not_supported.text': 'Migration is not supported on embedded databases.',
  'maintenance.back_up_database': 'Back up your database',
  'maintenance.back_up_database.1':
    'When upgrading commences, you will no longer be able to back up your database or recover any lost data.',
  'maintenance.back_up_database.2': 'Continue only after you have backed up your database.',
  'maintenance.upgrade_database': 'Update database',
  'maintenance.upgrade_database.1': 'Upgrading your database can take several minutes.',
  'maintenance.upgrade_database.2': 'For guidance, view the {link}',
  'maintenance.upgrade_database.2.link': 'SonarQube Server update guide',
  'maintenance.upgrade': 'Start update',
  'maintenance.database_migration': 'Database Migration',
  'maintenance.database_is_up_to_date': 'Database is up-to-date',
  'maintenance.is_down': '{instance} is down',
  'maintenance.sonarqube_is_down.text':
    'Something went wrong. Please contact your system administrator.',
  'maintenance.try_again': 'Try Again',
  'maintenance.is_under_maintenance': '{instance} is under maintenance',
  'maintenance.sonarqube_is_under_maintenance.1': 'While waiting, install {link} in your IDE!',
  'maintenance.sonarqube_is_under_maintenance_link.1': 'SonarQube for IDE',
  'maintenance.sonarqube_is_under_maintenance.2':
    'If you are an administrator and have no idea why this message is being shown, you should read the {link}.',
  'maintenance.sonarqube_is_under_maintenance_link.2': 'update guide',
  'maintenance.is_starting': '{instance} is starting',
  'maintenance.is_up': '{instance} is up',
  'maintenance.all_systems_opetational': 'All systems operational.',
  'maintenance.is_offline': '{instance} is offline',
  'maintenance.sonarqube_is_offline.text':
    'The connection to {productName} is lost. Please contact your system administrator.',
  'maintenance.running.progress': '{completed} migrations completed out of {total}',
  'maintenance.running.estimate': 'Estimated completion time: {date}',

  //------------------------------------------------------------------------------
  //
  // WEBHOOKS
  //
  //------------------------------------------------------------------------------
  'webhooks.page': 'Webhooks',
  'webhooks.create': 'Create Webhook',
  'webhooks.delete': 'Delete Webhook',
  'webhooks.delete.confirm': 'Are you sure you want to delete the webhook "{0}"?',
  'webhooks.description0':
    'Webhooks are used to notify external services when a project analysis is done.',
  'webhooks.description1':
    'An HTTP POST request including a JSON payload is sent to each of the provided URLs. Learn more in the {url}.',
  'webhooks.deliveries.show': 'Show recent deliveries',
  'webhooks.show_actions': 'Show actions for webhook {0}',
  'webhooks.deliveries_for_x': 'Recent deliveries of {0}',
  'webhooks.delivery.duration_x': 'Duration: {0}',
  'webhooks.delivery.payload': 'Payload:',
  'webhooks.delivery.response_x': 'Response: {0}',
  'webhooks.delivery.server_unreachable': 'Server Unreachable',
  'webhooks.documentation_link': 'Webhooks documentation',
  'webhooks.last_execution': 'Last delivery',
  'webhooks.last_execution.none': 'Never',
  'webhooks.last_execution.open_for_x': 'Open last delivery of {0}',
  'webhooks.latest_delivery_for_x': 'Last delivery of {0}',
  'webhooks.maximum_reached':
    'You reached your maximum number of {0} webhooks. You can still update or delete an existing one.',
  'webhooks.name': 'Name',
  'webhooks.name.required': 'Name is required.',
  'webhooks.no_result': 'No webhook defined.',
  'webhooks.update': 'Update Webhook',
  'webhooks.secret': 'Secret',
  'webhooks.secret_header': 'Has secret?',
  'webhooks.secret.bad_format': 'Secret length must be between 16 and 200 characters.',
  'webhooks.secret.description':
    "If provided, secret will be used as the key to generate the HMAC hex (lowercase) digest value in the 'X-Sonar-Webhook-HMAC-SHA256' header.",
  'webhooks.secret.description.update':
    'If blank, any secret previously configured will be removed. If not set, the secret will remain unchanged.',
  'webhooks.secret.field_mask.description': 'Hidden for security reasons: {link}.',
  'webhooks.secret.field_mask.link': ' edit secret',
  'webhooks.url': 'URL',
  'webhooks.url.bad_format': 'Bad format of URL.',
  'webhooks.url.bad_protocol': 'URL must start with "http://" or "https://".',
  'webhooks.url.description':
    'Server endpoint that will receive the webhook payload, for example: "http://my_server/foo". If HTTP Basic authentication is used, HTTPS is recommended to avoid man in the middle attacks. Example: "https://myLogin:myPassword@my_server/foo"',
  'webhooks.url.required': 'URL is required.',

  'organization.jira.binding.header': 'Jira',
  'organization.jira.binding.badge.connected': 'Connected',
  'organization.jira.binding.badge.not_connected': 'Not Connected',
  'organization.jira.binding.instance_details_title': 'Jira instance details',
  'organization.jira.binding.not_connected.intro':
    '<p>Setup and connect to your Jira application to push issues into Jira as work items. You will need to provide a Client ID and Secret to connect. To obtain them, <setupGuideDocLink>follow our setup guide</setupGuideDocLink></p>',
  'organization.jira.binding.start_setup.hint': 'Setup can take 15 minutes.',
  'organization.jira.binding.connected.intro':
    "<p>To push issues, ensure you've <projectBindingDocLink>connected your projects</projectBindingDocLink> in your project settings.</p><p>If reauthorizing, always ensure you select the same instance in the app page to avoid potential errors. If an error occurs, please read and follow our <troubleshootingDocLink>troubleshooting steps.</troubleshootingDocLink></p>",
  'organization.jira.binding.connected.callout.title':
    'Want project admins to be able to set up Jira at the project level?',
  'organization.jira.binding.connected.callout.text':
    'By default, only instance admins have browse, bind and edit permissions to Jira projects. If you want project admins to be able to set up Jira at the project level, turn ‘on’ the setting below.',
  'organization.jira.binding.connected.callout.documentation_link_text':
    'How to connect projects to Jira',
  'organization.jira.binding.connected.grant_project_permissions.label':
    'Grant project administrators binding permissions',
  'organization.jira.binding.connected.grant_project_permissions.description':
    'If you want project admins to be able to bind to Jira at the project level, turn ‘on’ this setting.',
  'organization.jira.binding.connected.grant_project_permissions.description_2':
    'By default, only instance admins have browse, bind and edit permissions to Jira projects.',
  'organization.jira.binding.connected.grant_project_permissions.toast_granted.title':
    'Permissions granted',
  'organization.jira.binding.connected.grant_project_permissions.toast_granted.description':
    'Project admins now have browse, bind and edit permissions to Jira projects.',
  'organization.jira.binding.connected.grant_project_permissions.toast_revoked.title':
    'Permissions revoked',
  'organization.jira.binding.connected.grant_project_permissions.toast_revoked.description':
    'Only instance administrator now have browse, bind and edit permissions to Jira projects.',
  'organization.jira.binding.connected.reauthorize': 'Reauthorize',
  'organization.jira.binding.bind_success':
    "You've successfully connected your Jira instance to this SonarQube Server instance",
  'organization.jira.binding.unbind_success': "You've successfully deleted your Jira connection",
  'organization.jira.binding.instance_url.label': 'Instance URL',
  'organization.jira.binding.connected_by_on_label': 'Connected by',
  'organization.jira.binding.connected_by_on_value': '{createdBy} on {createdAt}',
  'organization.jira.binding.app_configuration.title': 'Client ID and Secret',
  'organization.jira.binding.app_configuration.edit_modal.title': 'Edit Client ID and Secret',
  'organization.jira.binding.app_configuration.helper_intro':
    'Follow the steps in our guide to <link>edit your Client ID and Secret</link>',
  'organization.jira.binding.app_configuration.callback_url.label': 'Callback URL',
  'organization.jira.binding.app_configuration.callback_url.copy': 'Copy callback URL to clipboard',
  'organization.jira.binding.app_configuration.client_id.label': 'Client ID',
  'organization.jira.binding.app_configuration.client_secret.label': 'Secret',
  'organization.jira.binding.app_configuration.submit_note':
    'Updating will redirect you to Atlassian to confirm your workspace.',
  'organization.jira.binding.modal.confirmation.description':
    "You've previously authorised multiple Jira instances to this SonarQube Server instance. Please confirm the Jira instance that you want to connect to:",
  'organization.jira.binding.modal.confirmation.title': 'Confirm your Jira instance',
  'organization.jira.binding.disconnect.label': 'Disconnect Jira instance',
  'organization.jira.binding.disconnect.modal.title':
    'Delete Jira connection for this SonarQube instance?',
  'organization.jira.binding.disconnect.modal.description.line1':
    "<p>This action deletes all data (except Client ID & Secret) on SonarQube Server.</p><p>Revoke token permissions on Atlassian's connected apps page to completely delete the connection.</p>",
  'organization.jira.binding.disconnect.modal.description.line2': 'By deleting, you will:',
  'organization.jira.binding.disconnect.modal.description.bullet1':
    'Lose access to all Jira features in this SonarQube Server instance',
  'organization.jira.binding.disconnect.modal.description.bullet2':
    "Delete this instance's project ↔ Jira project connections",
  'organization.jira.binding.disconnect.modal.description.bullet3':
    'Disconnect all SonarQube Server issues from Jira work items',
  'organization.jira.binding.disconnect.modal.description.warning':
    'You will not be able to restore or relink connections or issues even if you reconnect to the same Jira instance in the future',
  'organization.jira.binding.disconnect.modal.link': 'Atlassian connected apps page',
  'organization.settings.binding.auto_import.helper.bitbucket':
    'Automatically import new repositories from your connected Bitbucket workspace. Existing repositories are not imported.',
  'organization.settings.binding.auto_import.title.bitbucket':
    'Automatically import new Bitbucket repositories',
  'organization.repository_auto_import.toggletip.new_repos_description.bitbucket':
    'New repositories created in your connected Bitbucket workspace will be imported automatically into this organization.',
  'organization.settings.binding.auto_import.bitbucket.error.not_saved':
    'Your AutoImport choice could not be saved. Your Bitbucket workspace is still connected. Check the saved setting and try again in organization settings.',
  'organization.settings.binding.auto_import.bitbucket.error.unconfirmed':
    'We could not confirm your AutoImport setting. Your Bitbucket workspace is still connected. Reload organization settings to check the saved value before trying again.',
};
