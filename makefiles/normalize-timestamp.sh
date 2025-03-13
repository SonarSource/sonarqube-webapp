# /bin/sh

# This script sets the timestamps of the python build artifacts to the most recent
# commit in the service. Since the timestamps of the build artifacts are natrually
# when they are built, this action ensures a consistent timestamp and hash of
# the final artifact.

echo "Normalizing timestamps."

find build/package -exec touch -t \
    "$(git ls-files -z . \
        | xargs -0 -n1 -I{} -- git log -1 --date=format:"%Y%m%d%H%M" --format="%cd" '{}' \
        | sort -r \
        | head -n 1)" \
    '{}' +
