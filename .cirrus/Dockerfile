ARG JDK_VERSION=17
FROM eclipse-temurin:${JDK_VERSION}-jdk-jammy

ENV DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN set -o errexit -o nounset \
  && groupadd --system --gid 1000 sonarsource \
  && useradd --system --gid sonarsource --uid 1000 --shell /bin/bash --create-home sonarsource

RUN echo 'Acquire::AllowReleaseInfoChange::Suite "true";' > /etc/apt/apt.conf.d/allow_release_info_change.conf

# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=863199#23
RUN mkdir -p /usr/share/man/man1 \
  && apt-get update \
  && apt-get -y install --no-install-recommends \
    lsb-release \
    ca-certificates \
    curl \
    wget \
    gnupg


ARG NODE_VERSION=20
RUN DISTRO="$(lsb_release -s -c)" \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION.x nodistro main" >> /etc/apt/sources.list.d/nodesource.list \
  && apt-get update \
  && apt-get -y install --no-install-recommends \
    git \
    zip \
    nodejs="$NODE_VERSION".* \
    jq


# Remove all caches of apt to reduce image size
RUN apt-get clean autoclean && apt-get autoremove --yes && rm -rf /var/lib/{apt,dpkg,cache,log}

# Enable yarn
# renovate: datasource=github-releases depName=yarn packageName=yarnpkg/berry
ARG YARN_VERSION=4.9.1
RUN corepack enable
RUN corepack pack yarn@${YARN_VERSION}

# Install sonar-scanner-npm
RUN npm install -g sonarqube-scanner

USER sonarsource
WORKDIR /home/sonarsource
