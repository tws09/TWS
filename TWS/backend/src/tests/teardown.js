module.exports = async function globalTeardown() {
  // Per-file integration suites own their MongoMemoryReplSet lifecycle via
  // ./helpers/memoryMongo.js (connect/disconnect). This global hook is a
  // best-effort safety net in case a suite throws before its afterAll runs.
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (_) {
    /* nothing to clean up */
  }
};
