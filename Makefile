SHELL := /bin/bash

ORDER := private
DESTROY_ORDER := private

include $(shell git rev-parse --show-toplevel)/private/sq-cloud-assets/common-makefiles/orchestration.mk

deploy-with-webapp-assets-download:
	make -C private deploy-with-webapp-assets-download

deploy-static-configuration:
	make -C private/sq-cloud-assets deploy-static-configuration

destroy-static-configuration:
	make -C private/sq-cloud-assets destroy-static-configuration
