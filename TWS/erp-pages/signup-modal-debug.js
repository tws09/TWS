/**
 * Debug helper for signup modal
 * Add this script temporarily to debug modal initialization issues
 */

// Check if scripts are loaded
window.addEventListener('load', function() {
  console.log('=== Signup Modal Debug ===');
  console.log('SignupFlows available:', typeof SignupFlows !== 'undefined');
  console.log('SignupModalV2 available:', typeof SignupModalV2 !== 'undefined');
  console.log('window.signupModal:', window.signupModal);
  console.log('Current path:', window.location.pathname);
  
  if (typeof SignupFlows !== 'undefined') {
    console.log('Available flows:', Object.keys(SignupFlows));
  }
  
  // Test modal open
  if (window.signupModal) {
    console.log('✅ Modal is ready');
  } else {
    console.error('❌ Modal not initialized');
  }
});
