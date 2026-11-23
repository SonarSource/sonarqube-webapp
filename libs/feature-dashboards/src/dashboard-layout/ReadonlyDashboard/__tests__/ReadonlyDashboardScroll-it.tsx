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

import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, useLocation, useNavigate } from 'react-router';
import { renderWithRoutes } from '~shared/helpers/test-utils';
import { DashboardInstance } from '../../logic/types';
import { ChartHorizontalLegend } from '../../../components/visualizations/ChartHorizontalLegend';
import { useWidgetDrilldownNavigation } from '../../shared/WidgetInstanceContext';
import { WidgetMapsProvider } from '../../shared/WidgetMapsContext';
import { ReadonlyDashboard } from '../ReadonlyDashboard';

type Widgets = { count: { label: string } };
const dashboard: DashboardInstance<Widgets> = {
  version: 0,
  children: [
    {
      type: 'implicit',
      children: [
        {
          type: 'count',
          key: 'first',
          position: { x: 0, y: 0 },
          dimensions: { width: 3, height: 3 },
          props: { label: 'First' },
        },
        {
          type: 'count',
          key: 'target',
          position: { x: 0, y: 20 },
          dimensions: { width: 3, height: 3 },
          props: { label: 'Target' },
        },
      ],
    },
  ],
};
const scrollIntoView = jest.fn();
const observeNativeActivation = jest.fn();
const loadDrilldown = jest.fn(async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 80);
  });
  return null;
});

beforeEach(() => {
  jest.clearAllMocks();
  window.history.replaceState(null, '', '/dashboard?id=portfolio');
  HTMLElement.prototype.scrollIntoView = scrollIntoView;
});

function keepNativeActivation(event: React.MouseEvent<HTMLAnchorElement>) {
  observeNativeActivation(event.defaultPrevented);
  event.preventDefault();
}

function CountWidget({ label }: Readonly<{ label: string }>) {
  const navigate = useWidgetDrilldownNavigation();
  if (label === 'First') {
    return <h3>First widget</h3>;
  }
  return (
    <>
      <h3>Widget title</h3>
      <ChartHorizontalLegend
        containerWidth={80}
        items={[
          { color: '#000', label: 'Visible', url: 'breakdown/target?q=security' },
          { color: '#111', label: 'Overflow drilldown', url: 'breakdown/target?q=security' },
          { color: '#222', label: 'Another', url: 'breakdown/target?q=security' },
        ]}
        onLegendMouseLeave={() => undefined}
      />
      <button
        onClick={() => {
          navigate('breakdown/target?q=security');
        }}
        type="button"
      >
        Chart segment
      </button>
      <Link to="breakdown/target?q=security">Open drilldown</Link>
      <Link target="_self" to="breakdown/target?q=security">
        Same tab drilldown
      </Link>
      <Link to="/elsewhere">Other page</Link>
      <a href="https://another.example/dashboard/breakdown/target" onClick={keepNativeActivation}>
        External drilldown
      </a>
      <a
        href="/dashboard/breakdown/target"
        onClick={keepNativeActivation}
        rel="noopener noreferrer"
        target="_blank"
      >
        New tab
      </a>
      <a download href="/dashboard/breakdown/target" onClick={keepNativeActivation}>
        Download
      </a>
    </>
  );
}

function DashboardPage({ enabled }: Readonly<{ enabled: boolean }>) {
  return (
    <WidgetMapsProvider<Widgets>
      bodyMap={{ count: () => null }}
      editBehaviorMap={{
        count: {
          defaultProps: {},
          defaultSize: { width: 3, height: 3 },
          minSize: { width: 1, height: 1 },
          maxSize: { width: 12, height: 12 },
        },
      }}
      headerMap={{ count: CountWidget }}
    >
      <ReadonlyDashboard dashboard={dashboard} restoreDrilldownScroll={enabled} width={12} />
    </WidgetMapsProvider>
  );
}

function Drilldown() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <h1>Drilldown</h1>
      <output>{location.search}</output>
      <Link state={{ preserved: 'updated' }} to="/dashboard?id=other&context=app">
        Change context
      </Link>
      <button
        onClick={() => {
          void navigate(-1);
        }}
        type="button"
      >
        Browser Back
      </button>
      <Link to="/dashboard?id=portfolio#dashboard-widget-target">Back to dashboard</Link>
    </>
  );
}

function LocationState() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output>{JSON.stringify(location.state)}</output>
      <output>{location.search}</output>
      <Link state={{ preserved: 'updated' }} to="/dashboard?id=other&context=app">
        Change context
      </Link>
      <button
        onClick={() => {
          void navigate(-1);
        }}
        type="button"
      >
        Previous page
      </button>
    </>
  );
}

