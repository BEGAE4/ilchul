# Ilchul Vault 전환 설계

사용자 승인: 2026-09-21. 현재 checkout에서 최신 main을 기준으로 새 브랜치 → 초안 PR.
main 직접 push, PR merge, 운영 계정/Secret 변경, 배포는 이 단계에 포함하지 않는다.

## 경계

- 기존 OCI 단일 VM, blue/green, private shared-infra 네트워크를 유지한다.
- 호스트 Instance Principal만 정확히 지정된 OCI Secret 버전을 읽는다. 앱의 metadata 접근은 계속 차단한다.
- 호스트 공통 publisher가 `/run/oci-service-secrets/ilchul-backend/current/CONFIG_JSON`을 발행한다.
  부모/세대 디렉터리 0750, 파일 0640, root 소유, 전용 GID. 컨테이너에는 해당 서비스 디렉터리만 read-only mount한다.
- 앱은 시작 시 하나의 세대를 읽는다. 누락/잘못된 권한/형식이면 환경변수로 fallback하지 않고 실패한다.
- JWT/OAuth/API 기존 값은 보존한다. 새 DB/Redis/MinIO 서비스 계정은 별도 운영 단계에서 생성한다.
- 프론트엔드는 공개 설정만 받는다. MYSQL_ROOT_PASSWORD 및 migration 비밀값은 backend에 전달하지 않는다.
- 단일 VM root 침해까지 격리하지는 못한다. 새 VM/유료 리소스/장기 cloud key는 만들지 않는다.

## 애플리케이션

Compose는 `ILCHUL_RUNTIME_MODE=vault`를 고정한다. JSON은 허용된 비밀 필드만 포함한다.
Spring property source가 기존 placeholder를 채우고 Redis username/password를 함께 설정한다.
S3Client와 S3Presigner는 동일한 명시적 자격증명 provider를 사용한다. Vault 모드에서는 AWS SDK 기본 체인/metadata로 fallback하지 않는다.
일반 앱 Flyway는 강제로 비활성화하고 JPA DDL은 none이다. migration은 동일 immutable backend image의 별도 CLI 모드만 사용한다.

## 배포

main merge 시 자동 배포라는 기존 규칙은 유지한다. 운영 job은 production environment와
root 소유 호스트 준비 상태 검사로 보호한다. GitHub ENV_FILE/CLAUDE_API_KEY → .env 재생성을 없앤다.
배포용 .env에는 검증된 공개 설정과 이미지 참조만 남긴다. 서버 준비 전에는 어떤 컨테이너도 교체하지 않는다.
publisher는 start/reload를 사용하며 restart하지 않는다. 실패하면 기존 컨테이너와 세대가 유지된다.
호스트 migration 작업은 root-only 별도 Secret, DB backup, 배타 lock, 제한된 일회용 container를 사용한다.
실패하면 target 시작/traffic 전환을 하지 않는다. 새 SQL migration이나 운영 DDL은 이번 PR에 없다.

비활성 색상 시작 → backend/frontend health → gateway/auth smoke → traffic 전환.
기존 색상은 최초 전환 검증 동안 유지한다. 로그인/refresh/업로드/삭제까지 운영자가 확인한 뒤 중지·계정 폐기한다.
rollback은 기존 컨테이너를 start하고 원래 이미지/환경을 보존한다. 최신 Compose로 재생성하지 않는다.
이전 secret generation은 rollback 경계가 닫힐 때까지 삭제하지 않는다.

## 별도 호스트 준비와 병합 조건

공통 publisher의 ilchul-backend/ilchul-migration profile, 정확한 Secret IAM, root manifests,
전용 GID, startup systemd gate, 백업 권한, root 소유 migration executable을 먼저 준비한다.
앱 restart policy는 no이며 systemd가 publisher 성공 뒤에만 앱을 재시작해야 한다.
재부팅은 실행하지 않고 recovery/reload 실패 검증을 별도 수행한다.

Redis의 default nopass를 즉시 끄지 않는다. Ilchul key/command 목록과 모든 consumer를 조사하고,
YouTube ACL reconciler를 host-only admin 인증으로 바꾼 뒤 함께 전환한다. 기존 refresh/draft/cache key를 삭제하지 않는다.
MinIO 공개 읽기 policy는 호스트 관리 작업으로 검증하며 앱 배포에서 root 자격증명을 꺼내 쓰지 않는다.
GitHub production environment 승인 설정은 API/관리 화면에서 실제 확인하기 전에는 보호됨으로 간주하지 않는다.

## 검증

파일 loader 실패/권한/JSON/우선순위, S3 provider, migration 분리, preflight fail-closed,
Compose 공개 env/mount/restart contract, backend 전체 test/build, frontend build, shell syntax와 image cleanup tests.
CI와 운영 검증은 분리한다. 초안 PR에는 미실행 운영 조건을 명시하며 자동 merge를 설정하지 않는다.
