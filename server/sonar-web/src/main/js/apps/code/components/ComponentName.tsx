/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { LinkHighlight, LinkStandalone, Tooltip } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { Badge, BranchIcon, LightLabel, Note, QualifierIcon } from '~design-system';
import { ContainsAICodeBadge } from '~sq-server-shared/components/shared/ContainsAICodeBadge';
import { translate } from '~sq-server-shared/helpers/l10n';
import { isDefined } from '~sq-server-shared/helpers/types';
import { CodeScope, getComponentOverviewUrl } from '~sq-server-shared/helpers/urls';
import { getBranchLikeQuery } from '~sq-server-shared/sonar-aligned/helpers/branch-like';
import { isPortfolioLike } from '~sq-server-shared/sonar-aligned/helpers/component';
import { queryToSearchString } from '~sq-server-shared/sonar-aligned/helpers/urls';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { MetricKey } from '~sq-server-shared/sonar-aligned/types/metrics';
import { BranchLike } from '~sq-server-shared/types/branch-like';
import { isApplication, isProject } from '~sq-server-shared/types/component';
import { ComponentMeasure } from '~sq-server-shared/types/types';
import { mostCommonPrefix } from '../utils';

export interface Props {
  branchLike?: BranchLike;
  canBrowse?: boolean;
  component: ComponentMeasure;
  newCodeSelected?: boolean;
  previous?: ComponentMeasure;
  rootComponent: ComponentMeasure;
  showIcon?: boolean;
  unclickable?: boolean;
}

export default function ComponentName({
  branchLike,
  canBrowse = false,
  component,
  newCodeSelected,
  previous,
  rootComponent,
  showIcon = true,
  unclickable = false,
}: Readonly<Props>) {
  const ariaLabel = unclickable ? translate('code.parent_folder') : undefined;

  if (
    [
      ComponentQualifier.Application,
      ComponentQualifier.Portfolio,
      ComponentQualifier.SubPortfolio,
    ].includes(rootComponent.qualifier as ComponentQualifier) &&
    [ComponentQualifier.Application, ComponentQualifier.Project].includes(
      component.qualifier as ComponentQualifier,
    )
  ) {
    return (
      <span className="sw-flex sw-items-center sw-overflow-hidden">
        <div className="sw-truncate" title={getTooltip(component)} aria-label={ariaLabel}>
          {renderNameWithIcon(
            branchLike,
            component,
            previous,
            rootComponent,
            showIcon,
            unclickable,
            canBrowse,
            newCodeSelected,
          )}
        </div>

        {component.branch ? (
          <div className="sw-truncate sw-ml-2">
            <BranchIcon className="sw-mr-1" />

            <Note>{component.branch}</Note>
          </div>
        ) : (
          <Badge className="sw-ml-1" variant="default">
            {translate('branches.main_branch')}
          </Badge>
        )}

        {showAiBadge(component) && <AIBadgeWithTooltip componentQualifier={component.qualifier} />}
      </span>
    );
  }

  return (
    <span title={getTooltip(component)} aria-label={ariaLabel}>
      {renderNameWithIcon(
        branchLike,
        component,
        previous,
        rootComponent,
        showIcon,
        unclickable,
        canBrowse,
      )}
      {showAiBadge(component) && <AIBadgeWithTooltip componentQualifier={component.qualifier} />}
    </span>
  );
}

type AIBadgeWithTooltipProps = {
  componentQualifier:
    | ComponentQualifier.Application
    | ComponentQualifier.Project
    | ComponentQualifier.SubPortfolio;
};

function AIBadgeWithTooltip({ componentQualifier }: Readonly<AIBadgeWithTooltipProps>) {
  const content = useMemo(() => {
    switch (componentQualifier) {
      case ComponentQualifier.Application:
        return translate('code.ai_badge_tooltip.application');
      case ComponentQualifier.Project:
        return translate('code.ai_badge_tooltip.project');
      case ComponentQualifier.SubPortfolio:
        return translate('code.ai_badge_tooltip.sub_portfolio');
      default:
        return componentQualifier satisfies never;
    }
  }, [componentQualifier]);

  return (
    <span className="sw-ml-2">
      <Tooltip content={content}>
        <span>
          <ContainsAICodeBadge />
        </span>
      </Tooltip>
      <span className="sw-sr-only">{content}</span>
    </span>
  );
}

