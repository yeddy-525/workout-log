# 운동기록 앱

두 명이서 쓰는 개인 운동 기록 PWA. YJ(관리자)와 사용자 1명.

## 배포
- GitHub Pages: https://yeddy-525.github.io/workout-log/
- 레포: https://github.com/yeddy-525/workout-log.git

## 기술 스택
- 프론트: `index.html` 단일 파일 SPA (vanilla JS, 탭 구조)
- 백엔드: Google Apps Script (`Code.gs`) — Google Sheets에 저장
- 오프라인: localStorage 우선, GAS는 동기화 용도
- PWA: `sw.js` + `manifest.json`, 아이콘: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`

## GAS 연결
- URL: `https://script.google.com/macros/s/AKfycbz7DmXihUcX7R5ImZgBo0tXAKXtbyp_2PzOR4zHsO_JD0MfJO-BdrBEIF2ySwPyPeTa/exec`
- `apiUrl`은 `API_URL` 상수 + localStorage `workout_api_url` 오버라이드
- GAS actions: `saveRoutine`, `saveRecord`, `getAll`, `getExerciseDB`
- Google Sheets 시트: `루틴`, `기록`, `운동DB`
- `운동DB` 시트: A열 name, B열 category — 처음 호출 시 기본 운동 자동 씨딩
- `cleanupRecords()` — GAS 에디터에서 수동 실행, 기록 시트 중복 행 제거

## GAS 알려진 이슈
- Google Sheets가 날짜 문자열("2026-06-16")을 Date 객체로 자동 변환함
- `dateToKey_()` 함수로 `Asia/Seoul` 기준 포맷 복원
- 프론트에서도 `syncFromRemote` 시 날짜 키를 `YYYY-MM-DD`로 정규화 (방어 처리)

## 관리자 모드
- 코드: `0525`
- 진입 방법 2곳: ① 인트로 페이지 하단 `🔐 관리자 모드` ② 루틴 탭 맨 아래 `🔐 관리자 모드`
- localStorage `workout_is_admin=1` 저장
- 관리자만 루틴 탭에서 앱 설정(GAS URL) 접근 가능

## 반응형
- 520px 이상(PC)에서 480px 너비 중앙 카드 형태로 표시
- bottom-nav, FAB, 타이머, 모달 모두 카드 안에 정렬

## 동기화 로직
- 앱 진입 시 `syncFromRemote()` → GAS에서 루틴+기록 불러와 localStorage 저장 후 현재 탭 재렌더링
- 저장 FAB 클릭 시: 식단 textarea 값 먼저 flush → `syncRoutine()` + `syncRecord()` 호출
- 식단 textarea `onblur`에도 즉시 저장

## 주요 기능

### 오늘 탭
- 루틴에서 분할 선택 → 해당 운동 목록 불러오기
- 쉬는날 선택/해제 토글
- **직접 추가**: 루틴 없이 운동 바로 추가 가능 (운동명 자동완성 포함)
- 세트 완료 체크 → 그 운동에 설정된 휴식 시간으로 타이머 자동 시작
- **식단 기록**: 아침/점심/저녁 텍스트 입력 (항상 표시)
- **저장 버튼**: 플로팅 FAB (오늘 탭에서만 표시), GAS에 동기화

### 타이머
- 운동별 휴식 시간 지정 가능 (기본 60초)
- 세트 완료 시 해당 운동의 휴식 시간으로 자동 시작
- 완료 시 진동 알림

### 캘린더 탭
- 월별 운동/휴식/식단 기록 확인
- 날짜 탭 시 운동 기록 + 식단(아침/점심/저녁) 모두 표시
- 식단만 있는 날도 `식` 태그 표시

### 루틴 탭
- 분할 추가/삭제, 운동 추가/삭제
- 운동 추가 시: 세트/횟수/kg/휴식(초) 레이블 표시, kg 음수 입력 방지
- 운동명 입력 시 운동DB 자동완성 + 목록 버튼(카테고리별 모달)
- 앱 설정 🔐 (관리자만): GAS URL 설정
- 맨 아래 항상: 사용자 변경 + 관리자 모드 전환

## 데이터 구조
```js
// records[날짜]
{
  split: '가슴' | '쉬는날' | '직접' | null,
  exercises: [{ name, sets: [{weight, reps, done}], rest }],
  meals: { breakfast: '', lunch: '', dinner: '' }
}

// routine
{ splits: [{ name, exercises: [{ name, sets, reps, weight, rest }] }] }
```

## localStorage 키
| 키 | 내용 |
|---|---|
| `workout_user` | 닉네임 |
| `workout_routine` | 루틴 JSON |
| `workout_records` | 날짜별 기록 JSON |
| `workout_api_url` | GAS URL 오버라이드 |
| `workout_is_admin` | 관리자 여부 (`1`) |
| `workout_exercise_db` | 운동DB 캐시 (GAS에서 불러온 것) |
