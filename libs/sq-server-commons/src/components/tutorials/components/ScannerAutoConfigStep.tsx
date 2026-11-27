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

import { ScannerAutoConfigCard } from '~shared/components/onboarding/ScannerAutoConfigCard';
import { SCANNER_AUTOCONFIG_ENABLED } from '~shared/components/onboarding/scannerAutoConfig';
import { DocLink } from '../../../helpers/doc-links';
import { useDocUrl } from '../../../helpers/docs';
import { useSaveSimpleValueMutation } from '../../../queries/settings';
import { Component } from '../../../types/types';
import { BuildTools } from '../types';
import { useIsScannerAutoConfigEnabled } from '../useScannerAutoConfig';

interface Props {
  buildTool?: BuildTools;
  component: Component;
}

function ScannerAutoConfigStep({ buildTool, component }: Readonly<Props>) {
  const docUrl = useDocUrl(DocLink.SonarScanner);
  const { isEnabled, isLoading } = useIsScannerAutoConfigEnabled(component, buildTool);
  const { isPending, mutate: setScannerAutoConfig } = useSaveSimpleValueMutation(false, null);

  const handleChange = (value: boolean) => {
    setScannerAutoConfig({
      component: component.key,
      key: SCANNER_AUTOCONFIG_ENABLED,
      value: String(value),
    });
  };

  return (
    <ScannerAutoConfigCard
      canAdministerProject={component.configuration?.showSettings === true}
      docUrl={docUrl}
      isEnabled={isEnabled}
      isPending={isLoading || isPending}
      onChange={handleChange}
      showAndroidInfo={buildTool === BuildTools.Gradle}
    />
  );
}

export { ScannerAutoConfigStep };
