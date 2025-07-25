#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_DIR = process.env.HOME || process.env.USERPROFILE || '/tmp';
const LOG_DIR = path.join(BASE_DIR, 'bigbraincoding.com');

function analyzeTrackingData() {
  console.log('🔍 Big Brain Coding - Tracking Data Analysis');
  console.log('=============================================\n');

  if (!fs.existsSync(LOG_DIR)) {
    console.log('❌ No tracking data found. Make sure tracking is enabled and data is being collected.');
    return;
  }

  // Get all year directories
  const years = fs.readdirSync(LOG_DIR).filter(dir =>
    fs.statSync(path.join(LOG_DIR, dir)).isDirectory() && /^\d{4}$/.test(dir)
  ).sort();

  if (years.length === 0) {
    console.log('❌ No tracking data found in expected directory structure.');
    return;
  }

  console.log(`📊 Found data for years: ${years.join(', ')}\n`);

  // Analyze each year
  years.forEach(year => {
    console.log(`📅 ${year} Analysis:`);
    console.log('─'.repeat(50));

    const yearDir = path.join(LOG_DIR, year);
    const months = fs.readdirSync(yearDir).filter(dir =>
      fs.statSync(path.join(yearDir, dir)).isDirectory() && /^\d{2}$/.test(dir)
    ).sort();

    let yearStats = {
      totalEvents: 0,
      uniqueSessions: new Set(),
      pageViews: 0,
      clicks: 0,
      formSubmissions: 0,
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      browsers: {},
      pages: {},
      averageSessionDuration: 0,
      totalSessionDuration: 0,
      sessionCount: 0
    };

    months.forEach(month => {
      const monthDir = path.join(yearDir, month);
      const days = fs.readdirSync(monthDir).filter(dir =>
        fs.statSync(path.join(monthDir, dir)).isDirectory() && /^\d{2}$/.test(dir)
      ).sort();

      days.forEach(day => {
        const dayDir = path.join(monthDir, day);

        // Read summary file if it exists
        const summaryFile = path.join(dayDir, `${year}-${month}-${day}-summary.json`);
        if (fs.existsSync(summaryFile)) {
          try {
            const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
            yearStats.totalEvents += summary.totalEvents || 0;

            if (summary.uniqueSessions) {
              summary.uniqueSessions.forEach(sessionId => {
                yearStats.uniqueSessions.add(sessionId);
              });
            }
          } catch (error) {
            console.log(`⚠️  Error reading summary for ${year}-${month}-${day}:`, error.message);
          }
        }

        // Analyze individual event files
        const eventFiles = fs.readdirSync(dayDir).filter(file =>
          file.endsWith('.json') && !file.includes('summary')
        );

        eventFiles.forEach(file => {
          try {
            const eventData = JSON.parse(fs.readFileSync(path.join(dayDir, file), 'utf8'));

            // Count event types
            switch (eventData.eventType) {
              case 'pageview':
                yearStats.pageViews++;
                break;
              case 'click':
                yearStats.clicks++;
                break;
              case 'form_submit':
                yearStats.formSubmissions++;
                break;
            }

            // Count devices
            if (eventData.deviceInfo && eventData.deviceInfo.deviceType) {
              yearStats.devices[eventData.deviceInfo.deviceType]++;
            }

            // Count browsers
            if (eventData.deviceInfo && eventData.deviceInfo.browser) {
              yearStats.browsers[eventData.deviceInfo.browser] =
                (yearStats.browsers[eventData.deviceInfo.browser] || 0) + 1;
            }

            // Count pages
            if (eventData.pageUrl) {
              const pagePath = new URL(eventData.pageUrl).pathname;
              yearStats.pages[pagePath] = (yearStats.pages[pagePath] || 0) + 1;
            }

            // Calculate session duration for session_end events
            if (eventData.eventType === 'session_end' && eventData.eventData) {
              yearStats.totalSessionDuration += eventData.eventData.sessionDuration || 0;
              yearStats.sessionCount++;
            }

          } catch (error) {
            console.log(`⚠️  Error reading event file ${file}:`, error.message);
          }
        });
      });
    });

    // Calculate averages
    if (yearStats.sessionCount > 0) {
      yearStats.averageSessionDuration = yearStats.totalSessionDuration / yearStats.sessionCount;
    }

    // Display year statistics
    console.log(`📈 Total Events: ${yearStats.totalEvents.toLocaleString()}`);
    console.log(`👥 Unique Sessions: ${yearStats.uniqueSessions.size.toLocaleString()}`);
    console.log(`📄 Page Views: ${yearStats.pageViews.toLocaleString()}`);
    console.log(`🖱️  Clicks: ${yearStats.clicks.toLocaleString()}`);
    console.log(`📝 Form Submissions: ${yearStats.formSubmissions.toLocaleString()}`);
    console.log(`⏱️  Average Session Duration: ${Math.round(yearStats.averageSessionDuration / 1000)}s`);

    console.log('\n📱 Device Distribution:');
    Object.entries(yearStats.devices).forEach(([device, count]) => {
      const percentage = ((count / yearStats.pageViews) * 100).toFixed(1);
      console.log(`   ${device}: ${count.toLocaleString()} (${percentage}%)`);
    });

    console.log('\n🌐 Browser Distribution:');
    Object.entries(yearStats.browsers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([browser, count]) => {
        const percentage = ((count / yearStats.pageViews) * 100).toFixed(1);
        console.log(`   ${browser}: ${count.toLocaleString()} (${percentage}%)`);
      });

    console.log('\n📄 Top Pages:');
    Object.entries(yearStats.pages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([page, count]) => {
        const percentage = ((count / yearStats.pageViews) * 100).toFixed(1);
        console.log(`   ${page}: ${count.toLocaleString()} views (${percentage}%)`);
      });

    console.log('\n');
  });

  console.log('✅ Analysis complete!');
  console.log('\n💡 Tips:');
  console.log('   - Run this script regularly to monitor trends');
  console.log('   - Check specific dates by examining the log files directly');
  console.log('   - Use the data to optimize your website and marketing strategies');
}

// Run analysis
analyzeTrackingData();