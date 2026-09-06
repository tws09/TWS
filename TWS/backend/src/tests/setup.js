// Jest setup (runs once per test file, after the test framework is installed).

// WP1: activate global Mongoose plugins (tenant-scope query isolation) before
// any model is compiled by a test. Mirrors the require at the top of server.js.
// The plugin is a strict no-op unless a test opens a request context via
// `runWithContext(...)`, so this is safe for the pure-function unit tests.
require('../models/registerPlugins');

// Replica-set MongoDB for tests that need real persistence / transactions is
// provided on demand by ./helpers/memoryMongo.js (opt-in per test file), not
// started here — most suites are pure unit tests and must stay fast.
