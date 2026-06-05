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

import { byRole, byText } from '~shared/helpers/testSelector';
import {
  QUALITY_PROFILE_SONAR_AGENTIC_AI,
  QUALITY_PROFILE_SONAR_WAY,
} from '~sq-server-commons/helpers/quality-profiles';
import { mockQualityProfile } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { ProfileDescription } from '../ProfileDescription';

const ui = {
  agenticBuiltInDescription: byText(
    `quality_profiles.built_in.agentic.description.${QUALITY_PROFILE_SONAR_AGENTIC_AI}`,
  ),
  agenticBuiltInLearnMoreLink: byText('quality_profiles.built_in.agentic.description.learn_more'),
  builtInDescription: byText('quality_profiles.built_in.description'),
  builtInLearnMoreLink: byText('quality_profiles.built_in.description.learn_more'),
};

describe('ProfileDescription', () => {
  describe('Agentic profile', () => {
    it('should render agentic description', () => {
      const profile = mockQualityProfile({
        name: QUALITY_PROFILE_SONAR_AGENTIC_AI,
        isBuiltIn: true,
      });
      setupRender(profile, false);

      expect(ui.agenticBuiltInDescription.get()).toBeInTheDocument();
    });

    it('should render description and learn more content when showAicaIntro is true', () => {
      const profile = mockQualityProfile({
        name: QUALITY_PROFILE_SONAR_AGENTIC_AI,
        isBuiltIn: true,
      });
      setupRender(profile, true);

      expect(ui.agenticBuiltInDescription.get()).toBeInTheDocument();
      expect(
        byText('quality_profiles.built_in.agentic.description.learn_more').get(),
      ).toBeInTheDocument();
      expect(ui.agenticBuiltInLearnMoreLink.get()).toBeInTheDocument();
    });

    it('should not render learn more content when showAicaIntro is false', () => {
      const profile = mockQualityProfile({
        name: QUALITY_PROFILE_SONAR_AGENTIC_AI,
        isBuiltIn: true,
      });
      setupRender(profile, false);

      expect(ui.agenticBuiltInDescription.get()).toBeInTheDocument();
      expect(
        byText('quality_profiles.built_in.agentic.description.learn_more').query(),
      ).not.toBeInTheDocument();
      expect(ui.agenticBuiltInLearnMoreLink.query()).not.toBeInTheDocument();
    });

    it('should render link with correct doc link when showAicaIntro is true', () => {
      const profile = mockQualityProfile({
        name: QUALITY_PROFILE_SONAR_AGENTIC_AI,
        isBuiltIn: true,
      });
      setupRender(profile, true);

      const link = byRole('link', {
        name: /quality_profiles.built_in.agentic.description.learn_more_link/,
      }).get();
      expect(link).toHaveAttribute('href', expect.stringContaining('ai-code-assurance'));
    });
  });

  describe('Sonar way profile', () => {
    it('should render sonar way description', () => {
      const profile = mockQualityProfile({ name: QUALITY_PROFILE_SONAR_WAY, isBuiltIn: true });
      setupRender(profile, false);

      expect(ui.builtInDescription.get()).toBeInTheDocument();
    });

    it('should render description and learn more content when showAicaIntro is true', () => {
      const profile = mockQualityProfile({ name: QUALITY_PROFILE_SONAR_WAY, isBuiltIn: true });
      setupRender(profile, true);

      expect(ui.builtInDescription.get()).toBeInTheDocument();
      expect(byText('quality_profiles.built_in.description.learn_more').get()).toBeInTheDocument();
      expect(ui.builtInLearnMoreLink.get()).toBeInTheDocument();
    });

    it('should not render learn more content when showAicaIntro is false', () => {
      const profile = mockQualityProfile({ name: QUALITY_PROFILE_SONAR_WAY, isBuiltIn: true });
      setupRender(profile, false);

      expect(ui.builtInDescription.get()).toBeInTheDocument();
      expect(
        byText('quality_profiles.built_in.description.learn_more').query(),
      ).not.toBeInTheDocument();
      expect(ui.builtInLearnMoreLink.query()).not.toBeInTheDocument();
    });

    it('should render link with correct doc link when showAicaIntro is true', () => {
      const profile = mockQualityProfile({ name: QUALITY_PROFILE_SONAR_WAY, isBuiltIn: true });
      setupRender(profile, true);

      const link = byRole('link', {
        name: /quality_profiles.built_in.description.learn_more_link/,
      }).get();
      expect(link).toHaveAttribute('href', expect.stringContaining('ai-code-assurance'));
    });
  });

  describe('Other profiles', () => {
    it('should not render any content for other profiles', () => {
      const profile = mockQualityProfile({ name: 'Custom Profile' });
      setupRender(profile, false);

      expect(ui.builtInDescription.query()).not.toBeInTheDocument();
      expect(ui.agenticBuiltInDescription.query()).not.toBeInTheDocument();
      expect(ui.builtInLearnMoreLink.query()).not.toBeInTheDocument();
      expect(ui.agenticBuiltInLearnMoreLink.query()).not.toBeInTheDocument();
    });

    it('should not render any content for other profiles even when showAicaIntro is true', () => {
      const profile = mockQualityProfile({ name: 'My Profile' });
      setupRender(profile, true);

      expect(ui.builtInDescription.query()).not.toBeInTheDocument();
      expect(ui.agenticBuiltInDescription.query()).not.toBeInTheDocument();
      expect(ui.builtInLearnMoreLink.query()).not.toBeInTheDocument();
      expect(ui.agenticBuiltInLearnMoreLink.query()).not.toBeInTheDocument();
    });
  });
});

function setupRender(profile: ReturnType<typeof mockQualityProfile>, showAicaIntro: boolean) {
  return renderComponent(<ProfileDescription profile={profile} showAicaIntro={showAicaIntro} />);
}
