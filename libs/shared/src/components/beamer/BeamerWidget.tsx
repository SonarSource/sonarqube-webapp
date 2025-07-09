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

import { css, Global, useTheme } from '@emotion/react';
import { GlobalNavigation, IconBell } from '@sonarsource/echoes-react';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { getBeamerProductId } from '~adapters/helpers/vendorConfig';
import useEffectOnce from '../../helpers/useEffectOnce';
import useScript from '../../helpers/useScript';

const TRIGGER_ID = 'beamer-news-trigger';

interface BeamerConfig {
  // animate icon
  bounce?: boolean;
  // show unread news count
  counter?: boolean;
  // Segment data
  filter?: string;
  // language
  language: 'EN';
  // beamer id
  product_id: string;
  // selector element to listen the click event to
  selector: string;
  // class name to be set in the root of iframe
  theme?: string;
}

/**
 * userPersona: admin/ not
 * product: sqs/sqcb/sqc
 * productVersion
 * edition
 * maxLoc
 * usedLoc
 * features
 */

declare global {
  interface Window {
    Beamer?: {
      update: (params: Partial<BeamerConfig>) => void; // Update beamer config
    };
    beamer_config: BeamerConfig;
  }
}

interface Props {
  hideCounter?: boolean;
}

export function BeamerWidget({ hideCounter = true }: Readonly<Props>) {
  const intl = useIntl();
  const theme = useTheme();

  useEffectOnce(() => {
    window.beamer_config = {
      bounce: false,
      // counter icon is controlled by CSS (beamer_icon class) as recommended by Beamer team
      counter: true,
      product_id: getBeamerProductId(),
      language: 'EN',
      selector: TRIGGER_ID,
      theme: theme.id,

      filter: 'admin',
    };
  });

  useScript({
    src: 'https://app.getbeamer.com/js/beamer-embed.js',
    id: 'beamer-embed',
  });

  useEffect(() => {
    window.Beamer?.update({ theme: theme.id });
  }, [theme.id]);

  return (
    <>
      {/* Important is neccessary for all the styles to properly override the beamer ones */}
      <Global
        styles={css`
          #beamerNews,
          #beamerLoader {
            background-color: var(--echoes-color-background-accent-weak-default) !important;
          }

          .beamer_icon {
            display: ${hideCounter ? 'none !important;' : null};
            color: var(--echoes-color-text-on-color) !important;
            background-color: var(--echoes-color-background-accent-default) !important;
          }

          .product-news-trigger:hover .beamer_icon {
            color: var(--echoes-color-text-on-color) !important;
            background-color: var(--echoes-color-background-accent-hover) !important;
          }
        `}
      />
      <GlobalNavigation.Action
        Icon={IconBell}
        aria-haspopup
        ariaLabel={intl.formatMessage({ id: 'global_nav.news.tooltip' })}
        className="product-news-trigger"
        id={TRIGGER_ID}
        isIconFilled
        size="medium"
        variety="default-ghost"
      />
    </>
  );
}
