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

import { MouseEvent, ReactNode, useCallback, useLayoutEffect, useRef } from 'react';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { getWidgetAnchor, WidgetDrilldownNavigationContext } from '../shared/WidgetInstanceContext';
import type { To } from 'react-router';
import { DashboardInstance } from '../logic/types';
import { ExplicitSection } from './ExplicitSection';
import { ImplicitSection } from './ImplicitSection';

interface Props<WidgetPropMap extends {}> {
  dashboard: DashboardInstance<WidgetPropMap>;
  width: number;
  restoreDrilldownScroll?: boolean;
}

export function ReadonlyDashboard<WidgetPropMap extends {}>(props: Readonly<Props<WidgetPropMap>>) {
  const { dashboard, width } = props;

  const sections = (
    <div className="sw:py-4">
      {dashboard.children.map((section) => {
        if (section.type === 'explicit') {
          return <ExplicitSection gridWidth={width} key={section.key} section={section} />;
        }
        return <ImplicitSection gridWidth={width} key="implicit" section={section} />;
      })}
    </div>
  );

  return props.restoreDrilldownScroll ? (
    <DrilldownScrollRestoration>{sections}</DrilldownScrollRestoration>
  ) : (
    sections
  );
}

function DrilldownScrollRestoration({ children }: Readonly<{ children: ReactNode }>) {
  const location = useLocation();
  const { navigate } = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const navigation = useRef<{ pending: boolean; sourceHash?: string }>({ pending: false });

  useLayoutEffect(() => {
    if (navigation.current.sourceHash === location.hash) {
      delete navigation.current.sourceHash;
      return;
    }
    const widget = Array.from(
      container.current?.querySelectorAll<HTMLElement>('[data-widget-key]') ?? [],
    ).find((element) => `#${getWidgetAnchor(element.dataset.widgetKey ?? '')}` === location.hash);
    widget?.scrollIntoView({ behavior: 'instant', block: 'center' });
  }, [location.hash]);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const target = getWidgetDrilldownTarget(event.target, new URL(window.location.href));
    if (!target) {
      return;
    }
    const { destination, originPath, widgetKey } = target;
    event.preventDefault();
    void navigateFromWidget(
      {
        pathname: `${location.pathname.replace(/\/$/, '')}${destination.pathname.slice(originPath.length)}`,
        search: destination.search,
        hash: destination.hash,
      },
      widgetKey,
    );
  }

  const navigateFromWidget = useCallback(
    async (destination: To, widgetKey: string) => {
      const currentNavigation = navigation.current;
      if (currentNavigation.pending) {
        return;
      }
      currentNavigation.pending = true;
      const sourceHash = `#${getWidgetAnchor(widgetKey)}`;
      currentNavigation.sourceHash = sourceHash;
      try {
        // Replace the origin entry before pushing the drilldown; data-router navigation is async.
        await navigate(
          {
            pathname: location.pathname,
            search: location.search,
            hash: sourceHash,
          },
          { replace: true, state: location.state as unknown, preventScrollReset: true },
        );
        if (container.current) {
          await navigate(destination);
        }
      } finally {
        currentNavigation.pending = false;
      }
    },
    [location.pathname, location.search, location.state, navigate],
  );

  return (
    <WidgetDrilldownNavigationContext.Provider value={navigateFromWidget}>
      <div onClickCapture={handleClick} ref={container}>
        {children}
      </div>
    </WidgetDrilldownNavigationContext.Provider>
  );
}

function getWidgetDrilldownTarget(target: EventTarget, current: URL) {
  const link = target instanceof Element ? target.closest('a[href]') : null;
  if (!(link instanceof HTMLAnchorElement)) {
    return null;
  }
  const widgetKey =
    link.dataset.widgetDrilldownKey ??
    link.closest<HTMLElement>('[data-widget-key]')?.dataset.widgetKey;
  if (!widgetKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) {
    return null;
  }
  const destination = new URL(link.href);
  const originPath = current.pathname.replace(/\/$/, '');
  if (
    destination.origin !== current.origin ||
    !destination.pathname.startsWith(`${originPath}/breakdown/`)
  ) {
    return null;
  }
  return { destination, originPath, widgetKey };
}
