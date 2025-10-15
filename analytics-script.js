// Google Apps Script 代码 - 网站访问统计系统
// Spreadsheet ID: 1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4

function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById('1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4');
    const data = JSON.parse(e.postData.contents);
    const eventType = data.eventType || 'page_visit';
    
    if (eventType === 'ad_guide_triggered') {
      handleAdGuideEvent(spreadsheet, data);
    } else {
      handlePageVisitEvent(spreadsheet, data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Error:', error);
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Analytics endpoint is working!').setMimeType(ContentService.MimeType.TEXT);
}


// ==================== 广告引导事件处理 ====================

function handleAdGuideEvent(spreadsheet, data) {
  const dateString = getDateString();
  const adGuideSheet = getOrCreateAdGuideSheet(spreadsheet, dateString);
  
  const rowData = [
    getTimeString(),              // 时间
    data.page || '',              // 访问页面
    data.userAgent || '',         // 用户属性
    data.referrer || '',          // 来源页面
    data.userIP || 'Unknown',     // IP地址
    data.totalAdsSeen || 0,       // 累计广告数
    data.currentPageAds || 0,     // 当前页广告数
    data.timestamp || ''          // 事件时间戳
  ];
  
  adGuideSheet.appendRow(rowData);
  console.log('广告引导事件已记录');
}

function getOrCreateAdGuideSheet(spreadsheet, dateString) {
  const sheetName = `广告引导-${dateString}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, 8).setValues([
      ['时间', '访问页面', '用户属性', '来源页面', 'IP地址', '累计广告数', '当前页广告数', '事件时间戳']
    ]);
    
    const headerRange = sheet.getRange(1, 1, 1, 8);
    headerRange.setBackground('#FF6B6B').setFontColor('white').setFontWeight('bold');
    
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 300);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(4, 200);
    sheet.setColumnWidth(5, 120);
    sheet.setColumnWidth(6, 100);
    sheet.setColumnWidth(7, 120);
    sheet.setColumnWidth(8, 180);
  }
  
  return sheet;
}

// ==================== 页面访问事件处理 ====================

function handlePageVisitEvent(spreadsheet, data) {
  const dateString = getDateString();
  const todaySheet = getOrCreateDailySheet(spreadsheet, dateString);
  
  const rowData = [
    getTimeString(),              // 时间
    data.page || '',              // 访问页面
    data.userAgent || '',         // 用户属性
    data.referrer || '',          // 来源页面
    data.userIP || 'Unknown'      // IP地址
  ];
  
  todaySheet.appendRow(rowData);
  
  // 1%概率执行统计更新
  if (Math.random() < 0.01) {
    updateDashboard(spreadsheet, dateString);
    cleanupOldSheets(spreadsheet);
    updateStatisticsTable(spreadsheet);
  }
}

function getOrCreateDailySheet(spreadsheet, dateString) {
  const sheetName = `详细-${dateString}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, 5).setValues([
      ['时间', '访问页面', '用户属性', '来源页面', 'IP地址']
    ]);
    
    const headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setBackground('#4285f4').setFontColor('white').setFontWeight('bold');
  }
  
  return sheet;
}

// ==================== 工具函数 ====================

function getDateString() {
  return new Date().toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
}

function getTimeString() {
  return new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// ==================== 控制台统计 ====================

function updateDashboard(spreadsheet, currentDate) {
  try {
    let dashboardSheet = spreadsheet.getSheetByName('📊控制台');
    if (!dashboardSheet) {
      dashboardSheet = spreadsheet.insertSheet('📊控制台', 0);
      initializeDashboard(dashboardSheet);
    }
    
    const todaySheet = spreadsheet.getSheetByName(`详细-${currentDate}`);
    if (todaySheet) {
      const rowCount = Math.max(0, todaySheet.getDataRange().getNumRows() - 1);
      dashboardSheet.getRange(2, 2).setValue(rowCount);
      dashboardSheet.getRange(2, 3).setValue(new Date());
    }
    
    updateTotalStats(spreadsheet, dashboardSheet);
  } catch (error) {
    console.error('更新控制台失败:', error);
  }
}

function initializeDashboard(sheet) {
  sheet.getRange(1, 1, 1, 5).merge();
  sheet.getRange(1, 1).setValue('📊 网站访问统计控制台');
  
  const headers = [
    ['统计项目', '数值', '最后更新', '说明', ''],
    ['今日访问量', 0, '', '当天的访问次数', ''],
    ['总访问量', 0, '', '所有详细记录的总数', ''],
    ['活跃天数', 0, '', '有访问记录的天数', ''],
    ['平均日访问', 0, '', '每日平均访问量', '']
  ];
  
  sheet.getRange(2, 1, headers.length, 5).setValues(headers);
  sheet.getRange(1, 1).setBackground('#1a73e8').setFontColor('white').setFontSize(14).setFontWeight('bold');
  sheet.getRange(2, 1, 1, 5).setBackground('#4285f4').setFontColor('white').setFontWeight('bold');
}

function updateTotalStats(spreadsheet, dashboardSheet) {
  const sheets = spreadsheet.getSheets();
  let totalVisits = 0;
  let activeDays = 0;
  
  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (sheetName.startsWith('详细-')) {
      const rowCount = Math.max(0, sheet.getDataRange().getNumRows() - 1);
      totalVisits += rowCount;
      if (rowCount > 0) activeDays++;
    }
  });
  
  dashboardSheet.getRange(3, 2).setValue(totalVisits);
  dashboardSheet.getRange(4, 2).setValue(activeDays);
  dashboardSheet.getRange(5, 2).setValue(activeDays > 0 ? Math.round(totalVisits / activeDays) : 0);
  
  const updateTime = new Date();
  dashboardSheet.getRange(3, 3).setValue(updateTime);
  dashboardSheet.getRange(4, 3).setValue(updateTime);
  dashboardSheet.getRange(5, 3).setValue(updateTime);
}

