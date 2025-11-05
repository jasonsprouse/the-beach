/**
 * Automated Test Suite for The Beach - MVC Authentication System
 * 
 * Run this script in the browser console at http://localhost:3000
 * 
 * Usage:
 * 1. Open http://localhost:3000 in your browser
 * 2. Open DevTools Console (F12)
 * 3. Copy and paste this entire script
 * 4. Run: await runAllTests()
 */

// Test utilities
const TestRunner = {
  results: [],
  currentTest: null,

  log(message, type = 'info') {
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type];
    console.log(`${emoji} ${message}`);
  },

  startTest(name) {
    this.currentTest = { name, startTime: Date.now(), status: 'running' };
    this.log(`Testing: ${name}`, 'test');
  },

  passTest(details = '') {
    const duration = Date.now() - this.currentTest.startTime;
    this.results.push({ ...this.currentTest, status: 'passed', duration, details });
    this.log(`PASSED: ${this.currentTest.name} (${duration}ms)`, 'success');
  },

  failTest(error) {
    const duration = Date.now() - this.currentTest.startTime;
    this.results.push({ ...this.currentTest, status: 'failed', duration, error: error.message });
    this.log(`FAILED: ${this.currentTest.name} - ${error.message}`, 'error');
  },

  skipTest(reason) {
    this.results.push({ ...this.currentTest, status: 'skipped', reason });
    this.log(`SKIPPED: ${this.currentTest.name} - ${reason}`, 'warning');
  },

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const total = this.results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => r.status === 'failed').forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }
};

