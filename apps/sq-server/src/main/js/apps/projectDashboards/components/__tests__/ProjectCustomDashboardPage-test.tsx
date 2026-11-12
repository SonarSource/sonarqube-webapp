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

import { act, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Link, Route, useParams } from 'react-router';
import { EmptyDashboard } from '~feature-dashboards/dashboard-layout/EmptyDashboard';
import { useNativeBrowserNavigationBlocker } from '~feature-dashboards/hooks/useNativeBrowserNavigationBlocker';
import { DashboardMode, DashboardType } from '~feature-dashboards/types/dashboard-list';
import { renderWithRouter, renderWithRoutes } from '~shared/helpers/test-utils';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { EditionKey } from '~sq-server-commons/types/editions';
import { Permissions } from '~sq-server-commons/types/permissions';
import { getProjectCustomDashboardRoute } from '../../routes';
import { ProjectCustomDashboardPage } from '../ProjectCustomDashboardPage';

const mockUpdate = jest.fn<undefined, [unknown, { onSuccess: () => void; onError: () => void }]>();
const mockDelete = jest.fn();
const mockDuplicate = jest.fn<
  undefined,
  [unknown, { onSuccess: (dashboard: { id: string; name: string }) => void; onError: () => void }]
>();
const mockRetry = jest.fn();
const mockResetTargetSection = jest.fn();
const mockUseUsersByIdsQuery = jest.fn<
  { data: Record<string, { avatar: string; name: string }>; isPending: boolean },
  [string[]]
>();
const mockDownloadDashboardSchema = jest.fn<undefined, [unknown]>();
let mockCurrentUser: { isLoggedIn: boolean; permissions: { global: Permissions[] } };
let mockDashboardId = '77acc15a-1742-42ff-9469-7e4de1faa19f';
let mockQuery: { data?: unknown; error?: unknown; isPending: boolean; refetch: () => void };

jest.mock('react-router', () => ({
  ...jest.requireActual<typeof import('react-router')>('react-router'),
  useParams: jest.fn(() => ({ dashboardId: mockDashboardId })),
}));

jest.mock('~sq-server-commons/context/componentContext/withComponentContext', () => ({
  useComponent: () => ({ component: { key: 'project-key' } }),
}));
jest.mock('~sq-server-commons/sq-server-adapters/helpers/useProjectId', () => ({
  useProjectId: () => 'project-id',
}));
jest.mock('~sq-server-commons/sq-server-adapters/helpers/users', () => ({
  useCurrentUser: () => ({
    currentUser: mockCurrentUser,
    isLoggedIn: mockCurrentUser.isLoggedIn,
  }),
}));
jest.mock('~sq-server-commons/queries/users', () => ({
  useUsersByIdsQuery: (ids: string[]) => mockUseUsersByIdsQuery(ids),
}));
jest.mock('~feature-dashboards/helpers/downloadDashboardSchema', () => ({
  downloadDashboardSchema: (dashboard: unknown) => {
    mockDownloadDashboardSchema(dashboard);
  },
}));

jest.mock('../../../../queries/project-dashboards', () => ({
  useCreateProjectDashboardDuplicateMutation: () => ({
    isPending: false,
    mutate: mockDuplicate,
  }),
  useDeleteProjectDashboardMutation: () => ({ isPending: false, mutate: mockDelete }),
  useGetProjectDashboardQuery: () => mockQuery,
  useUpdateProjectDashboardMutation: () => ({ isPending: false, mutate: mockUpdate }),
}));

jest.mock('~feature-dashboards/dashboard-layout/DashboardCustomDashboardViews', () => {
  const mockDashboardCustomDashboardState = {
    Error: 'error',
    InvalidLayout: 'invalid-layout',
    Loading: 'loading',
    NotFound: 'not-found',
    Ready: 'ready',
    UnsupportedVersion: 'unsupported-version',
  } as const;

  return {
    DashboardCustomDashboardGenericError: ({ onRetry }: { onRetry: () => void }) => (
      <button onClick={onRetry} type="button">
        generic-error
      </button>
    ),
    DashboardCustomDashboardInvalidLayout: () => <div>invalid-layout</div>,
    DashboardCustomDashboardLoading: () => <div>loading-dashboard</div>,
    DashboardCustomDashboardNotFound: () => <div>dashboard-not-found</div>,
    DashboardCustomDashboardUnsupportedVersion: () => <div>unsupported-version</div>,
    DashboardCustomDashboardState: mockDashboardCustomDashboardState,
    getDashboardCustomDashboardState: ({
      error,
      isLoading,
      dashboard,
    }: {
      error?: unknown;
      isLoading: boolean;
      dashboard?: unknown;
    }) => {
      if (isLoading) {
        return mockDashboardCustomDashboardState.Loading;
      }
      if (error === 'not-found') {
        return mockDashboardCustomDashboardState.NotFound;
      }
      if (error === 'invalid-layout') {
        return mockDashboardCustomDashboardState.InvalidLayout;
      }
      if (error === 'unsupported-version') {
        return mockDashboardCustomDashboardState.UnsupportedVersion;
      }
      if (error || !dashboard) {
        return mockDashboardCustomDashboardState.Error;
      }
      return mockDashboardCustomDashboardState.Ready;
    },
  };
});

