SHELL := /bin/bash

FOLDERS := private
COMMANDS := synth deploy format validate-format test update-dependencies

# The folders are iterated in through in order and the commands are executed on them
include private/sq-cloud-assets/common-makefiles/orchestration.mk
# This delete action calls the delete action of the subsequent Makefiles in a reverse order of the FOLDERS
include private/sq-cloud-assets/common-makefiles/reverse_destroy.mk
