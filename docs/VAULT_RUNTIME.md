# Ilchul Vault 운영 전환

## 현재 변경의 범위

이 PR은 **배포 준비 코드**다. merge가 운영 배포를 자동으로 시작하므로
아래 서버 준비와 사용자 확인 전에는 merge하지 않는다. 이 문서의 명령은 실행 기록이 아니다.
기존 OCI 단일 VM과 blue/green, shared-infra 네트워크를 유지한다. 전체 VM/Docker 재시작은 필요하지 않다.

## 자격증명 경로

OCI Secret Management → 호스트 Instance Principal → 공통 publisher → tmpfs 서비스 디렉터리
→ backend의 Spring 메모리 설정. 컨테이너에는 OCI 인증정보/SDK 권한을 주지 않는다.
일반 backend에 MYSQL_ROOT_PASSWORD, migration 계정, Redis/MinIO 관리자를 전달하지 않는다.
프론트엔드는 PORT/HOSTNAME/BACKEND_INTERNAL_URL 세 가지 공개 설정만 받는다.

`/run/oci-service-secrets/ilchul-backend`만 read-only bind한다. 전용 GID는 호스트에서 충돌 없이 배정하고
Compose `group_add`에 사용한다. 부모/세대는 root:전용GID 0750, 파일 0640, `current`는 root 소유의
`g-XXXXXX` 상대 symlink다. 컨테이너는 시작 시 한 세대만 읽으며 누락·권한·형식 오류에서 fail-closed한다.
새 세대 발행만으로 이미 실행 중인 앱 설정은 변경되지 않는다. 비활성 색상을 재생성해서 적용한다.

CONFIG_JSON에는 아래 **필드명만** 허용하며 값은 이 문서에 기록하지 않는다.

```
MYSQL_USER MYSQL_PASSWORD REDIS_USERNAME REDIS_PASSWORD
AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY ADMIN_PASSWORD JWT_SECRET_KEY
KAKAO_REST_API_KEY GOOGLE_API_KEY TOUR_API_KEY ANTHROPIC_API_KEY
OAUTH_GOOGLE_CLIENT_SECRET OAUTH_KAKAO_CLIENT_SECRET OAUTH_NAVER_CLIENT_SECRET
```

모든 값은 비어 있지 않은 문자열이어야 한다. 기존 JWT/OAuth/API 키와 ADMIN_PASSWORD는 보존한다.
DB/Redis/MinIO는 입력 파일에 준비된 새 서비스 계정으로 별도 전환한다. 입력 파일은 삭제하지 않는다.
장기 cloud API key/SSH key를 새로 만들지 않는다. 기존 외부 API 키는 서비스 제약상 유지되는 예외이며,
소유자는 서비스 운영자, 목적은 기존 API/OAuth/JWT 기능이다. 해당 공급자의 제한·폐기·정기 회전 정책을 적용한다.

일반 앱 Flyway는 강제 비활성화한다. 별도 `--ilchul-migrate` 모드만 Flyway를 실행하며
Spring 웹/Redis/OAuth context를 열지 않는다. `/run/oci-service-secrets/ilchul-migration`은 root:root 0750/0640,
CONFIG_JSON은 MYSQL_USER/MYSQL_PASSWORD 두 필드만 가진다. baseline 자동 생성/clean은 금지한다.
DB 대상은 private Docker DNS `mysql:3306/ilchul_db`다. 다른 값이 실제 운영 설정이면 먼저 설계를 수정한다.

## 병합 전 서버 준비 체크리스트

아래는 준비 당시 체크리스트다. 2026-09-21 서버 실행 결과는 문서 마지막의 별도 기록을 참조한다.
전환 후 앱 인수 검증과 구 계정 폐기는 서버 준비와 별개다.

