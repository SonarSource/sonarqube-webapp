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

import { Component } from '../../../../types/types';
import { CompilationInfo } from '../../components/CompilationInfo';
import { Arch, OSs } from '../../types';
import DownloadBuildWrapper from './DownloadBuildWrapper';
import DownloadScanner from './DownloadScanner';
import ExecBuildWrapper from './ExecBuildWrapper';
import ExecScanner from './ExecScanner';

export interface ClangGCCCustomProps {
  arch: Arch;
  baseUrl: string;
  component: Component;
  isLocal: boolean;
  os: OSs;
  token: string;
}

export default function ClangGCCCustom(props: Readonly<ClangGCCCustomProps>) {
  const { os, arch, baseUrl, component, isLocal, token } = props;

  return (
    <div>
      <DownloadBuildWrapper arch={arch} baseUrl={baseUrl} isLocal={isLocal} os={os} />
      <DownloadScanner arch={arch} isLocal={isLocal} os={os} token={token} />
      <ExecBuildWrapper arch={arch} os={os} />
      <CompilationInfo />
      <ExecScanner
        baseUrl={baseUrl}
        cfamily
        component={component}
        isLocal={isLocal}
        os={os}
        token={token}
      />
    </div>
  );
}
