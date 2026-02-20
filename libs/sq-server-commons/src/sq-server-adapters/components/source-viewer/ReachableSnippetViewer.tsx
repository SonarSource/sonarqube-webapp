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

import { ComponentQualifier } from '~shared/types/component';
import { SourceLine } from '~shared/types/source';
import SnippetViewer from '../../../components/issues/crossComponentSourceViewer/SnippetViewer';
import { getLinearLocations } from '../../../components/SourceViewer/helpers/issueLocations';
import { LineFinding, SonarCodeColorizer } from '../../../design-system';
import { FlowLocation, LineMap, SourceViewerFile, TextRange } from '../../../types/types';

interface ReachableSnippetViewerProps {
  componentKey: string;
  filePath: string;
  highlightRange: {
    endLine: number;
    endLineOffset: number;
    startLine: number;
    startLineOffset: number;
  };
  message: string;
  sources: SourceLine[];
}

export function ReachableSnippetViewer({
  componentKey,
  filePath,
  highlightRange,
  message,
  sources,
}: Readonly<ReachableSnippetViewerProps>) {
  const projectKey = componentKey.split(':')[0];

  const textRange: TextRange = {
    startLine: highlightRange.startLine,
    startOffset: highlightRange.startLineOffset,
    endLine: highlightRange.endLine,
    endOffset: highlightRange.endLineOffset,
  };

  const flowLocation: FlowLocation = {
    component: componentKey,
    textRange,
  };

  const linearLocations = getLinearLocations(textRange);
  const locationsByLine: { [line: number]: typeof linearLocations } = {};
  for (const loc of linearLocations) {
    if (!(loc.line in locationsByLine)) {
      locationsByLine[loc.line] = [];
    }
    locationsByLine[loc.line].push(loc);
  }

  const sourceViewerFile: SourceViewerFile = {
    key: componentKey,
    measures: { lines: undefined },
    path: filePath,
    project: projectKey,
    projectName: '',
    q: ComponentQualifier.File,
    uuid: '',
  };

  const snippetSourcesMap: LineMap = {};
  for (const line of sources || []) {
    snippetSourcesMap[line.line] = line;
  }

  const noop = () => {
    /* noop */
  };

  const renderAdditionalChildInLine = (line: SourceLine) => {
    if (line.line === highlightRange.endLine) {
      return <LineFinding issueKey={componentKey} message={message} selected />;
    }
    return undefined;
  };

  return (
    <>
      {/*

        SQ Server snippet viewer makes API requests we are not yet prepared to mock from the tests
        Until this feature is actually needed on SQ Server, this adapter will simply pass the tests.

        At the time of writing, `useStandardExperienceModeQuery` was the problematic query hook.
        It has no suitable mock.

        <SourceViewerHeader
          branchLike={undefined}
          openComponent={noop}
          sourceViewerFile={sourceViewerFile}
        />
      */}
      <span>{sourceViewerFile.path}</span>
      <SonarCodeColorizer className="sw-flex sw-flex-col sw-gap-6">
        <SnippetViewer
          component={sourceViewerFile}
          displayLineNumberOptions={false}
          displaySCM={false}
          expandBlock={() => Promise.resolve()}
          handleSymbolClick={noop}
          hideLocationIndex
          highlightedLocationMessage={undefined}
          highlightedSymbols={[]}
          index={0}
          locations={[flowLocation]}
          locationsByLine={locationsByLine}
          onLocationSelect={noop}
          renderAdditionalChildInLine={renderAdditionalChildInLine}
          renderDuplicationPopup={() => null}
          snippet={sources || []}
          snippetSourcesMap={snippetSourcesMap}
        />
      </SonarCodeColorizer>
    </>
  );
}
