#!/usr/bin/env bash
set -eu

base_url=${1:-https://il-chul.com}
probe() {
  curl --max-time 20 --silent --output /dev/null --write-out '%{http_code}' "${base_url}$1" || printf '000'
}
frontend_status=$(probe /intro)
auth_status=$(probe /api/mypage/plans)
public_status=$(probe /api/region)
printf 'Smoke: frontend=%s authenticated_api=%s public_api=%s\n' "$frontend_status" "$auth_status" "$public_status"
[ "$frontend_status" = 200 ] && [ "$auth_status" = 401 ] && [ "$public_status" = 200 ]
