/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { IntlShape, createIntl, createIntlCache } from 'react-intl';
import { isDefined } from '~shared/helpers/types';
import { fetchL10nBundle } from '../api/l10n';
import { defaultMessages } from '../l10n/default';
import { AppState } from '../types/appstate';
import { EditionKey } from '../types/editions';
import { L10nBundle, L10nBundleRequestParams } from '../types/l10nBundle';
import { ProductName } from '../types/system';
import { toISO8601WithOffsetString } from './dates';

const DEFAULT_LOCALE = 'en';
const DEFAULT_MESSAGES: Record<string, string> = {
  // eslint-disable-next-line camelcase
  default_error_message: 'The request cannot be processed. Try again later.',
};

let intl: IntlShape;

export function getIntl() {
  return intl;
}

export function getMessages() {
  return getL10nBundleFromCache().messages ?? DEFAULT_MESSAGES;
}

export function getCurrentLocale() {
  return getL10nBundleFromCache().locale ?? DEFAULT_LOCALE;
}

export function getCurrentL10nBundle() {
  return getL10nBundleFromCache();
}

export async function loadL10nBundle(appState: AppState | undefined) {
  const browserLocale = getPreferredLanguage();
  const cachedBundle = getL10nBundleFromCache();

  const params: L10nBundleRequestParams = {};

  if (browserLocale) {
    params.locale = browserLocale;

    if (
      cachedBundle.locale &&
      browserLocale.startsWith(cachedBundle.locale) &&
      cachedBundle.timestamp &&
      cachedBundle.messages
    ) {
      params.ts = cachedBundle.timestamp;
    }
  }

  const { effectiveLocale, messages: translatedMessages } = await fetchL10nBundle(params).catch(
    (response) => {
      if (response?.status !== 304) {
        // eslint-disable-next-line no-console
        console.error(`Unexpected status code: ${response.status}`);
      }

      return {
        effectiveLocale: cachedBundle.locale ?? browserLocale ?? DEFAULT_LOCALE,
        messages: cachedBundle.messages ?? {},
      };
    },
  );

  /**
   * If using the default locale, we want the defaultMessages to take precedence. Only additional
   * messages from extensions will be added to them. The core.properties translation file is
   * legacy.
   *
   * Otherwise, we want the translated messages to take precedence, so that we overwrite the
   * defaults properly.
   */
  const messages =
    effectiveLocale === DEFAULT_LOCALE
      ? { ...translatedMessages, ...defaultMessages }
      : { ...defaultMessages, ...translatedMessages };

  const bundle = {
    timestamp: toISO8601WithOffsetString(new Date()),
    locale: effectiveLocale,
    messages,
  };

  persistL10nBundleInCache(bundle);

  const cache = createIntlCache();

  intl = createIntl(
    {
      locale: effectiveLocale,
      messages,

      /*
       * This sets a default value for translations, so devs do not need to pass the {productName}
       * value to every instance of FormattedMessage.
       * It is a bit of a hack, abusing this config item that is normally for tag replacement only,
       * hence the ts-expect-error tag
       */
      defaultRichTextElements: {
        // @ts-expect-error
        productName: getProductName(appState),
      },
    },
    cache,
  );

  return intl;
}

function getPreferredLanguage() {
  return window.navigator.languages ? window.navigator.languages[0] : window.navigator.language;
}

function getL10nBundleFromCache(): L10nBundle {
  return (window as unknown as any).sonarQubeL10nBundle ?? {};
}

function persistL10nBundleInCache(bundle: L10nBundle) {
  (window as unknown as any).sonarQubeL10nBundle = bundle;
}

function getProductName(appState?: AppState) {
  if (isDefined(appState?.edition)) {
    return appState?.edition === EditionKey.community
      ? ProductName.SonarQubeCommunityBuild
      : ProductName.SonarQubeServer;
  }

  return 'SonarQube';
}
