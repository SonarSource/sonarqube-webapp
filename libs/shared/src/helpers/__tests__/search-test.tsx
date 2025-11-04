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

import { screen } from '@testing-library/react';
import SearchHighlighter from '../../components/SearchHighlighter';
import { highlightTerm } from '../search';
import { render } from '../test-utils';

describe('highlightTerm', () => {
  it('should highlight exact match at beginning', () => {
    const result = highlightTerm('JavaScript language', 'Java');
    render(<div data-testid="result">{result}</div>);

    expect(screen.getByText('Java')).toHaveProperty('tagName', 'MARK');
    expect(screen.getByTestId('result')).toHaveTextContent('JavaScript language');
  });

  it('should highlight exact match in middle', () => {
    const result = highlightTerm('React JavaScript Framework', 'Script');
    render(<div data-testid="result">{result}</div>);

    expect(screen.getByText('Script')).toHaveProperty('tagName', 'MARK');
    expect(screen.getByTestId('result')).toHaveTextContent('React JavaScript Framework');
  });

  it('should highlight exact match at end', () => {
    const result = highlightTerm('Programming Language', 'Language');
    render(<div data-testid="result">{result}</div>);

    expect(screen.getByText('Language')).toHaveProperty('tagName', 'MARK');
    expect(screen.getByTestId('result')).toHaveTextContent('Programming Language');
  });

  it('should highlight case-insensitive match', () => {
    const result = highlightTerm('JavaScript LANGUAGE', 'language');
    render(<div data-testid="result">{result}</div>);

    expect(screen.getByText('LANGUAGE')).toHaveProperty('tagName', 'MARK');
    expect(screen.getByTestId('result')).toHaveTextContent('JavaScript LANGUAGE');
  });

  it('should handle exact match of entire string', () => {
    const result = highlightTerm('JavaScript', 'JavaScript');
    render(<div data-testid="result">{result}</div>);

    expect(screen.getByText('JavaScript')).toHaveProperty('tagName', 'MARK');
    expect(screen.getByTestId('result')).toHaveTextContent('JavaScript');
  });

  it('should handle single character match', () => {
    const result = highlightTerm('JavaScript', 'J');
    render(<div data-testid="result">{result}</div>);

    expect(screen.getByText('J')).toHaveProperty('tagName', 'MARK');
    expect(screen.getByTestId('result')).toHaveTextContent('JavaScript');
  });

  it('should handle a term with no text', () => {
    render(<SearchHighlighter />);
    expect(screen.queryByRole('mark')).not.toBeInTheDocument();
  });
});
