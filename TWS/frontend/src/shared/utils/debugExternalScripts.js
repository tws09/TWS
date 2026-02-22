/**
 * Debug External Scripts
 * Helps identify what external scripts are causing errors
 */

export const debugExternalScripts = () => {
  // Only run verbose debugging if explicitly enabled via localStorage
  const verboseDebug = localStorage.getItem('debugExternalScripts') === 'true';
  
  if (!verboseDebug) {
    // Silent mode - only log if there are actual issues
    return { totalScripts: 0, extensions: [], shareModalScripts: 0, globalVars: [] };
  }
  
  console.log('🔍 Debugging External Scripts...');
  
  // Check for browser extensions
  const extensions = [];
  
  // Check for common extension patterns
  const extensionPatterns = [
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'edge-extension://',
    'extension://'
  ];
  
  // Check all scripts on the page
  const scripts = document.querySelectorAll('script');
  console.log(`📜 Found ${scripts.length} script tags:`);
  
  scripts.forEach((script, index) => {
    const src = script.src;
    if (src) {
      console.log(`  ${index + 1}. ${src}`);
      
      // Check if it's an extension
      const isExtension = extensionPatterns.some(pattern => src.includes(pattern));
      if (isExtension) {
        extensions.push(src);
        console.log(`    ⚠️  This appears to be a browser extension`);
      }
    }
  });
  
  // Check for share-modal related scripts
  const shareModalScripts = Array.from(scripts).filter(script => 
    script.src && script.src.includes('share-modal')
  );
  
  if (shareModalScripts.length > 0) {
    console.log('🎯 Found share-modal scripts:');
    shareModalScripts.forEach(script => {
      console.log(`  - ${script.src}`);
    });
  } else {
    console.log('❌ No share-modal scripts found in DOM');
  }
  
  // Check for any global variables that might be related
  const globalVars = Object.keys(window).filter(key => 
    key.toLowerCase().includes('share') || 
    key.toLowerCase().includes('modal')
  );
  
  if (globalVars.length > 0) {
    console.log('🌐 Global variables related to share/modal:');
    globalVars.forEach(key => {
      console.log(`  - window.${key}`);
    });
  }
  
  // Check for event listeners on common elements
  const commonElements = ['body', 'document', 'window'];
  commonElements.forEach(elementName => {
    const element = elementName === 'document' ? document : 
                   elementName === 'window' ? window : 
                   document.querySelector(elementName);
    
    if (element && element.addEventListener) {
      console.log(`🎧 Event listeners on ${elementName}:`, element.addEventListener.toString());
    }
  });
  
  console.log('✅ External script debugging complete');
  
  return {
    totalScripts: scripts.length,
    extensions: extensions,
    shareModalScripts: shareModalScripts.length,
    globalVars: globalVars
  };
};

// Auto-run if in development (but silently unless verbose mode is enabled)
if (process.env.NODE_ENV === 'development') {
  // Run after a short delay to ensure all scripts are loaded
  // Only logs if localStorage has 'debugExternalScripts' set to 'true'
  setTimeout(() => {
    debugExternalScripts();
  }, 2000);
}

export default debugExternalScripts;