function setup({
  enabled = true,
  entry = '/dashboard?id=portfolio',
  browser = false,
  delayed = false,
} = {}) {
  const target = new URL(entry, window.location.origin);
  window.history.replaceState(null, '', entry);
  return renderWithRoutes(
    <>
      <Route
        element={
          <>
            <DashboardPage enabled={enabled} />
            <LocationState />
          </>
        }
        path="/dashboard"
      />
      <Route
        element={<Drilldown />}
        loader={delayed ? loadDrilldown : undefined}
        path="/dashboard/breakdown/:widget"
      />
      <Route element={<h1>Elsewhere</h1>} path="/elsewhere" />
    </>,
    {
      initialEntries: [
        '/elsewhere',
        {
          pathname: target.pathname,
          search: target.search,
          hash: target.hash,
          state: { preserved: true },
        },
      ],
      routerMode: browser ? 'browser' : 'memory',
    },
  );
}

it.each([false, true])(
  'restores the active widget on browser Back (BrowserRouter=%s)',
  async (browser) => {
    const user = userEvent.setup();
    setup({ browser });
    await user.click(
      await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Drilldown' }, { timeout: 1000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('?q=security')).toBeInTheDocument();
    expect(scrollIntoView).not.toHaveBeenCalled();
    scrollIntoView.mockClear();
    await user.click(screen.getByRole('button', { name: 'Browser Back' }));
    expect(
      await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }),
    ).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'center' });
    expect((scrollIntoView.mock.contexts[0] as HTMLElement).dataset.widgetKey).toBe('target');
  },
);

it('preserves origin state and query while adding no extra Back entry', async () => {
  const user = userEvent.setup();
  setup();
  await user.click(await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }));
  await user.click(await screen.findByRole('button', { name: 'Browser Back' }, { timeout: 1000 }));
  expect(await screen.findByText('{"preserved":true}', {}, { timeout: 1000 })).toBeInTheDocument();
  expect(screen.getByText('?id=portfolio')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Open drilldown' })).toHaveAttribute(
    'href',
    '/dashboard/breakdown/target?q=security',
  );
  await user.click(screen.getByRole('button', { name: 'Previous page' }));
  expect(
    await screen.findByRole('heading', { name: 'Elsewhere' }, { timeout: 1000 }),
  ).toBeInTheDocument();
});

it('restores the widget when the in-app return link creates a new entry', async () => {
  const user = userEvent.setup();
  setup();
  await user.click(await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }));
  scrollIntoView.mockClear();
  await user.click(
    await screen.findByRole('link', { name: 'Back to dashboard' }, { timeout: 1000 }),
  );
  expect(
    await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(scrollIntoView).toHaveBeenCalledTimes(1);
  expect((scrollIntoView.mock.contexts[0] as HTMLElement).dataset.widgetKey).toBe('target');
});

it('leaves Cloud and other default callers inactive', async () => {
  const user = userEvent.setup();
  setup({ enabled: false });
  await user.click(await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }));
  await user.click(await screen.findByRole('button', { name: 'Browser Back' }, { timeout: 1000 }));
  expect(
    await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(scrollIntoView).not.toHaveBeenCalled();
});

it.each([
  { ctrlKey: true },
  { metaKey: true },
  { shiftKey: true },
  { altKey: true },
  { button: 1 },
])('preserves modified activation %j', async (modifiers) => {
  setup();
  const link = await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 });
  const preventNavigation = (event: Event) => {
    event.preventDefault();
  };
  link.addEventListener('click', preventNavigation);
  fireEvent.click(link, modifiers);
  await userEvent.setup().tab();
  expect(screen.getByRole('link', { name: 'Open drilldown' })).toBeInTheDocument();
  expect(scrollIntoView).not.toHaveBeenCalled();
});

