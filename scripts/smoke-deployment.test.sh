#!/usr/bin/env bash
set -eu
script_dir=$(cd "$(dirname "$0")" && pwd)
test_dir=$(mktemp -d)
trap 'rm -rf "$test_dir"' EXIT
cat > "$test_dir/curl" <<'MOCK'
#!/usr/bin/env bash
url=${!#}
case "$url" in
  */intro) printf '%s' "${INTRO_CODE:-200}" ;;
  */api/mypage/plans) printf '%s' "${AUTH_CODE:-401}" ;;
  */api/region) printf '%s' "${PUBLIC_CODE:-200}" ;;
  *) exit 99 ;;
esac
[ "${NETWORK_FAILURE:-0}" = 0 ]
MOCK
chmod +x "$test_dir/curl"
export PATH="$test_dir:$PATH"
bash "$script_dir/smoke-deployment.sh"
for failure in 'INTRO_CODE=500' 'AUTH_CODE=200' 'PUBLIC_CODE=401' 'NETWORK_FAILURE=1'; do
  if env "$failure" bash "$script_dir/smoke-deployment.sh"; then
    printf 'FAIL: accepted %s\n' "$failure"
    exit 1
  fi
done
printf 'PASS: deployment smoke contract\n'
