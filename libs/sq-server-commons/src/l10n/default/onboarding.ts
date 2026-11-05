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

export const onboardingMessages = {
  //------------------------------------------------------------------------------
  //
  // ONBOARDING
  //
  //------------------------------------------------------------------------------
  'onboarding.alm.azure': 'Azure DevOps',
  'onboarding.alm.bitbucket': 'Bitbucket Data Center',
  'onboarding.alm.bitbucketcloud': 'Bitbucket Cloud',
  'onboarding.alm.gitlab': 'GitLab',

  'onboarding.project_analysis.menu_entry': 'Project onboarding',
  'onboarding.project_analysis.header': 'Analyze your project',
  'onboarding.project_analysis.description':
    "We initialized your project on {productName}, now it's up to you to launch analyses!",
  'onboarding.project_analysis.guide_to_integrate_pipelines':
    'follow the guide to integrating with Pipelines',

  'onboarding.create_project.manual.step1': '1 of 2',
  'onboarding.create_project.manual.step2': '2 of 2',
  'onboarding.create_project.manual.title': 'Create a local project',
  'onboarding.create_project.select_method': 'How do you want to create your project?',
  'onboarding.create_project.select_method.manually':
    'Are you just testing or have an advanced use-case?',
  'onboarding.create_project.select_method.devops_platform':
    "Do you want to benefit from all of {productName}'s features (like repository import and Pull Request decoration)?",
  'onboarding.create_project.select_method.devops_platform_second':
    'Create your project from your favorite DevOps platform.',

  'onboarding.create_project.select_method.no_alm_yet.admin':
    'First, you need to set up a DevOps platform configuration.',
  'onboarding.create_project.import_select_method.manual': 'Create a local project',
  'onboarding.create_project.import_select_method.azure': 'Import from Azure DevOps',
  'onboarding.create_project.import_select_method.bitbucket': 'Import from Bitbucket Data Center',
  'onboarding.create_project.import_select_method.bitbucketcloud': 'Import from Bitbucket Cloud',
  'onboarding.create_project.import_select_method.github': 'Import from GitHub',
  'onboarding.create_project.import_select_method.gitlab': 'Import from GitLab',
  'onboarding.create_project.alm_not_configured':
    'Contact your admin to set up the global configuration allowing you to import project from this DevOps Platform',
  'onboarding.create_project.project_key': 'Project key',
  'onboarding.create_project.project_key.duplicate_key': 'The project key name is already taken.',
  'onboarding.create_project.project_key.wrong_format':
    "The provided value doesn't match the expected format.",
  'onboarding.create_project.project_key.description':
    "The project key is a unique identifier for your project. It may contain up to 400 characters. Allowed characters are alphanumeric, '-' (dash), '_' (underscore), '.' (period) and ':' (colon), with at least one non-digit.",
  'onboarding.create_project.project_key.valid': 'The provided key can be used',
  'onboarding.create_project.project_key.error.empty': 'You must provide at least one character.',
  'onboarding.create_project.project_key.error.too_long': 'The provided key is too long.',
  'onboarding.create_project.project_key.error.invalid_char':
    'The provided key contains invalid characters.',
  'onboarding.create_project.project_key.error.only_digits':
    'The provided key contains only digits.',
  'onboarding.create_project.display_name': 'Project display name',
  'onboarding.create_project.display_name.description':
    'Up to 255 characters. Some scanners might override the value you provide.',

  'onboarding.create_project.main_branch_name': 'Main branch name',
  'onboarding.create_project.main_branch_name.error.empty': 'Please provide a main branch name.',
  'onboarding.create_project.main_branch_name.description':
    'The name of your project’s default branch { learn_more }',

  'onboarding.create_project.pr_decoration.information':
    'Local projects won’t benefit from the features associated with DevOps Platforms integration unless you configure them in the project settings.',
  'onboarding.create_project.repository_imported': 'Already imported',
  'onboarding.create_project.import': 'Import',
  'onboarding.create_project.search_projects_by_name': 'Search for project name starting with...',
  'onboarding.create_project.search_repositories_by_name':
    'Search for repository name starting with...',
  'onboarding.create_project.search_mode': 'Search for',
  'onboarding.create_project.search_mode.project': 'Project',
  'onboarding.create_project.search_mode.repository': 'Repository',
  'onboarding.create_project.search_projects_repositories': 'Search for projects and repositories',
  'onboarding.create_project.search_repositories': 'Search for a repository',
  'onboarding.create_project.select_all_repositories': 'Select currently visible repositories',

  'onboarding.create_application.key.description':
    'If specified, this value is used as the key instead of generating it from the name of the Application. Only letters, digits, dashes and underscores can be used.',
  'onboarding.create_project.pat_form.title': 'Grant access to your repositories',
  'onboarding.create_project.pat_form.help.azure':
    '{productName} needs a personal access token to access and list your repositories from Azure DevOps. Use a token from your own account. Do not use the token that an administrator set in the DevOps Platform Integrations settings.',
  'onboarding.create_project.pat_form.help.bitbucket':
    '{productName} needs a personal access token to access and list your repositories from Bitbucket Data Center. Use a token from your own account. Do not use the token that an administrator set in the DevOps Platform Integrations settings.',
  'onboarding.create_project.pat_form.help.bitbucket_cloud':
    '{productName} needs an API token to access and list your repositories from Bitbucket Cloud.',
  'onboarding.create_project.pat_form.help.gitlab':
    '{productName} needs a personal access token to access and list your projects from GitLab. Use a token from your own account. Do not use the token that an administrator set in the DevOps Platform Integrations settings.',
  'onboarding.create_project.pat_form.pat_required': 'Please enter a personal access token',
  'onboarding.create_project.wrong_binding_count':
    'You must have at least 1 {alm} instance configured in order to use this method, but none were found. Either create a local project, or contact your system administrator.',
  'onboarding.create_project.wrong_binding_count.admin':
    'You must have at least 1 {alm} instance configured in order to use this method. You can configure instances under {url}.',
  'onboarding.create_project.azure.no_url.admin':
    'Your Azure DevOps instance configuration is missing a URL. We cannot import projects in the current state. You can configure instances under {url}.',
  'onboarding.create_project.azure.no_url':
    'Your Azure DevOps instance configuration is missing a URL. We cannot import projects in the current state. Please contact your system administrator.',
  'onboarding.create_project.enter_pat': 'Personal Access Token',
  'onboarding.create_project.bitbucket_cloud.enter_password': 'API token',
  'onboarding.create_project.bitbucket_cloud.enter_username': 'Atlassian account email address',
  'onboarding.create_project.pat_incorrect.azure': "Your personal access couldn't be validated.",
  'onboarding.create_project.pat_incorrect.bitbucket':
    "Your personal access couldn't be validated.",
  'onboarding.create_project.pat_incorrect.bitbucket_cloud':
    "Your API token couldn't be validated.",
  'onboarding.create_project.pat_incorrect.gitlab':
    "Your personal access couldn't be validated. Please make sure it has the right scope and that it is not expired.",
  'onboarding.create_project.pat_incorrect.gitlab.hint':
    'Use a legacy token, not a fine-grained token.',
  'onboarding.create_project.pat.expired.info_message':
    'You have to do this again as your token may have expired or has been revoked. If this does not fix the issue, please contact your system administrator.',

  'onboarding.create_project.pat_help.instructions.azure':
    'To create a Personal Access Token on Azure, {link} and make sure to select the “Code (Read and Write)” and “Identity (Read)” scopes. On Azure DevOps Services, set “Organization” to one organization. Do not select “All accessible organizations”.',
  'onboarding.create_project.pat_help.instructions.link.azure': 'generate a token',

  'onboarding.create_project.pat_help.instructions.gitlab':
    'To create a Personal Access Token on GitLab, {link} by choosing the legacy token type, setting a name, for example “{productName}” and selecting the “read_api” scope. Do not use a fine-grained token.',
  'onboarding.create_project.pat_help.instructions.gitlab.link': 'generate a token',

  'onboarding.enter_username.instructions.bitbucket_cloud':
    'Find your email address in your {link}',
  'onboarding.enter_username.instructions.bitbucket_cloud.link': 'Atlassian settings',

  'onboarding.create_project.enter_password.instructions.bitbucket_cloud':
    'To get an API token, {link}',
  'onboarding.create_project.enter_password.instructions.bitbucket_cloud.link':
    'view our "API token with scopes" guide',

  'onboarding.create_project.pat_help.instructions.bitbucket_server':
    'To create a Personal Access Token on Bitbucket Data Center, go to {link} and click on “Create token”. Set a name, for example “{productName}” and select the following permissions “Projects: Read” “Repositories: Read”.',
  'onboarding.create_project.pat_help.instructions.bitbucket_server.link': 'HTTP access tokens',

  'onboarding.create_project.pat_help.instructions2.bitbucket':
    'Set a name, for example "{productName}", and select the following permissions:',
  'onboarding.create_project.pat_help.instructions2.bitbucketcloud':
    'Set a name, for example "{productName}", and select the following permissions:',

  'onboarding.create_project.pat_help.instructions2.gitlab':
    'Set a name, for example "{productName}", and select the following scope:',
  'onboarding.create_project.pat_help.gitlab.read_api_permission': 'read_api',

  'onboarding.create_project.no_bbs_projects':
    'No projects could be fetched from Bitbucket Data Center. Contact your system administrator, or {link}.',
  'onboarding.create_project.update_your_token': 'update your personal access token',
  'onboarding.create_project.see_on': 'See on {almName}',

  'onboarding.create_project.search_prompt': 'Search for projects',
  'onboarding.create_project.subtitle_monorepo_setup_link': 'set up a monorepo',
  'onboarding.create_project.azure.title': 'Azure project onboarding',
  'onboarding.create_project.azure.subtitle': 'Import projects from one of your Azure projects',
  'onboarding.create_project.azure.subtitle.reset_pat':
    'Reset your Azure DevOps personal access token',
  'onboarding.create_project.azure.subtitle.with_monorepo':
    'Import projects from one of your Azure projects or {monorepoSetupLink}.',
  'onboarding.create_project.azure.no_projects':
    'No projects could be fetched from Azure DevOps. Contact your system administrator, or {link}.',
  'onboarding.create_project.azure.search_results_for_project_X': 'Search results for "{0}"',
  'onboarding.create_project.azure.no_repositories':
    'Could not fetch repositories for this project. Contact your system administrator, or {link}.',
  'onboarding.create_project.azure.no_results': 'No repositories match your search query.',
  'onboarding.create_project.bitbucketcloud.title': 'Bitbucket Cloud project onboarding',
  'onboarding.create_project.bitbucketcloud.subtitle.reset_pat':
    'Reset your Bitbucket Cloud API token',
  'onboarding.create_project.bitbucketcloud.subtitle':
    'Import projects from one of your Bitbucket Cloud workspaces',
  'onboarding.create_project.bitbucketcloud.subtitle.with_monorepo':
    'Import projects from one of your Bitbucket Cloud workspaces or {monorepoSetupLink}.',
  'onboarding.create_project.bitbucketcloud.no_projects':
    'No projects could be fetched from Bitbucket. Contact your system administrator, or {link}.',
  'onboarding.create_project.bitbucketcloud.link': 'See on Bitbucket',
  'onboarding.create_project.github.title': 'GitHub project onboarding',
  'onboarding.create_project.github.subtitle':
    'Import repositories from one of your GitHub organizations.',
  'onboarding.create_project.github.subtitle.with_monorepo':
    'Import repositories from one of your GitHub organizations or {monorepoSetupLink}.',
  'onboarding.create_project.github.choose_organization': 'Choose an organization',
  'onboarding.create_project.github.warning.message':
    'Could not connect to GitHub. Please contact an administrator to configure GitHub integration.',
  'onboarding.create_project.github.warning.message_admin':
    'Could not connect to GitHub. Please make sure the GitHub instance is correctly configured in the {link} to create a new project from a repository.',
  'onboarding.create_project.github.warning.message_admin.link':
    'DevOps Platform integration settings',
  'onboarding.create_project.github.no_orgs':
    "We couldn't load any organizations with your key. Contact an administrator.",
  'onboarding.create_project.github.no_orgs_admin':
    "We couldn't load any organizations. Make sure the GitHub App is installed in at least one organization and check the GitHub instance configuration in the {link}.",
  'onboarding.create_project.gitlab.title': 'GitLab project onboarding',
  'onboarding.create_project.gitlab.subtitle': 'Import projects from one of your GitLab groups',
  'onboarding.create_project.gitlab.subtitle.reset_pat': 'Reset your GitLab personal access token',
  'onboarding.create_project.gitlab.subtitle.with_monorepo':
    'Import projects from one of your GitLab groups or {monorepoSetupLink}.',
  'onboarding.create_project.gitlab.no_projects':
    'No projects could be fetched from GitLab. Contact your system administrator, or {link}.',
  'onboarding.create_project.gitlab.link': 'See on GitLab',
  'onboarding.create_project.bitbucket.title': 'Bitbucket Data Center project onboarding',
  'onboarding.create_project.bitbucket.subtitle.reset_pat':
    'Reset your Bitbucket Data Center personal access token',
  'onboarding.create_project.bitbucket.subtitle':
    'Import projects from one of your Bitbucket Data Center workspaces',
  'onboarding.create_project.bitbucket.subtitle.with_monorepo':
    'Import projects from one of your Bitbucket Data Center workspaces or {monorepoSetupLink}.',
  'onboarding.create_project.x_repositories_selected':
    '{count} {count, plural, one {repository} other {repositories}} selected',
  'onboarding.create_project.x_repository_created':
    '{count} {count, plural, one {repository} other {repositories}} will be created as {count, plural, one {a project} other {projects}} in {productName}',
  'onboarding.create_project.please_dont_leave':
    'If you leave the page the import could fail. Are you sure you want to leave?',
  'onboarding.create_project.import_in_progress':
    '{count} of {total} projects imported. Please do not close this page until the import is complete.',

  'onboarding.create_project.monorepo.title': '{almName} monorepo project onboarding',
  'onboarding.create_project.monorepo.subtitle':
    'Create multiple {productName} projects corresponding to the same monorepo and bound to the same repository.',
  'onboarding.create_project.monorepo.doc_link': 'Learn more and get help setting up your monorepo',
  'onboarding.create_project.monorepo.choose_organization_and_repository':
    'Choose the organization and the repository',
  'onboarding.create_project.monorepo.choose_dop_setting': 'Choose the {almKey} configuration',
  'onboarding.create_project.monorepo.choose_organization': 'Choose the organization',
  'onboarding.create_project.monorepo.choose_organization.placeholder': 'List of organizations',
  'onboarding.create_project.monorepo.choose_repository': 'Choose the repository',
  'onboarding.create_project.monorepo.choose_repository.placeholder': 'List of repositories',
  'onboarding.create_project.monorepo.choose_repository.no_already_bound_projects':
    'This repository has no imported projects in {productName}',
  'onboarding.create_project.monorepo.choose_repository.existing_already_bound_projects':
    "This repository has already been imported, and it's linked to these projects in {productName}:",
  'onboarding.create_project.monorepo.no_orgs':
    "We couldn't load any organizations with your key. Contact an administrator.",
  'onboarding.create_project.monorepo.no_orgs_admin':
    "We couldn't load any organizations. Make sure the {almKey} App is installed in at least one organization and check the {almKey} instance configuration in the {link}.",
  'onboarding.create_project.monorepo.no_projects':
    'No projects could be fetched from {almKey}. Contact your system administrator.',
  'onboarding.create_project.monorepo.project_title': 'Create new projects',
  'onboarding.create_project.monorepo.add_project': 'Add new project',
  'onboarding.create_project.monorepo.remove_project': 'Remove project',
  'onboarding.create_project.monorepo.warning.message':
    'Could not connect to {almKey}. Please contact an administrator to configure {almKey} integration.',
  'onboarding.create_project.monorepo.warning.message_admin':
    'Could not connect to {almKey}. Please make sure the {almKey} instance is correctly configured in the {link} to create a new project from a repository.',
  'onboarding.create_project.monorepo.warning.message_admin.link':
    'DevOps Platform integration settings',

  'onboarding.create_project.new_code_definition.title': 'Set up new code for project',
  'onboarding.create_x_project.new_code_definition.title':
    'Set up new code for {count, plural, one {project} other {# projects}}',
  'onboarding.create_project.new_code_definition.create_x_projects':
    'Create {count, plural, one {project} other {# projects}}',
  'onboarding.create_projects.new_code_definition.change_info':
    'You can change this setting for each project individually at any time in the project administration settings.',
  'onboarding.create_project.success':
    'Your {count, plural, one {project has} other {# projects have}} been created.',
  'onboarding.create_project.monorepo.success':
    'Your monorepo has been set up successfully. {count, plural, one {1 new project was} other {# new projects were}} created',
  'onboarding.create_project.success.admin':
    'Project {project_link} has been successfully created.',
  'onboarding.create_project.failure':
    'Import of {count, plural, one {# project} other {# projects}} failed.',

  'onboarding.token.header': 'Provide a token',
  'onboarding.token.text':
    'The token is used to identify you when an analysis is performed. If it has been compromised, you can revoke it at any point in time in your {link}.',
  'onboarding.token.text.PROJECT_ANALYSIS_TOKEN':
    'The project token is used to identify you when an analysis is performed. If it has been compromised, you can revoke it at any point in time in your {link}.',
  'onboarding.token.text.GLOBAL_ANALYSIS_TOKEN':
    'The global token is used to identify you when an analysis is performed. If it has been compromised, you can revoke it at any point in time in your {link}.',
  'onboarding.token.text.user_account': 'user account',
  'onboarding.token.generate': 'Generate',
  'onboarding.token.generate.long': 'Generate a token',
  'onboarding.token.generate.PROJECT_ANALYSIS_TOKEN': 'Generate a project token',
  'onboarding.token.generate.GLOBAL_ANALYSIS_TOKEN': 'Generate a global token',
  'onboarding.token.use_existing_token': 'Use existing token',
  'onboarding.token.use_existing_token.label': 'Existing token value',
  'onboarding.token.warning_project_token_scope':
    'Please note that this token will only allow you to analyze the current project. If you want to use the same token to analyze multiple projects, you need to generate a global token in your {link}. See the {doc_link} for more information.',
  'onboarding.token.name.label': 'Token name',
  'onboarding.token.name.placeholder': 'Enter a name for your token',
  'onboarding.token.name.help': 'Enter a name for your project token',
  'onboarding.token.invalid_format': 'The token you have entered has invalid format.',
  'onboarding.token.delete': 'Delete the token',

  'onboarding.tutorial.env_variables': 'In the {field} field, enter {value} {extra}',
  'onboarding.tutorial.env_variables.field': 'Value',
  'onboarding.tutorial.env_variables.token_generator.value':
    'an existing token, or a newly generated one:',

  'onboarding.analysis.header': 'Run analysis on your project',
  'onboarding.analysis.auto_refresh_after_analysis.done': 'Is my analysis done?',
  'onboarding.analysis.auto_refresh_after_analysis.auto_refresh':
    'If your analysis is successful, this page will automatically refresh in a few moments.',
  'onboarding.analysis.auto_refresh_after_analysis.check_these_links':
    "While you're waiting, check out these links to learn how to configure Branch Analysis and Pull Request Analysis:",
  'onboarding.analysis.auto_refresh_after_analysis.check_these_links.pr_analysis':
    'Pull Request Analysis',
  'onboarding.analysis.auto_refresh_after_analysis.check_these_links.branches': 'Branch Analysis',
  'onboarding.analysis.auto_refresh_after_analysis.community.check_these_links':
    "While you're waiting, why not consider upgrading to our {edition}?  It offers additional features such as {branches} and {pull_requests}.",
  'onboarding.analysis.auto_refresh_after_analysis.community.check_these_links.edition':
    'Developer Edition',

  'onboarding.build': 'What option best describes your project?',
  'onboarding.build.maven': 'Maven',
  'onboarding.build.gradle': 'Gradle',
  'onboarding.build.make': 'Make',
  'onboarding.build.dotnet': '.NET',
  'onboarding.build.dotnet.win_core': 'Windows + .NET Core',
  'onboarding.build.dotnet.win_msbuild': 'Windows + .NET Framework',
  'onboarding.build.dotnet.linux_core': 'Linux + .NET Core',
  'onboarding.build.cpp': 'C or C++',
  'onboarding.build.objectivec': 'Objective-C',
  'onboarding.build.dart': 'Flutter or Dart',
  'onboarding.build.other': 'Other (for Go, PHP, ...)',

  'onboarding.build.jsts': 'JS/TS & Web',
  'onboarding.analysis.jsts.install.header': 'Install the Scanner for npm projects',
  'onboarding.analysis.jsts.links.documentation':
    'official documentation of the Scanner for npm projects',
  'onboarding.analysis.jsts.execute.header': 'Execute the Scanner',
  'onboarding.analysis.jsts.execute.text': `Running a SonarQube analysis with the Scanner for npm projects is straightforward. You just need to run the following command in your project's folder.`,
  'onboarding.analysis.jsts.step.footer': `Please visit the {link} for more details.`,

  'onboarding.build.python': 'Python',
  'onboarding.analysis.python.install.header': 'Install the Scanner for Python projects',
  'onboarding.analysis.python.links.documentation':
    'official documentation of the Scanner for Python projects',
  'onboarding.analysis.python.execute.header': 'Execute the Scanner',
  'onboarding.analysis.python.execute.text': `Running a SonarQube analysis with the Scanner for Python projects is straightforward. You just need to run the following command in your project's folder.`,
  'onboarding.analysis.python.step.footer': `Please visit the {link} for more details.`,

  'onboarding.build.rust': 'Rust/Cargo',
  'onboarding.analysis.rust.install.header': 'Install the Scanner for Cargo projects',
  'onboarding.analysis.rust.install.text': `Prebuilt binaries are also available. If you have {binstallCommand} installed, you can use it instead for a faster installation.`,
  'onboarding.analysis.rust.links.documentation':
    'official documentation of the Scanner for Cargo projects',
  'onboarding.analysis.rust.configure.header': 'Configure the analysis',
  'onboarding.analysis.rust.configure.text': `Add the following to the {projectManifestName} in your project's folder. Cargo build output is not excluded from the analysis automatically yet, so exclude it explicitly. In a virtual workspace, use {workspaceTable} in the workspace root instead.`,
  'onboarding.analysis.rust.execute.header': 'Execute the Scanner',
  'onboarding.analysis.rust.execute.text': `Running a SonarQube analysis with the Scanner for Cargo projects is straightforward. You just need to run the following command in your project's folder.`,
  'onboarding.analysis.rust.step.footer': `Please visit the {link} for more details.`,

  'onboarding.build.dotnet.variant': 'Which framework do you use?',
  'onboarding.build.dotnet.variant.dotnet_core': '.NET Core',
  'onboarding.build.dotnet.variant.dotnet_framework': '.NET Framework',

  'onboarding.build.other.os': 'What is your OS?',
  'onboarding.build.other.os.linux': 'Linux',
  'onboarding.build.other.os.win': 'Windows',
  'onboarding.build.other.os.mac': 'macOS',

  'onboarding.build.other.architecture': 'What is your architecture?',
  'onboarding.build.other.architecture.x86_64': 'x86_64',
  'onboarding.build.other.architecture.arm64': 'ARM64',

  'onboarding.build.cpp.autoconfig':
    'Do you want to use automatic configuration or manual configuration?',
  'onboarding.build.cpp.autoconfig.automatic': 'Automatic',
  'onboarding.build.cpp.autoconfig.automatic.description':
    'Automatic Configuration allows the onboarding of most projects. Getting started does not require any specific knowledge about the project or the language.',
  'onboarding.build.cpp.autoconfig.manual': 'Manual',
  'onboarding.build.cpp.autoconfig.manual.description':
    "Manual Configuration provides enhanced control over the setup, making it more suitable for certain specific use-cases. However, it may not support all scenarios and requires a certain level of understanding about the project's build process.",

  'onboarding.analysis.docs': 'Please visit the {link} for more details.',
  'onboarding.analysis.build_wrapper.header.linux':
    'Download and unzip the Build Wrapper for Linux',
  'onboarding.analysis.build_wrapper.header.win':
    'Download and unzip the Build Wrapper for Windows',
  'onboarding.analysis.build_wrapper.header.mac': 'Download and unzip the Build Wrapper for macOS',
  'onboarding.analysis.build_wrapper.text':
    "And add the executable's directory to the {env_var} environment variable",
  'onboarding.analysis.build_wrapper.execute':
    'Execute the Build Wrapper as a prefix to your build command',
  'onboarding.analysis.build_wrapper.execute_text':
    "Run the following command in your project's folder.",
  'onboarding.analysis.build_wrapper.execute_build_command': '<your clean build command>',
  'onboarding.analysis.build_wrapper.docs':
    'Please visit the {link} of the Build Wrapper for more details.',
  'onboarding.analysis.build_wrapper.docs_link': 'official documentation',

  'onboarding.analysis.java.maven.header': 'Execute the Scanner for Maven',
  'onboarding.analysis.java.maven.text':
    "Running a {instance} analysis with Maven is straightforward. You just need to run the following command in your project's folder.",
  'onboarding.analysis.java.maven.docs_link': 'official documentation of the Scanner for Maven',

  'onboarding.analysis.java.gradle.header': 'Execute the Scanner for Gradle',
  'onboarding.analysis.java.gradle.text.1':
    'Running an analysis with Gradle is straightforward. You just need to declare the {plugin_code} plugin in your {groovy} or {kotlin} file:',
  'onboarding.analysis.java.gradle.text.2': 'and run the following command:',
  'onboarding.analysis.java.gradle.latest_version':
    'You can find the latest version of the Gradle plugin {link}.',
  'onboarding.analysis.java.gradle.docs_link': 'official documentation of the Scanner for Gradle',

  'onboarding.analysis.msbuild.header': 'Download and unzip the SonarScanner for .NET',
  'onboarding.analysis.msbuild.text':
    'Visit the {link} to download the latest version for .NET framework. Make sure to add the directory containing {code} to the {path} environment variable.',
  'onboarding.analysis.msbuild.execute.text':
    'Running a {instance} analysis is straightforward. You just need to execute the following commands at the root of your solution.',
  'onboarding.analysis.msbuild.docs_link': 'documentation of the SonarScanner for .NET',

  'onboarding.analysis.sq_scanner.header.linux': 'Download and unzip the Scanner for Linux',
  'onboarding.analysis.sq_scanner.header.win': 'Download and unzip the Scanner for Windows',
  'onboarding.analysis.sq_scanner.header.mac': 'Download and unzip the Scanner for macOS',
  'onboarding.analysis.sq_scanner.text':
    'Visit the {link} to download the latest version, and add the {dir} directory to the {env_var} environment variable',
  'onboarding.analysis.sq_scanner.prepare': 'Prepare the Scanner',
  'onboarding.analysis.sq_scanner.prepare.flutter':
    'Before performing the analysis, we highly recommend:',
  'onboarding.analysis.sq_scanner.prepare.flutter.pub_get':
    'retrieving all project dependencies declared in <snippet>pubspec.yaml</snippet>, for example, by running <snippet>flutter pub get</snippet> for Flutter projects, <snippet>dart pub get</snippet> for Dart projects, etc.',
  'onboarding.analysis.sq_scanner.prepare.flutter.build':
    'performing a full and successful build of your Flutter or Dart project',
  'onboarding.analysis.sq_scanner.prepare.flutter.tip':
    'Otherwise, you might get incomplete and potentially incorrect analysis results. Retrieving project dependencies alone may not be enough to produce a correct analysis, for example, when you analyze generated code.',
  'onboarding.analysis.sq_scanner.execute': 'Execute the Scanner',
  'onboarding.analysis.sq_scanner.execute.text':
    "Running a {instance} analysis is straightforward. You just need to execute the following commands in your project's folder.",
  'onboarding.analysis.sq_scanner.docs': 'Please visit the {link} for more details.',
  'onboarding.analysis.sq_scanner.docs_link': 'official documentation of the Scanner',
  'onboarding.analysis.sq_scanner.sonar_token_env.header':
    'Configure a SONAR_TOKEN environment variable in your CI settings',
  'onboarding.analysis.sq_scanner.sonar_token_env.var_name': 'Add an environment variable called',
  'onboarding.analysis.sq_scanner.sonar_token_env.var_value': 'Give it the following value',
  'onboarding.analysis.sqscanner.docs.gradle.example_project.title':
    'live Gradle-based example project',

  'onboarding.analysis.dotnetcore.global': 'Install the SonarScanner .NET Core Global Tool',
  'onboarding.analysis.dotnetcore.global.text':
    'As a prerequisite you need to have the sonarscanner tool installed globally using the following command:',
  'onboarding.analysis.dotnetcore.global.text.path':
    'Make sure dotnet tools folder is in your path. See dotnet global tools documentation for more information.',

  'onboarding.tutorial.ci_outro.done': 'And you are done!',
  'onboarding.tutorial.ci_outro.refresh_text':
    "If everything is running successfully, once the analysis is complete you'll be redirected to the Overview page of your project where the new analysis results will be displayed. This can take a few minutes.",
  'onboarding.tutorial.ci_outro.commit.why.gitlab':
    'Each new push you make on your branches or merge requests will trigger a new analysis in {productName}. We will decorate merge requests directly on GitLab for you.',
  'onboarding.tutorial.ci_outro.commit.why.github':
    'Each new push you make on your branches or pull requests will trigger a new analysis in {productName}. We will decorate pull requests directly on GitHub for you.',
  'onboarding.tutorial.ci_outro.commit.why.bitbucket':
    'Each new push you make on your branches or pull requests will trigger a new analysis in {productName}. We will decorate pull requests directly on Bitbucket for you.',
  'onboarding.tutorial.ci_outro.commit.why.bitbucketcloud':
    'Each new push you make on your branches or pull requests will trigger a new analysis in {productName}. We will decorate pull requests directly on Bitbucket for you.',
  'onboarding.tutorial.ci_outro.commit.why.azure':
    'Each new push you make on your branches or pull requests will trigger a new analysis in {productName}. We will decorate pull requests directly on Azure for you.',
  'onboarding.tutorial.ci_outro.commit.why.no_branches':
    'Each new push you make on your main branch will trigger a new analysis in {productName}.',
  'onboarding.tutorial.ci_outro.refresh.why':
    "If the page doesn't refresh after a while, please double-check the analysis configuration, and check your logs.",
  'onboarding.tutorial.other.project_key.sentence':
    'Create a {file} file in your repository and paste the following code:',
  'onboarding.tutorial.other.project_key.monorepo.sentence':
    'Create a {file} file at the root of your project and paste the following code:',
  'onboarding.tutorial.other.project_key.monorepo.info':
    'Repeat this step for all the projects in your monorepo',
  'onboarding.tutorial.cfamilly.compilation_database_info':
    'If you have trouble using the Build Wrapper, you can try one of the alternative methods to {link}.',
  'onboarding.tutorial.cfamilly.compilation_database_info.link': 'generate a compilation database',
  'onboarding.tutorial.cfamily.examples_repositories_description':
    'Check out our C and C++ sample projects with {productName} analysis configured',

  'onboarding.tutorial.page.title': 'Analysis Method',
  'onboarding.tutorial.page.description':
    'Use this page to manage and set-up the way your analyses are performed.',
  'onboarding.tutorial.choose_method': 'How do you want to analyze your repository?',
  'onboarding.tutorial.choose_method.devops_platform.description':
    'Do you want to integrate with your favorite CI? Choose one of the following tutorials.',
  'onboarding.tutorial.choose_method.local': 'Locally',
  'onboarding.tutorial.choose_method.other-ci': 'Other CI',
  'onboarding.tutorial.choose_method.jenkins': 'With Jenkins',
  'onboarding.tutorial.choose_method.github-actions': 'With GitHub Actions',
  'onboarding.tutorial.choose_method.gitlab-ci': 'With GitLab CI',
  'onboarding.tutorial.choose_method.azure-pipelines': 'With Azure Pipelines',
  'onboarding.tutorial.choose_method.bitbucket-pipelines': 'With Bitbucket Pipelines',
  'onboarding.tutorial.breadcrumbs.home': 'Analysis Method',
  'onboarding.tutorial.breadcrumbs.local': 'Locally',
  'onboarding.tutorial.breadcrumbs.other-ci': 'Other CI',
  'onboarding.tutorial.breadcrumbs.jenkins': 'Jenkins',
  'onboarding.tutorial.breadcrumbs.github-actions': 'GitHub Actions',
  'onboarding.tutorial.breadcrumbs.gitlab-ci': 'GitLab CI',
  'onboarding.tutorial.breadcrumbs.azure-pipelines': 'Azure Pipelines',
  'onboarding.tutorial.breadcrumbs.bitbucket-pipelines': 'Bitbucket Pipelines',
  'onboarding.mode.help.manual':
    'Use this for testing or advanced use-case. Other modes are recommended to help you set up your CI environment.',
  'onboarding.mode.help.otherci':
    "{productName} integrates with your workflow no matter which CI tool you're using.",

  'onboarding.tutorial.with.yaml.gradle':
    'Update your {groovy} or {kotlin} file with the {sq} plugin and its configuration:',

  'onboarding.tutorial.with.bitbucket-pipelines.title': 'Analyze your project with Bitbucket CI',
  'onboarding.tutorial.with.bitbucket_pipelines.variables.title': 'Create repository variables',
  'onboarding.tutorial.with.bitbucket_pipelines.yaml.title':
    'Create your pipelines builds configuration',
  'onboarding.tutorial.with.bitbucket_pipelines.variables.intro':
    'In your Bitbucket repository, go to {repository_variables} and create two new variables:',
  'onboarding.tutorial.with.bitbucket_pipelines.variables.intro.link':
    'Repository settings > Repository variables',
  'onboarding.tutorial.with.bitbucket_pipelines.variables.name.sentence':
    'In the {name} field, enter',
  'onboarding.tutorial.with.bitbucket_pipelines.variables.name.sentence.name': 'Name',
  'onboarding.tutorial.with.bitbucket_pipelines.variables.add.sentence': 'Click on {add}.',
  'onboarding.tutorial.with.bitbucket_pipelines.variables.add.sentence.add': 'Add',
  'onboarding.tutorial.with.bitbucket_pipelines.variables.secured.sentence':
    'Make sure {secured} is check.',
  'onboarding.tutorial.with.bitbucket_pipelines.variables.secured.sentence.secured': 'Secured',

  'onboarding.tutorial.with.github-actions.title': 'Analyze your project with GitHub CI',
  'onboarding.tutorial.with.github_action.create_secret.title': 'Create GitHub Secrets',
  'onboarding.tutorial.with.github_action.create_secret.monorepo_project_level_token_info':
    'If you use project-level tokens, {link} for each project in your monorepo and create the associated secrets as per previous steps (secrets names need to be unique per project e.g. SONAR_TOKEN_1, SONAR_TOKEN_2...)',
  'onboarding.tutorial.with.github_action.create_secret.monorepo_project_level_token_info.link':
    'generate a token',
  'onboarding.tutorial.with.github_action.create_secret.monorepo_global_token_info':
    'If you use global tokens, request a global token from your admin and follow previous steps.',
  'onboarding.tutorial.with.github_action.monorepo.see_yaml_instructions':
    'Create or update your .github/workflows/build.yml YAML file at the root of your monorepository with this content',
  'onboarding.tutorial.with.github_action.secret.intro':
    'In your GitHub repository, go to {settings_secret} and create the following new secrets:',
  'onboarding.tutorial.with.github_action.secret.intro.link':
    'Settings > Secrets and variables > Actions',
  'onboarding.tutorial.with.github_action.secret.name.sentence': 'In the {name} field, enter',
  'onboarding.tutorial.with.github_action.secret.name.sentence.name': 'Name',
  'onboarding.tutorial.with.github_action.secret.new.sentence': 'Click on {new_secret}.',
  'onboarding.tutorial.with.github_action.secret.new.sentence.new_secret': 'New repository secret',
  'onboarding.tutorial.with.github_action.secret.add.sentence': 'Click on {add_secret}.',
  'onboarding.tutorial.with.github_action.secret.add.sentence.add_secret': 'Add secret',
  'onboarding.tutorial.with.github_action.yaml.title': 'Create Workflow YAML File',
  'onboarding.tutorial.with.github_action.yaml.create_yml':
    'Create or update your {file} YAML file with the following content:',

  'onboarding.tutorial.with.gitlab-ci.title': 'Analyze your project with GitLab CI',
  'onboarding.tutorial.with.gitlab_ci.project_key.maven.step2':
    'Add the following to your {file} file:',
  'onboarding.tutorial.with.gitlab_ci.project_key.gradle.step2':
    'Add the following to your {file} or {file2} file:',
  'onboarding.tutorial.with.gitlab_ci.project_key.jsts.step2':
    'Create a {file} file in your repository and paste the following code:',
  'onboarding.tutorial.with.gitlab_ci.project_key.python.step2':
    'Create a {file} file in your repository and paste the following code:',
  'onboarding.tutorial.with.gitlab_ci.project_key.rust.step2':
    'Create a {file} file in your repository and paste the following code:',
  'onboarding.tutorial.with.gitlab_ci.project_key.other.step2':
    'Create a {file} file in your repository and paste the following code:',
  'onboarding.tutorial.with.gitlab_ci.project_key.dart.step2':
    'Create a {file} file in your repository and paste the following code:',
  'onboarding.tutorial.with.gitlab_ci.project_key.dotnet.step2':
    'Create a {file} file in your repository and paste the following code:',
  'onboarding.tutorial.with.gitlab_ci.project_key.cpp.step2':
    'Create a {file} file in your repository and paste the following code:',
  'onboarding.tutorial.with.gitlab_ci.project_key.objectivec.step2':
    'Create a {file} file in your repository and paste the following code:',

  'onboarding.tutorial.with.gitlab_ci.variables.title': 'Add environment variables',
  'onboarding.tutorial.with.gitlab_ci.variables.description.link': 'Settings > CI/CD > Variables',
  'onboarding.tutorial.with.gitlab_ci.variables.section.title':
    'Define the {productName} Token environment variable.',
  'onboarding.tutorial.with.gitlab_ci.variables.section.description':
    'In GitLab, go to {link} to add the following variable and make sure it is available for your project:',
  'onboarding.tutorial.with.gitlab_ci.variables.edit.token.tooltip':
    'Use an existing token or generate a new one.',
  'onboarding.tutorial.with.gitlab_ci.variables.step1': 'Key {value} {extra}',

  'onboarding.tutorial.with.gitlab_ci.variables.step3': 'Uncheck the {value} checkbox.',
  'onboarding.tutorial.with.gitlab_ci.variables.step3.value': 'Protect Variable',
  'onboarding.tutorial.with.gitlab_ci.variables.section.step4': 'Check the {value} checkbox.',
  'onboarding.tutorial.with.gitlab_ci.variables.section.step4.value': 'Mask Variable',
  'onboarding.tutorial.with.gitlab_ci.variables.section2.title':
    'Define the {productName} URL environment variable.',
  'onboarding.tutorial.with.gitlab_ci.variables.section2.description':
    'Still in {link} add a new variable and make sure it is available for your project:',
  'onboarding.tutorial.with.gitlab_ci.variables.section2.step4':
    'Leave the {value} checkbox unchecked.',
  'onboarding.tutorial.with.gitlab_ci.yaml.title': 'Create or update the configuration file',
  'onboarding.tutorial.with.gitlab_ci.yaml.description':
    'Create or update your {filename} file with the following content.',
  'onboarding.tutorial.with.gitlab_ci.yaml.filename': '.gitlab-ci.yml',
  'onboarding.tutorial.with.gitlab_ci.yaml.baseconfig':
    'Note that this is a minimal base configuration to run a {productName} analysis on your main branch and merge requests, and fetch the vulnerability report (if applicable).',
  'onboarding.tutorial.with.gitlab_ci.yaml.existing':
    'If you already have a pipeline configured and running, you might want to add the example above to your existing yml file.',
  'onboarding.tutorial.with.gitlab_ci.yaml.premium':
    'GitLab vulnerability report is only available with GitLab Ultimate. You may safely remove the sonarqube-vulnerability-report stage if you have not subscribed to this service.',

  'onboarding.tutorial.with.jenkins.title': 'Analyze your project with Jenkins',
  'onboarding.tutorial.with.jenkins.alm_selection.title': 'Select your DevOps platform',
  'onboarding.tutorial.with.jenkins.prereqs.title': 'Prerequisites',
  'onboarding.tutorial.with.jenkins.prereqs.intro.sentence':
    'To run your project analyses with Jenkins, the following plugins must be {installed} and {configured}.',
  'onboarding.tutorial.with.jenkins.prereqs.intro.sentence.installed': 'installed',
  'onboarding.tutorial.with.jenkins.prereqs.intro.sentence.configured': 'configured',
  'onboarding.tutorial.with.jenkins.prereqs.plugins.branch_source.bitbucket':
    'Bitbucket Branch Source plugin for Jenkins - version 2.7 or later',
  'onboarding.tutorial.with.jenkins.prereqs.plugins.branch_source.bitbucketcloud':
    'Bitbucket Branch Source plugin for Jenkins - version 2.7 or later',
  'onboarding.tutorial.with.jenkins.prereqs.plugins.branch_source.github':
    'GitHub Branch Source plugin for Jenkins - version 2.7.1 or later',
  'onboarding.tutorial.with.jenkins.prereqs.plugins.branch_source.gitlab':
    'GitLab Branch Source plugin for Jenkins - version 1.5.3 or later',
  'onboarding.tutorial.with.jenkins.prereqs.plugins.gitlab_plugin':
    'GitLab plugin for Jenkins - version 1.5.13 or later',
  'onboarding.tutorial.with.jenkins.prereqs.plugins.sonar_scanner':
    '{productName} Scanner plugin for Jenkins - version 2.11 or later',
  'onboarding.tutorial.with.jenkins.prereqs.step_by_step_guide':
    'For a step by step guide on installing and configuring those plugins in Jenkins, visit the {link} documentation page.',
  'onboarding.tutorial.with.jenkins.prereqs.step_by_step_guide.link': 'Analysis Prerequisites',
  'onboarding.tutorial.with.jenkins.prereqs.following_are_recommendations':
    'We recommend using the configuration in the following steps for the best results, but you can customize it as needed.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.title':
    'Create a Multibranch Pipeline Job',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.intro':
    'Create a Multibranch Pipeline in order to automatically analyze all your branches and pull requests.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step1.sentence':
    "From Jenkins' dashboard, click {new_item} and create a {type}.",
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step1.sentence.new_item': 'New Item',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step1.sentence.type':
    'Multibranch Pipeline Job',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.sentence':
    'Under {tab}, add a {source} source and enter the following information:',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.sentence.tab':
    'Branch Sources',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.sentence.source':
    'Bitbucket',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.server.label': 'Server',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.server.action':
    'select the instance hosting the repository you want to analyze.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.creds.label':
    'Credentials',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.creds.action':
    'select the Bitbucket Data Center credentials.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.owner.label': 'Owner',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.owner.action':
    'enter your project key.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.repo.label': 'Repository',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.repo.action':
    'select the repository you want to analyze.',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.sentence':
    'Under {tab}, add a {source} source and enter the following information:',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.sentence.tab':
    'Branch Sources',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.sentence.source':
    'Bitbucket',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.server.label':
    'Server',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.server.action':
    'Make sure that Bitbucket Cloud is selected.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.creds.label':
    'Credentials',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.creds.action':
    'select the Bitbucket Cloud credentials.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.owner.label':
    'Owner',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.owner.action':
    'enter your workspace ID.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.repo.label':
    'Repository',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.repo.action':
    'select the repository you want to analyze.',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.github.sentence':
    'Under {tab}, add a {source} source and enter the following information:',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.github.sentence.tab':
    'Branch Sources',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.github.sentence.source': 'GitHub',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.github.creds.label': 'Credentials',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.github.creds.action':
    'select or add your GitHub credentials.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.github.repo_url.label':
    'Repository HTTPS URL',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.github.repo_url.action':
    'enter your repository URL.',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.sentence':
    'Under {tab}, add a {source} source and enter the following information:',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.sentence.tab':
    'Branch Sources',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.sentence.source':
    'GitLab Project',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.creds.label':
    'Checkout Credentials',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.creds.action':
    'select or add your GitLab credentials.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.owner.label': 'Owner',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.owner.action':
    'enter the name of your user or your group.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.repo.label': 'Projects',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.repo.action':
    'select your project.',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.label': 'Behaviors',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.branches_prs.action':
    'Exclude branches that are also filed as PRs.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.branches_prs.label':
    'Discover branches',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.branches_mrs.action':
    'Exclude branches that are also filed as MRs.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.branches_mrs.label':
    'Discover branches',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.discover_prs.action':
    'The current pull request revision.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.discover_prs.label':
    'Discover pull requests from origin',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.discover_mrs.action':
    'The current merge request revision.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.discover_mrs.label':
    'Discover merge requests from origin',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.label':
    'Specify ref specs',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.add_behaviour.sentence':
    'By default, this behavior is not active. If you do not see it, click on {add} to see the list of available behaviors, and select {ref_spec}.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.add_behaviour.sentence.add':
    'Add',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.add_behaviour.sentence.ref_spec':
    'Specify ref specs',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.set_pr_ref_specs.sentence':
    'In order to correctly compute new code for Pull Requests, the scanner will need the refs of the target branch. Make sure the {ref_spec} value will include any target branches (the default value should be enough). Example:',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.set_pr_ref_specs.sentence.ref_spec':
    'Ref Spec',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.set_mr_ref_specs.sentence':
    'In order to correctly compute new code for Merge Requests, the scanner will need the refs of the target branch. Make sure the {ref_spec} value will include any target branches (the default value should be enough). Example:',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.set_mr_ref_specs.sentence.ref_spec':
    'Ref Spec',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.leave_defaults':
    'You can leave the other Branch Source settings at the defaults.',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step3.sentence':
    'Jump to the {tab} section and make sure the parameters are set as follows:',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step3.sentence.tab':
    'Build Configuration',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step3.mode.label': 'Mode',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step3.mode.action': 'by Jenkinsfile',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step3.script_path.label': 'Script Path',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step3.script_path.action': 'Jenkinsfile',

  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step4.sentence': 'Click {save}.',
  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step4.sentence.save': 'Save',

  'onboarding.tutorial.with.jenkins.pipeline.title': 'Create a Pipeline Job',
  'onboarding.tutorial.with.jenkins.pipeline.intro':
    'Create a Pipeline in order to automatically analyze your project.',
  'onboarding.tutorial.with.jenkins.pipeline.step1.sentence':
    "From Jenkins' dashboard, click {new_item} and create a {type}.",
  'onboarding.tutorial.with.jenkins.pipeline.step1.sentence.new_item': 'New Item',
  'onboarding.tutorial.with.jenkins.pipeline.step1.sentence.type': 'Pipeline Job',

  'onboarding.tutorial.with.jenkins.pipeline.step2.sentence':
    'Under {tab}, choose {option}. You must set a unique, secret token for this field.',
  'onboarding.tutorial.with.jenkins.pipeline.step2.sentence.tab': 'Build Triggers',
  'onboarding.tutorial.with.jenkins.pipeline.step2.sentence.option': 'Trigger builds remotely',

  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.trigger.sentence':
    'Under {tab}, choose {option}. Write down the webhook URL provided. You will need it when configuring the webhook in GitLab.',
  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.trigger.sentence.tab': 'Build Triggers',
  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.trigger.sentence.option':
    'Build when a change is pushed to GitLab',
  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.pick_triggers.sentence':
    'Under {triggers}, only select {push_events}.',
  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.pick_triggers.sentence.triggers':
    'Enabled GitLab triggers',
  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.pick_triggers.sentence.push_events':
    'Push events',
  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.click_advanced.sentence':
    'Click on {advanced}',
  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.click_advanced.sentence.advanced':
    'Advanced...',
  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.secret_token.sentence':
    'Find the {secret_token} text field, and click on {generate}. Write down the secret token. You will need it when configuring the webhook in GitLab.',
  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.secret_token.sentence.secret_token':
    'Secret token',
  'onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.secret_token.sentence.generate':
    'Generate',

  'onboarding.tutorial.with.jenkins.pipeline.step3.sentence':
    'Under {tab}, make sure the parameters are set as follows:',
  'onboarding.tutorial.with.jenkins.pipeline.step3.sentence.tab': 'Pipeline',
  'onboarding.tutorial.with.jenkins.pipeline.step3.definition.label': 'Definition',
  'onboarding.tutorial.with.jenkins.pipeline.step3.definition.action': 'Pipeline script from SCM',
  'onboarding.tutorial.with.jenkins.pipeline.step3.scm.sentence':
    '{label} Configure your SCM. Make sure to only build your main branch. For example, if your main branch is called "main", put "*/main" under {branches_to_build}.',
  'onboarding.tutorial.with.jenkins.pipeline.step3.scm.sentence.label': 'SCM:',
  'onboarding.tutorial.with.jenkins.pipeline.step3.scm.sentence.branches_to_build':
    'Branches to build',
  'onboarding.tutorial.with.jenkins.pipeline.step3.script_path.label': 'Script Path',
  'onboarding.tutorial.with.jenkins.pipeline.step3.script_path.action': 'Jenkinsfile',

  'onboarding.tutorial.with.jenkins.pipeline.step4.sentence': 'Click {save}.',
  'onboarding.tutorial.with.jenkins.pipeline.step4.sentence.save': 'Save',

  'onboarding.tutorial.with.jenkins.webhook.bitbucket.title':
    'Create a Bitbucket Data Center Webhook',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.title':
    'Create a Bitbucket Cloud Webhook',
  'onboarding.tutorial.with.jenkins.webhook.github.title': 'Create a GitHub Webhook',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.title': 'Create a GitLab Webhook',
  'onboarding.tutorial.with.jenkins.webhook.intro.sentence':
    'Create a Webhook in your repository to trigger the Jenkins job on push. You may skip this step if you already have a Webhook configured.',
  'onboarding.tutorial.with.jenkins.webhook.step1.sentence':
    'Go to the {link} and enter the following information:',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step1.link':
    'Bitbucket Data Center Webhook creation page for your repository',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.step1.link':
    'Bitbucket Cloud Webhook creation page for your repository',
  'onboarding.tutorial.with.jenkins.webhook.github.step1.link':
    'GitHub Webhook creation page for your repository',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step1.link':
    'GitLab Webhook creation page for your repository',
  'onboarding.tutorial.with.jenkins.webhook.step1.name.label': 'Name',
  'onboarding.tutorial.with.jenkins.webhook.step1.name.action': 'give a unique name.',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step1.url.label': 'URL',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step1.url.action':
    'Enter the following URL, replacing the values between *** as needed:',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step1.url.warning':
    'The Bitbucket Data Center URL must be identical to the one in your Jenkins configuration. Watch out for any missing or extra "/" at the end.',
  'onboarding.tutorial.with.jenkins.webhook.github.step1.url.label': 'URL',
  'onboarding.tutorial.with.jenkins.webhook.github.step1.url.action':
    'Enter the following URL, replacing the values between *** as needed:',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step1.url_with_branches.label': 'URL',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step1.url_with_branches.action':
    'Enter the following URL, replacing the values between *** as needed:',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step1.url_no_branches.label': 'URL',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step1.url_no_branches.action':
    'Enter the URL you wrote down in the previous step.',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step1.secret_token.label': 'Secret Token',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step1.secret_token.action':
    'Enter the generated token you wrote down in the previous step.',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step2.sentence':
    'Under {events}, make sure the following options are checked:',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step2.sentence.events': 'Events',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.step2.sentence':
    'Under {triggers}, select {option} and make sure the following options are checked:',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.step2.sentence.triggers': 'Triggers',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.step2.sentence.option':
    'Choose from a full list of triggers',
  'onboarding.tutorial.with.jenkins.webhook.github.step2.sentence':
    'Under {events} select {option} and check the following:',
  'onboarding.tutorial.with.jenkins.webhook.github.step2.sentence.events':
    'Which events would you like to trigger this webhook?',
  'onboarding.tutorial.with.jenkins.webhook.github.step2.sentence.option':
    'Let me select individual events',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step2.sentence':
    'Under {trigger} check the following:',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step2.sentence.trigger': 'Trigger',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step2.repo.label': 'Repository',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step2.repo.action': 'Push',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step2.pr.label': 'Pull Request',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step2.pr.action': 'Opened',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.step2.repo.label': 'Repository',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.step2.repo.action': 'Push',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.step2.pr.label': 'Pull Request',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.step2.pr.action': 'Created',
  'onboarding.tutorial.with.jenkins.webhook.github.step2.repo': 'Pushes',
  'onboarding.tutorial.with.jenkins.webhook.github.step2.pr': 'Pull Requests',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step2.repo': 'Push events',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step2.mr': 'Merge request events',
  'onboarding.tutorial.with.jenkins.webhook.github.step3.sentence': 'Click {add_webhook}.',
  'onboarding.tutorial.with.jenkins.webhook.github.step3.sentence.add_webhook': 'Add webhook',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.step3.sentence': 'Click {save}.',
  'onboarding.tutorial.with.jenkins.webhook.bitbucketcloud.step3.sentence.save': 'Save',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step3.sentence': 'Click {create}.',
  'onboarding.tutorial.with.jenkins.webhook.bitbucket.step3.sentence.create': 'Create',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step3.sentence': 'Click {add_webhook}.',
  'onboarding.tutorial.with.jenkins.webhook.gitlab.step3.sentence.add_webhook': 'Add webhook',
  'onboarding.tutorial.with.jenkins.jenkinsfile.title': 'Create a Jenkinsfile',
  'onboarding.tutorial.with.jenkins.jenkinsfile.jenkinsfile_step.sentence':
    'Create a {file} file in your repository and paste the following code:',
  'onboarding.tutorial.with.jenkins.jenkinsfile.maven.step3.replace.sentence':
    'Make sure to replace {default} with the name you gave to your Maven tool {in_jenkins}.',
  'onboarding.tutorial.with.jenkins.jenkinsfile.maven.step3.replace.sentence.default':
    'Default Maven',
  'onboarding.tutorial.with.jenkins.jenkinsfile.maven.step3.replace.sentence.in_jenkins':
    'in Jenkins',
  'onboarding.tutorial.with.jenkins.jenkinsfile.maven.step3.help1.sentence':
    'To get the name of your Maven tool in Jenkins, navigate to {path}.',
  'onboarding.tutorial.with.jenkins.jenkinsfile.maven.step3.help1.sentence.path':
    'Manage Jenkins > Global Tool Configuration',
  'onboarding.tutorial.with.jenkins.jenkinsfile.maven.step3.help2.sentence':
    'The name is located under the {path} section, in the {name} field.',
  'onboarding.tutorial.with.jenkins.jenkinsfile.maven.step3.help2.sentence.path':
    'Maven > Maven installations',
  'onboarding.tutorial.with.jenkins.jenkinsfile.maven.step3.help2.sentence.name': 'Name',
  'onboarding.tutorial.with.jenkins.jenkinsfile.gradle.step2.sentence':
    'Add the following to your {groovy} or {kotlin} file:',
  'onboarding.tutorial.with.jenkins.jenkinsfile.dotnet.build_agent': 'Choose your build agent.',

  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.title.sentence':
    'Prerequisite: Add a {default_msbuild} tool.',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.title.sentence.default_msbuild':
    'MSBuild',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.info':
    'This step need to be done only once per jenkins instance.',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.step1.sentence':
    'In Jenkins, make sure to have the {msbuild} installed.',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.step1.sentence.msbuild':
    'MSBuild Plugin',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.step2.sentence': 'Navigate to {path}.',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.step2.sentence.path':
    'Manage Jenkins > Global Tool Configuration',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.step3.sentence':
    'Under {msbuild} click on {add_msbuild} and give a {name} that will be used in the last step. Refer to the {msbuild_plugin} documentation on how to install the tool:',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.step3.sentence.msbuild': 'MSBuild',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.step3.sentence.msbuild_plugin':
    'MSBuild Plugin',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.step3.sentence.add_msbuild':
    'Add MSBuild',
  'onboarding.tutorial.with.jenkins.dotnet.msbuild.prereqs.step3.sentence.name': 'Name',

  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.title.sentence':
    'Prerequisite: Add a {default_scanner} tool.',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.title.sentence.default_scanner':
    'SonarScanner for .NET',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.info':
    'This step needs to be done only once per jenkins instance or if you need different scanner versions.',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step1.sentence':
    'In Jenkins, navigate to {path}.',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step1.sentence.path':
    'Manage Jenkins > Global Tool Configuration',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step2.sentence':
    'Under {default_scanner} click on {add_scanner_for_msbuild}.',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step2.sentence.default_scanner':
    'SonarScanner for .NET',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step2.sentence.add_scanner_for_msbuild':
    'Add SonarScanner for .NET',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step3.sentence':
    'Choose a {name} that will be used in the last step:',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step3.sentence.name': 'Name',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step4.sentence': 'Check {install_auto}',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step4.sentence.install_auto':
    'Install automatically',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step5.sentence':
    'Under {install_from} select the corresponding .NET Core scanner required for you project.',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step5.sentence.install_from':
    'Install from GitHub',
  'onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step5.sentence.install_auto':
    'Install automatically',

  'onboarding.tutorial.with.jenkins.jenkinsfile.other.step3.replace.sentence':
    'Make sure to replace {default} with the name you gave to your {productName} Scanner tool {in_jenkins}.',
  'onboarding.tutorial.with.jenkins.jenkinsfile.other.step3.replace.sentence.default':
    'SonarScanner',
  'onboarding.tutorial.with.jenkins.jenkinsfile.other.step3.replace.sentence.in_jenkins':
    'in Jenkins',
  'onboarding.tutorial.with.jenkins.jenkinsfile.other.step3.help1.sentence':
    'To get the name of your {productName} Scanner tool in Jenkins, navigate to {path}.',
  'onboarding.tutorial.with.jenkins.jenkinsfile.other.step3.help1.sentence.path':
    'Manage Jenkins > Global Tool Configuration',
  'onboarding.tutorial.with.jenkins.jenkinsfile.other.step3.help2.sentence':
    'The name is located under the {path} section, in the {name} field.',
  'onboarding.tutorial.with.jenkins.jenkinsfile.other.step3.help2.sentence.path':
    '{productName} Scanner > {productName} Scanner installations',
  'onboarding.tutorial.with.jenkins.jenkinsfile.other.step3.help2.sentence.name': 'Name',
  'onboarding.tutorial.with.jenkins.jenkinsfile.cfamilly.agent_setup':
    'We assume the Jenkins agent has the necessary tools to build your project.',

  'onboarding.tutorial.with.azure_pipelines.os': 'What is your agent host?',
  'onboarding.tutorial.with.azure_pipelines.architecture': 'What is your agent architecture?',
  'onboarding.tutorial.with.azure-pipelines.title':
    'Analyze your project with Azure DevOps Pipelines',
  'onboarding.tutorial.with.azure_pipelines.ExtensionInstallation.title':
    'Install {productName} extension for Azure DevOps',
  'onboarding.tutorial.with.azure_pipelines.ExtensionInstallation.sentence':
    'From your Azure DevOps instance, navigate to the Visual Studio Marketplace and install the {link} by clicking the {button} button.',
  'onboarding.tutorial.with.azure_pipelines.ExtensionInstallation.sentence.link':
    '{productName} extension',
  'onboarding.tutorial.with.azure_pipelines.ExtensionInstallation.sentence.button': 'Get it free',
  'onboarding.tutorial.with.azure_pipelines.ServiceEndpoint.title':
    'Add a new {productName} Service Endpoint in your project',
  'onboarding.tutorial.with.azure_pipelines.ServiceEndpoint.step1.sentence':
    'In Azure DevOps, go to {menu}.',
  'onboarding.tutorial.with.azure_pipelines.ServiceEndpoint.step1.sentence.menu':
    'Project settings > Service connections',
  'onboarding.tutorial.with.azure_pipelines.ServiceEndpoint.step2.sentence':
    'Add a new service connection of type {type}.',
  'onboarding.tutorial.with.azure_pipelines.ServiceEndpoint.step2.sentence.type': '{productName}',
  'onboarding.tutorial.with.azure_pipelines.ServiceEndpoint.step3.sentence':
    'Enter your {productName} server url: {url} {button}',
  'onboarding.tutorial.with.azure_pipelines.ServiceEndpoint.step4.sentence':
    'Enter an existing token, or a newly generated one',
  'onboarding.tutorial.with.azure_pipelines.ServiceEndpoint.step5.sentence':
    'Enter a memorable connection name.',
  'onboarding.tutorial.with.azure_pipelines.ServiceEndpoint.step6.sentence':
    'Create the service connection.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.title': 'Configure analysis',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.info':
    'The following steps assume you are using the Azure Pipelines classic editor. Check out our {doc_link} for the YAML counterpart.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.info.doc_link':
    'Azure DevOps integration page',

  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.build_wrapper.ccpp.sentence':
    'In Azure DevOps, create or edit a build {pipeline} to make Build Wrapper available on the build agent.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.build_wrapper.ccpp.script.sentence':
    'Add a {task} task, select {inline} mode and add the following script to download and decompress the Build Wrapper on the build agent.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.build_wrapper.ccpp.win.sentence.task':
    'PowerShell script',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.build_wrapper.ccpp.nix.sentence.task':
    'Bash script',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.build_wrapper.ccpp.win.sentence.inline':
    'inline',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.build_wrapper.ccpp.nix.sentence.inline':
    'inline',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.ccpp.sentence':
    'Add a new {task} task {before} your build task.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare_additional.ccpp':
    'In {additional} in the {advanced} section, add a new property: {property} {button}',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare_additional.ccpp.additional':
    'Additional Properties',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare_additional.ccpp.advanced':
    'Advanced',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.build.ccpp.sentence':
    'Add or modify your build {task} task. For the analysis to happen, your build has to be run through a command line so that it can be wrapped-up by the build-wrapper.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.build.ccpp.sentence.task':
    'Command Line',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.build_script.ccpp.sentence':
    'Run {build_wrapper} executable. Pass in as the arguments (1) the output directory configured in the previous task and (2) the command that runs a clean build of your project (not an incremental build). Example:',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.build_script.ccpp.sentence.build_wrapper':
    'Build Wrapper',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.run.ccpp.sentence':
    'Add a new {task} task {after} your build task. Consider running this task right after the previous one as the build environment should not be significantly altered before running the analysis.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.sentence':
    'In Azure DevOps, create or edit a build {pipeline} and add a new {task} task {before} your build task:',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.sentence.pipeline': 'Pipeline',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.sentence.task':
    'Prepare Analysis Configuration',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.sentence.before': 'before',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.endpoint.sentence':
    'Select the {endpoint} you created in Step 2.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.endpoint.sentence.endpoint':
    '{productName} server endpoint',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis':
    'Under {section}, select {run_analysis_value}.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis.section':
    'Choose the way to run the analysis',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis.values.dotnet':
    'Integrate with MSBuild',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis.values.maven':
    'Integrate with Maven or Gradle',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis.values.gradle':
    'Integrate with Maven or Gradle',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis.values.cpp':
    'Use standalone scanner',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis.values.objectivec':
    'Use standalone scanner',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis.values.other':
    'Use standalone scanner',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.manual.sentence':
    'Select the {mode} mode.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.manual.sentence.mode':
    'Manually provide configuration',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.run.sentence':
    'Add a new {task} task {after} your build task.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.run.sentence.task': 'Run Code Analysis',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.run.sentence.after': 'after',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.run.key.sentence':
    'In the {project_key} field, enter {key} {button}',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.run.key.sentence.project_key':
    'Project Key',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.advanced_properties.sentence':
    'Expand the {section} and replace the {properties} with the following snippet',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.advanced_properties.sentence.section':
    'Advanced section',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.advanced_properties.sentence.properties':
    'Additional Properties',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.title':
    'Add a new Java tool installer task:',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.sentence':
    'Under {field}, select {value}',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.java_version':
    'JDK version',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.or_higher': '(or higher)',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.java_architecture':
    'JDK architecture',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.java_source':
    'JDK source',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.pre-installed':
    'Pre-installed',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java': 'Edit or add a new {0} task:',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java.settings.sentence':
    'Under {section}, check {option}',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java.settings.sentence.section':
    'Code Analysis',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java.settings.sentence.option':
    'Run {productName} Analysis',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.publish_qg.sentence':
    "Add a new {task} task to publish {productName}'s quality gate results on your build pipeline summary.",
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.publish_qg.info.sentence1':
    'This task may increase your build time as your pipeline will have to wait for {productName} to process the analysis report. It is highly recommended but optional.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.publish_qg.sentence.task':
    'Publish quality gate result',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.continous_integration.sentence':
    'Under the {tab} tab of your pipeline, check {continuous_integration} and select all the branches for which you want the {productName} analysis to run automatically.',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.continous_integration.sentence.tab':
    'Triggers',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.continous_integration.sentence.continuous_integration':
    'Enable continuous integration',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.continous_integration.no_branches.sentence':
    'Under the {tab} tab of your pipeline, check {continuous_integration} and select the main branch',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.continous_integration.no_branches.sentence.tab':
    'Triggers',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.continous_integration.no_branches.sentence.continuous_integration':
    'Enable continuous integration',
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.branch_protection':
    "To make sure your Pull Requests are analyzed automatically and aren't merged when they're failing their quality gate, check out the {link}.",
  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.branch_protection.link': 'documentation',

  'onboarding.tutorial.no_scan_rights':
    'You do not have permission to analyze this project. Please contact the project administrator.',
  //------------------------------------------------------------------------------
  //
  // Project coverage
  //
  //------------------------------------------------------------------------------

  'onboarding_dashboard.donut.tooltip.count': 'Count:',
  'onboarding_dashboard.donut.tooltip.percentage': 'Percentage:',
  'onboarding_dashboard.header.subtitle': 'Your journey to validated code quality and security.',
  'onboarding_dashboard.journey.congrats.title': 'Congratulations!',
  'onboarding_dashboard.journey.congrats.message':
    'You have successfully configured your DevOps platform! We found <b>{count}</b> repositories ready to be imported.',
  'onboarding_dashboard.journey.step.binding.title': 'DevOps platforms configured',
  'onboarding_dashboard.journey.step.binding.unbound': 'Not configured',
  'onboarding_dashboard.journey.step.binding.bound': 'Configured',
  'onboarding_dashboard.journey.step.repositories.title': 'Repositories imported',
  'onboarding_dashboard.journey.step.projects.title': 'Projects analyzed',
  'onboarding_dashboard.journey.step.count': '{done} / {total}',
  'onboarding_dashboard.journey.step.locked_aria_label': '{title}, locked',
  'onboarding_dashboard.journey.step.ring_count_aria_label': '{count} {title}',
  'onboarding_dashboard.journey.binding.title': 'Configure DevOps platforms',
  'onboarding_dashboard.journey.binding.description':
    'To start analyzing your projects, link GitHub, GitLab, Azure DevOps, or Bitbucket for Sonar to find, import and analyze them.',
  'onboarding_dashboard.journey.binding.bind_cta': 'Create configuration',
  'onboarding_dashboard.journey.binding.configured_label': 'Configured',
  'onboarding_dashboard.journey.binding.view_details': 'View details',
  'onboarding_dashboard.journey.binding.current': 'Current binding:',
  'onboarding_dashboard.journey.binding.view_cta': 'View configuration',
  'onboarding_dashboard.journey.binding.modal.title': 'Configured DevOps platforms',
  'onboarding_dashboard.journey.binding.modal.search': 'Search DevOps name...',
  'onboarding_dashboard.journey.binding.modal.platform_filter.label': 'DevOps',
  'onboarding_dashboard.journey.binding.modal.loading': 'Loading DevOps platform configurations...',
  'onboarding_dashboard.journey.binding.modal.col.name': 'Name',
  'onboarding_dashboard.journey.binding.modal.col.imported': 'Imported projects',
  'onboarding_dashboard.journey.binding.modal.action.import_repositories':
    'Import missing repositories',
  'onboarding_dashboard.journey.binding.modal.action.analyze_projects': 'Analyze projects',
  'onboarding_dashboard.journey.binding.modal.action.view_on_platform': 'View on {platform}',
  'onboarding_dashboard.journey.import.title': 'Import repositories',
  'onboarding_dashboard.journey.import.description':
    "Import all your repositories to unlock central visibility into your team's code health and block vulnerabilities before they hit production.",
  'onboarding_dashboard.journey.import.cta': 'Import',
  'onboarding_dashboard.journey.import.auto_edit_aria_label': 'Edit auto-import setting',
  'onboarding_dashboard.journey.import.cli_title': 'Bulk import your repositories',
  'onboarding_dashboard.journey.import.cli_description':
    'Use our CLI tool to import high quantities of repositories at the same time.',
  'onboarding_dashboard.journey.import.cli_cta': 'Import via CLI',
  'onboarding_dashboard.journey.import.imported_label': 'Imported',
  'onboarding_dashboard.journey.import.view_all': 'View all',
  'onboarding_dashboard.journey.import.legend.imported': 'Imported',
  'onboarding_dashboard.journey.import.legend.not_imported': 'Not imported',
  'onboarding_dashboard.journey.import.modal.title': 'Import repositories',
  'onboarding_dashboard.journey.import.modal.col.repository': 'Repository name',
  'onboarding_dashboard.journey.import.modal.col.visibility': 'Visibility',
  'onboarding_dashboard.journey.import.modal.col.status': 'Status',
  'onboarding_dashboard.journey.import.modal.platform_select.label': 'Choose platform',
  'onboarding_dashboard.journey.analyze.analyzed_label': 'Analyzed',
  'onboarding_dashboard.journey.analyze.title': 'Analyze your projects',
  'onboarding_dashboard.journey.analyze.description':
    'For full coverage and deep insights, consider moving as many projects as you can to CI-based analysis.',
  'onboarding_dashboard.journey.analyze.not_scanned.title': 'Not analyzed',
  'onboarding_dashboard.journey.analyze.not_scanned.desc':
    'These projects have not yet reported an analysis result. This may happen if analysis has not been set up, has not run successfully, or no code has been analyzed yet.',
  'onboarding_dashboard.journey.analyze.not_scanned.cta': 'Configure scanners',
  'onboarding_dashboard.journey.analyze.not_imported.title': 'Not imported',
  'onboarding_dashboard.journey.analyze.not_imported.desc':
    'These repositories have not been imported yet. Import them to start analyzing their code.',
  'onboarding_dashboard.journey.analyze.not_imported.cta': 'Import',
  'onboarding_dashboard.journey.analyze.projects_count': '{count} projects',
  'onboarding_dashboard.journey.analyze.repositories_count': '{count} repositories',
  'onboarding_dashboard.journey.analyze.legend.analyzed': 'Analyzed',
  'onboarding_dashboard.journey.analyze.legend.ci_scan': 'CI scan',
  'onboarding_dashboard.journey.analyze.legend.autoscan': 'Autoscan',
  'onboarding_dashboard.journey.analyze.legend.other_analysis': 'Other analysis',
  'onboarding_dashboard.journey.analyze.legend.not_scanned': 'Not analyzed',
  'onboarding_dashboard.journey.analyze.legend.not_imported': 'Not imported',
  'onboarding_dashboard.journey.analyze.modal.title': 'Projects',
  'onboarding_dashboard.journey.analyze.modal.description':
    'Projects with the status "not analyzed" need CI configuration to get analysis results.',
  'onboarding_dashboard.journey.analyze.modal.configure': 'Configure',
  'onboarding_dashboard.journey.analyze.modal.how_to_configure': 'How to configure projects',
  'onboarding_dashboard.journey.permission_required.description':
    '"Create projects" permission is required to take this action.',
  'onboarding_dashboard.journey.permission_required.cta': 'Edit permissions',
  'onboarding_dashboard.journey.overtime.title': 'Project coverage timeline',
  'onboarding_dashboard.journey.overtime.description':
    'Track your repository imports and project analysis, month by month.',
  'onboarding_dashboard.journey.overtime.description.analysis_only':
    'Track your project analysis, month by month.',
  'onboarding_dashboard.journey.overtime.legend.projects_scanned': 'Projects analyzed',
  'onboarding_dashboard.journey.overtime.legend.repositories_imported': 'Repositories imported',
  'onboarding_dashboard.journey.locked.stats.title': 'Unlock onboarding statistics',
  'onboarding_dashboard.journey.locked.stats.message':
    'Configure your first DevOps platform to see your onboarding momentum and adoption metrics!',
  'onboarding_dashboard.journey.locked.stats.cta': 'Create configuration',
  'onboarding_dashboard.journey.locked.more.title': 'Unlock more statistics',
  'onboarding_dashboard.journey.locked.more.message':
    'Import your first repositories to see your onboarding momentum and adoption metrics!',
  'onboarding_dashboard.journey.locked.more.cta': 'Import repositories',
  'onboarding_dashboard.loading': 'Loading dashboard',
  'onboarding_dashboard.table.results_size': '{size}/{total} results',
  'onboarding_dashboard.percent': '{percent}%',
  'onboarding_dashboard.stale.title': 'Commits not being analyzed',
  'onboarding_dashboard.stale.loading': 'Loading stale projects',
  'onboarding_dashboard.stale.description':
    "These projects have commits that haven't been analyzed in the past 7 days.",
  'onboarding_dashboard.stale.search': 'Search projects...',
  'onboarding_dashboard.stale.col.project': 'Project',
  'onboarding_dashboard.stale.col.gate_status': 'Gate status',
  'onboarding_dashboard.stale.col.last_scan': 'Last analysis',
  'onboarding_dashboard.stale.filter.gate_status.label': 'Gate status',
  'onboarding_dashboard.projects.title': 'All projects',
  'onboarding_dashboard.projects.loading': 'Loading projects',
  'onboarding_dashboard.projects.description':
    'All of your projects, whether or not they are bound to a repository.',
  'onboarding_dashboard.projects.search': 'Search projects...',
  'onboarding_dashboard.projects.col.repository': 'Repository',
  'onboarding_dashboard.projects.col.project': 'Project',
  'onboarding_dashboard.projects.col.onboarding': 'Analysis status',
  'onboarding_dashboard.projects.col.analysis_mode': 'Analysis mode',
  'onboarding_dashboard.projects.col.gate_status': 'Gate status',
  'onboarding_dashboard.projects.col.actions': 'Actions',
  'onboarding_dashboard.projects.actions.label': 'Actions for {name}',
  'onboarding_dashboard.projects.action.configure_ci': 'Configure CI analysis',
  'onboarding_dashboard.projects.action.bind_project': 'Bind project',
  'onboarding_dashboard.projects.action.rerun_automatic_analysis': 'Re-run automatic analysis',
  'onboarding_dashboard.projects.action.rerun_automatic_analysis.success':
    'Automatic analysis has been triggered.',
  'onboarding_dashboard.projects.action.rerun_automatic_analysis.error':
    "Automatic analysis couldn't be triggered. Please try again later.",
  'onboarding_dashboard.projects.action.rerun_automatic_analysis.not_eligible':
    'This project is not eligible for automatic analysis.',
  'onboarding_dashboard.projects.action.restore_access': 'Restore access',
  'onboarding_dashboard.projects.action.restore_access.success':
    'Your permissions on this project have been restored.',
  'onboarding_dashboard.projects.action.how_to_run_new_scan': 'How to run a new analysis',
  'onboarding_dashboard.projects.action.view_project': 'View project',
  'onboarding_dashboard.projects.filter.scan_status.label': 'Analysis status',
  'onboarding_dashboard.projects.filter.analysis_mode.label': 'Analysis mode',
  'onboarding_dashboard.projects.filter.all': 'All',
  'onboarding_dashboard.projects.filter.scanned': 'Analyzed',
  'onboarding_dashboard.projects.filter.not_scanned': 'Not analyzed',
  'onboarding_dashboard.projects.filter.ci': 'CI-based analysis',
  'onboarding_dashboard.projects.filter.no_analysis_mode': 'None',
  'onboarding_dashboard.projects.onboarding.scanned': 'Analyzed',
  'onboarding_dashboard.projects.onboarding.scan_failed': 'Analysis failed',
  'onboarding_dashboard.projects.onboarding.not_scanned': 'Not analyzed',
  'onboarding_dashboard.projects.analysis.full_ci': 'CI-based analysis',
  'onboarding_dashboard.projects.analysis.autoscan': 'Automatic analysis',
  'onboarding_dashboard.projects.gate.not_computed': 'Not computed',
  'onboarding_dashboard.repositories.loading': 'Loading repositories',
  'onboarding_dashboard.repositories.search': 'Search repositories...',
  'onboarding_dashboard.repositories.filter.visibility.label': 'Visibility',
  'onboarding_dashboard.repositories.filter.private': 'Private',
  'onboarding_dashboard.repositories.filter.public': 'Public',
  'onboarding_dashboard.enterprise.step.binding.title': 'DevOps platforms configured',
  'onboarding_dashboard.enterprise.step.binding.count': '{bound} of {total} organizations bound',
  'onboarding_dashboard.enterprise.step.imported_count': '{imported} imported',
  'onboarding_dashboard.enterprise.binding.title': 'Bind your organizations',
  'onboarding_dashboard.enterprise.binding.description':
    'Each organization of your enterprise is bound to its own DevOps platform. Binding keeps them synchronized and enables the easy import of projects into SonarQube Cloud. Use the organizations table below to bind the ones that are not.',
  'onboarding_dashboard.enterprise.binding.bound_label': 'Bound',
  'onboarding_dashboard.enterprise.binding.legend.not_bound': 'Not bound',
  'onboarding_dashboard.enterprise.import.title': 'Import repositories',
  'onboarding_dashboard.enterprise.import.description':
    'Repositories found on the DevOps platforms of all your organizations, and how many of them are imported. Open an organization from the table below to import its missing repositories.',
  'onboarding_dashboard.enterprise.import.summary':
    '{imported} of {discovered} repositories imported',
  'onboarding_dashboard.enterprise.import.summary_unknown': '{imported} repositories imported',
  'onboarding_dashboard.enterprise.import.total_unknown':
    'How many repositories your DevOps platforms hold could not be determined, so no share can be shown.',
  'onboarding_dashboard.enterprise.analyze.title': 'Analyze your projects',
  'onboarding_dashboard.enterprise.analyze.description':
    'Projects of all your organizations, and how many of them have reported an analysis. Open an organization from the table below to set up analysis for the ones that have not.',
  'onboarding_dashboard.enterprise.analyze.summary': '{analyzed} of {total} projects analyzed',
  'onboarding_dashboard.enterprise.locked.stats.title': 'Unlock onboarding statistics',
  'onboarding_dashboard.enterprise.locked.stats.message':
    "Bind your first organization to a DevOps platform to see your enterprise's onboarding momentum and adoption metrics!",
  'onboarding_dashboard.enterprise.locked.more.title': 'Unlock more statistics',
  'onboarding_dashboard.enterprise.locked.more.message':
    "Import your first repositories to see your enterprise's onboarding momentum and adoption metrics!",
  'onboarding_dashboard.enterprise.coverage.banner':
    "{unavailable} of {total} organizations couldn't be loaded. Totals exclude them.",
  'onboarding_dashboard.enterprise.organizations.title': 'Organizations',
  'onboarding_dashboard.enterprise.organizations.description':
    'Where each organization of your enterprise stands on its journey, least progressed first.',
  'onboarding_dashboard.enterprise.organizations.search': 'Search organizations...',
  'onboarding_dashboard.enterprise.organizations.loading': 'Loading organizations',
  'onboarding_dashboard.enterprise.organizations.sort.progress': 'Least progressed first',
  'onboarding_dashboard.enterprise.organizations.sort.name': 'Name',
  'onboarding_dashboard.enterprise.organizations.col.organization': 'Organization',
  'onboarding_dashboard.enterprise.organizations.col.repositories': 'Repositories',
  'onboarding_dashboard.enterprise.organizations.col.projects': 'Projects',
  'onboarding_dashboard.enterprise.organizations.col.progress': 'Progress',
  'onboarding_dashboard.enterprise.organizations.col.actions': 'Actions',
  'onboarding_dashboard.enterprise.organizations.unavailable': "Couldn't load",
  'onboarding_dashboard.enterprise.organizations.progress.label': 'Progress of {name}',
  'onboarding_dashboard.enterprise.organizations.action.view': 'View dashboard',
  'onboarding_dashboard.enterprise.organizations.action.view.label': 'View the dashboard of {name}',
  'onboarding_dashboard.enterprise.organizations.action.bind': 'Bind',
  'onboarding_dashboard.enterprise.organizations.action.bind.label':
    'Bind {name} to a DevOps platform',
  'onboarding_dashboard.enterprise.empty.title': 'No organizations yet',
  'onboarding_dashboard.enterprise.empty.description':
    'Add an organization to your enterprise to start following its onboarding progress here.',
  'onboarding_dashboard.enterprise.empty.cta': 'Add organization',
  'onboarding.create_organization.repo_auto_import.helper.bitbucket':
    'Automatically import new repositories from your connected Bitbucket workspace. Existing repositories are not imported.',
  'onboarding.create_organization.repo_auto_import.label.bitbucket':
    'Automatically import new Bitbucket repositories',
  'onboarding_dashboard.journey.import.auto_help.bitbucket':
    'New repositories in your Bitbucket workspace are imported automatically.',
  'onboarding.create_organization.repo_auto_import.locs_warning.bitbucket':
    'Analyzing imported private projects consumes your lines of code allowance. Ensure your plan has enough allowance for uninterrupted analysis.',
};
