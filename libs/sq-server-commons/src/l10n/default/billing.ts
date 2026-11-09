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

export const billingMessages = {
  //------------------------------------------------------------------------------
  //
  // License page
  //
  //------------------------------------------------------------------------------

  'license.activate_offline': 'Activate offline',
  'license.activate_your_license_offline': 'Activate your license offline',
  'license.activation_method.legacy': 'License key based on server ID',
  'license.activation_method.offline': 'Offline',
  'license.activation_method.online': 'Online',
  'license.activation_method': 'Activation method',
  'license.add_license': 'Add license',
  'license.callout.activated.suggestion':
    'Your SonarQube license is active. You have full access to all the features and capabilities included in your edition.',
  'license.callout.activated.title': 'License successfully activated',
  'license.callout.new_products.suggestion':
    "You've added new products to this instance. Enable each product individually in the Active products table before you can start using it.",
  'license.callout.new_products.title': 'Enable your new products',
  'license.callout.expired.suggestion.grace_period':
    "We've granted you a {days}-day grace period so you can continue using all your features without interruption. To maintain full access, please set a new license or refresh your current one",
  'license.callout.expired.suggestion':
    'Set a new license or refresh your current one after renewal',
  'license.callout.expired.title': 'Your license has expired',
  'license.callout.loc.suggestion':
    'In order to continue using the product, decrease the number of lines of code, or contact sales to add more',
  'license.callout.loc.suggestion.increase_overage':
    'To continue analyzing more lines of code, increase your overage limit or contact sales to upgrade your license.',
  'license.callout.loc.suggestion.overage':
    'To continue analyzing more lines of code, enable overage or contact sales to upgrade your license.',
  'license.callout.loc.title': "You've exceeded the limit on lines of code",
  'license.callout.non-official.link-text': 'an official SonarQube Server distribution',
  'license.callout.non-official.suggestion':
    'Installing a Commercial Edition on top of a non-official distribution of SonarQube Server is not supported. As a consequence, all analyses are suspended. Please download and install {link} provided by SonarSource.',
  'license.callout.non-official.title': "You're using a non-official SQS distribution",
  'license.cant_connect_to_license_server': "SonarQube can't connect to the license server",
  'license.datetime.utc': 'UTC',
  'license.disabled_by_sonar.popover': 'The license was disabled by Sonar.',
  'license.disabled_by_sonar': 'Disabled by Sonar',
  'license.enter_your_license_key_for_x': 'Enter your license key for {0}',
  'license.enter_your_license_key': 'Enter your license key',
  'license.exceeded_loc.popover': "You've exceeded the limit of LOC (lines of code).",
  'license.exceeded_loc': 'Exceeded LOC',
  'license.expiration_date': 'Expiration date',
  'license.expired.popover': 'Set a new license or refresh your current one after renewal',
  'license.expired': 'Expired',
  'license.expires_soon.popover': 'Your license expires on {date}',
  'license.expires_soon': 'Expires soon',
  'license.feature_name': 'License manager',
  'license.how_to_fix_it': 'How to fix it',
  'license.i_accept_the_terms_and_conditions_with_link': 'I accept the {link}',
  'license.i_accept_the_terms_and_conditions': 'I accept the SonarQube Terms and Conditions',
  'license.invalid': 'Invalid',
  'license.is_supported': 'Support included',
  'license.last_refresh': 'Last refresh: ',
  'license.learn_more_or_activate_offline':
    'Learn more about this issue and how to fix it, or activate the license in the offline mode',
  'license.license_administration': 'license administration',
  'license.license_information': 'License information',
  'license.license_key': 'License key',
  'license.license_usage': 'License usage',
  'license.loc_usage.title': 'Lines of code',
  'license.loc_usage.purchased.title': 'Lines of code usage',
  'license.loc_usage.purchased.description': 'Included in your license',
  'license.loc_usage.purchased.analyzed_out_of': '{analyzed} lines analyzed out of {purchased}',
  'license.loc_usage.overage.title': 'Billed overage this month: {peak}',
  'license.loc_usage.overage.tooltip.title': 'Billed overage',
  'license.loc_usage.overage.tooltip.description':
    'Overage is calculated from your highest LOC peak this month. Lines of code usage shows the additional lines of code needed for your new plan, which may differ from this overage amount.',
  'license.loc_usage.overage.tooltip.usage_title': 'Usage',
  'license.loc_usage.overage.tooltip.usage_limit': '{used} / {limit} overage limit',
  'license.loc_usage.overage.tooltip.cost_title': 'Cost this month',
  'license.loc_usage.overage.tooltip.cost': '{cost} plus taxes',
  'license.loc_usage.overage.tooltip.minimum_charge_note':
    'A monthly minimum charge of {amount} plus applicable taxes applies (equivalent to {blockSize}). Your billed overage usage resets each month. Additional usage is billed in increments of {blockSize}.',
  'license.loc_usage.overage.tooltip.tax_note':
    'Taxes will be calculated based on tax rules in effect on the date the invoice is issued.',
  'license.loc_usage.overage.billable_marker.tooltip':
    'Highest overage reached this cycle. Your bill is based on this, not your current usage.',
  'license.loc_usage.overage.resets_on': 'Resets on {date}',
  'license.loc_usage.overage.limit_reached': 'Limit reached',
  'license.loc_usage.overage.limit_reached.tooltip':
    "You've reached your monthly usage limit. Your limit resets on {date}. To keep using the product, increase overage limit.",
  'license.loc_usage.overage.deactivated.tooltip':
    'You turned off LOC overage. Activate it again to avoid service interruptions when reaching your limit.',
  'license.loc_usage.overage.offline.tooltip':
    'Overage is deactivated as your instance is offline. Allow your instance to reach {url} and try again.',
  'license.loc_usage.overage.sales_gated.tooltip':
    'Overage is additional lines you can use beyond your purchased plan, billed monthly. Overage is deactivated for your organization. Contact our sales team to activate or to learn more about the overage.',
  'license.loc_usage.overage.misprovisioned.tooltip':
    'Overage is additional lines you can use beyond your purchased plan, billed monthly. Required overage settings are missing from your license. Contact SonarSource support to resolve this.',
  'license.loc_usage.ratio': '{used}/{limit}',
  'license.loc_usage.legend.purchased_analyzed': 'Lines of code analyzed',
  'license.loc_usage.legend.overage_billable': 'Overage lines of code',
  'license.loc_usage.legend.overage_billable.tooltip':
    'Overage is calculated from your highest LOC peak this month. Upgrade your plan to unlock a higher LOC limit at a lower rate.',
  'license.ncloc_lines_analyzed': '{ncloc} lines currently analyzed',
  'license.no_license.not_added': "It seems like you haven't added any license yet.",
  'license.no_license.reach_out':
    "If you've purchased a license but need a new key, reach out to {emailLink}",
  'license.no_license': "You don't have any license",
  'license.not_production_database_warning':
    'This license key is valid only for the embedded database, which should be considered disposable. Consider configuring an external database for long-term use and requesting a new license key.',
  'license.notification_threshold': 'Notification threshold',
  'license.notification_threshold.lines_of_code': '{ncloc} remaining lines of code',
  'license.offline.obtain_req_file.button': 'Download .req file',
  'license.offline.obtain_req_file.helptext':
    'Click to download your .req request file from SonarQube Server',
  'license.offline.obtain_req_file': 'Download your .req request file from SonarQube Server',
  'license.offline.upload_lic_file.button': 'Upload .lic file',
  'license.offline.upload_lic_file.helptext':
    'Click to upload your .lic file into SonarQube Server and activate your license',
  'license.offline.upload_lic_file': 'Upload your .lic file into SonarQube Server',
  'license.offline.upload_req_file.button': 'Upload .req file',
  'license.offline.upload_req_file.helptext':
    'Click to open the offline license portal. Upload your .req file into it and donwload your .lic file in return. Then come back to this wizard',
  'license.offline.upload_req_file':
    'Upload your .req request file, download your .lic license file',
  'license.offline_activation_hint':
    "If you can't activate your license online, try <link>offline activation</link>.",
  'license.prompt.description':
    '{title}You must set a license to be able to perform new analyses. {url}.',
  'license.prompt.link': 'Go to License page',
  'license.prompt.title': 'License needed:',
  'license.products.additional.title': 'Active products',
  'license.products.explore.title': 'Explore new products',
  'license.products.explore.trial_prompt': 'To try new products. {link}',
  'license.products.explore.talk_to_sales': 'Talk to sales',
  // Not a row in the Active Products table (LOC has its own usage card), but OverageDialog looks
  // up this key for any product it's given, LOC included, since it's product-agnostic.
  'license.products.linesOfCode.title': 'Lines of code',
  'license.products.sqas.title': 'Advanced Security',
  'license.products.sqas.features':
    '<ul><li>Detect vulnerabilities in your third-party dependencies</li><li>Catch when malicious packages are used by developers</li><li>Use quality gates to prevent new risks from being added to your code</li></ul>',
  'license.products.vortex.title': 'Vortex',
  'license.products.vortex.usage': '{used}/{limit} tools called',
  'license.products.vortex.usage.monthly': '{used}/{limit} tools called monthly',
  'license.products.vortex.overage_usage': '{used}/{limit} overage tools called',
  'license.products.vortex.overage_usage.monthly': '{used}/{limit} overage tools called monthly',
  'license.products.vortex.features':
    '<ul><li>Automatically analyzes files modified by the agent to find issues in less than 5 seconds</li><li>Advanced code navigation tools for token reduction</li><li>Third party dependency risks and policy checks before code generation happens</li></ul>',
  'license.products.hunterAgent.title': 'Hunter Agent',
  'license.products.hunterAgent.usage': '{used}/{limit} scan units used',
  'license.products.hunterAgent.usage.monthly': '{used}/{limit} scan units used monthly',
  'license.products.hunterAgent.overage_usage': '{used}/{limit} overage scan units used',
  'license.products.hunterAgent.overage_usage.monthly':
    '{used}/{limit} overage scan units used monthly',
  'license.products.hunterAgent.features':
    "<ul><li>Find high-impact security flaws that static analysis misses, such as broken access control and business-logic errors</li><li>Work with findings as regular issues you triage, assign, and track like any other, with no new tool to learn</li><li>Run the analysis on Sonar's infrastructure, with nothing to install or run locally</li></ul>",
  'license.products.hunterAgent.overage.dialog.info_message':
    'The overage limit stays active until your license expires. We will invoice monthly for usage, and you can update your limit at anytime.',
  'license.products.remediationAgent.title': 'Remediation Agent',
  'license.products.remediationAgent.usage': '{used}/{limit} suggestions used',
  'license.products.remediationAgent.usage.monthly': '{used}/{limit} suggestions used monthly',
  'license.products.remediationAgent.overage_usage': '{used}/{limit} overage suggestions used',
  'license.products.remediationAgent.overage_usage.monthly':
    '{used}/{limit} overage suggestions used monthly',
  'license.products.remediationAgent.features':
    "<ul><li>Generates and verifies fixes with Sonar's own analysis engine — automatically on a schedule, from your backlog, or in PRs</li><li>Creates ready-to-review pull requests, keeping developers in full control before anything is merged</li><li>Covers a broad range of issue types including security, reliability, maintainability, and dependency risks</li></ul>",
  'license.products.key_features': 'Key features',
  'license.products.badge.new': 'New',
  'license.products.overage.activate': 'Activate overage',
  'license.products.overage.deactivated_badge': 'Deactivated',
  // Cadence-neutral on purpose: the chip is rendered from the overage state alone, with no cadence
  // to consult, so it must read correctly for a perpetual pool as well as a monthly allowance.
  'license.products.overage.deactivated.description':
    'Activate overage so your workflows keep running even after reaching your limit.',
  'license.products.overage.deactivated.title': 'Overage is not active',
  'license.products.overage.manage': 'Manage overage',
  'license.products.overage.not_applicable': 'Not applicable',
  'license.products.overage.misprovisioned.description':
    'Required overage settings are missing from your license. Contact SonarSource support to resolve this.',
  'license.products.overage.misprovisioned.title': 'Overage settings incomplete',
  'license.products.overage.sales_gated.description':
    'Overage usage is currently disabled for your account. Get in touch with our team to enable overage options.',
  'license.products.overage.sales_gated.title': 'Overage is not active',
  'license.products.overage.dialog.activate.title': 'Activate overage for {product}',
  'license.products.overage.dialog.manage.title': 'Manage overage for {product}',
  // Each of the next four pairs is the design's two copy sets: the plain key for an allowance that
  // runs to licence expiry, the `.monthly` one for an allowance that resets. Keep them in step.
  'license.products.overage.dialog.acknowledge.title': 'Activate overage for {product}',
  'license.products.overage.dialog.acknowledge.title.monthly':
    'Activate monthly overage for {product}',
  'license.products.overage.dialog.acknowledge.summary':
    'You are activating extra usage for {product} (capped at {limit}). Extra usage is billed at {blockCost} per block of {blockSize}, subject to a {blockCost} minimum monthly charge.',
  'license.products.overage.dialog.acknowledge.units.hunterAgent':
    '{count, plural, one {# scan} other {# scans}}',
  'license.products.overage.dialog.acknowledge.units.remediationAgent':
    '{count, plural, one {# suggestion} other {# suggestions}}',
  'license.products.overage.dialog.acknowledge.units.vortex':
    '{count, plural, one {# tool used} other {# tools used}}',
  'license.products.overage.dialog.acknowledge.units.linesOfCode':
    '{count, plural, one {# line of code} other {# lines of code}}',
  'license.products.overage.dialog.acknowledge.tax_note':
    'Prices are exclusive of applicable taxes, calculated based on tax rules in effect on the date the invoice is issued.',
  'license.products.overage.dialog.acknowledge.authorization':
    'By activating overage, you represent that you are authorized to bind your organization to monthly recurring charges up to your selected limit whenever your included allowance is exceeded.',
  'license.products.overage.dialog.acknowledge.consent':
    'I accept the Terms and Conditions and authorize billing for up to {limit} (cancel or adjust limit anytime in settings).',
  'license.products.overage.dialog.allow': 'Allow overage usage',
  'license.products.overage.dialog.allow.description':
    'Enable extra usage to keep using the product uninterrupted. Overage starts after you reach your plan limit.',
  'license.products.overage.dialog.activated_toast.title': 'Overage activated for {product}',
  'license.products.overage.dialog.activated_toast.description':
    'Overage is successfully activated for {product} with {limit} for {cost}. This allowance does not reset and lasts for your license term. Overage starts after you reach your plan limit.',
  'license.products.overage.dialog.activated_toast.description.monthly':
    'Overage is successfully activated for {product} with {limit} for {cost} and will reset every month. Overage starts after you reach your plan limit.',
  'license.products.overage.dialog.limit.label': 'Set overage limit',
  'license.products.overage.dialog.limit.label.annual.hunterAgent': 'Set annual overage limit',
  'license.products.overage.dialog.limit.label.monthly': 'Set monthly overage limit',
  'license.products.overage.dialog.limit.help':
    'Enter a value in the multiples of {step, number}. Maximum limit is {max, number}.',
  'license.products.overage.dialog.limit.help.no_max':
    'Enter a value in the multiples of {step, number}.',
  'license.products.overage.dialog.limit.consumed':
    "You've used {used} of your {limit} overage limit. Enter a new limit below.",
  'license.products.overage.dialog.limit.consumed.monthly':
    "You've used {used} of your {limit} overage limit this month. Enter a new monthly limit below.",
  'license.products.overage.dialog.error.belowConsumed':
    'Enter a value greater than your current usage.',
  'license.products.overage.dialog.error.outOfRange':
    'Enter a value between {min, number} and {max, number}.',
  'license.products.overage.dialog.error.outOfRange.no_max':
    'Enter a value of at least {min, number}.',
  'license.products.overage.dialog.error.notAMultiple':
    'The value must be in the multiples of {step, number}.',
  'license.products.overage.dialog.error.missing': 'Enter an overage limit.',
  'license.products.overage.dialog.next': 'Next',
  'license.products.overage.dialog.activate': 'Activate overage',
  'license.products.overage.dialog.confirm_limit': 'Confirm new limit',
  'license.products.overage.dialog.confirm_deactivation': 'Confirm',
  'license.products.overage.dialog.deactivate.warning':
    'Turning off overage will pause {product} as soon as you’ve used your limit, it won’t run again until your limit resets.',
  'license.products.overage.dialog.deactivate.warning.monthly':
    'Turning off overage will pause {product} as soon as you’ve used your monthly limit, it won’t run again until your limit resets.',
  'license.products.overage.dialog.learn_more': 'Learn more',
  'license.products.overage.dialog.terms': 'Terms and conditions',
  // Mirrors what the activation endpoint says when a licence enables overage without the settings
  // it needs, so an admin who hits the gap here reads the same instruction.
  'license.products.overage.dialog.unavailable':
    'The license enables overage but is missing required overage settings. Contact SonarSource support.',
  'license.products.overage.dialog.contact_support': 'Contact support',
  'license.products.overage.stopped.description':
    'You turned off overage for this feature. Activate it again to avoid service interruptions when reaching your limit.',
  'license.products.overage.stopped.title': 'Overage deactivated',
  'license.products.overage.talk_to_sales': 'Talk to sales',
  'license.products.overage.talk_to_support': 'Talk to support',
  'license.products.overage.blocked.title': 'Overage blocked. Connect online to continue overage',
  'license.products.overage.blocked.description':
    'Your instance has been offline for a while, which paused product overage usage.<br></br>To continue using overage, reconnect your instance to {url} and try again.',
  'license.products.overage.blocked.learn_more': 'Learn more',
  'license.products.overage.offline.manage':
    "You can't manage overage while offline. Allow your instance to reach {url} and try again.",
  'license.products.column.base_usage_limit.help':
    'This is the usage limit included with your product subscription.',
  'license.products.column.base_usage_limit': 'Base usage limit',
  'license.products.column.overage_limit.help':
    'Additional usage beyond your base limit. Kicks in automatically once your base allowance is fully used.',
  'license.products.column.overage_limit': 'Overage limit',
  'license.products.column.product': 'Products',
  'license.products.column.status.help':
    'An organization admin must enable these products before your organization can use them.',
  'license.products.column.status': 'Status',
  'license.products.enable_now': 'Enable now',
  'license.products.enabled': 'Enabled',
  'license.products.full_access': 'Full access',
  'license.products.read_docs': 'Read the doc',
  'license.products.usage_tip.base.resets_on': 'Your limit resets on {date}.',
  'license.products.usage_tip.base.valid_until':
    'Your limit is valid until your license expires on {date}.',
  'license.products.usage_tip.base.monthly.default.title': 'Monthly usage',
  'license.products.usage_tip.base.monthly.default.description':
    'This shows the monthly usage limit included with your plan subscription. {validity}',
  'license.products.usage_tip.base.monthly.warning.title': '{percentage}% of monthly limit used',
  'license.products.usage_tip.base.monthly.warning.description':
    "You're close to reaching your usage limit. {validity}",
  'license.products.usage_tip.base.monthly.reached.title': 'Monthly limit reached',
  'license.products.usage_tip.base.monthly.reached.description':
    'You reached your monthly usage limit. {validity}',
  'license.products.usage_tip.base.monthly.reached_active.title':
    'Monthly limit reached and overage is active',
  'license.products.usage_tip.base.monthly.reached_active.description':
    'You reached your monthly limit and are currently using overage. {validity}',
  'license.products.usage_tip.base.term.default.title': 'Usage limit',
  'license.products.usage_tip.base.term.default.description':
    'This shows the usage limit included with your plan subscription. {validity}',
  'license.products.usage_tip.base.term.default.description.valid_until':
    'The usage you purchased for {product} is valid until your license expires on {date}.',
  'license.products.usage_tip.base.term.warning.title': '{percentage}% of limit used',
  'license.products.usage_tip.base.term.warning.description':
    "You're close to reaching your usage limit. {validity}",
  'license.products.usage_tip.base.term.reached.title': 'Limit reached',
  'license.products.usage_tip.base.term.reached.description':
    'You reached your usage limit. {validity}',
  'license.products.usage_tip.base.term.reached_active.title':
    'Limit reached and overage is active',
  'license.products.usage_tip.base.term.reached_active.description':
    'You reached your limit and are currently using overage. {validity}',
  'license.products.usage_tip.base.warning.prompt.sales':
    'To avoid interruptions, talk to sales to activate overage to your organization.',
  'license.products.usage_tip.base.warning.prompt.self_serve':
    'To continue using the product, you can enable overage billed monthly or <salesLink>contact Sales</salesLink> to increase your annual commitment.',
  'license.products.usage_tip.base.warning.prompt.support':
    'Overage settings are incomplete. Contact SonarSource support to resolve this.',
  'license.products.usage_tip.base.reached.prompt.sales':
    'To keep using the product, talk to sales to activate overage to your organization.',
  'license.products.usage_tip.base.reached.prompt.self_serve':
    'To continue using the product, you can enable overage billed monthly or <salesLink>contact Sales</salesLink> to increase your annual commitment.',
  'license.products.usage_tip.base.reached.prompt.support':
    'Overage settings are incomplete. Contact SonarSource support to resolve this.',
  'license.products.usage_tip.base.reached_active.resets_on':
    'Both your base plan and overage reset on {date}.',
  'license.products.usage_tip.base.reached_active.valid_until':
    'Both your base plan and overage are valid until your license expires on {date}.',
  'license.products.usage_tip.overage.resets_on': 'Your overage limit resets on {date}.',
  'license.products.usage_tip.overage.valid_until':
    'Your overage limit is valid until your license expires on {date}.',
  'license.products.usage_tip.overage.monthly.default.title': 'Overage limit',
  'license.products.usage_tip.overage.monthly.default.description':
    'Overage is activated for this product. Overage usage starts only after you reach your purchased limit, and we bill you monthly based on your usage.',
  'license.products.usage_tip.overage.monthly.warning.title':
    '{percentage}% of overage limit reached',
  'license.products.usage_tip.overage.monthly.warning.description':
    "You're close to reaching your overage limit. {validity}",
  'license.products.usage_tip.overage.monthly.reached.title': 'Overage limit reached',
  'license.products.usage_tip.overage.monthly.reached.description':
    'You reached your overage limit. {validity}',
  'license.products.usage_tip.overage.term.default.title': 'Overage limit',
  'license.products.usage_tip.overage.term.default.description':
    '{validity} We bill you monthly based on your usage alongside your other products.',
  'license.products.usage_tip.overage.term.default.description.valid_until':
    'The overage for {product} is valid until your license expires on {date}. We bill you monthly based on your usage alongside your other products.',
  'license.products.usage_tip.overage.term.warning.title': '{percentage}% of overage limit reached',
  'license.products.usage_tip.overage.term.warning.description':
    "You're close to reaching your overage limit. {validity}",
  'license.products.usage_tip.overage.term.reached.title': 'Overage limit reached',
  'license.products.usage_tip.overage.term.reached.description':
    'You reached your overage limit. {validity}',
  'license.products.usage_tip.overage.warning.prompt.manage':
    'To keep using the product uninterrupted, consider increasing your overage limit.',
  'license.products.usage_tip.overage.reached.prompt.manage':
    'To keep using the product, consider increasing your overage limit.',
  'license.products.usage_tip.overage.spent.usage_title': 'Usage',
  'license.products.usage_tip.overage.spent.usage_value':
    '{used} out of {limit} overage limit used',
  'license.products.usage_tip.overage.spent.usage_value.hunterAgent':
    '{used, number} of {limit, plural, one {# overage scan} other {# overage scans}} used',
  'license.products.usage_tip.overage.spent.usage_value.remediationAgent':
    '{used, number} of {limit, plural, one {# overage suggestion} other {# overage suggestions}} used',
  'license.products.usage_tip.overage.spent.usage_value.vortex':
    '{used, number} of {limit, plural, one {# overage tool} other {# overage tools}} used',
  'license.products.usage_tip.overage.spent.title': 'Spent',
  'license.products.usage_tip.overage.spent.title.monthly': 'Cost this month',
  'license.products.usage_tip.overage.spent.value': '{amount} plus taxes',
  'license.products.usage_tip.overage.spent.minimum_charge_note.monthly':
    'A monthly minimum charge of {amount} plus applicable taxes applies (equivalent to {blockSize}). Your usage resets each month. Additional usage is billed in increments of {blockSize}.',
  'license.products.usage_tip.overage.spent.minimum_charge_note.term':
    'A monthly minimum charge of {amount} plus applicable taxes applies (equivalent to {blockSize}). Your usage resets only when the license term ends. Additional usage is billed in increments of {blockSize}.',
  'license.products.usage_tip.overage.spent.tax_note':
    'Taxes will be calculated based on tax rules in effect on the date the invoice is issued.',
  'license.products.valid_until': 'Valid until',
  'license.products.view_demo': 'View demo',
  'license.refresh_license': 'Refresh license',
  'license.refresh_limit_hit': 'Daily refresh limit of 10 reached',
  'license.refresh_your_license_offline': 'Refresh your license offline',
  'license.replace_license': 'Set a new license',
  'license.request_trial_license': 'Request trial license',
  'license.serverId': 'Server ID',
  'license.set_license': 'Set license',
  'license.set_or_update': 'Set or update your SonarQube Server license.',
  'license.set_up_a_license': 'Set up a license',
  'license.start_date': 'Start date',
  'license.support': 'For support, view the {docLink} documentation or email us at {emailLink}.',
  'license.support_page.browse_resources': 'Browse online resources:',
  'license.support_page.create_ticket':
    "Create a ticket of the appropriate type (don't forget to attach your {file})",
  'license.support_page.connect_to_portal': 'Connect to the {link}',
  'license.support_page.download': 'Download',
  'license.support_page.get_support_info_file': 'Get your {file}',
  'license.support_page.need_help': 'Need help with your SonarQube ecosystem?',
  'license.support_page.not_finding_help': 'Not finding the help you need?',
  'license.support_page.not_supported':
    'This instance is not supported. Please contact SonarSource to get support.',
  'license.support_page.sonarqube_documentation': 'SonarQube documentation',
  'license.support_page.sonarsource_products': 'SonarSource products',
  'license.support_page.support_info_file': '<b>Support Information File</b>',
  'license.support_page.support_page_link': 'Support page',
  'license.support_page.support_page_read':
    'After you read it, feel free to create a ticket to report your problem, ask a question or suggest a change:',
  'license.support_page.support_page_text':
    'On our {link} you can find all the information you need concerning the SonarSource service desk, including how to create tickets.',
  'license.support_page.support_portal': 'SonarSource Support Portal',
  'license.support_page.supported':
    'This SonarQube server is covered by your SonarSource support subscription.',
  'license.support_page.title': 'Support',
  'license.terms_and_conditions': 'terms and conditions',
  'license.threshold.edit': 'Edit threshold',
  'license.threshold.explanation':
    'Once you reach this point, you will receive an email to inform you that you are approaching your limit of authorized lines of code for analysis.',
  'license.threshold.tooltip': 'This is your notification threshold',
  'license.threshold.warning_threshold.description':
    'Send an email notification when there are less lines of code remaining for analysis than the notification threshold.',
  'license.threshold.warning_threshold.name': 'Threshold',
  'license.title': 'SonarQube Server license',
  'license.type': 'Type',
  'license.unset_license.confirm.1': 'You are about to unset your SonarQube Server license.',
  'license.unset_license.confirm.2':
    'This action cannot be undone, and will immediately remove paid features from your instance until you set a valid license again.',
  'license.unset_license.confirm.3': 'Are you sure you wish to proceed?',
  'license.unset_license.success': 'License successfully unset',
  'license.unset_license': 'Unset license',
  'license.up_to_ncloc': 'Up to {ncloc}',
  'license.usage.description.subdued':
    'In order to determine how much each project contributes, the license takes into account the number of lines of code on the largest branch of that project. Lines of test code do not count towards your license usage.',
  'license.valid': 'Valid',
  'license.warning_threshold.success': 'Warning threshold saved successfully.',
};
