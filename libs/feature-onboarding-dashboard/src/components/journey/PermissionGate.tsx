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

import { createElement, ElementType, ReactElement, ReactNode } from 'react';
import { PermissionRequiredPopover } from '~adapters/components/onboarding/PermissionRequiredPopover';
import { useCanCreateProjects } from '~adapters/helpers/useCanCreateProjects';

interface Props {
  children?: (trigger: ReactElement) => ReactNode;
  trigger: ReactElement;
}

/**
 * The only props carried over when a trigger is rebuilt for the popover — everything needed to keep
 * it looking the same, and nothing that can act.
 *
 * An allowlist, deliberately: denylisting interactive props by name means any prop a future trigger
 * introduces (`onKeyDown`, `href`, `download`, `type="submit"`) survives the rebuild and still fires
 * while the popover claims the action is blocked. Widen this list only with presentational props.
 */
const PRESENTATIONAL_TRIGGER_PROPS = [
  'ariaLabel',
  'children',
  'className',
  'Icon',
  'prefix',
  'size',
  'suffix',
  'variety',
] as const;

/**
 * Wraps a trigger button with permission-aware behaviour. When the user has "Create projects"
 * permission the children render function receives the trigger and decides how to wrap it (e.g.
 * inside a modal). When the user lacks permission a popover is shown instead, explaining the
 * requirement and linking to the permissions settings page. Omit children when no modal wrapping
 * is needed — the trigger is rendered as-is when the user has permission.
 */
export function PermissionGate({ children, trigger }: Readonly<Props>) {
  const canCreateProjects = useCanCreateProjects();

  if (canCreateProjects) {
    return <>{children?.(trigger) ?? trigger}</>;
  }

  // Rebuild the trigger from the allowlist above, so it keeps its looks and loses everything else.
  const triggerProps = trigger.props as Record<string, unknown>;
  const safeProps = Object.fromEntries(
    PRESENTATIONAL_TRIGGER_PROPS.filter((prop) => prop in triggerProps).map((prop) => [
      prop,
      triggerProps[prop],
    ]),
  );
  const staticTrigger = createElement(trigger.type as ElementType, safeProps);

  return <PermissionRequiredPopover>{staticTrigger}</PermissionRequiredPopover>;
}
