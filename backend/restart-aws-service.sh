#!/bin/bash
# A script that restarts the Notification Handler backend service on AWS. It does it by
# killing the only task in this service: the service will immediately create a
# new one.
#
# Do this if the Docker image has been updated and you want to use the latest
# one. The downside is that there is some down time, but given the current
# design of the backend this is completly acceptable.
readonly AWS_SERVICE=project-noah
readonly RESTART_REASON="$1"
readonly AWS_DEFAULT_REGION=eu-central-1

readonly TASK_ID="$(aws ecs list-tasks --service-name "${AWS_SERVICE}" --region "${AWS_DEFAULT_REGION}" |\
  grep arn |\
  sed -e "s/^.*task\///;s/\".*//")"
aws ecs stop-task --task "${TASK_ID}" --reason "${RESTART_REASON}" --region "${AWS_DEFAULT_REGION}"
