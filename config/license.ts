/*
 * Copyright (C) 2009-2025 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
import { Dependency } from 'rollup-plugin-license';

// To be always synced with https://saas-eu.whitesourcesoftware.com/Wss/WSS.html#!policyDetails;policy=3131;org=318388
// The below is the list of approved licenses in mend. The list below is incomplete from that of mend
// and these are the only licenses we use in front end for now
export const ALLOWED_LICENSES = [
  'MIT',
  'Apache-2.0',
  '0BSD',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'LGPL-3.0',
  '(MPL-2.0 OR Apache-2.0)', // Multiple licenses. Added specifically for dompurify as we have ignored this in Mend
];

// Just for Sprig currently, it has an Apache-2 license that isn't correctly parsed by the plugin
export const ALLOWED_LICENSE_TEXT = ['http://www.apache.org/licenses/LICENSE-2.0'];

// Generates license information with necessary details.
// A package which has a valid license that the plugin is unable read will default to MIT
export const generateLicenseText = (dependency: Dependency) => {
  const { author, homepage, license, licenseText, name, repository, version } = dependency;
  const lines: string[] = [];

  lines.push(`Name: ${name}`);
  lines.push(`Version: ${version}`);

  if (license) {
    lines.push(`License: ${license}`);
  }

  if (typeof repository === 'string') {
    lines.push(`Repository: ${repository}`);
  } else if (repository?.url) {
    lines.push(`Repository: ${repository.url}`);
  } else if (homepage) {
    lines.push(`Homepage: ${homepage}`);
  }

  if (author) {
    lines.push(`Author: ${author.text()}`);
  }

  if (licenseText) {
    lines.push(`License Copyright:`);
    lines.push(`${licenseText}`);
  }

  return lines.join('\n');
};
