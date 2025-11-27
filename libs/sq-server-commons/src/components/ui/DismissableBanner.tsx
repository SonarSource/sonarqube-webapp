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

import { BannerProps, Layout } from '@sonarsource/echoes-react';
import { useCallback, useEffect, useState } from 'react';
import { get, save } from '~shared/helpers/storage';

export interface DismissableBannerProps {
  alertKey: string;
  children: BannerProps['children'];
  className?: string;
  variety: BannerProps['variety'];
}

export const DISMISSED_ALERT_STORAGE_KEY = 'sonarqube.dismissed_alert';

export function DismissableBanner(props: Readonly<DismissableBannerProps>) {
  const { alertKey, children, className, variety } = props;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (get(DISMISSED_ALERT_STORAGE_KEY, alertKey) !== 'true') {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [alertKey]);

  const handleBannerDismiss = useCallback(() => {
    window.dispatchEvent(new Event('resize'));
    save(DISMISSED_ALERT_STORAGE_KEY, 'true', alertKey);
    setShow(false);
  }, [alertKey]);

  if (!show) {
    return null;
  }

  return (
    <Layout.Banner className={className} onDismiss={handleBannerDismiss} variety={variety}>
      {children}
    </Layout.Banner>
  );
}
