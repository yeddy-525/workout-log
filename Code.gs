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

function saveRecord_(user, date, split, data) {
  if (!user || !date) return { ok: false, error: 'missing params' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('기록');
  if (!sheet) { sheet = ss.insertSheet('기록'); sheet.appendRow(['user','date','split','data','updatedAt']); }
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === user && String(rows[i][1]) === date) {
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
        try { records[String(rows[i][1])] = JSON.parse(rows[i][3]); } catch(e) {}
      }
    }
  }
  return { ok: true, routine, records };
}

function getExerciseDB_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('운동DB');
  if (!sheet) {
    sheet = ss.insertSheet('운동DB');
    sheet.appendRow(['name', 'category']);
    return { ok: true, exercises: [] };
  }
  const rows = sheet.getDataRange().getValues();
  const exercises = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]) exercises.push({ name: String(rows[i][0]), category: String(rows[i][1] || '') });
  }
  return { ok: true, exercises };
}
