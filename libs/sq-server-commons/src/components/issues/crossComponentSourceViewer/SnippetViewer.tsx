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

import classNames from 'classnames';
import { debounce, throttle } from 'lodash';
import React from 'react';
import { SourceLine } from '~shared/types/source';
import {
  CodeViewerExpander,
  SonarCodeColorizer,
  ThemeProp,
  UnfoldDownIcon,
  UnfoldUpIcon,
  themeColor,
  withTheme,
} from '../../../design-system';
import { translate } from '../../../helpers/l10n';
import {
  Duplication,
  ExpandDirection,
  FlowLocation,
  LineMap,
  LinearIssueLocation,
  SourceViewerFile,
} from '../../../types/types';
import Line from '../../SourceViewer/components/Line';
import { symbolsByLine } from '../../SourceViewer/helpers/indexing';
import { getSecondaryIssueLocationsForLine } from '../../SourceViewer/helpers/issueLocations';
import {
  optimizeHighlightedSymbols,
  optimizeLocationMessage,
} from '../../SourceViewer/helpers/lines';

export interface SnippetViewerProps {
  className?: string;
  component: SourceViewerFile;
  displayLineNumberOptions?: boolean;
  displaySCM?: boolean;
  duplications?: Duplication[];
  duplicationsByLine?: { [line: number]: number[] };
  expandBlock: (snippetIndex: number, direction: ExpandDirection) => Promise<void>;
  handleSymbolClick: (symbols: string[]) => void;
  hideLocationIndex?: boolean;
  highlightedLocationMessage: { index: number; text: string | undefined } | undefined;
  highlightedSymbols: string[];
  index: number;
  loadDuplications?: (line: SourceLine) => void;
  locations: FlowLocation[];
  locationsByLine: { [line: number]: LinearIssueLocation[] };
  onLocationSelect: (index: number) => void;
  renderAdditionalChildInLine?: (line: SourceLine) => React.ReactNode | undefined;
  renderDuplicationPopup: (index: number, line: number) => React.ReactNode;
  snippet: SourceLine[];
  snippetSourcesMap?: LineMap;
}

type Props = SnippetViewerProps & ThemeProp;

function SnippetViewer(props: Props) {
  const expandBlock = (direction: ExpandDirection) => () => {
    props.expandBlock(props.index, direction);
  };

  const {
    component,
    displaySCM,
    locationsByLine,
    snippet,
    theme,
    className,
    hideLocationIndex,
    displayLineNumberOptions,
    duplications,
    duplicationsByLine,
    snippetSourcesMap,
  } = props;

  const duplicationsCount = duplications ? duplications.length : 0;

  const firstLineNumber = snippet?.length ? snippet[0].line : 0;
  const noop = () => {
    /* noop */
  };
  const lastLine = component.measures?.lines && parseInt(component.measures.lines, 10);

  const symbols = symbolsByLine(snippet);

  const displayDuplications =
    Boolean(props.loadDuplications) && snippet.some((s) => !!s.duplicated);

  const borderColor = themeColor('codeLineBorder')({ theme });

  const THROTTLE_SHORT_DELAY = 10;
  const [hoveredLine, setHoveredLine] = React.useState<SourceLine | undefined>();

  const onLineMouseEnter = React.useMemo(
    () =>
      throttle((hoveredLine: number) => {
        if (snippetSourcesMap) {
          setHoveredLine(snippetSourcesMap[hoveredLine]);
        }
      }, THROTTLE_SHORT_DELAY),
    [snippetSourcesMap],
  );

  const onLineMouseLeave = React.useMemo(
    () =>
      debounce((line: number) => {
        setHoveredLine((hoveredLine) => (hoveredLine?.line === line ? undefined : hoveredLine));
      }, THROTTLE_SHORT_DELAY),
    [],
  );

  return (
    <div
      className={classNames('it__source-viewer-code', className)}
      style={{ border: `1px solid ${borderColor}` }}
    >
      <SonarCodeColorizer>
        {snippet[0].line > 1 && (
          <CodeViewerExpander
            className="sw-flex sw-justify-start sw-items-center sw-py-1 sw-px-2"
            direction="UP"
            onClick={expandBlock('up')}
          >
            <UnfoldUpIcon aria-label={translate('source_viewer.expand_above')} />
          </CodeViewerExpander>
        )}
        <table className="sw-w-full">
          <tbody>
            {snippet.map((line, index) => {
              const secondaryIssueLocations = getSecondaryIssueLocationsForLine(
                line,
                props.locations,
              );
              const lineDuplications = (duplicationsCount && duplicationsByLine?.[line.line]) || [];

              const displayCoverageUnderline = hoveredLine?.coverageBlock === line.coverageBlock;
              const displayNewCodeUnderline = hoveredLine?.newCodeBlock === line.line;
              return (
                <Line
                  displayCoverage
                  displayCoverageUnderline={displayCoverageUnderline}
                  displayDuplications={displayDuplications}
                  displayIssues={false}
                  displayLineNumberOptions={displayLineNumberOptions}
                  displayLocationMarkers
                  displayNewCodeUnderline={displayNewCodeUnderline}
                  displaySCM={displaySCM}
                  duplications={lineDuplications}
                  duplicationsCount={duplicationsCount}
                  firstLineNumber={firstLineNumber}
                  hideLocationIndex={hideLocationIndex}
                  highlighted={false}
                  highlightedLocationMessage={optimizeLocationMessage(
                    props.highlightedLocationMessage,
                    secondaryIssueLocations,
                  )}
                  highlightedSymbols={optimizeHighlightedSymbols(
                    symbols[line.line],
                    props.highlightedSymbols,
                  )}
                  issueLocations={locationsByLine[line.line] || []}
                  issues={[]}
                  key={line.line}
                  line={line}
                  loadDuplications={props.loadDuplications ?? noop}
                  onIssueSelect={noop}
                  onIssueUnselect={noop}
                  onIssuesClose={noop}
                  onIssuesOpen={noop}
                  onLineMouseEnter={onLineMouseEnter}
                  onLineMouseLeave={onLineMouseLeave}
                  onLocationSelect={props.onLocationSelect}
                  onSymbolClick={props.handleSymbolClick}
                  openIssues={false}
                  previousLine={index > 0 ? snippet[index - 1] : undefined}
                  renderDuplicationPopup={props.renderDuplicationPopup}
                  secondaryIssueLocations={secondaryIssueLocations}
                >
                  {props.renderAdditionalChildInLine?.(line)}
                </Line>
              );
            })}
          </tbody>
        </table>
        {(!lastLine || snippet[snippet.length - 1].line < lastLine) && (
          <CodeViewerExpander
            className="sw-flex sw-justify-start sw-items-center sw-py-1 sw-px-2"
            direction="DOWN"
            onClick={expandBlock('down')}
          >
            <UnfoldDownIcon aria-label={translate('source_viewer.expand_below')} />
          </CodeViewerExpander>
        )}
      </SonarCodeColorizer>
    </div>
  );
}

export default withTheme(SnippetViewer);