jest.mock('~feature-dashboards/hooks/useAddWidget', () => ({
  useAddWidget: () => ({
    handleAddWidget: jest.fn(),
    handleAddWidgetToSection: jest.fn(),
    handleResetTargetSection: mockResetTargetSection,
  }),
}));
jest.mock('~feature-dashboards/widget-creation-modal/hooks/useEditWidget', () => ({
  useEditWidget: () => ({
    handleOpenEditWidget: jest.fn(),
    handleSaveEditWidget: jest.fn(),
    initialWidgetProps: undefined,
  }),
}));
jest.mock('~feature-dashboards/hooks/useNativeBrowserNavigationBlocker', () => ({
  useNativeBrowserNavigationBlocker: jest.fn(),
}));

jest.mock('~feature-dashboards/dashboard-layout/DashboardCustomDashboardContent', () => ({
  DashboardCustomDashboardContent: ({
    canEdit,
    isEditing,
    onAddWidgetToSection,
    onWidgetEdit,
    setIsEditing,
  }: {
    canEdit: boolean;
    isEditing: boolean;
    onAddWidgetToSection: (index: number) => void;
    onWidgetEdit: (index: number, widget: never) => void;
    setIsEditing: (editing: boolean) => void;
  }) => (
    <div data-testid="dashboard-content">
      editing:{String(isEditing)}
      <EmptyDashboard
        canEdit={canEdit}
        editDescriptionDocUrl="https://example.com/edit"
        editModeButtonLabelKey="project_dashboard.empty.button.enter_edit_mode"
        isEditing={isEditing}
        nonEditDescriptionDocUrl="https://example.com/view"
        setIsEditing={setIsEditing}
      />
      <button
        onClick={() => {
          onAddWidgetToSection(0);
        }}
        type="button"
      >
        add-widget-section
      </button>
      <button
        onClick={() => {
          onWidgetEdit(0, {} as never);
        }}
        type="button"
      >
        edit-widget-section
      </button>
    </div>
  ),
}));
jest.mock('~feature-dashboards/dashboard-layout/EditToolbar', () => ({
  EditToolbar: ({
    onSaveChanges,
    onExitEdit,
    onSetIsAddWidgetModalOpen,
    onSetIsCreateSectionModalOpen,
  }: {
    onSaveChanges: () => void;
    onExitEdit: () => void;
    onSetIsAddWidgetModalOpen: (open: boolean) => void;
    onSetIsCreateSectionModalOpen: (open: boolean) => void;
  }) => (
    <div>
      <button onClick={onSaveChanges} type="button">
        save-changes
      </button>
      <button onClick={onExitEdit} type="button">
        exit-edit
      </button>
      <button
        onClick={() => {
          onSetIsAddWidgetModalOpen(true);
        }}
        type="button"
      >
        add-widget-toolbar
      </button>
      <button
        onClick={() => {
          onSetIsCreateSectionModalOpen(true);
        }}
        type="button"
      >
        create-section
      </button>
    </div>
  ),
}));
jest.mock('~feature-dashboards/dashboard-layout/modals/CreateSectionModal', () => ({
  CreateSectionModal: ({
    isOpen,
    onConfirm,
  }: {
    isOpen: boolean;
    onConfirm: (name: string, description: string) => void;
  }) =>
    isOpen ? (
      <button
        onClick={() => {
          onConfirm('New section', 'Description');
        }}
        type="button"
      >
        confirm-section
      </button>
    ) : null,
}));
jest.mock(
  '~feature-dashboards/widget-creation-modal/components/DashboardCustomDashboardWidgetModal',
  () => ({
    DashboardCustomDashboardWidgetModal: ({
      isAddWidgetModalOpen,
      isEditWidgetModalOpen,
      metricPickerOptions,
      onOpenChange,
      onSaveWidget,
      renderOptions,
    }: {
      isAddWidgetModalOpen: boolean;
      isEditWidgetModalOpen: boolean;
      metricPickerOptions: never;
      onOpenChange: (open: boolean) => void;
      onSaveWidget: (widget: never) => void;
      renderOptions: (args: never) => ReactNode;
    }) =>
      isAddWidgetModalOpen || isEditWidgetModalOpen ? (
        <div>
          <button
            onClick={() => {
              onOpenChange(false);
            }}
            type="button"
          >
            close-widget
          </button>
          <button
            onClick={() => {
              onSaveWidget({} as never);
            }}
            type="button"
          >
            save-widget
          </button>
          {renderOptions({
            dispatch: jest.fn(),
            isEditMode: isEditWidgetModalOpen,
            metricPickerOptions,
            state: {} as never,
          } as never)}
        </div>
      ) : null,
  }),
);
jest.mock('../ProjectDashboardModal', () => ({
  ProjectDashboardModal: ({
    isOpen,
    onClose,
    onSave,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dashboard: never) => void;
  }) =>
    isOpen ? (
      <div>
        <button
          onClick={() => {
            onSave({ id: 'dashboard-id', name: 'Renamed', description: '' } as never);
          }}
          type="button"
        >
          save-metadata
        </button>
        <button onClick={onClose} type="button">
          close-metadata
        </button>
      </div>
    ) : null,
}));
jest.mock('../ProjectWidgetOptions', () => ({ ProjectWidgetOptions: () => null }));
jest.mock('~feature-dashboards/dashboard-list/DashboardKebabMenu', () => ({
  DashboardKebabMenu: ({ items, isVisible }: { items: ReactNode; isVisible: boolean }) =>
    isVisible ? <div>{items}</div> : null,
  DashboardKebabMenuItems: ({
    onDelete,
    onDownloadSchema,
    onDuplicate,
    onEditDashboard,
    onEditNameDescription,
  }: {
    onDelete: (controls: { close: () => void }) => void;
    onDownloadSchema?: () => void;
    onDuplicate?: () => void;
    onEditDashboard?: () => void;
    onEditNameDescription: () => void;
  }) => (
    <div>
      {onDownloadSchema && (
        <button onClick={onDownloadSchema} type="button">
          download-schema
        </button>
      )}
      {onEditDashboard && (
        <button onClick={onEditDashboard} type="button">
          edit-dashboard-action
        </button>
      )}
      {onDuplicate && (
        <button onClick={onDuplicate} type="button">
          duplicate-dashboard
        </button>
      )}
      <button onClick={onEditNameDescription} type="button">
        edit-metadata
      </button>
      <button
        onClick={() => {
          onDelete({ close: jest.fn() });
        }}
        type="button"
      >
        delete-dashboard
      </button>
    </div>
  ),
}));
jest.mock('~feature-dashboards/dashboard-description/DashboardDescriptionAccordion', () => ({
  DashboardDescriptionAccordion: () => null,
}));
jest.mock('~feature-dashboards/dashboard-list/DashboardTypeBadge', () => ({
  DashboardTypeBadge: () => null,
}));
jest.mock('~shared/components/a11y/A11ySkipTarget', () => () => null);
jest.mock('~shared/components/intl/DateFromNow', () => ({
  __esModule: true,
  default: ({ children }: { children: (date: string) => ReactNode }) => <>{children('today')}</>,
}));
jest.mock(
  '~shared/components/NotFound',
  () =>
    function MockNotFound() {
      return <div>not-found</div>;
    },
);
jest.mock('~shared/components/pages/ProjectPageTemplate', () => ({
  ProjectPageTemplate: ({
    actions,
    children,
    description,
    title,
  }: {
    actions?: ReactNode;
    children: ReactNode;
    description?: ReactNode;
    title: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      {description}
      {actions}
      {children}
    </div>
  ),
}));

const dashboard = {
  description: 'description',
  id: 'dashboard-id',
  layout: { children: [{ children: [], type: 'implicit' as const }] },
  name: 'Custom project dashboard',
  type: DashboardType.Custom,
  updatedAt: 1,
  updatedById: 'editor-id',
};

function setupQuery(overrides: Partial<typeof mockQuery> = {}) {
  mockQuery = { data: dashboard, isPending: false, refetch: mockRetry, ...overrides };
}

function renderProjectCustomDashboardPage(edition = EditionKey.enterprise) {
  return renderWithRouter(<ProjectCustomDashboardPage />, {
    appState: mockAppState({ edition }),
  });
}

describe('ProjectCustomDashboardPage', () => {
  beforeEach(() => {
    mockCurrentUser = {
      isLoggedIn: true,
      permissions: { global: [Permissions.Admin] },
    };
    mockDashboardId = '77acc15a-1742-42ff-9469-7e4de1faa19f';
    setupQuery();
    jest.clearAllMocks();
    jest.mocked(useNativeBrowserNavigationBlocker).mockImplementation(() => (action) => {
      action();
    });
    jest.mocked(useParams).mockImplementation(() => ({ dashboardId: mockDashboardId }));
    mockUseUsersByIdsQuery.mockReturnValue({
      data: { 'editor-id': { avatar: 'avatar', name: 'Alice' } },
      isPending: false,
    });
  });

  it('renders the loading, not-found, invalid, and generic error states', async () => {
    setupQuery({ data: undefined, isPending: true });
    const { rerender } = renderProjectCustomDashboardPage();
    expect(screen.getByText('loading-dashboard')).toBeInTheDocument();

    setupQuery({ data: undefined, error: 'not-found', isPending: false });
    rerender(<ProjectCustomDashboardPage />);
    expect(screen.getByText('dashboard-not-found')).toBeInTheDocument();

    setupQuery({ data: undefined, error: 'invalid-layout', isPending: false });
    rerender(<ProjectCustomDashboardPage />);
    expect(screen.getByText('invalid-layout')).toBeInTheDocument();

    setupQuery({ data: undefined, error: 'unsupported-version', isPending: false });
    rerender(<ProjectCustomDashboardPage />);
    expect(screen.getByText('unsupported-version')).toBeInTheDocument();

    setupQuery({ data: undefined, error: new Error('failed'), isPending: false });
    rerender(<ProjectCustomDashboardPage />);
    await screen.findByRole('button', { name: 'generic-error' });
  });

  it('renders a dashboard and can enter and save edit mode', async () => {
    const { user } = renderProjectCustomDashboardPage();

    expect(screen.getByText('Custom project dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-content')).toHaveTextContent('editing:false');
    const editStatus = screen.getByText(/project_dashboard.last_edited_by/, { selector: 'span' });
    expect(editStatus).toHaveTextContent('project_dashboard.last_edited_by');
    expect(editStatus).toHaveTextContent('Alice');
    expect(mockUseUsersByIdsQuery).toHaveBeenCalledWith(['editor-id']);
    expect(screen.queryByRole('button', { name: 'edit-dashboard-action' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'dashboard.edit_dashboard' }));
    expect(screen.getByTestId('dashboard-content')).toHaveTextContent('editing:true');

    await user.click(screen.getByRole('button', { name: 'save-changes' }));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ dashboardId: 'dashboard-id', projectId: 'project-id' }),
      expect.any(Object),
    );
  });

  it('allows only system administrators to download the dashboard schema', async () => {
    const { rerender, user } = renderProjectCustomDashboardPage();

    await user.click(screen.getByRole('button', { name: 'download-schema' }));
    expect(mockDownloadDashboardSchema).toHaveBeenCalledWith(dashboard);

    mockCurrentUser = { isLoggedIn: true, permissions: { global: [] } };
    rerender(<ProjectCustomDashboardPage />);

    expect(screen.queryByRole('button', { name: 'download-schema' })).not.toBeInTheDocument();
  });

  it('waits for dashboard data before opening the requested editor', async () => {
    setupQuery({ data: undefined, isPending: true });
    const { rerender, unmount } = renderWithRoutes(
      <Route element={<ProjectCustomDashboardPage />} path="/" />,
      {
        initialEntries: ['/?id=project-key&filter=active&mode=edit'],
        routerMode: 'browser',
      },
    );
    expect(screen.getByText('loading-dashboard')).toBeInTheDocument();
    setupQuery();
    rerender(<Route element={<ProjectCustomDashboardPage />} path="/" />);
    expect(await screen.findByRole('button', { name: 'exit-edit' })).toBeInTheDocument();
    expect(window.location.search).toBe('?id=project-key&filter=active&mode=edit');
    const reloadUrl = window.location.pathname + window.location.search;
    unmount();
    renderWithRouter(<ProjectCustomDashboardPage />, {
      initialEntries: [reloadUrl],
      routerMode: 'browser',
    });
    expect(await screen.findByRole('button', { name: 'exit-edit' })).toBeInTheDocument();
  });

  it('does not enable URL-requested editing for anonymous users', () => {
    mockCurrentUser.isLoggedIn = false;
    renderWithRouter(<ProjectCustomDashboardPage />, {
      initialEntries: ['/?id=project-key&mode=edit'],
    });
    expect(screen.queryByRole('button', { name: 'exit-edit' })).not.toBeInTheDocument();
  });

  it.each(['dashboard.edit_dashboard', 'project_dashboard.empty.button.enter_edit_mode'])(
    'synchronizes URL state when editing is entered via %s',
    async (buttonName) => {
      const { user } = renderWithRouter(<ProjectCustomDashboardPage />, {
        initialEntries: ['/?id=project-key&filter=active'],
        routerMode: 'browser',
      });
      const historyLength = window.history.length;
      await user.click(screen.getByRole('button', { name: buttonName }));
      expect(await screen.findByRole('button', { name: 'exit-edit' })).toBeInTheDocument();
      expect(window.location.search).toBe('?id=project-key&filter=active&mode=edit');
      await user.click(screen.getByRole('button', { name: 'exit-edit' }));
      expect(
        await screen.findByRole('button', { name: 'dashboard.edit_dashboard' }),
      ).toBeInTheDocument();
      expect(window.location.search).toBe('?id=project-key&filter=active');
      expect(window.history).toHaveLength(historyLength);
    },
  );

  it('removes only edit mode after successfully saving a new dashboard', async () => {
    mockUpdate.mockImplementationOnce((_data, { onSuccess }) => {
      onSuccess();
    });
    const { user } = renderWithRouter(<ProjectCustomDashboardPage />, {
      initialEntries: ['/?id=project-key&filter=active&mode=edit'],
      routerMode: 'browser',
    });
    await user.click(await screen.findByRole('button', { name: 'save-changes' }));
    expect(
      await screen.findByRole('button', { name: 'dashboard.edit_dashboard' }),
    ).toBeInTheDocument();
    expect(window.location.search).toBe('?id=project-key&filter=active');
  });

  it.each(['save-changes', 'exit-edit'])(
    'returns to the source after dirty %s and Back with the real blocker',
    async (buttonName) => {
      jest
        .mocked(useNativeBrowserNavigationBlocker)
        .mockImplementation(
          jest.requireActual<
            typeof import('~feature-dashboards/hooks/useNativeBrowserNavigationBlocker')
          >('~feature-dashboards/hooks/useNativeBrowserNavigationBlocker')
            .useNativeBrowserNavigationBlocker,
        );
      jest
        .mocked(useParams)
        .mockImplementation(
          jest.requireActual<typeof import('react-router')>('react-router').useParams,
        );
      mockUpdate.mockImplementationOnce((_input, { onSuccess }) => {
        onSuccess();
      });
      const editorUrl = `/project/dashboards/${mockDashboardId}?id=project-key&filter=active&mode=edit`;
      const { user } = renderWithRoutes(
        <>
          <Route element={<Link to={editorUrl}>Open editor</Link>} path="/source" />
          <Route element={<ProjectCustomDashboardPage />} path="/project/dashboards/:dashboardId" />
        </>,
        { initialEntries: ['/source'], routerMode: 'browser' },
      );
      await user.click(screen.getByRole('link', { name: 'Open editor' }));
      await user.click(await screen.findByRole('button', { name: 'create-section' }));
      await user.click(screen.getByRole('button', { name: 'confirm-section' }));
      expect(window.history.state).toHaveProperty('navigationBlocked', true);
      await user.click(screen.getByRole('button', { name: buttonName }));
      expect(
        await screen.findByRole('button', { name: 'dashboard.edit_dashboard' }),
      ).toBeInTheDocument();
      expect(window.location.search).toBe('?id=project-key&filter=active');
      expect(window.history.state).not.toHaveProperty('navigationBlocked');
      act(() => {
        window.history.back();
      });
      expect(await screen.findByRole('link', { name: 'Open editor' })).toBeInTheDocument();
      expect(window.location.pathname).toBe('/source');
    },
  );

  it('returns to the original dashboard in view mode after duplicating and navigating Back', async () => {
    jest
      .mocked(useParams)
      .mockImplementation(
        jest.requireActual<typeof import('react-router')>('react-router').useParams,
      );
    const sourceUrl = `/project/dashboards/${mockDashboardId}?id=project-key`;
    const { user } = renderWithRoutes(
      <Route element={<ProjectCustomDashboardPage />} path="/project/dashboards/:dashboardId" />,
      { initialEntries: [sourceUrl], routerMode: 'browser' },
    );
    await user.click(screen.getByRole('button', { name: 'duplicate-dashboard' }));
    await user.click(screen.getByRole('button', { name: 'save-metadata' }));
    act(() => {
      mockDuplicate.mock.calls[0][1].onSuccess({
        id: '88acc15a-1742-42ff-9469-7e4de1faa19f',
        name: 'Copied dashboard',
      });
    });
    expect(await screen.findByRole('button', { name: 'exit-edit' })).toBeInTheDocument();
    expect(window.location.pathname).toBe(
      '/project/dashboards/88acc15a-1742-42ff-9469-7e4de1faa19f',
    );
    await act(async () => {
      const popped = new Promise<void>((resolve) => {
        window.addEventListener(
          'popstate',
          () => {
            resolve();
          },
          { once: true },
        );
      });
      window.history.back();
      await popped;
    });
    expect(
      await screen.findByRole('button', { name: 'dashboard.edit_dashboard' }),
    ).toBeInTheDocument();
    expect(window.location.pathname + window.location.search).toBe(sourceUrl);
  });

  it('duplicates the dashboard from the menu', async () => {
    const { user } = renderProjectCustomDashboardPage();

    await user.click(screen.getByRole('button', { name: 'duplicate-dashboard' }));
    await user.click(screen.getByRole('button', { name: 'close-metadata' }));
    expect(screen.queryByRole('button', { name: 'save-metadata' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'duplicate-dashboard' }));
    await user.click(screen.getByRole('button', { name: 'save-metadata' }));

    expect(mockDuplicate).toHaveBeenCalledWith(
      {
        description: '',
        duplicateSource: dashboard,
        name: 'Renamed',
        projectId: 'project-id',
      },
      expect.any(Object),
    );

    act(() => {
      mockDuplicate.mock.calls[0][1].onSuccess({ id: 'new-id', name: 'Renamed' });
    });

    expect(
      await screen.findByText(
        getProjectCustomDashboardRoute('new-id', 'project-key', { mode: DashboardMode.Edit }),
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'save-metadata' })).not.toBeInTheDocument();
  });

  it('renders not found for an invalid dashboard id', () => {
    mockDashboardId = 'invalid-id';

    renderProjectCustomDashboardPage();

    expect(screen.getByText('not-found')).toBeInTheDocument();
  });

  it('handles dashboard editing, section creation, widget actions, and metadata editing', async () => {
    const { user } = renderProjectCustomDashboardPage();

    await user.click(screen.getByRole('button', { name: 'edit-metadata' }));
    await user.click(screen.getByRole('button', { name: 'save-metadata' }));

    await user.click(screen.getByRole('button', { name: 'dashboard.edit_dashboard' }));
    await user.click(screen.getByRole('button', { name: 'create-section' }));
    await user.click(screen.getByRole('button', { name: 'confirm-section' }));
    await user.click(screen.getByRole('button', { name: 'add-widget-toolbar' }));
    await user.click(screen.getByRole('button', { name: 'save-widget' }));
    await user.click(screen.getByRole('button', { name: 'add-widget-section' }));
    await user.click(screen.getByRole('button', { name: 'close-widget' }));
    expect(mockResetTargetSection).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'edit-widget-section' }));
    await user.click(screen.getByRole('button', { name: 'save-widget' }));
    await user.click(screen.getByRole('button', { name: 'exit-edit' }));

    await user.click(screen.getByRole('button', { name: 'delete-dashboard' }));
    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ dashboardId: 'dashboard-id', projectId: 'project-id' }),
      expect.any(Object),
    );
  });

  it('does not expose authoring controls to logged-out users', () => {
    mockCurrentUser = { isLoggedIn: false, permissions: { global: [] } };
    renderProjectCustomDashboardPage();

    expect(screen.getByText('Custom project dashboard')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'dashboard.edit_dashboard' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'edit-metadata' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'delete-dashboard' })).not.toBeInTheDocument();
  });
});
