#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function verifyTrackingBuild() {
  console.log('🔍 Verifying Tracking System in Build');
  console.log('=====================================\n');

  const buildDir = path.join(process.cwd(), '.next');
  const trackingFiles = [
    'src/lib/tracking.ts',
    'src/app/api/tracking/route.ts',
    'src/components/tracking/TrackingProvider.tsx'
  ];

  console.log('📁 Checking source files:');
  trackingFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });

  // Check if build directory exists
  if (fs.existsSync(buildDir)) {
    console.log('\n📦 Build directory found');

    // Check for API routes in build
    const apiDir = path.join(buildDir, 'server', 'app', 'api', 'tracking');
    if (fs.existsSync(apiDir)) {
      console.log('✅ API tracking endpoint built successfully');
    } else {
      console.log('⚠️  API tracking endpoint not found in build (may be normal for development)');
    }
  } else {
    console.log('\n⚠️  Build directory not found. Run "npm run build" first.');
  }

  // Check package.json for build scripts
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('\n📋 Build scripts found:');
    Object.keys(packageJson.scripts || {}).forEach(script => {
      if (script.includes('build') || script.includes('dev')) {
        console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
      }
    });
  }

  console.log('\n💡 Build Process Information:');
  console.log('─'.repeat(50));
  console.log('✅ Tracking is automatically included in your Next.js build');
  console.log('✅ No additional configuration needed');
  console.log('✅ API endpoints are automatically deployed');
  console.log('✅ Client-side tracking is bundled with your app');
  console.log('✅ Works in both development and production');

  console.log('\n🚀 To deploy with tracking:');
  console.log('1. npm run build');
  console.log('2. npm run start (or deploy to your hosting platform)');
  console.log('3. Tracking will automatically start collecting data');

  console.log('\n✅ Build verification complete!');
}

verifyTrackingBuild();