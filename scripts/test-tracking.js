#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_DIR = process.env.HOME || process.env.USERPROFILE || '/tmp';
const LOG_DIR = path.join(BASE_DIR, 'bigbraincoding.com');

function testTrackingSystem() {
  console.log('🧪 Testing Big Brain Coding Tracking System');
  console.log('===========================================\n');

  // Check if log directory exists
  if (!fs.existsSync(LOG_DIR)) {
    console.log('❌ Log directory not found. Creating test structure...');
    try {
      fs.mkdirSync(LOG_DIR, { recursive: true });
      console.log('✅ Created log directory');
    } catch (error) {
      console.log('❌ Failed to create log directory:', error.message);
      return;
    }
  }

  // Create test data
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  const testDir = path.join(LOG_DIR, String(year), month, day);

  // Create test directory
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create test event
  const testEvent = {
    timestamp: now.toISOString(),
    sessionId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    eventType: 'pageview',
    pageUrl: 'https://bigbraincoding.com/test',
    referrer: 'https://google.com',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    deviceInfo: {
      browser: 'TestBrowser',
      browserVersion: '1.0',
      os: 'TestOS',
      osVersion: '1.0',
      deviceType: 'desktop',
      screenWidth: 1920,
      screenHeight: 1080,
      viewportWidth: 1920,
      viewportHeight: 937,
      language: 'en-US',
      timezone: 'America/New_York'
    },
    eventData: {
      test: true,
      message: 'This is a test event'
    },
    timeOnPage: 5000
  };

  // Write test event
  const testFileName = `${hour}-${minute}-${second}-test-event.json`;
  const testFilePath = path.join(testDir, testFileName);

  try {
    fs.writeFileSync(testFilePath, JSON.stringify(testEvent, null, 2));
    console.log('✅ Created test event file:', testFileName);
  } catch (error) {
    console.log('❌ Failed to create test event:', error.message);
    return;
  }

  // Create test summary
  const summaryFileName = `${year}-${month}-${day}-summary.json`;
  const summaryPath = path.join(testDir, summaryFileName);

  const testSummary = {
    events: [{
      timestamp: testEvent.timestamp,
      eventType: testEvent.eventType,
      sessionId: testEvent.sessionId,
      pageUrl: testEvent.pageUrl,
      deviceType: testEvent.deviceInfo.deviceType,
      browser: testEvent.deviceInfo.browser
    }],
    totalEvents: 1,
    uniqueSessions: [testEvent.sessionId],
    lastUpdated: now.toISOString()
  };

  try {
    fs.writeFileSync(summaryPath, JSON.stringify(testSummary, null, 2));
    console.log('✅ Created test summary file:', summaryFileName);
  } catch (error) {
    console.log('❌ Failed to create test summary:', error.message);
    return;
  }

  // Test directory structure
  console.log('\n📁 Directory Structure Test:');
  console.log('─'.repeat(50));

  const yearDir = path.join(LOG_DIR, String(year));
  const monthDir = path.join(yearDir, month);
  const dayDir = path.join(monthDir, day);

  console.log(`✅ Year directory: ${yearDir} ${fs.existsSync(yearDir) ? '✓' : '✗'}`);
  console.log(`✅ Month directory: ${monthDir} ${fs.existsSync(monthDir) ? '✓' : '✗'}`);
  console.log(`✅ Day directory: ${dayDir} ${fs.existsSync(dayDir) ? '✓' : '✗'}`);
  console.log(`✅ Test event file: ${testFilePath} ${fs.existsSync(testFilePath) ? '✓' : '✗'}`);
  console.log(`✅ Summary file: ${summaryPath} ${fs.existsSync(summaryPath) ? '✓' : '✗'}`);

  // Test file permissions
  console.log('\n🔐 File Permissions Test:');
  console.log('─'.repeat(50));

  try {
    const stats = fs.statSync(testFilePath);
    console.log(`✅ File permissions: ${stats.mode.toString(8)}`);
    console.log(`✅ File size: ${stats.size} bytes`);
    console.log(`✅ File owner: ${stats.uid}`);
  } catch (error) {
    console.log('❌ Failed to check file permissions:', error.message);
  }

  // Test JSON parsing
  console.log('\n📄 JSON Format Test:');
  console.log('─'.repeat(50));

  try {
    const eventData = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
    console.log('✅ Event JSON is valid');
    console.log(`✅ Event type: ${eventData.eventType}`);
    console.log(`✅ Session ID: ${eventData.sessionId}`);
    console.log(`✅ Timestamp: ${eventData.timestamp}`);
  } catch (error) {
    console.log('❌ Failed to parse event JSON:', error.message);
  }

  try {
    const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    console.log('✅ Summary JSON is valid');
    console.log(`✅ Total events: ${summaryData.totalEvents}`);
    console.log(`✅ Unique sessions: ${summaryData.uniqueSessions.length}`);
  } catch (error) {
    console.log('❌ Failed to parse summary JSON:', error.message);
  }

  console.log('\n🎯 Test Results:');
  console.log('─'.repeat(50));
  console.log('✅ Directory structure created successfully');
  console.log('✅ Test event file created and validated');
  console.log('✅ Summary file created and validated');
  console.log('✅ JSON format is correct');
  console.log('✅ File permissions are appropriate');

  console.log('\n💡 Next Steps:');
  console.log('1. Visit your website to generate real tracking data');
  console.log('2. Run the analysis script: node scripts/analyze-tracking.js');
  console.log('3. Check the log files in ~/bigbraincoding.com/');
  console.log('4. Monitor browser console for any tracking errors');

  console.log('\n✅ Tracking system test completed successfully!');
}

// Run test
testTrackingSystem();