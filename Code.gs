function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  try {
    const action = e.parameter.action;
    const user = e.parameter.user;
    if (action === 'saveRoutine') {
      output.setContent(JSON.stringify(saveRoutine_(user, e.parameter.data)));
    } else if (action === 'saveRecord') {
      output.setContent(JSON.stringify(saveRecord_(user, e.parameter.date, e.parameter.split, e.parameter.data)));
    } else if (action === 'getAll') {
      output.setContent(JSON.stringify(getAll_(user)));
    } else if (action === 'getExerciseDB') {
      output.setContent(JSON.stringify(getExerciseDB_()));
    } else {
      output.setContent(JSON.stringify({ error: 'unknown action' }));
    }
  } catch(err) {
    output.setContent(JSON.stringify({ error: err.toString() }));
  }
  return output;
}

function saveRoutine_(user, data) {
  if (!user || !data) return { ok: false, error: 'missing params' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('루틴');
  if (!sheet) { sheet = ss.insertSheet('루틴'); sheet.appendRow(['user','data','updatedAt']); }
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === user) {
      sheet.getRange(i+1, 2).setValue(data);
      sheet.getRange(i+1, 3).setValue(new Date().toISOString());
      return { ok: true };
    }
  }
  sheet.appendRow([user, data, new Date().toISOString()]);
  return { ok: true };
}

function dateToKey_(val) {
  if (val instanceof Date) return Utilities.formatDate(val, 'Asia/Seoul', 'yyyy-MM-dd');
  return String(val);
}

function saveRecord_(user, date, split, data) {
  if (!user || !date) return { ok: false, error: 'missing params' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('기록');
  if (!sheet) { sheet = ss.insertSheet('기록'); sheet.appendRow(['user','date','split','data','updatedAt']); }
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === user && dateToKey_(rows[i][1]) === date) {
      sheet.getRange(i+1, 3).setValue(split);
      sheet.getRange(i+1, 4).setValue(data);
      sheet.getRange(i+1, 5).setValue(new Date().toISOString());
      return { ok: true };
    }
  }
  sheet.appendRow([user, date, split, data, new Date().toISOString()]);
  return { ok: true };
}

function getAll_(user) {
  if (!user) return { ok: false, error: 'missing user' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let routine = null;
  const routineSheet = ss.getSheetByName('루틴');
  if (routineSheet) {
    const rows = routineSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === user) { routine = rows[i][1]; break; }
    }
  }
  const records = {};
  const recSheet = ss.getSheetByName('기록');
  if (recSheet) {
    const rows = recSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === user) {
        try { records[dateToKey_(rows[i][1])] = JSON.parse(rows[i][3]); } catch(e) {}
      }
    }
  }
  return { ok: true, routine, records };
}

// 기록 시트 중복 행 정리 - GAS 에디터에서 수동 실행
function cleanupRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('기록');
  if (!sheet) return;
  const rows = sheet.getDataRange().getValues();
  const seen = {};
  const toDelete = [];
  for (let i = rows.length - 1; i >= 1; i--) {
    const key = rows[i][0] + '|' + dateToKey_(rows[i][1]);
    if (seen[key]) {
      toDelete.push(i + 1);
    } else {
      seen[key] = true;
    }
  }
  toDelete.forEach(r => sheet.deleteRow(r));
  return { deleted: toDelete.length };
}

function getExerciseDB_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('운동DB');
  if (!sheet) { sheet = ss.insertSheet('운동DB'); sheet.appendRow(['name', 'category']); }
  if (sheet.getLastRow() <= 1) {
    const defaults = [
      ['벤치프레스','가슴'],['인클라인 벤치프레스','가슴'],['딥스','가슴'],['덤벨 플라이','가슴'],['케이블 크로스오버','가슴'],['펙덱 플라이','가슴'],['푸시업','가슴'],['인클라인 덤벨 플라이','가슴'],
      ['데드리프트','등'],['랫풀다운','등'],['바벨 로우','등'],['덤벨 로우','등'],['시티드 케이블 로우','등'],['풀업','등'],['티바 로우','등'],['원암 덤벨 로우','등'],['페이스풀','등'],
      ['밀리터리 프레스','어깨'],['덤벨 숄더프레스','어깨'],['사이드 레터럴 레이즈','어깨'],['프론트 레이즈','어깨'],['리어 델트 플라이','어깨'],['아놀드 프레스','어깨'],['업라이트 로우','어깨'],['케이블 레터럴 레이즈','어깨'],
      ['바벨 컬','이두'],['덤벨 컬','이두'],['해머 컬','이두'],['케이블 컬','이두'],['인클라인 덤벨 컬','이두'],['컨센트레이션 컬','이두'],['프리처 컬','이두'],
      ['트라이셉스 푸시다운','삼두'],['라잉 트라이셉스 익스텐션','삼두'],['오버헤드 익스텐션','삼두'],['딥스','삼두'],['킥백','삼두'],['클로즈그립 벤치프레스','삼두'],
      ['스쿼트','하체'],['레그프레스','하체'],['레그 익스텐션','하체'],['레그 컬','하체'],['런지','하체'],['불가리안 스플릿 스쿼트','하체'],['힙 쓰러스트','하체'],['카프 레이즈','하체'],['루마니안 데드리프트','하체'],['핵 스쿼트','하체'],
      ['크런치','복근'],['레그레이즈','복근'],['플랭크','복근'],['케이블 크런치','복근'],['싯업','복근'],['AB 롤아웃','복근'],['바이시클 크런치','복근'],
      ['러닝머신','유산소'],['사이클','유산소'],['로잉머신','유산소'],['버피','유산소'],['줄넘기','유산소'],['스텝밀','유산소'],
    ];
    defaults.forEach(row => sheet.appendRow(row));
  }
  const rows = sheet.getDataRange().getValues();
  const exercises = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]) exercises.push({ name: String(rows[i][0]), category: String(rows[i][1] || '') });
  }
  return { ok: true, exercises };
}