function containsAICode(component: ComponentMeasure): boolean {
  return Boolean(
    component.measures?.some(
      (measure) => measure.metric === MetricKey.contains_ai_code && measure.value === 'true',
    ),
  );
}

function getTooltip(component: ComponentMeasure) {
  const isFile =
    component.qualifier === ComponentQualifier.File ||
    component.qualifier === ComponentQualifier.TestFile;

  if (isFile && isDefined(component.path)) {
    return `${component.path}\n\n${component.key}`;
  }

  return [component.name, component.key, component.branch]
    .filter((s) => s !== undefined)
    .join('\n\n');
}

function renderNameWithIcon(
  branchLike: BranchLike | undefined,
  component: ComponentMeasure,
  previous: ComponentMeasure | undefined,
  rootComponent: ComponentMeasure,
  showIcon: boolean,
  unclickable = false,
  canBrowse = false,
  newCodeSelected = true,
) {
  const name = renderName(component, previous);
  const codeType = newCodeSelected ? CodeScope.New : CodeScope.Overall;

  if (
    !unclickable &&
    (isPortfolioLike(component.qualifier) ||
      isApplication(component.qualifier) ||
      isProject(component.qualifier))
  ) {
    const branch = [ComponentQualifier.Application, ComponentQualifier.Portfolio].includes(
      rootComponent.qualifier as ComponentQualifier,
    )
      ? component.branch
      : undefined;

    return (
      <LinkStandalone
        highlight={LinkHighlight.CurrentColor}
        iconLeft={showIcon && <QualifierIcon className="sw-mr-2" qualifier={component.qualifier} />}
        to={getComponentOverviewUrl(
          component.refKey ?? component.key,
          component.qualifier,
          { branch },
          codeType,
        )}>
        {name}
      </LinkStandalone>
    );
  } else if (canBrowse) {
    const query = { id: rootComponent.key, ...getBranchLikeQuery(branchLike) };

    if (component.key !== rootComponent.key) {
      Object.assign(query, { selected: component.key });
    }

    return (
      <LinkStandalone
        highlight={LinkHighlight.CurrentColor}
        iconLeft={showIcon && <QualifierIcon className="sw-mr-2" qualifier={component.qualifier} />}
        to={{ pathname: '/code', search: queryToSearchString(query) }}>
        {name}
      </LinkStandalone>
    );
  }

  return (
    <span>
      {showIcon && (
        <QualifierIcon className="sw-mr-2 sw-align-text-bottom" qualifier={component.qualifier} />
      )}

      {name}
    </span>
  );
}

function renderName(component: ComponentMeasure, previous: ComponentMeasure | undefined) {
  const areBothDirs =
    component.qualifier === ComponentQualifier.Directory &&
    previous &&
    previous.qualifier === ComponentQualifier.Directory;

  const prefix =
    areBothDirs && isDefined(previous)
      ? mostCommonPrefix([component.name + '/', previous.name + '/'])
      : '';

  return prefix ? (
    <span>
      <LightLabel>{prefix}</LightLabel>

      <span>{component.name.slice(prefix.length)}</span>
    </span>
  ) : (
    component.name
  );
}

function showAiBadge(component: ComponentMeasure): component is ComponentMeasure & {
  qualifier:
    | ComponentQualifier.Application
    | ComponentQualifier.Project
    | ComponentQualifier.SubPortfolio;
} {
  if (!containsAICode(component)) {
    return false;
  }

  return (
    component.qualifier === ComponentQualifier.Application ||
    component.qualifier === ComponentQualifier.Project ||
    component.qualifier === ComponentQualifier.SubPortfolio
  );
}