- [ ] 공통 host runtime(Project Management 저장소)에 ilchul-backend/ilchul-migration profile 추가·테스트·main 반영·승인된 host release 설치.
- [ ] 기존 DEFAULT Vault/키 재사용, 서비스 Secret과 정확한 버전 manifest 생성. VM IAM은 정확한 Secret 조회만 허용.
- [ ] 신규 MySQL runtime CRUD / migration DDL+backup 계정 생성 및 실제 grants 검사. Flyway 이력과 모든 테이블에 대한 backup 권한 검사.
- [ ] Redis 기존 key pattern/명령, refresh token, plan draft, Spring repository의 index/phantom key와 pub/sub 사용 확인 후 서비스 ACL 생성.
- [ ] YouTube의 현재 ACL reconciler가 default nopass에 의존함을 반영. host-only 관리자 인증으로 먼저 전환하고 모든 consumer 검증 뒤 default를 폐쇄. FLUSHALL/키 삭제/공유 Redis 재시작 금지.
- [ ] MinIO ilchul 버킷/실제 경로에 필요한 put/get/delete/list 범위를 계정에 부여. anonymous read policy는 host 관리 단계에서 검증; 매 앱 배포에서 root 키로 다시 설정하지 않는다.
- [ ] 컨테이너 metadata IPv4/IPv6 차단 유지, host publisher만 Instance Principal 사용.
- [ ] root 소유 publisher service `ilchul-secrets.service` 설치. 공통 runtime의 `--ilchul-backend`로 ExecStart/ExecReload, RemainAfterExit=yes. 정상 배포는 reload, restart 금지.
- [ ] `ilchul-runtime.service` 설치·enable. Docker restart=no인 active color를 publisher 성공 이후에만 복구해야 한다. Docker daemon 재시작에도 종속 서비스가 재시작하도록 관계와 실제 복구를 검증.
- [ ] boot 복구는 현재 이미지의 고정 SHA와 public config로 재생성 가능해야 한다. tmpfs 재생성 실패 시 앱을 시작하지 않으며 다른 서비스를 중단하지 않는다.
- [ ] 본 PR의 `scripts/vault_preflight.py`를 `/usr/local/sbin/ilchul-vault-preflight`, `infrastructure/vault/ilchul-vault-migrate.py`를 `/usr/local/sbin/ilchul-vault-migrate`에 root:root 0750으로 검토 후 설치. 워크플로우는 sudo로 이 고정 경로만 호출한다.
- [ ] 배포 계정의 기존 SSH와 sudo 경로를 검토하고 필요한 명령만 허용. 새 공용 key를 복사하지 않는다.
- [ ] GitHub `production` environment의 required reviewer/branch 정책 실제 확인. YAML에 environment를 적는 것만으로 reviewer 보호가 생겼다고 간주하지 않는다.
- [ ] Vault 실패 주입 시 기존 current/active container 유지, backend 권한으로 다른 서비스와 migration 파일 읽기 거부, 실제 DB/Redis/MinIO 권한 경계 검증.
- [ ] backup gzip/해시 및 별도 restore 검증, active/rollback 두 색상과 이전 자격증명 유지 계획 확인.

`/etc/ilchul`은 root 소유이며 그룹/다른 사용자가 쓸 수 없어야 한다. `runtime-public.env`는 root:root 0644이다.
비밀값이 없으므로 배포 계정이 읽을 수 있게 하되, 수정 권한은 root만 갖는다. 값은 한 줄 `KEY=value`, 따옴표/보간 없이 쓴다.
허용 필드는 `scripts/vault_preflight.py`의 PUBLIC_FIELDS이며 필수 고정값은 기존 nginx upstream과 맞춘
BACKEND_SERVER_PORT=8081 / FRONTEND_SERVER_PORT=3001이다. 기존 CLOUD_AWS_S3_* aliases는 명시적 STORAGE_*로 정규화한다.
일반 `.env`는 이 경로로 교체하되 기존 파일을 무조건 삭제하지 말고 증거 보관·접근 제한·폐기 대상 자격증명 목록에 포함한다.

`vault-cutover.json`은 root:root 0600이며 다음 형태의 **운영자 검증 기록**이다. 자동 생성하거나 무조건 true로 바꾸지 않는다.
`checks` 전체는 검사 코드의 CHECKS와 같아야 하며, 모든 항목을 실제 검증한 뒤에만 true로 기록한다.

```json
{
  "contractVersion": 1,
  "checks": {
    "accounts": false,
    "vaultIam": false,
    "publisher": false,
    "bootRecovery": false,
    "metadataBlocked": false,
    "backup": false,
    "minioPolicy": false,
    "redisCompatibility": false,
    "rollback": false,
    "productionApproval": false
  }
}
```

