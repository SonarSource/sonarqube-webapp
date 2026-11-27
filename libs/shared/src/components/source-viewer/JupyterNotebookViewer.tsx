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

import {
  IMarkdownCell,
  IOutput,
  isDisplayData,
  isExecuteResult,
  isStream,
} from '@jupyterlab/nbformat';
import classNames from 'classnames';
import { useIntl } from 'react-intl';
import Markdown from 'react-markdown';
import { HighlightedCodeSnippet } from '../code-snippet/HighlightedCodeSnippet';
import { Image } from '../common/Image';

export function JupyterMarkdownCell({ cell }: Readonly<{ cell: IMarkdownCell }>) {
  const markdown = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

  return (
    <div className="sw:m-4 sw:ml-0">
      <Markdown>{markdown}</Markdown>
    </div>
  );
}

function CellOutput({ output }: Readonly<{ output: IOutput }>) {
  const { formatMessage } = useIntl();

  if (isExecuteResult(output) || isDisplayData(output)) {
    const components = Object.entries(output.data).map(([mimeType, dataValue], index) => {
      const bundle = Array.isArray(dataValue) ? dataValue.join('') : dataValue;

      if (mimeType === 'image/png' && typeof bundle === 'string') {
        return (
          <Image
            alt={formatMessage({ id: 'source_viewer.jupyter.output.image' })}
            key={`${mimeType}_${index}`}
            src={`data:image/png;base64,${bundle}`}
          />
        );
      } else if (mimeType === 'text/plain') {
        return (
          <pre key={`${mimeType}_${index}`}>
            {typeof bundle === 'string' ? bundle : JSON.stringify(bundle)}
          </pre>
        );
      }
      return null;
    });
    return <>{components}</>;
  } else if (isStream(output)) {
    const text = Array.isArray(output.text) ? output.text.join('') : output.text;

    return <pre>{text}</pre>;
  }
  return null;
}

export interface JupyterCodeCellProps {
  className?: string;
  htmlAsString: string;
  outputs?: IOutput[];
  source: string[];
}

export function JupyterCodeCell(props: Readonly<JupyterCodeCellProps>) {
  const { className, htmlAsString, outputs, source } = props;

  return (
    <div className={classNames('sw:m-4 sw:ml-0', className)}>
      <div>
        <HighlightedCodeSnippet
          className="sw:p-4"
          copyValue={source.join('')}
          htmlAsString={htmlAsString}
          noCopy
          wrap
        />
      </div>
      <div>
        {outputs?.map((output: IOutput, outputIndex: number) => (
          <CellOutput key={`${output.output_type}-output-${outputIndex}`} output={output} />
        ))}
      </div>
    </div>
  );
}
