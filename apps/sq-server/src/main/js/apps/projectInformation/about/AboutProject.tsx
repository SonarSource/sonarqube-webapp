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

import { Heading } from '@sonarsource/echoes-react';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ComponentQualifier, Visibility } from '~shared/types/component';
import { Measure } from '~shared/types/measures';
import { getProjectLinks } from '~sq-server-commons/api/projectLinks';
import { useLanguagesWithRules } from '~sq-server-commons/context/languages/withLanguages';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Component, ProjectLink } from '~sq-server-commons/types/types';
import AiCodeStatus from './AiCodeStatus';
import MetaDescription from './components/MetaDescription';
import MetaKey from './components/MetaKey';
import MetaLinks from './components/MetaLinks';
import MetaQualityGate from './components/MetaQualityGate';
import MetaQualityProfiles from './components/MetaQualityProfiles';
import MetaSize from './components/MetaSize';
import MetaTags from './components/MetaTags';
import MetaVisibility from './components/MetaVisibility';
import { ProjectInformationSection } from './ProjectInformationSection';

export interface AboutProjectProps {
  component: Component;
  measures?: Measure[];
  onComponentChange: (changes: {}) => void;
}

export default function AboutProject(props: Readonly<AboutProjectProps>) {
  const { component, measures = [] } = props;
  const languagesWithRules = useLanguagesWithRules();
  const isApp = component.qualifier === ComponentQualifier.Application;
  const [links, setLinks] = useState<ProjectLink[] | undefined>(undefined);

  const filteredQualityProfiles =
    component.qualityProfiles?.filter((profile) => languagesWithRules[profile.language]) ?? [];

  useEffect(() => {
    if (!isApp) {
      getProjectLinks(component.key).then(
        (links) => {
          setLinks(links);
        },
        () => {},
      );
    }
  }, [component.key, isApp]);

  return (
    <>
      <Heading as="h2" className="sw-mb-4">
        {translate(isApp ? 'application' : 'project', 'about.title')}
      </Heading>

      {!isApp && (component.qualityGate || filteredQualityProfiles.length > 0) && (
        <ProjectInformationSection className="sw-pt-0 sw-flex sw-flex-col sw-gap-4">
          {component.qualityGate && <MetaQualityGate qualityGate={component.qualityGate} />}

          {filteredQualityProfiles.length > 0 && (
            <MetaQualityProfiles profiles={filteredQualityProfiles} />
          )}
        </ProjectInformationSection>
      )}

      <AiCodeStatus component={component} />

      {component.isAiCodeFixEnabled === true && (
        <ProjectInformationSection>
          <Heading as="h3" className="sw-mb-2">
            {translate('project.info.ai_code_fix.title')}
          </Heading>
          <FormattedMessage id="project.info.ai_code_fix.message" />
        </ProjectInformationSection>
      )}

      <ProjectInformationSection>
        <MetaKey componentKey={component.key} qualifier={component.qualifier} />
      </ProjectInformationSection>

      <ProjectInformationSection>
        <MetaVisibility
          qualifier={component.qualifier}
          visibility={component.visibility ?? Visibility.Public}
        />
      </ProjectInformationSection>

      <ProjectInformationSection>
        <MetaDescription description={component.description} isApp={isApp} />
      </ProjectInformationSection>

      <ProjectInformationSection>
        <MetaTags component={component} onComponentChange={props.onComponentChange} />
      </ProjectInformationSection>

      <ProjectInformationSection last={isApp || !links?.length}>
        <MetaSize component={component} measures={measures} />
      </ProjectInformationSection>

      {!isApp && links && links.length > 0 && (
        <ProjectInformationSection last>
          <MetaLinks links={links} />
        </ProjectInformationSection>
      )}
    </>
  );
}
