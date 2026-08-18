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

import { EchoesProviderForTests } from '@sonarsource/echoes-react';
import { screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { render } from '~shared/helpers/test-utils';
import { WidgetHeaderTitle } from '../WidgetHeaderTitle';
import { useObserveElementTruncation } from '../hooks/useObserveElementTruncation';

jest.mock('../hooks/useObserveElementTruncation');

const mockUseObserveElementTruncation = jest.mocked(useObserveElementTruncation);

function renderTitle(title: string) {
  return render(
    <HelmetProvider>
      <EchoesProviderForTests tooltipsDelayDuration={0}>
        <WidgetHeaderTitle title={title} />
      </EchoesProviderForTests>
    </HelmetProvider>,
  );
}

describe('WidgetHeaderTitle', () => {
  beforeEach(() => {
    mockUseObserveElementTruncation.mockReturnValue(false);
  });

  it('renders the title in sentence case', () => {
    renderTitle('Blocker Security MTTR for Issues');

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Blocker security MTTR for issues',
    );
  });

  it('uses the sentence-case title as the accessible name when truncated', () => {
    mockUseObserveElementTruncation.mockReturnValue(true);

    renderTitle('Blocker Security MTTR for Issues');

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Blocker security MTTR for issues',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Blocker security MTTR for issues')).toHaveAttribute(
      'aria-label',
      'Blocker security MTTR for issues',
    );
  });
});
