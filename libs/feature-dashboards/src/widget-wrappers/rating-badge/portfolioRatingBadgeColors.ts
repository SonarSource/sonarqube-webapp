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

import { cssVar, RatingBadgeRating } from '@sonarsource/echoes-react';

export const PORTFOLIO_RATING_COLOR_STYLES = {
  [RatingBadgeRating.A]: `
    background-color: ${cssVar('ratings-colors-background-rating-a-default')};
    color: ${cssVar('ratings-colors-text-rating-a-default')};
    border: 3px solid ${cssVar('ratings-colors-border-rating-a-default')};
  `,
  [RatingBadgeRating.B]: `
    background-color: ${cssVar('ratings-colors-background-rating-b-default')};
    color: ${cssVar('ratings-colors-text-rating-b-default')};
    border: 3px solid ${cssVar('ratings-colors-border-rating-b-default')};
  `,
  [RatingBadgeRating.C]: `
    background-color: ${cssVar('ratings-colors-background-rating-c-default')};
    color: ${cssVar('ratings-colors-text-rating-c-default')};
    border: 3px solid ${cssVar('ratings-colors-border-rating-c-default')};
  `,
  [RatingBadgeRating.D]: `
    background-color: ${cssVar('ratings-colors-background-rating-d-default')};
    color: ${cssVar('ratings-colors-text-rating-d-default')};
    border: 3px solid ${cssVar('ratings-colors-border-rating-d-default')};
  `,
  [RatingBadgeRating.E]: `
    background-color: ${cssVar('ratings-colors-background-rating-e-default')};
    color: ${cssVar('ratings-colors-text-rating-e-default')};
    border: 3px solid ${cssVar('ratings-colors-border-rating-e-default')};
  `,
  [RatingBadgeRating.Null]: `
    background-color: ${cssVar('color-background-neutral-bolder-default')};
    color: ${cssVar('color-text-default')};
    border: 3px solid ${cssVar('color-border-bold')};
  `,
};

const RATING_BORDER_COLOR = {
  [RatingBadgeRating.A]: cssVar('ratings-colors-border-rating-a-default'),
  [RatingBadgeRating.B]: cssVar('ratings-colors-border-rating-b-default'),
  [RatingBadgeRating.C]: cssVar('ratings-colors-border-rating-c-default'),
  [RatingBadgeRating.D]: cssVar('ratings-colors-border-rating-d-default'),
  [RatingBadgeRating.E]: cssVar('ratings-colors-border-rating-e-default'),
  [RatingBadgeRating.Null]: cssVar('color-border-bold'),
};

export function getPortfolioRatingColor(rating: RatingBadgeRating) {
  return RATING_BORDER_COLOR[rating] ?? cssVar('color-border-bold');
}
