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

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const CLOUD_MESSAGES_JSON = path.join(repoRoot, 'private/apps/sq-cloud/src/l10n/messages.json');
const SERVER_DEFAULT_TS = path.join(repoRoot, 'libs/sq-server-commons/src/l10n/default.ts');

/** @type {ReadonlySet<string> | undefined} */
let memoizedCloudKeys;
/** @type {ReadonlySet<string> | undefined} */
let memoizedServerKeys;

function keysFromServerDefaultTs(tsSource) {
  const keys = new Set();
  const lineRe = /^\s*(?:'([^']+)'|"([^"]+)"|([a-zA-Z_$][\w$]*))\s*:/;
  for (const line of tsSource.split('\n')) {
    if (!line.trimStart().startsWith('//')) {
      const match = line.match(lineRe);
      if (match) {
        keys.add(match[1] ?? match[2] ?? match[3]);
      }
    }
  }
  return keys;
}

function getCloudL10nKeysSet() {
  if (memoizedCloudKeys !== undefined) {
    return memoizedCloudKeys;
  }
  const keys = new Set();
  if (fs.existsSync(CLOUD_MESSAGES_JSON)) {
    for (const key of Object.keys(JSON.parse(fs.readFileSync(CLOUD_MESSAGES_JSON, 'utf8')))) {
      keys.add(key);
    }
  }
  memoizedCloudKeys = keys;
  return memoizedCloudKeys;
}

function getServerL10nKeysSet() {
  if (memoizedServerKeys !== undefined) {
    return memoizedServerKeys;
  }
  const keys = new Set();
  if (fs.existsSync(SERVER_DEFAULT_TS)) {
    for (const k of keysFromServerDefaultTs(fs.readFileSync(SERVER_DEFAULT_TS, 'utf8'))) {
      keys.add(k);
    }
  }
  memoizedServerKeys = keys;
  return memoizedServerKeys;
}

function localizationCatalogResolvable(platform) {
  if (platform === 'cloud') {
    return fs.existsSync(CLOUD_MESSAGES_JSON);
  }
  if (platform === 'server') {
    return fs.existsSync(SERVER_DEFAULT_TS);
  }
  return fs.existsSync(CLOUD_MESSAGES_JSON) && fs.existsSync(SERVER_DEFAULT_TS);
}

function inferPlatformFromFilePath(absoluteFilePath) {
  const rel = path.relative(repoRoot, absoluteFilePath).replace(/\\/g, '/');
  if (rel.startsWith('private/apps/sq-cloud/')) {
    return 'cloud';
  }
  if (
    rel.startsWith('apps/sq-server/') ||
    rel.startsWith('libs/sq-server-commons/') ||
    rel.startsWith('libs/sq-server-addons/') ||
    rel.startsWith('private/libs/sq-server-')
  ) {
    return 'server';
  }
  if (rel.startsWith('private/libs/')) {
    return 'cloud';
  }
  if (rel.startsWith('libs/shared/') || rel.startsWith('libs/feature-')) {
    return 'shared';
  }
  return 'cloud';
}

function getKnownL10nKeysSet(platform) {
  if (platform === 'cloud') {
    return getCloudL10nKeysSet();
  }
  if (platform === 'server') {
    return getServerL10nKeysSet();
  }
  const cloudKeys = getCloudL10nKeysSet();
  const serverKeys = getServerL10nKeysSet();
  const intersection = new Set();
  for (const key of cloudKeys) {
    if (serverKeys.has(key)) {
      intersection.add(key);
    }
  }
  return intersection;
}

function resolvePlatform(platformOption, filename) {
  if (platformOption === 'cloud' || platformOption === 'server' || platformOption === 'shared') {
    return platformOption;
  }
  return inferPlatformFromFilePath(filename);
}

function getStaticStringFromExpression(node) {
  if (node == null) {
    return null;
  }
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  if (
    node.type === 'TemplateLiteral' &&
    node.expressions.length === 0 &&
    node.quasis.length === 1
  ) {
    const quasi = node.quasis[0].value.cooked ?? node.quasis[0].value.raw;
    return quasi ?? null;
  }
  return null;
}

function reportIfUnknown(context, reportNode, key, knownKeys, messageId) {
  if (key === null || key === '') {
    return;
  }
  if (knownKeys.has(key)) {
    return;
  }
  context.report({ node: reportNode, messageId, data: { key } });
}

