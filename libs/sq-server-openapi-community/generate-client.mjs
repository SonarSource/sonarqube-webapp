import { createClient } from '@hey-api/openapi-ts';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const output = join(projectRoot, 'src/generated');
const inputFile = join(projectRoot, 'specs/community.json');

if (!existsSync(inputFile)) {
  throw new Error(
    `Missing ${relative(process.cwd(), inputFile)}. Use the generate-openapi-clients skill to refresh it.`,
  );
}

const specification = withServerPathPrefix(JSON.parse(readFileSync(inputFile, 'utf8')));

await createClient({
  input: specification,
  output: {
    clean: true,
    path: output,
    postProcess: [],
    tsConfigPath: join(projectRoot, 'tsconfig.json'),
  },
  plugins: [
    {
      baseUrl: false,
      name: '@hey-api/client-axios',
      runtimeConfigPath: join(projectRoot, 'src/runtime.ts'),
      throwOnError: true,
    },
    { name: '@hey-api/typescript' },
    { name: '@hey-api/sdk' },
  ],
});
normalizeGeneratedSource();
execFileSync('yarn', ['prettier', '--write', output], { stdio: 'inherit' });

// Paths are relative to the single declared server (`/api/v2`). Moving that prefix into the paths
// keeps the Axios base URL free for the deployment context path.
function withServerPathPrefix(spec) {
  const servers = spec.servers ?? [];
  if (servers.length !== 1 || !servers[0].url.startsWith('/')) {
    throw new Error(
      `Expected exactly one relative server URL in ${relative(projectRoot, inputFile)}`,
    );
  }

  const [{ url: prefix }] = servers;
  const { servers: _servers, ...rest } = spec;
  return {
    ...rest,
    paths: Object.fromEntries(
      Object.entries(spec.paths).map(([path, item]) => [prefix + path, item]),
    ),
  };
}

function normalizeGeneratedSource() {
  const clientFile = join(output, 'client.gen.ts');
  const source = readFileSync(clientFile, 'utf8');
  const pattern = /from '([^']*\/runtime)\.ts';/g;
  const matches = [...source.matchAll(pattern)];

  if (matches.length !== 1) {
    throw new Error(`Unexpected generated shape in ${relative(projectRoot, clientFile)}`);
  }

  writeFileSync(clientFile, source.replace(pattern, "from '$1';"));
}
