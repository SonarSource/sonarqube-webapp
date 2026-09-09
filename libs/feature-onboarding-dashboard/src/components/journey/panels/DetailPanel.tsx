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

import { Card, CardSize } from '@sonarsource/echoes-react';
import { useLayoutEffect, useRef } from 'react';
import { JourneyState, JourneyStep } from '~shared/types/onboarding';
import { AnalyzeProjectsPanel } from './AnalyzeProjectsPanel';
import { ImportRepositoriesPanel } from './ImportRepositoriesPanel';
import { OrganizationBindingPanel } from './OrganizationBindingPanel';

interface Props {
  onSelectStep: (step: JourneyStep) => void;
  selectedStep: JourneyStep;
  state: JourneyState;
}

function renderPanel(
  selectedStep: JourneyStep,
  state: JourneyState,
  onSelectStep: (step: JourneyStep) => void,
) {
  switch (selectedStep) {
    case JourneyStep.Binding:
      return <OrganizationBindingPanel onSelectStep={onSelectStep} state={state} />;
    case JourneyStep.Repositories:
      return <ImportRepositoriesPanel state={state} />;
    case JourneyStep.Projects:
      return <AnalyzeProjectsPanel state={state} />;
  }
}

export function DetailPanel({ onSelectStep, selectedStep, state }: Readonly<Props>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) {
      return undefined;
    }

    const newHeight = el.scrollHeight;

    if (prevHeightRef.current !== null) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        prevHeightRef.current = newHeight;
        return undefined;
      }

      // When the element is at `height: auto`, getBoundingClientRect() already reflects the new
      // content, not the old height. Use the stored previous natural height instead. Only fall
      // back to getBoundingClientRect() when a transition is in progress (explicit px height) so
      // that interrupting a mid-animation switch starts from wherever the card currently sits.
      const fromHeight =
        el.style.height && el.style.height !== 'auto'
          ? el.getBoundingClientRect().height
          : prevHeightRef.current;

      el.style.transition = 'none';
      el.style.height = `${fromHeight}px`;
      el.style.opacity = '0';
      el.getBoundingClientRect(); // force reflow so the browser registers the starting values

      el.style.transition = 'height 300ms ease, opacity 200ms ease';
      el.style.height = `${newHeight}px`;
      el.style.opacity = '1';

      const finalize = () => {
        el.removeEventListener('transitionend', onTransitionEnd);
        el.style.height = 'auto';
        el.style.transition = '';
      };

      // transitionend fires once per animated property, so filter on `height`; it never fires
      // at all when the height happens not to change, hence the timeout fallback.
      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.propertyName === 'height') {
          finalize();
        }
      };
      const timeoutId = window.setTimeout(finalize, 350);
      el.addEventListener('transitionend', onTransitionEnd);

      return () => {
        window.clearTimeout(timeoutId);
        el.removeEventListener('transitionend', onTransitionEnd);
      };
    }

    prevHeightRef.current = newHeight;
    return undefined;
  }, [selectedStep]);

  // Keep prevHeightRef current when content changes size without a step change
  // (async data resolving, permission gates, etc.), but only while no explicit px
  // height is driving a transition.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      if (!el.style.height || el.style.height === 'auto') {
        prevHeightRef.current = el.scrollHeight;
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Card size={CardSize.Large}>
      <Card.Body>
        <div data-testid="detail-panel-content" ref={contentRef} style={{ overflow: 'hidden' }}>
          {renderPanel(selectedStep, state, onSelectStep)}
        </div>
      </Card.Body>
    </Card>
  );
}