이 기록은 cloud/DB 권한을 자동으로 증명하는 도구가 아니다. preflight는 여기에 더해 파일 소유권·권한,
unit 상태, tmpfs/no swap, 서비스 디렉터리, Docker network를 실제 검사한다. 본 PR만 merge하면 아직 설치되지 않은
host 명령 때문에 **배포가 중단되는 것이 정상**이다. 먼저 host 준비를 완료하고 사용자와 merge 일정을 맞춘다.

## 배포와 실패 처리

1. main merge → immutable 이미지 build. 운영 Secret은 CI에 전달하지 않는다. 공개 frontend client 설정과 기존 배포용 SSH bootstrap만 남는다.
2. production 승인 → host preflight. 실패하면 파일 복사/기존 container 교체를 하지 않는다.
3. host public config를 명시적으로 사용하고 publisher reload. 실패하면 이전 current는 유지되며 target을 시작하지 않는다.
4. inactive image pull → host migration. 배타 lock → 별도 root Secret 발행 → 동일 MySQL 이미지의 mysqldump로 압축 backup
   → gzip CRC/sha256 → 제한된 일회용 migration container. backup은 `/var/backups/ilchul-vault`, root 0700/0600이다.
5. migration 성공 → inactive color 시작 → backend/frontend health → nginx 설정 검사·전환 → 공개 intro 200 / 비인증 API 401.
   migration 실패 시 traffic은 이전 색상을 유지한다. DB schema는 자동 rollback하지 않는다. 전환 전 호환성 검토가 필수다.
6. 기존 색상은 실행 상태로 보존한다. OAuth 로그인/refresh/이미지 업로드·조회·삭제/일정/검색 검증 후에만 운영자가 중지한다.
   `vault-acceptance-pending.json`이 있으면 다음 배포는 파일 복사 전부터 차단된다. target 시작 실패나 rollback 후에도 자동으로 제거하지 않는다.
   운영자가 검증 결과·이전 색상·백업/계정 상태를 확인하고 기록을 보관한 뒤 marker를 제거해야 다음 배포가 허용된다.
7. rollback 경계를 닫은 뒤에만 구 계정 폐기, 구 env/Secret 버전 정리를 별도로 승인한다.

migration wrapper는 자기 작업의 고유 이름 container만 정리한다. Docker 상태 확인이 실패하면 root-only migration 자료를 남기고
실패한다. 원인을 확인하고 container 제거가 확실해진 뒤 정리한다. 실패한 backup도 임의 삭제하지 않는다.
호스트 중단/SIGKILL이면 wrapper finally가 보장되지 않으므로 다음 작업 전에 잔여 container/mount를 점검한다.

## rollback과 재부팅 경계

`rollback.sh`는 보존된 container를 사용하며 최신 image/Compose로 재생성하지 않는다. 파일 mount는 서비스의 current를 바라보므로
Vault backend가 이미 중지된 경우에는 자동 재시작하지 않고 운영자에게 generation 재검증을 요구한다.
실행 중인 이전 색상은 이미 읽은 비밀값을 메모리에 보유하므로 정상적인 최초 전환 rollback 대상이다.
재부팅 후에는 `/run`과 메모리가 사라진다. 별도 host systemd 복구가 새 generation 발행과 active image 재생성을 담당한다.
코드 구현, host 설치, 실패 주입 검증, 실제 VM 재부팅 검증은 서로 다른 완료 항목이다.

## 로컬/PR 검증

```sh
cd backend
./gradlew clean build --no-daemon
cd ../frontend
yarn install --frozen-lockfile
NEXT_PUBLIC_API_BASE_URL=https://example.invalid/api NEXT_PUBLIC_KAKAO_MAP_APP_KEY=test-public-client-id yarn build
cd ..
node --test scripts/vault-compose.test.mjs
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s scripts -p 'test_vault*.py'
bash -n rollback.sh
bash scripts/prune-deployment-images.test.sh
```