// ==================== 数据清理 ====================

function cleanupOldSheets(spreadsheet) {
  try {
    const sheets = spreadsheet.getSheets();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    sheets.forEach(sheet => {
      const sheetName = sheet.getName();
      if (sheetName.startsWith('详细-')) {
        const dateStr = sheetName.replace('详细-', '');
        const sheetDate = new Date(dateStr);
        
        if (sheetDate < cutoffDate) {
          console.log(`删除过期数据表: ${sheetName}`);
          spreadsheet.deleteSheet(sheet);
        }
      }
    });
  } catch (error) {
    console.error('清理旧数据失败:', error);
  }
}

function manualCleanup() {
  const spreadsheet = SpreadsheetApp.openById('1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4');
  cleanupOldSheets(spreadsheet);
  updateDashboard(spreadsheet, getDateString());
  return '数据清理完成';
}

// ==================== 统计汇总表 ====================

function updateStatisticsTable(spreadsheet) {
  try {
    let statsSheet = spreadsheet.getSheetByName('📈统计汇总表');
    if (!statsSheet) {
      statsSheet = spreadsheet.insertSheet('📈统计汇总表', 1);
      initializeStatisticsTable(statsSheet);
    }
    
    const today = new Date().toLocaleDateString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      month: 'numeric',
      day: 'numeric'
    });
    const todayLabel = `${today.split('/')[0]}月${today.split('/')[1]}日`;
    const todayStats = generateDailyStatistics(spreadsheet, todayLabel);
    
    updateStatsInTable(statsSheet, todayStats, todayLabel);
  } catch (error) {
    console.error('更新统计汇总表失败:', error);
  }
}

function initializeStatisticsTable(sheet) {
  sheet.getRange(1, 1, 1, 5).merge();
  sheet.getRange(1, 1).setValue('📈 网站访问统计汇总表');
  
  sheet.getRange(2, 1, 1, 5).setValues([
    ['时间', '域名来源', '书籍名称', '累计章节', '累计IP数量（去重）']
  ]);
  
  sheet.getRange(1, 1).setBackground('#1a73e8').setFontColor('white').setFontSize(14).setFontWeight('bold');
  sheet.getRange(2, 1, 1, 5).setBackground('#4285f4').setFontColor('white').setFontWeight('bold');
  
  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 300);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 120);
}

function generateDailyStatistics(spreadsheet, dateLabel) {
  const todaySheetName = `详细-${getDateString()}`;
  const todaySheet = spreadsheet.getSheetByName(todaySheetName);
  
  if (!todaySheet) {
    console.log('未找到今日数据表:', todaySheetName);
    return [];
  }
  
  const stats = {};
  const values = todaySheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const pageUrl = row[1] || '';
    const userIP = row[4] || '';
    
    if (!pageUrl || !userIP) continue;
    
    const urlInfo = parsePageUrl(pageUrl);
    if (!urlInfo) continue;
    
    const { domain, bookName, isChapter } = urlInfo;
    const key = `${domain}|${bookName}`;
    
    if (!stats[key]) {
      stats[key] = {
        domain: domain,
        bookName: bookName,
        chapterCount: 0,
        ipSet: new Set()
      };
    }
    
    if (isChapter) {
      stats[key].chapterCount++;
    }
    
    if (userIP && userIP !== 'Unknown' && userIP !== 'Error') {
      stats[key].ipSet.add(userIP);
    }
  }
  
  const result = [];
  for (const key in stats) {
    const stat = stats[key];
    result.push([
      dateLabel,
      stat.domain,
      stat.bookName,
      stat.chapterCount,
      stat.ipSet.size
    ]);
  }
  
  return result;
}

function parsePageUrl(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    const novelMatch = path.match(/\/novels\/([^\/]+)/);
    if (!novelMatch) return null;
    
    const bookName = novelMatch[1];
    const isChapter = path.includes('/chapter-');
    
    return { domain, bookName, isChapter };
  } catch (error) {
    console.error('URL解析失败:', url, error);
    return null;
  }
}

function updateStatsInTable(sheet, newStats, dateLabel) {
  if (!newStats || newStats.length === 0) {
    console.log('没有新的统计数据需要更新');
    return;
  }
  
  const dataRange = sheet.getDataRange();
  const existingData = dataRange.getNumRows() > 2 ? dataRange.getValues().slice(2) : [];
  const nonTodayData = existingData.filter(row => row[0] !== dateLabel);
  const allData = [...nonTodayData, ...newStats];
  
  if (dataRange.getNumRows() > 2) {
    sheet.getRange(3, 1, dataRange.getNumRows() - 2, 5).clear();
  }
  
  if (allData.length > 0) {
    sheet.getRange(3, 1, allData.length, 5).setValues(allData);
  }
  
  const lastRow = sheet.getLastRow() + 2;
  sheet.getRange(lastRow, 1, 1, 5).merge();
  sheet.getRange(lastRow, 1).setValue(`最后更新时间: ${getTimeString()}`);
  sheet.getRange(lastRow, 1).setFontStyle('italic').setFontColor('#666666');
  
  console.log(`统计表更新完成，共 ${allData.length} 条记录`);
}

function hourlyStatisticsUpdate() {
  const spreadsheet = SpreadsheetApp.openById('1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4');
  updateStatisticsTable(spreadsheet);
  return '每小时统计更新完成';
}

function manualStatisticsUpdate() {
  const spreadsheet = SpreadsheetApp.openById('1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4');
  updateStatisticsTable(spreadsheet);
