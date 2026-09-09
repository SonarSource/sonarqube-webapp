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

import { IconPackage } from '@sonarsource/echoes-react';
import { PackageManagers } from '../../helpers/package-managers';
import { CargoLogo } from './logos/CargoLogo';
import { CocoapodsLogo } from './logos/CocoapodsLogo';
import { ComposerLogo } from './logos/ComposerLogo';
import { ConanLogo } from './logos/ConanLogo';
import { GopkgLogo } from './logos/GopkgLogo';
import { MavenLogo } from './logos/MavenLogo';
import { NpmLogo } from './logos/NpmLogo';
import { NugetLogo } from './logos/NugetLogo';
import { PypiLogo } from './logos/PypiLogo';
import { RubygemsLogo } from './logos/RubygemsLogo';
import { VcpkgLogo } from './logos/VcpkgLogo';

interface PackageManagerIconProps {
  ariaLabel?: string;
  className?: string;
  packageManager: PackageManagers | string;
}

function renderPackageManagerIcon(packageManager: PackageManagers | string, className?: string) {
  switch (packageManager.toUpperCase()) {
    case PackageManagers.Cargo:
      return <CargoLogo className={className} />;
    case PackageManagers.Cocoapods:
      return <CocoapodsLogo className={className} />;
    case PackageManagers.Composer:
      return <ComposerLogo className={className} />;
    case PackageManagers.Conan:
      return <ConanLogo className={className} />;
    case PackageManagers.Gopkg:
      return <GopkgLogo className={className} />;
    case PackageManagers.Maven:
      return <MavenLogo className={className} />;
    case PackageManagers.Npm:
      return <NpmLogo className={className} />;
    case PackageManagers.Nuget:
      return <NugetLogo className={className} />;
    case PackageManagers.Pypi:
      return <PypiLogo className={className} />;
    case PackageManagers.Rubygems:
      return <RubygemsLogo className={className} />;
    case PackageManagers.Vcpkg:
      return <VcpkgLogo className={className} />;
    default:
      return <IconPackage className={className} />;
  }
}

export function PackageManagerIcon(props: Readonly<PackageManagerIconProps>) {
  const { ariaLabel, className, packageManager } = props;
  const icon = renderPackageManagerIcon(packageManager, className);

  if (ariaLabel) {
    return (
      <span aria-label={ariaLabel} role="img">
        <span aria-hidden="true">{icon}</span>
      </span>
    );
  }

  return icon;
}