PR validation은 secrets 없이 실행한다. 브라우저/OAuth 실로그인, 운영 migration, DB restore, VM 재부팅은 이 테스트에 포함되지 않는다.
Docker Compose env 선택 근거: [Docker 환경 파일 문서](https://docs.docker.com/compose/how-tos/environment-variables/envvars/).

### 2026-09-21 로컬 검증 기록

- Java 21 `clean build`: 212 tests, 0 failures/errors/skips.
- Next.js production build: 성공. 기존 viewport/themeColor metadata 경고, 빌드 설정상 lint 생략은 그대로다.
- Python: 14 PASS / 1 SKIP. 실제 packaged JAR migration은 비밀 파일이 없으면 고정 오류와 exit 1로 종료됨을 확인했다.
- Node Compose/workflow 계약: 3 PASS. shell syntax / 기존 image cleanup tests / diff whitespace 검증 통과.
- 로컬 Docker CLI가 없어 실제 Compose 렌더링과 Docker build/run은 로컬 미검증. PR CI에 해당 검증을 추가했다.
- 읽기 전용 검토에서 나온 rollback 보존, stopped Vault 세대 혼동, cache TRACE 초기화 문제를 수정하고 재검토했다.
- 운영 계정/Secret/IAM/파일 변경, 서비스 재시작, main merge/push, 배포는 실행하지 않았다.

### 2026-09-21 서버 준비 실행 기록

- 기존 Vault에 backend / migration / root-only Redis 관리자 Secret v1 등록. 정확한 Secret ID와 기존 VM egress 조건으로 bundle 조회 IAM 추가.
- 공통 host runtime의 Ilchul profiles, publisher, active-color supervisor, Redis ACL 복원 unit을 PM main에 반영하고 서버에 설치했다. PM 웹앱은 재배포하지 않았다.
- 전용 GID 983, root manifest, 0750/0640 tmpfs generation, 공개 설정과 root 소유 preflight/migration 명령 설치.
- 새 MySQL runtime CRUD / migration DDL·backup 계정 생성. 실제 인증, runtime DDL 거부, 양쪽 시스템 사용자 테이블 조회 거부 확인. 기존 계정 불변.
- 마이그레이션 계정으로 backup 후 네트워크 없는 tmpfs 임시 MySQL에 restore: 18개 테이블, Flyway 260920120100 확인. 임시 컨테이너 제거.
- Redis 앱 계정의 hash/index/draft/list/sorted-set 동작과 다른 prefix·관리 명령 거부 확인. YouTube ACL 복원은 named host administrator로 변경했다.
- **Redis default nopass는 아직 유지한다.** 구 Ilchul/rollback이 사용하므로 앱 전환·인수 검증 뒤 모든 consumer를 확인하고 별도 폐쇄해야 한다. 기존 key 삭제·공유 Redis 재시작 없음.
- MinIO ilchul 전용 계정의 put/get/list/delete, 관리자 API 거부, 다른 버킷 미노출 검증. 기존 root·공개 읽기 정책 불변. 합성 probe 삭제.
- 잘못된 실제 Vault 버전 조회 실패 시 current generation 보존 검증. 앱 GID로 다른 서비스·migration·admin 파일 읽기 거부 확인.
- 별도 mount namespace의 빈 tmpfs에서 실제 Instance Principal로 재발행 성공. publisher 실패 시 재생성 금지·후속 재시도 및 Docker bind 재생성 동작은 분리 검증했다. **실제 VM 재부팅과 실제 Ilchul 앱 복구는 실행하지 않았다.**
- 기존 blue backend/frontend/nginx는 시작 시각과 이미지 변경 없이 healthy 유지. `.env`·Compose·nginx 설정·container inspect는 root-only rollback backup으로 보존했다.
- GitHub production 환경: main만, required reviewer guite95 확인. begae에는 preflight·publisher reload·검증된 migration wrapper만 sudo 허용; 임의 shell/서비스 중지 불허.
- RedisConfig가 username/password를 무시하던 누락을 수정했다. backend 213 tests 및 PR backend/frontend CI 통과.

서버 준비 완료 판정은 `/usr/local/sbin/ilchul-vault-preflight --new-deployment` 실제 성공과
운영자 검증 기록으로 한다. main 병합, production 승인, 앱 전환, 실로그인/refresh/업로드 인수,
구 자격증명 폐기는 사용자가 진행할 후속 단계다. 단일 VM root 위험 및 기존 의존성 취약점은 이 전환만으로 해소되지 않는다.
