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

export enum PackageManagers {
  Cargo = 'CARGO',
  Cocoapods = 'COCOAPODS',
  Composer = 'COMPOSER',
  Conan = 'CONAN',
  Gopkg = 'GOLANG',
  Maven = 'MAVEN',
  Npm = 'NPM',
  Nuget = 'NUGET',
  Pypi = 'PYPI',
  Rubygems = 'GEM',
  Vcpkg = 'VCPKG',
  UNKNOWN = 'UNKNOWN',
}

export const PACKAGE_MANAGER_LABELS: Record<PackageManagers, string> = {
  [PackageManagers.Cargo]: 'dependencies.package_managers.CARGO',
  [PackageManagers.Cocoapods]: 'dependencies.package_managers.COCOAPODS',
  [PackageManagers.Composer]: 'dependencies.package_managers.COMPOSER',
  [PackageManagers.Conan]: 'dependencies.package_managers.CONAN',
  [PackageManagers.Gopkg]: 'dependencies.package_managers.GOLANG',
  [PackageManagers.Maven]: 'dependencies.package_managers.MAVEN',
  [PackageManagers.Npm]: 'dependencies.package_managers.NPM',
  [PackageManagers.Nuget]: 'dependencies.package_managers.NUGET',
  [PackageManagers.Pypi]: 'dependencies.package_managers.PYPI',
  [PackageManagers.Rubygems]: 'dependencies.package_managers.GEM',
  [PackageManagers.Vcpkg]: 'dependencies.package_managers.VCPKG',
  [PackageManagers.UNKNOWN]: 'dependencies.package_managers.UNKNOWN',
};

export function getPackageManagerLabel(packageManager: PackageManagers | string) {
  const upper = packageManager.toUpperCase();
  if (upper in PACKAGE_MANAGER_LABELS) {
    return PACKAGE_MANAGER_LABELS[upper as PackageManagers];
  }
  return null;
}
