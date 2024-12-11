# SonarQube Webapp
[![Build Status](https://api.cirrus-ci.com/github/SonarSource/sonarqube-webapp.svg?branch=master)](https://cirrus-ci.com/github/SonarSource/sonarqube-webapp/master)
[![Quality Gate Status](https://next.sonarqube.com/sonarqube/api/project_badges/measure?project=SonarSource_sonarqube-webapp&metric=alert_status&token=sqb_91e4c80f079956fc15a3eca994eb32da0de9ed32)](https://next.sonarqube.com/sonarqube/dashboard?id=SonarSource_sonarqube-webapp)

This repository contains the source code of the UI of SonarQube. The server code is hosted in the [sonarqube repository](https://github.com/SonarSource/sonarqube).

## Continuous Inspection

SonarQube provides the capability to not only show the health of an application but also to highlight issues newly introduced. With a Quality Gate in place, you can [achieve Clean Code](https://www.sonarsource.com/solutions/clean-code/) and therefore improve code quality systematically.

## Links

- [Website](https://www.sonarsource.com/products/sonarqube)
- [Download](https://www.sonarsource.com/products/sonarqube/downloads)
- [Documentation](https://docs.sonarsource.com/sonarqube)
- [SonarQube backend source code](https://github.com/SonarSource/sonarqube)
- [X](https://twitter.com/SonarQube)
- [SonarSource](https://www.sonarsource.com), author of SonarQube
- [Issue tracking](https://jira.sonarsource.com/browse/SONAR/), read-only. Only SonarSourcers can create tickets.
- [Responsible Vulnerability Disclosure](https://community.sonarsource.com/t/responsible-vulnerability-disclosure/9317)
- [Next](https://next.sonarqube.com/sonarqube) instance of the next SonarQube version

## Have Questions or Feedback?

For support questions ("How do I?", "I got this error, why?", ...), please first read the [documentation](https://docs.sonarsource.com/sonarqube) and then head to the [Sonar Community](https://community.sonarsource.com/c/help/sq) forum. The answer to your question has likely already been answered! 🤓

Be aware that this forum is a community, so the standard pleasantries ("Hi", "Thanks", ...) are expected. And if you don't get an answer to your thread, you should sit on your hands for at least three days before bumping it. Operators are not standing by. 😄


## Contributing

If you would like to see a new feature or report a bug, please create a new thread on our [forum](https://community.sonarsource.com/c/sq/10).

Please be aware that we are not actively looking for feature contributions. The truth is that it's extremely difficult for someone outside SonarSource to comply with our roadmap and expectations. Therefore, we typically only accept minor cosmetic changes and typo fixes.

With that in mind, if you would like to submit a code contribution, please create a pull request for this repository. Please explain your motives to contribute this change: what problem you are trying to fix, what improvement you are trying to make.

Make sure that you follow our [code style](https://github.com/SonarSource/sonar-developer-toolset#code-style) and all tests are passing.

Willing to contribute to SonarSource products? We are looking for smart, passionate, and skilled people to help us build world-class code-quality solutions. Have a look at our current [job offers here](https://www.sonarsource.com/company/jobs/)!

## Building

First, note that this repository only contains the UI of SonarQube, you can find the server code in the [sonarqube repository](https://github.com/SonarSource/sonarqube).

To locally build the UI from sources, follow these instructions.

### Build

Execute from the project base directory:

```bash
cd server/sonar-web

# install dependencies, only needed the first time
yarn

# build the webapp
yarn build

```

The distribution files are generated in the `server/sonar-web/build/webapp' directory.

### Run the UI locally for development

```bash
# Start the dev server targeting a SonarQube instance located at http://localhost:9000
yarn start

# Start the dev server targeting a SonarQube instance located at http://my-sonarqube.org
PROXY=http://my-sonarqube.org yarn start
```

### Validate your changes and test

```bash
yarn validate

```

### Building the whole SonarQube with a custom UI

If you want to build the whole SonarQube with a custom UI, you must also clone the `sonarqube` repository, which contains the backend code.

You can then do the following:

```bash
cd /path/to/sonarqube-webapp/server/sonar-web
# do your changes to have a custom UI

# build the webapp
yarn build

# Move in the sonarqube repository to build it
cd /path/to/sonarqube

# build the sonarqube repository using the custom build of the webapp
WEBAPP_BUILD_PATH=/path/to/sonarqube-webapp/server/sonar-web/build/webapp ./gradlew build
```

You can then start the SonarQube server as usual using the `start.sh` script from the `sonarqube` repository.

## Translations files

The default translations (in English) for SonarQube are now located in this repository, you can find them here:
https://github.com/SonarSource/sonarqube-webapp/blob/master/server/sonar-web/src/main/js/l10n/default.ts

The format of the file is no longer a `.properties` file but you can still generate a file of this format by running the following command:

```bash
cd server/sonar-web

# generate a backward compatible .properties file with all the translation keys
yarn generate-translation-keys
```

Note that contributing extensions for translations into other languages still work the same way as before. It's just the source of truth for the default translations that moved here.

## License

Copyright 2008-2024 SonarSource.

Licensed under the [GNU Lesser General Public License, Version 3.0](https://www.gnu.org/licenses/lgpl.txt)
