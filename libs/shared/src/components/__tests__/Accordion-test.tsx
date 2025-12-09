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
import { useState } from 'react';
import { render } from '../../helpers/test-utils';
import { Accordion } from '../Accordion';

describe('Accordion - Internal Control (Default)', () => {
  it('should toggle open/closed when clicking the summary', async () => {
    const { user } = render(
      <Accordion header="Test Header">
        <div>Test Content</div>
      </Accordion>,
    );

    const details = screen.getByRole('group');
    const headerText = screen.getByText('Test Header');

    expect(details).not.toHaveAttribute('open');

    await user.click(headerText);
    expect(details).toHaveAttribute('open');

    await user.click(headerText);
    expect(details).not.toHaveAttribute('open');
  });
});

describe('Accordion - External Control', () => {
  it('should be controlled by isOpen prop', () => {
    const { rerender } = render(
      <Accordion header="Test Header" isOpen={false}>
        <div>Test Content</div>
      </Accordion>,
    );

    const details = screen.getByRole('group');
    expect(details).not.toHaveAttribute('open');

    rerender(
      <Accordion header="Test Header" isOpen>
        <div>Test Content</div>
      </Accordion>,
    );

    expect(details).toHaveAttribute('open');
  });

  it('should call onOpenChange when toggled', async () => {
    const onOpenChange = jest.fn();
    const { rerender, user } = render(
      <Accordion header="Test Header" isOpen={false} onOpenChange={onOpenChange}>
        <div>Test Content</div>
      </Accordion>,
    );

    const headerText = screen.getByText('Test Header');

    await user.click(headerText);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    // Simulate parent updating isOpen
    rerender(
      <Accordion header="Test Header" isOpen onOpenChange={onOpenChange}>
        <div>Test Content</div>
      </Accordion>,
    );

    await user.click(headerText);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it('should work with both isOpen and onOpenChange for full external control', async () => {
    function FullyControlledAccordion() {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <Accordion header="Test Header" isOpen={isOpen} onOpenChange={setIsOpen}>
          <div>Test Content</div>
        </Accordion>
      );
    }

    const { user } = render(<FullyControlledAccordion />);

    const details = screen.getByRole('group');
    const headerText = screen.getByText('Test Header');

    // Initially closed
    expect(details).not.toHaveAttribute('open');

    // Click to open
    await user.click(headerText);
    expect(details).toHaveAttribute('open');

    // Click to close
    await user.click(headerText);
    expect(details).not.toHaveAttribute('open');
  });
});
