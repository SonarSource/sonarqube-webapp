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

const { RuleTester } = require('eslint');
const noDirectAnalyticsSdkCalls = require('../no-direct-analytics-sdk-calls');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('no-direct-analytics-sdk-calls', noDirectAnalyticsSdkCalls, {
  valid: [
    {
      code: `
      import { updateLaunchDarklyMultiContext } from '~helpers/vendors/launchdarkly';
      import { useLDClient } from 'launchdarkly-react-client-sdk';

      const launchDarklyClient = useLDClient();

      updateLaunchDarklyMultiContext(launchDarklyClient, {kind: 'multi', {someData: 'data'}});
      `,
    },
    {
      code: `
      import { updateLaunchDarklyMultiContext } from '~helpers/vendors/launchdarkly';
      import { useLDClient } from 'launchdarkly-react-client-sdk';

      const launchDarklyClient = useLDClient();

      function useTest() {
        const launchDarklyClient = useLDClient();

        updateLaunchDarklyMultiContext(launchDarklyClient, {kind: 'multi', {someData: 'data'}});
      }
      `,
    },
    {
      code: `
      function updateLaunchDarklyMultiContext(launchDarklyClient, overrides) {
        launchDarklyClient.identify(overrides);
      }
      `,
    },
    {
      code: `
      import mixpanel from 'mixpanel-browser';

      export function identifyMixpanelUser(currentUser) {
        mixpanel.identify(currentUser.id);
      }
      `,
    },
  ],
  invalid: [
    {
      code: `
      import { useLDClient } from 'launchdarkly-react-client-sdk';

      async function useTest() {
        const launchDarklyClient = useLDClient();

        await launchDarklyClient?.identify({
          kind: 'multi',
          organization: { key: '123' },
        });
      }
      `,
      errors: [{ messageId: 'noLaunchDarklyIdentify' }],
    },
    {
      code: `
      import { useLDClient } from 'launchdarkly-react-client-sdk';

      export async function useTest() {
        const launchDarklyClient = useLDClient();

        await launchDarklyClient?.identify({
          kind: 'multi',
          organization: { key: '123' },
        });
      }
      `,
      errors: [{ messageId: 'noLaunchDarklyIdentify' }],
    },
    {
      code: `
      import { useLDClient } from 'launchdarkly-react-client-sdk';

      const useTest = () => {
        const launchDarklyClient = useLDClient();

        await launchDarklyClient?.identify({
          kind: 'multi',
          organization: { key: '123' },
        });
      }
      `,
      errors: [{ messageId: 'noLaunchDarklyIdentify' }],
    },
    {
      code: `
      import { useLDClient } from 'launchdarkly-react-client-sdk';

      export const useTest = async () => {
        const launchDarklyClient = useLDClient();

        await launchDarklyClient?.identify({
          kind: 'multi',
          organization: { key: '123' },
        });
      }
      `,
      errors: [{ messageId: 'noLaunchDarklyIdentify' }],
    },
    {
      code: `
      import mixpanel from 'mixpanel-browser';

      function trackPageView() {
        mixpanel.track('Page Viewed', { page: 'home' });
      }
      `,
      errors: [{ messageId: 'noMixpanelTrack' }],
    },
    {
      code: `
      import mixpanel from 'mixpanel-browser';

      export const trackButtonClick = () => {
        mixpanel.track('Button Clicked', { button: 'signup' });
      }
      `,
      errors: [{ messageId: 'noMixpanelTrack' }],
    },
    {
      code: `
      import mixpanel from 'mixpanel-browser';

      export async function useAnalytics() {
        await mixpanel.track('Feature Used');
      }
      `,
      errors: [{ messageId: 'noMixpanelTrack' }],
    },
    {
      code: `
      import mixpanel from 'mixpanel-browser';

      function useTest() {
        mixpanel.identify('user-123');
      }
      `,
      errors: [{ messageId: 'noMixpanelIdentify' }],
    },
  ],
});
