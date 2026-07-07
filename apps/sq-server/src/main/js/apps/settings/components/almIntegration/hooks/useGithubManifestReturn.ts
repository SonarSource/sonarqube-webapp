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

import { toast } from '@sonarsource/echoes-react';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';

/**
 * Handles the two ways GitHub sends the user back to a settings page during the App Manifest flow,
 * surfacing the outcome as a toast and cleaning the related query parameters:
 *
 * 1. The backend callback filter redirects here with `almManifestResult` (+ `almKey`/`almError`) when
 *    it cannot forward the user to GitHub's install page (creation error, or the rare success fallback).
 * 2. On the normal happy path the backend sends the user to GitHub to install the App, and GitHub then
 *    redirects to the App's `setup_url` (this page) with `setup_action`/`installation_id` instead — so
 *    we treat that as the successful completion of the flow.
 *
 * Shared by the settings tabs that can launch the flow (ALM integration and GitHub authentication),
 * since the backend redirects back to either one depending on the scope that was set up.
 */
export function useGithubManifestReturn() {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const router = useRouter();

  useEffect(() => {
    const {
      almManifestResult,
      almKey,
      almError,
      setup_action: setupAction,
    } = location.query as {
      almError?: string;
      almKey?: string;
      almManifestResult?: string;
      setup_action?: string;
    };

    if (!almManifestResult && !setupAction) {
      return;
    }

    if (almManifestResult === 'error') {
      toast.error({
        description:
          almError ||
          formatMessage({ id: 'settings.almintegration.github.manifest.error' }, { 0: '' }),
      });
    } else if (almManifestResult === 'success') {
      toast.success({
        description: formatMessage(
          { id: 'settings.almintegration.github.manifest.success' },
          { 0: almKey ?? '' },
        ),
      });
    } else if (setupAction === 'request') {
      // The user requested the installation but an organization owner still has to approve it.
      toast.info({
        description: formatMessage({
          id: 'settings.almintegration.github.manifest.install_requested',
        }),
      });
    } else if (setupAction === 'install' || setupAction === 'update') {
      // GitHub redirected back to the App's setup_url after a successful install/update.
      toast.success({
        description: formatMessage({ id: 'settings.almintegration.github.manifest.installed' }),
      });
    }
    // Any other state is unexpected (backend-controlled); we clean the params below without
    // surfacing a misleading success toast.

    const newQuery = { ...location.query };
    delete newQuery.almManifestResult;
    delete newQuery.almKey;
    delete newQuery.almError;
    delete newQuery.setup_action;
    delete newQuery.installation_id;
    delete newQuery.code;
    router.replace({ ...location, query: newQuery });
    // The manifest params are present exactly once, on the redirect back, so we only read them on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
