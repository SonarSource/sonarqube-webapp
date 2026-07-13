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

import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { scanComponents } from './scan-components.mjs';

const { AWS_REGION, METRIC_TIMESTAMP } = process.env;

if (!AWS_REGION) {
  console.error('Error: AWS_REGION environment variable is not set');
  process.exit(1);
}

if (METRIC_TIMESTAMP && Number.isNaN(new Date(METRIC_TIMESTAMP).getTime())) {
  console.error(`Error: METRIC_TIMESTAMP "${METRIC_TIMESTAMP}" is not a valid date`);
  process.exit(1);
}

// --- 1. Run the component scan ---
console.log('Running component scan...');
const components = await scanComponents();

// --- 2. Tally totals ---
let echoesTotal = 0;
let legacyTotal = 0;

for (const { source, count, match } of components) {
  if (source === 'echoes') {
    echoesTotal += count;
  } else if (!['Excluded', '', undefined].includes(match)) {
    legacyTotal += count;
  }
}

const timestamp = METRIC_TIMESTAMP ? new Date(METRIC_TIMESTAMP) : new Date();

// Only computed for logging
const percentMigrated = Number.parseFloat(
  ((echoesTotal / (echoesTotal + legacyTotal)) * 100).toFixed(2),
);
console.log(
  `\nResults: ${echoesTotal} echoes, ${legacyTotal} legacy → ${percentMigrated}% migrated`,
);

// --- 3. Send metrics to CloudWatch ---
const cloudWatchClient = new CloudWatchClient({ region: AWS_REGION });

console.log('\nSending adoption metrics to CloudWatch...');

const metrics = [
  { MetricName: 'EchoesTotal', Value: echoesTotal, Unit: 'Count', Timestamp: timestamp },
  { MetricName: 'LegacyTotal', Value: legacyTotal, Unit: 'Count', Timestamp: timestamp },
];

try {
  await cloudWatchClient.send(
    new PutMetricDataCommand({
      Namespace: 'FrontEndEngineering/EchoesAdoption',
      MetricData: metrics,
    }),
  );

  console.log('Successfully sent adoption metrics to CloudWatch');
} catch (error) {
  console.warn('Warning: Failed to send adoption metrics to CloudWatch');
  console.error(error.message);
  process.exit(1);
}