it('ignores ordinary links that are not widget drilldowns', async () => {
  const user = userEvent.setup();
  setup();
  await user.click(await screen.findByRole('link', { name: 'Other page' }, { timeout: 1000 }));
  expect(
    await screen.findByRole('heading', { name: 'Elsewhere' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(scrollIntoView).not.toHaveBeenCalled();
});

it('supports keyboard activation and restores only once on return', async () => {
  const user = userEvent.setup();
  setup();
  const link = await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 });
  link.focus();
  await user.keyboard('{Enter}');
  expect(
    await screen.findByRole('heading', { name: 'Drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  scrollIntoView.mockClear();
  await user.click(screen.getByRole('button', { name: 'Browser Back' }));
  expect(
    await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(scrollIntoView).toHaveBeenCalledTimes(1);
  expect((scrollIntoView.mock.contexts[0] as HTMLElement).dataset.widgetKey).toBe('target');
});

it('ignores a missing widget fragment', async () => {
  setup({ entry: '/dashboard?id=portfolio#dashboard-widget-deleted' });
  expect(
    await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(scrollIntoView).not.toHaveBeenCalled();
});

it('restores from an accepted trailing-slash dashboard URL', async () => {
  const user = userEvent.setup();
  setup({ entry: '/dashboard/?id=portfolio' });
  await user.click(await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }));
  expect(
    await screen.findByRole('heading', { name: 'Drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  scrollIntoView.mockClear();
  await user.click(screen.getByRole('button', { name: 'Browser Back' }));
  expect(
    await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'center' });
  expect((scrollIntoView.mock.contexts[0] as HTMLElement).dataset.widgetKey).toBe('target');
});

it('allows clicking widget text without attempting navigation', async () => {
  const user = userEvent.setup();
  setup();
  await user.click(screen.getByRole('heading', { name: 'Widget title' }));
  expect(screen.getByRole('link', { name: 'Open drilldown' })).toBeInTheDocument();
  expect(scrollIntoView).not.toHaveBeenCalled();
});

it('starts a slow drilldown only once on double activation', async () => {
  const user = userEvent.setup();
  setup({ delayed: true });
  await user.dblClick(screen.getByRole('link', { name: 'Open drilldown' }));
  expect(
    await screen.findByRole('heading', { name: 'Drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(loadDrilldown).toHaveBeenCalledTimes(1);
});

it.each(['External drilldown', 'New tab', 'Download'])(
  'preserves native %s link behavior',
  async (name) => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('link', { name }));
    expect(observeNativeActivation).toHaveBeenCalledWith(false);
    expect(screen.getByRole('link', { name: 'Open drilldown' })).toBeInTheDocument();
  },
);

it('restores explicitly same-tab drilldown links', async () => {
  const user = userEvent.setup();
  setup();
  await user.click(screen.getByRole('link', { name: 'Same tab drilldown' }));
  expect(
    await screen.findByRole('heading', { name: 'Drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  scrollIntoView.mockClear();
  await user.click(screen.getByRole('button', { name: 'Browser Back' }));
  expect(
    await screen.findByRole('link', { name: 'Open drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(scrollIntoView).toHaveBeenCalledTimes(1);
  expect((scrollIntoView.mock.contexts[0] as HTMLElement).dataset.widgetKey).toBe('target');
});

it.each([false, true])(
  'restores a programmatic chart drilldown (BrowserRouter=%s)',
  async (browser) => {
    const user = userEvent.setup();
    setup({ browser });
    await user.click(screen.getByRole('button', { name: 'Chart segment' }));
    expect(
      await screen.findByRole('heading', { name: 'Drilldown' }, { timeout: 1000 }),
    ).toBeInTheDocument();
    expect(scrollIntoView).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Browser Back' }));
    expect(
      await screen.findByRole('button', { name: 'Chart segment' }, { timeout: 1000 }),
    ).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'center' });
    expect((scrollIntoView.mock.contexts[0] as HTMLElement).dataset.widgetKey).toBe('target');
  },
);

it('restores widget navigation from a portaled overflow legend link', async () => {
  const user = userEvent.setup();
  setup();
  await user.click(screen.getByTestId('chart-horizontal-legend-more'));
  await user.click(
    await screen.findByRole('link', { name: 'Overflow drilldown' }, { timeout: 1000 }),
  );
  expect(
    await screen.findByRole('heading', { name: 'Drilldown' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(scrollIntoView).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Browser Back' }));
  expect(
    await screen.findByRole('button', { name: 'Chart segment' }, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'center' });
  expect((scrollIntoView.mock.contexts[0] as HTMLElement).dataset.widgetKey).toBe('target');
});

it.each([
  { role: 'link' as const, name: 'Open drilldown' },
  { role: 'button' as const, name: 'Chart segment' },
])('preserves changed context with $name', async ({ role, name }) => {
  const user = userEvent.setup();
  setup();
  await user.click(screen.getByRole('link', { name: 'Change context' }));
  expect(
    await screen.findByText('?id=other&context=app', {}, { timeout: 1000 }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole(role, { name }));
  await user.click(await screen.findByRole('button', { name: 'Browser Back' }, { timeout: 1000 }));
  expect(
    await screen.findByText('?id=other&context=app', {}, { timeout: 1000 }),
  ).toBeInTheDocument();
  expect(screen.getByText('{"preserved":"updated"}')).toBeInTheDocument();
});
