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

/** The three onboarding steps, in order, that the dashboard guides users through. */
export enum JourneyStep {
  Binding = 'BINDING',
  Repositories = 'REPOSITORIES',
  Projects = 'PROJECTS',
}

/** How the left slot of the card is rendered, depending on the step and binding state. */
export enum StepCardVisual {
  AvatarUnbound = 'AVATAR_UNBOUND',
  AvatarDone = 'AVATAR_DONE',
  AvatarLocked = 'AVATAR_LOCKED',
  Number = 'NUMBER',
  Donut = 'DONUT',
}

/**
 * Progressive-disclosure level of the dashboard. Controls which statistics/tables are unlocked:
 * - `Unbound`: nothing bound yet — only the binding step + a locked statistics placeholder.
 * - `BoundNoImport`: bound but no repositories imported — onboarding chart + "unlock more" placeholder.
 * - `Imported`: at least one repository imported — onboarding chart + the all-projects table.
 */
export enum JourneyLevel {
  Unbound = 'UNBOUND',
  BoundNoImport = 'BOUND_NO_IMPORT',
  Imported = 'IMPORTED',
}

/**
 * View model for the onboarding dashboard, derived once from `OnboardingOverview` by
 * {@link deriveJourneyState}. Every field is a primitive ready for rendering, so the presentational
 * components never need to reach back into the raw API shape.
 */
export interface JourneyState {
  /** The step selected by default (first incomplete step). */
  activeStep: JourneyStep;
  /**
   * Best-effort breakdown for the "Analyze your projects" panel. The backend does not expose these
   * exact cohorts yet, so they are approximated from the overview charts — see `deriveJourneyState`.
   */
  analyze: {
    autoscan: number;
    fullCi: number;
    local: number;
    moveToFullCi: number;
    notImported: number;
    notScanned: number;
  };
  /** Number of projects that have been analysed (scanned). */
  analyzed: number;
  /** Analysed projects as a percentage of total projects, 0–100. */
  analyzedPct: number;
  /** Total repositories discovered on the bound DevOps platform(s). */
  discovered: number;
  /** Number of repositories imported into SonarQube. */
  imported: number;
  /** Imported repositories as a percentage of discovered, 0–100. */
  importedPct: number;
  /** Whether the organization is bound to at least one DevOps platform. */
  isBound: boolean;
  /** Progressive-disclosure level controlling which sections are unlocked. */
  level: JourneyLevel;
  /** Repositories discovered but not yet imported. */
  notYetImported: number;
  /** Overall onboarding maturity percentage shown in the header ring, 0–100. */
  overallPct: number;
  /** Total number of projects across the organization. */
  totalProjects: number;
}
