DEPLOY_DOCKER_REGISTRY := gcr.io
DEPLOY_DOCKER_REPO_PREFIX := oursky-kube
DEPLOY_DOCKER_TAG := git-$(shell git rev-parse --short=10 HEAD)

.PHONY: docker-build-plugin
docker-build-plugin:
	docker build --tag $(DEPLOY_DOCKER_REGISTRY)/$(DEPLOY_DOCKER_REPO_PREFIX)/tell-chima-plugin:$(DEPLOY_DOCKER_TAG) .

.PHONY: docker-push-plugin
docker-push-plugin:
	docker push $(DEPLOY_DOCKER_REGISTRY)/$(DEPLOY_DOCKER_REPO_PREFIX)/tell-chima-plugin:$(DEPLOY_DOCKER_TAG)
