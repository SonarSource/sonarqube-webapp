# These are comments to the package.json file

## dependencies

### @date-fns/upgrade

Used by sq-cloud to parse Date from string or number.

### launchdarkly-react-client-sdk

LaunchDarkly SDK for React used by sq-cloud to manage feature flags.

## devDependencies

### @cyclonedx/cdxgen

Library used to generate CycloneDX SBOM. Has a peer dependency on @types/cheerio.

### @rollup/plugin-replace

Used by sq-cloud vite config to remove (tree-shake) Sentry debug logs. See https://docs.sentry.io/platforms/javascript/configuration/tree-shaking/#tree-shaking-optional-code.

### @sprig-technologies/sprig-browser

Used by sq-cloud to show feedback froms created on the Sprid platform to our users.

### @types/cheerio

Peer dependency of @cyclonedx/cdxgen to generate CycloneDX SBOM.

### @typescript-eslint/rule-tester

Used to test our custom eslint rules in `./eslint-local-rules`.

### browserslist-useragent-regexp

Used by sq-cloud to generate a regex from the browserlist query to display the "not supported" html code.

### cheerio

Used by sq-cloud-e2e-tests to load SAML files.

### core-js

Polyfills for new JS features. Used in conjunction with @vitejs/plugin-legacy.

### env-cmd

Used by sq-cloud-e2e-tests to easily provide environment variables when running e2e tests.

### glob

Used by some validation scripts to go through our files.

### http-proxy-middleware

Used by sq-cloud to proxy websockets correctly.

### jest-launchdarkly-mock

Used by sq-cloud to mock LaunchDarkly flags in tests.

### jest-watch-typeahead

Used in jest config files to improve the jest watch mode.

### msw

Used to mock API requests in tests and dev mode.

### otpauth

Used by sq-cloud-e2e-tests to generate TOTP codes when logging in github or bitbucket.

### regenerator-runtime

Polyfill for async/await used in conjunction with @vitejs/plugin-legacy.

### terser

Peer dependency of @vitejs/plugin-legacy.

### @vitejs/plugin-legacy

Used by vite to provide polyfills for older browsers.

## resolutions

### @types/d3-selection

d3-zoom expects @types/d3-selection@3.0.x, so it may install a different version that breaks type resolution.
We force it to use the explicit version we declare (3.0.10)

### debug

We have many transitive dependencies that depend on debug and versions before ^4.3.0 have a vulnerability reported by Mend. It's to hard to track down all the dependencies that would need to be updated to ensure it's at the right version without a resolution.

### json5

Latest eslint-plugin-import rely on a vulnerable version of json5. We force it to use a version that is not vulnerable.

### nwsapi

This is necessary, because more recent patch versions are broken.
(For instance: [2.2.14](https://github.com/dperini/nwsapi/issues/135))

### semver

We have many many transitive dependencies on semver with a lot of different version and some version before 7.0.0 have Mend vulnerabilities.

### yaml

We have multiple transitive dependencies on yaml and some before 2.0.0 have Mend vulnerabilities.
