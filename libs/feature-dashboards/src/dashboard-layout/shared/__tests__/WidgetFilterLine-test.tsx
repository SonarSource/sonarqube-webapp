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
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';
import { render } from '~shared/helpers/test-utils';
import { WidgetFilterLine } from '../WidgetFilterLine';

const intlCache = createIntlCache();
const intl = createIntl(
  {
    defaultLocale: 'en',
    locale: 'en',
    messages: {},
    textComponent: 'span',
  },
  intlCache,
);

function renderLine(segments: string[]) {
  return render(
    <HelmetProvider>
      <RawIntlProvider value={intl}>
        <EchoesProviderForTests tooltipsDelayDuration={0}>
          <WidgetFilterLine segments={segments} />
        </EchoesProviderForTests>
      </RawIntlProvider>
    </HelmetProvider>,
  );
}

describe('WidgetFilterLine', () => {
  it('renders nothing when there are no segments', () => {
    renderLine([]);
    expect(screen.queryByTestId('widget-filter-line')).not.toBeInTheDocument();
  });

  it('joins segments with a middle dot', () => {
    renderLine(['Overall code', 'Software Quality: Reliability']);

    expect(screen.getByTestId('widget-filter-line')).toHaveTextContent(
      'Overall code · Software Quality: Reliability',
    );
  });
});