function staticIdFromMessageDescriptor(objectExpr) {
  if (!objectExpr || objectExpr.type !== 'ObjectExpression') {
    return null;
  }
  let idValueExpression = null;
  for (const prop of objectExpr.properties) {
    if (prop.type !== 'Property' || prop.computed) {
      continue;
    }
    const keyName =
      prop.key.type === 'Identifier'
        ? prop.key.name
        : prop.key.type === 'Literal' && typeof prop.key.value === 'string'
          ? prop.key.value
          : null;
    if (keyName === 'id') {
      idValueExpression = prop.value;
      break;
    }
  }
  return idValueExpression ? getStaticStringFromExpression(idValueExpression) : null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require react-intl static message ids for FormattedMessage and useIntl().formatMessage to exist in the product l10n catalog',
      category: 'Possible Errors',
    },
    schema: [
      {
        type: 'object',
        properties: {
          knownKeys: {
            type: 'array',
            items: { type: 'string' },
          },
          platform: {
            type: 'string',
            enum: ['auto', 'cloud', 'server', 'shared'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unknownKeyCloud:
        'Unknown SonarCloud l10n key "{{key}}". Add it to private/apps/sq-cloud/src/l10n/messages.json.',
      unknownKeyServer:
        'Unknown SonarQube Server l10n key "{{key}}". Add it to libs/sq-server-commons/src/l10n/default.ts.',
      unknownKeyShared:
        'Unknown shared l10n key "{{key}}". Add it to both private/apps/sq-cloud/src/l10n/messages.json and libs/sq-server-commons/src/l10n/default.ts.',
    },
  },

  create(context) {
    const ruleOptions = context.options[0] ?? {};
    const configuredKeys = ruleOptions.knownKeys;
    const usesExplicitCatalogOverride = Array.isArray(configuredKeys) && configuredKeys.length > 0;
    const platform = resolvePlatform(ruleOptions.platform, context.filename);

    if (!usesExplicitCatalogOverride && !localizationCatalogResolvable(platform)) {
      return {};
    }

    const knownKeys = usesExplicitCatalogOverride
      ? new Set(configuredKeys)
      : getKnownL10nKeysSet(platform);
    const messageId =
      platform === 'server'
        ? 'unknownKeyServer'
        : platform === 'shared'
          ? 'unknownKeyShared'
          : 'unknownKeyCloud';

    let formattedMessageJsxLocalName = null;
    let useIntlImportLocalName = null;
    const intlObjectIds = new Set();
    const formatMessageFnIds = new Set();

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react-intl') {
          return;
        }
        for (const spec of node.specifiers) {
          if (spec.type === 'ImportSpecifier' && spec.imported.type === 'Identifier') {
            if (spec.imported.name === 'FormattedMessage') {
              formattedMessageJsxLocalName = spec.local.name;
            }
            if (spec.imported.name === 'useIntl') {
              useIntlImportLocalName = spec.local.name;
            }
          }
        }
      },

      VariableDeclarator(node) {
        if (!useIntlImportLocalName) {
          return;
        }
        const init = node.init;
        if (
          !init ||
          init.type !== 'CallExpression' ||
          init.callee.type !== 'Identifier' ||
          init.callee.name !== useIntlImportLocalName
        ) {
          return;
        }
        if (node.id.type === 'Identifier') {
          intlObjectIds.add(node.id.name);
          return;
        }
        if (node.id.type === 'ObjectPattern') {
          for (const prop of node.id.properties) {
            if (prop.type === 'Property' && !prop.computed) {
              const keyName =
                prop.key.type === 'Identifier'
                  ? prop.key.name
                  : prop.key.type === 'Literal' && typeof prop.key.value === 'string'
                    ? prop.key.value
                    : null;
              if (keyName === 'formatMessage' && prop.value.type === 'Identifier') {
                formatMessageFnIds.add(prop.value.name);
              }
            }
          }
        }
      },

      JSXOpeningElement(node) {
        if (!formattedMessageJsxLocalName) {
          return;
        }
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== formattedMessageJsxLocalName) {
          return;
        }
        for (const attr of node.attributes) {
          if (
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'id'
          ) {
            let staticId = null;
            if (attr.value == null) {
              staticId = null;
            } else if (attr.value.type === 'Literal' && typeof attr.value.value === 'string') {
              staticId = attr.value.value;
            } else if (attr.value.type === 'JSXExpressionContainer') {
              staticId = getStaticStringFromExpression(attr.value.expression);
            }
            reportIfUnknown(context, attr.value ?? attr, staticId, knownKeys, messageId);
          }
        }
      },

      CallExpression(node) {
        const callee = node.callee;
        let isFormatMessage = false;
        if (
          callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'formatMessage'
        ) {
          if (callee.object.type === 'Identifier' && intlObjectIds.has(callee.object.name)) {
            isFormatMessage = true;
          } else if (
            callee.object.type === 'CallExpression' &&
            useIntlImportLocalName &&
            callee.object.callee.type === 'Identifier' &&
            callee.object.callee.name === useIntlImportLocalName
          ) {
            isFormatMessage = true;
          }
        } else if (callee.type === 'Identifier' && formatMessageFnIds.has(callee.name)) {
          isFormatMessage = true;
        }
        if (!isFormatMessage) {
          return;
        }
        const firstArg = node.arguments[0];
        if (!firstArg || firstArg.type !== 'ObjectExpression') {
          return;
        }
        reportIfUnknown(
          context,
          firstArg,
          staticIdFromMessageDescriptor(firstArg),
          knownKeys,
          messageId,
        );
      },
    };
  },
};
