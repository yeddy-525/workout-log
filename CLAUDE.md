# 운동기록 앱

두 명이서 쓰는 개인 운동 기록 PWA. YJ(관리자)와 사용자 1명.

## 배포
- GitHub Pages: https://yeddy-525.github.io/workout-log/
- 레포: https://github.com/yeddy-525/workout-log.git

## 기술 스택
- 프론트: `index.html` 단일 파일 SPA (vanilla JS, 탭 구조)
- 백엔드: Google Apps Script (`Code.gs`) — Google Sheets에 저장
- 오프라인: localStorage 우선, GAS는 동기화 용도
- PWA: `sw.js` + `manifest.json`

## GAS 연결
- `apiUrl`은 localStorage `workout_api_url`에 저장 (관리자 설정)
- GAS actions: `saveRoutine`, `saveRecord`, `getAll`
- Google Sheets 시트: `루틴`, `기록`
- GAS URL은 관리자 모드에서만 설정 가능

## 관리자 모드
- 인트로 페이지 하단 `🔐 관리자 모드` 버튼
- 코드: `0525`
- localStorage `workout_is_admin=1` 저장
- 관리자만 루틴 탭에서 앱 설정(GAS URL) 접근 가능

## 주요 기능
- **오늘 탭**: 5분할 루틴에서 오늘 분할 선택 → 세트 체크 → 쉬는날 선택
- **타이머**: 세트 완료 시 자동 시작 (기본 90초), 진동 알림
- **캘린더 탭**: 월별 운동/휴식 기록 확인
- **루틴 탭**: 분할/운동 추가·삭제, 앱 설정(관리자)

## localStorage 키
| 키 | 내용 |
|---|---|
| `workout_user` | 닉네임 |
| `workout_routine` | 루틴 JSON |
| `workout_records` | 날짜별 기록 JSON |
| `workout_api_url` | GAS URL |
| `workout_is_admin` | 관리자 여부 (`1`) |

## 백로그 (논의된 것들)
- GAS + Google Sheets 연결 (아직 YJ가 시트 생성 안 함)
