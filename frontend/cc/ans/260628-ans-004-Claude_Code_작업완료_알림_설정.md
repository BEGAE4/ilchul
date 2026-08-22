# Claude Code 작업완료 알림 설정 가이드

Claude가 작업을 완료하거나 확인 요청이 발생했을 때, macOS 알림과 소리로 알려주는 훅 설정 방법입니다.

---

## 최종 동작 방식

| 이벤트 | 소리 | 알림 제목 | 알림 내용 | 버튼 |
|--------|------|-----------|-----------|------|
| 작업 완료 (`Stop`) | Glass | `Claude Code ✅ 작업완료` | `프로젝트명: 채팅 제목` | 보기 |
| 확인 요청 (`PermissionRequest`) | Ping | `Claude Code ⚠️ 확인 필요` | `프로젝트명: 채팅 제목` | - |

- **보기** 버튼 클릭 시 Cursor 창이 foreground로 올라옴
- 알림은 30초 후 자동으로 사라짐

---

## 1단계: alerter 설치

```bash
# GitHub 릴리즈에서 다운로드 (Homebrew에는 없음)
curl -L https://github.com/vjeantet/alerter/releases/download/v26.5/alerter-26.5.zip -o /tmp/alerter.zip
unzip -o /tmp/alerter.zip -d /tmp/alerter

# PATH에 복사 (sudo 필요)
sudo cp /tmp/alerter/alerter /usr/local/bin/alerter
sudo chmod +x /usr/local/bin/alerter

# 설치 확인
alerter --version
```

---

## 2단계: Cursor bundle ID 확인

```bash
mdls -name kMDItemCFBundleIdentifier /Applications/Cursor.app
# 결과 예시: com.todesktop.230313mzl4w4u92
```

---

## 3단계: `~/.claude/settings.json` 훅 추가

기존 `settings.json`에 아래 `hooks` 블록을 병합합니다.

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); PROJECT=$(basename \"$PWD\"); TRANSCRIPT=$(echo \"$INPUT\" | jq -r '.transcript_path // \"\"'); CHAT_TITLE=$(grep -o '\"aiTitle\":\"[^\"]*\"' \"$TRANSCRIPT\" 2>/dev/null | tail -1 | sed 's/\"aiTitle\":\"//;s/\"//'); if [ -z \"$CHAT_TITLE\" ]; then CHAT_TITLE=$(echo \"$INPUT\" | jq -r '.last_assistant_message // \"\"' | cut -c1-50); fi; (RESULT=$(alerter --title 'Claude Code ✅ 작업완료' --subtitle \"$PROJECT\" --message \"${CHAT_TITLE:-...}\" --sound 'Glass' --actions '보기' --json --timeout 30 2>/dev/null); echo \"$RESULT\" | grep -q 'actionClicked' && osascript -e 'tell application \"Cursor\" to activate') > /dev/null 2>&1 & disown"
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); PROJECT=$(basename \"$PWD\"); TRANSCRIPT=$(echo \"$INPUT\" | jq -r '.transcript_path // \"\"'); CHAT_TITLE=$(grep -o '\"aiTitle\":\"[^\"]*\"' \"$TRANSCRIPT\" 2>/dev/null | tail -1 | sed 's/\"aiTitle\":\"//;s/\"//'); alerter --title 'Claude Code ⚠️ 확인 필요' --subtitle \"$PROJECT\" --message \"${CHAT_TITLE:-...}\" --sound 'Ping' --timeout 30 > /dev/null 2>&1 & disown"
          }
        ]
      }
    ]
  }
}
```

---

## 동작 원리

### 채팅 제목 추출 방법
Claude Code는 세션 파일(`.jsonl`)에 `aiTitle` 필드로 채팅 제목을 저장합니다.

```
~/.claude/projects/<sanitized-path>/<session_id>.jsonl
```

훅 stdin으로 `transcript_path`가 전달되므로 이를 직접 사용합니다.

- `aiTitle`이 있으면 → 채팅 제목 사용
- 없으면(새 대화) → 마지막 응답 앞 50자 사용

### 프로세스 분리
`& disown`으로 alerter를 완전히 분리해 Claude Code가 훅 완료를 기다리지 않게 합니다.
`--timeout 0` 대신 `--timeout 30`을 사용해 무한 대기 방지.

### 소리
`afplay`와 alerter `--sound`를 동시에 쓰면 소리가 2번 납니다. alerter의 `--sound`만 사용합니다.

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| 알림이 안 뜸 | `--sender` 옵션으로 타 앱 사칭 시 macOS가 차단 | `--sender` 옵션 제거 |
| 소리가 2번 남 | `afplay` + `alerter --sound` 중복 | `afplay` 제거 |
| Claude Code가 계속 실행 중 상태 | `--timeout 0 &`으로 자식 프로세스 미분리 | `& disown` + `--timeout 30` 사용 |
| 채팅 제목 안 뜸 | 새 대화라 `aiTitle` 미생성 | `last_assistant_message` fallback으로 자동 처리 |