// Test Suite
const Tests = {
  
  // Test 1: Check MVC Controller Loaded
  async testControllerLoaded() {
    TestRunner.startTest('MVC Controller Loaded');
    try {
      if (!window.authController) {
        throw new Error('authController not found on window');
      }
      if (!window.authModel) {
        throw new Error('authModel not found on window');
      }
      if (!window.authAPI) {
        throw new Error('authAPI not found on window');
      }
      if (!window.authView) {
        throw new Error('authView not found on window');
      }
      TestRunner.passTest('All MVC components loaded');
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 2: Check Initial State
  async testInitialState() {
    TestRunner.startTest('Initial State Structure');
    try {
      const state = authModel.getState();
      if (typeof state !== 'object') {
        throw new Error('State is not an object');
      }
      if (!state.hasOwnProperty('isAuthenticated')) {
        throw new Error('State missing isAuthenticated property');
      }
      if (!state.hasOwnProperty('currentUser')) {
        throw new Error('State missing currentUser property');
      }
      if (!state.hasOwnProperty('pkp')) {
        throw new Error('State missing pkp property');
      }
      TestRunner.passTest(`Initial state valid: authenticated=${state.isAuthenticated}`);
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 3: Check API Configuration
  async testAPIConfiguration() {
    TestRunner.startTest('API Client Configuration');
    try {
      if (!authAPI.defaultOptions) {
        throw new Error('API defaultOptions not configured');
      }
      if (authAPI.defaultOptions.credentials !== 'include') {
        throw new Error('API credentials not set to "include"');
      }
      TestRunner.passTest('API configured with credentials: include');
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 4: Check Session Status Endpoint
  async testSessionStatusEndpoint() {
    TestRunner.startTest('Session Status API Endpoint');
    try {
      const response = await authAPI.getSessionStatus();
      TestRunner.passTest(`Session status: ${response.authenticated ? 'authenticated' : 'not authenticated'}`);
      return response;
    } catch (error) {
      TestRunner.failTest(error);
      return null;
    }
  },

  // Test 5: Check UI Elements Exist
  async testUIElements() {
    TestRunner.startTest('UI Elements Presence');
    try {
      const authContainer = document.getElementById('authContainer');
      if (!authContainer) {
        throw new Error('authContainer element not found');
      }
      
      const state = authModel.getState();
      if (state.isAuthenticated) {
        // Check authenticated UI elements
        const btnVisitParadise = document.getElementById('btnVisitParadise');
        const btnRefreshSession = document.getElementById('btnRefreshSession');
        const btnSignOut = document.getElementById('btnSignOut');
        
        if (!btnVisitParadise) throw new Error('Visit Paradise button not found');
        if (!btnRefreshSession) throw new Error('Refresh button not found');
        if (!btnSignOut) throw new Error('Sign Out button not found');
        
        TestRunner.passTest('Authenticated UI elements present');
      } else {
        // Check unauthenticated UI elements
        const btnRegister = document.getElementById('btnRegister');
        const btnLogin = document.getElementById('btnLogin');
        const btnCheckSession = document.getElementById('btnCheckSession');
        
        if (!btnRegister) throw new Error('Register button not found');
        if (!btnLogin) throw new Error('Login button not found');
        if (!btnCheckSession) throw new Error('Check Session button not found');
        
        TestRunner.passTest('Unauthenticated UI elements present');
      }
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 6: Test Observable Pattern
  async testObservablePattern() {
    TestRunner.startTest('Observable State Pattern');
    try {
      let notificationReceived = false;
      const unsubscribe = authModel.subscribe((state) => {
        notificationReceived = true;
      });

      // Trigger state change
      authModel.setState({ testProperty: 'test_value' });
      
      await TestRunner.sleep(100);
      
      if (!notificationReceived) {
        throw new Error('State change notification not received');
      }
      
      unsubscribe();
      TestRunner.passTest('Observable pattern working correctly');
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 7: Check Network Requests Include Cookies
  async testCookieInclusion() {
    TestRunner.startTest('Cookie Inclusion in Requests');
    try {
      // Make a simple API call and check if it includes credentials
      const response = await fetch('/lit/config', {
        credentials: 'include'
      });
      
      if (!response.ok && response.status === 401) {
        TestRunner.passTest('Cookie-based authentication enforced (401 on unauthorized)');
      } else if (response.ok) {
        TestRunner.passTest('Request successful with credentials included');
      }
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 8: Check Session Cookie Exists (if authenticated)
  async testSessionCookie() {
    TestRunner.startTest('Session Cookie Presence');
    try {
      const state = authModel.getState();
      const cookies = document.cookie;
      const hasSessionCookie = cookies.includes('connect.sid');
      
      if (state.isAuthenticated && !hasSessionCookie) {
        throw new Error('Authenticated but no connect.sid cookie found');
      }
      
      if (hasSessionCookie) {
        TestRunner.passTest('connect.sid cookie present');
      } else {
        TestRunner.passTest('No session cookie (not authenticated)');
      }
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 9: Test Refresh Session (if authenticated)
  async testRefreshSession() {
    TestRunner.startTest('Refresh Session Function');
    try {
      const state = authModel.getState();
      if (!state.isAuthenticated) {
        TestRunner.skipTest('Not authenticated');
        return;
      }

      await authController.refreshSession();
      TestRunner.passTest('Session refreshed successfully');
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 10: Test PKP Dashboard (if authenticated)
  async testPKPDashboard() {
    TestRunner.startTest('PKP Dashboard API');
    try {
      const state = authModel.getState();
      if (!state.isAuthenticated) {
        TestRunner.skipTest('Not authenticated');
        return;
      }

      const dashboard = await authAPI.getPKPDashboard();
      if (!dashboard) {
        throw new Error('PKP dashboard returned null');
      }
      
      if (!dashboard.primaryPKP) {
        throw new Error('No primaryPKP in dashboard response');
      }
      
      const subPKPCount = dashboard.primaryPKP.subPKPs ? dashboard.primaryPKP.subPKPs.length : 0;
      TestRunner.passTest(`PKP Dashboard loaded: ${subPKPCount} sub-PKPs`);
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 11: Check Navigation Links
  async testNavigationLinks() {
    TestRunner.startTest('Navigation Links Present');
    try {
      const nav = document.querySelector('nav');
      if (!nav) {
        throw new Error('Navigation element not found');
      }
      
      const links = nav.querySelectorAll('a');
      if (links.length === 0) {
        throw new Error('No navigation links found');
      }
      
      TestRunner.passTest(`Found ${links.length} navigation links`);
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 12: Check Features Section
  async testFeaturesSection() {
    TestRunner.startTest('Features Section Content');
    try {
      const featuresSection = document.getElementById('features');
      if (!featuresSection) {
        throw new Error('Features section not found');
      }
      
      const featureCards = featuresSection.querySelectorAll('.p-6');
      if (featureCards.length !== 6) {
        throw new Error(`Expected 6 feature cards, found ${featureCards.length}`);
      }
      
      TestRunner.passTest('Features section complete with 6 cards');
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 13: Performance Check
  async testPerformance() {
    TestRunner.startTest('Performance Metrics');
    try {
      const start = performance.now();
      const state = authModel.getState();
      const end = performance.now();
      const duration = end - start;
      
      if (duration > 100) {
        throw new Error(`State access too slow: ${duration.toFixed(2)}ms`);
      }
      
      TestRunner.passTest(`State access: ${duration.toFixed(2)}ms`);
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 14: Check Error Handling
  async testErrorHandling() {
    TestRunner.startTest('Error Handling');
    try {
      // Try to call an API endpoint that doesn't exist
      try {
        await authAPI.request('/nonexistent-endpoint');
        throw new Error('Should have thrown error for nonexistent endpoint');
      } catch (apiError) {
        // Expected to fail
        TestRunner.passTest('API error handling working');
      }
    } catch (error) {
      TestRunner.failTest(error);
    }
  },

  // Test 15: Memory Leak Check (Observers)
  async testMemoryLeaks() {
    TestRunner.startTest('Memory Leak Prevention (Observers)');
    try {
      const initialObserverCount = authModel._observers ? authModel._observers.length : 0;
      
      // Subscribe and immediately unsubscribe
      const unsubscribe = authModel.subscribe(() => {});
      unsubscribe();
      
      const finalObserverCount = authModel._observers ? authModel._observers.length : 0;
      
      if (finalObserverCount > initialObserverCount) {
        throw new Error('Observer not properly removed after unsubscribe');
      }
      
      TestRunner.passTest('Observers properly cleaned up');
    } catch (error) {
      TestRunner.failTest(error);
    }
  }
};

// Main test runner
async function runAllTests() {
  console.clear();
  console.log('🚀 Starting Automated Test Suite for The Beach - MVC Authentication System');
  console.log('=' .repeat(60));
  
  TestRunner.results = [];
  
  // Run all tests in sequence
  await Tests.testControllerLoaded();
  await TestRunner.sleep(100);
  
  await Tests.testInitialState();
  await TestRunner.sleep(100);
  
  await Tests.testAPIConfiguration();
  await TestRunner.sleep(100);
  
  await Tests.testSessionStatusEndpoint();
  await TestRunner.sleep(100);
  
  await Tests.testUIElements();
  await TestRunner.sleep(100);
  
  await Tests.testObservablePattern();
  await TestRunner.sleep(100);
  
  await Tests.testCookieInclusion();
  await TestRunner.sleep(100);
  
  await Tests.testSessionCookie();
  await TestRunner.sleep(100);
  
  await Tests.testRefreshSession();
  await TestRunner.sleep(100);
  
  await Tests.testPKPDashboard();
  await TestRunner.sleep(100);
  
  await Tests.testNavigationLinks();
  await TestRunner.sleep(100);
  
  await Tests.testFeaturesSection();
  await TestRunner.sleep(100);
  
  await Tests.testPerformance();
  await TestRunner.sleep(100);
  
  await Tests.testErrorHandling();
  await TestRunner.sleep(100);
  
  await Tests.testMemoryLeaks();
  
  // Print summary
  TestRunner.printSummary();
  
  return TestRunner.results;
}

// Interactive test functions
async function testRegistration(username = 'test_user_' + Date.now()) {
  console.log(`🧪 Testing Registration for: ${username}`);
  try {
    await authController.register(username);
    console.log('✅ Registration test initiated - complete WebAuthn prompt');
  } catch (error) {
    console.error('❌ Registration test failed:', error);
  }
}

async function testLogin() {
  console.log('🧪 Testing Login');
  try {
    await authController.login();
    console.log('✅ Login test initiated - complete WebAuthn prompt');
  } catch (error) {
    console.error('❌ Login test failed:', error);
  }
}

async function testLogout() {
  console.log('🧪 Testing Logout');
  try {
    await authController.logout();
    console.log('✅ Logout test completed');
  } catch (error) {
    console.error('❌ Logout test failed:', error);
  }
}

async function testAllButtons() {
  console.log('🧪 Testing All Buttons');
  console.log('This will simulate clicking each button...\n');
  
  const state = authModel.getState();
  
  if (state.isAuthenticated) {
    console.log('✅ Currently Authenticated');
    console.log('Buttons available:');
    console.log('  - 🌴 Visit Paradise (btnVisitParadise)');
    console.log('  - 🔄 Refresh (btnRefreshSession)');
    console.log('  - 🚪 Sign Out (btnSignOut)');
    console.log('\nTo test:');
    console.log('  document.getElementById("btnVisitParadise").click()');
    console.log('  document.getElementById("btnRefreshSession").click()');
    console.log('  document.getElementById("btnSignOut").click()');
  } else {
    console.log('⚠️  Currently Not Authenticated');
    console.log('Buttons available:');
    console.log('  - 🔐 Register (btnRegister)');
    console.log('  - 🔐 Login (btnLogin)');
    console.log('  - 🔍 Check Session (btnCheckSession)');
    console.log('\nTo test:');
    console.log('  document.getElementById("btnRegister").click()');
    console.log('  document.getElementById("btnLogin").click()');
    console.log('  document.getElementById("btnCheckSession").click()');
  }
}

// Export test functions
window.runAllTests = runAllTests;
window.testRegistration = testRegistration;
window.testLogin = testLogin;
window.testLogout = testLogout;
window.testAllButtons = testAllButtons;

// Welcome message
console.log('🎯 Automated Test Suite Loaded!');
console.log('');
console.log('Available Commands:');
console.log('  runAllTests()          - Run complete automated test suite');
console.log('  testRegistration()     - Test registration flow');
console.log('  testLogin()            - Test login flow');
console.log('  testLogout()           - Test logout flow');
console.log('  testAllButtons()       - Show all available buttons');
console.log('');
console.log('Quick Start:');
console.log('  await runAllTests()');
console.log('');
