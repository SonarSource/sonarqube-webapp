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

const SLACK_REDIRECT_URL_HOST = 'slack.com';
const SLACK_REDIRECT_URL_PROTOCOL = 'https:';

/**
 * Rejects any `redirectUri` that isn't a well-formed `https:` URL before forcing it to Slack.
 * Needed because `URL#protocol`/`URL#host` are no-ops on opaque-path URLs like `javascript:` or
 * `data:`, so coercing those in place would silently fail to neutralize the payload.
 */
export function getSlackRedirectUrl(redirectUri: string): URL | undefined {
  let redirectUrl: URL;
  try {
    redirectUrl = new URL(redirectUri);
  } catch {
    return undefined;
  }

  if (redirectUrl.protocol !== SLACK_REDIRECT_URL_PROTOCOL) {
    return undefined;
  }

  redirectUrl.host = SLACK_REDIRECT_URL_HOST;
  // The `host` setter keeps a pre-existing port, and userinfo survives the coercion,
  // so clear both to guarantee the redirect really lands on https://slack.com
  redirectUrl.port = '';
  redirectUrl.username = '';
  redirectUrl.password = '';
  return redirectUrl;
}
