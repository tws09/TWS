/**
 * In-memory MongoDB REPLICA SET for integration tests.
 *
 * WP1 (and WP3 later) need multi-document transactions, which require a replica
 * set — `MongoMemoryServer` (standalone) cannot do them. `MongoMemoryReplSet`
 * (single-node RS) can, and works with the cached mongod binary.
 *
 * Usage in a test file:
 *
 *   const { connect, disconnect, clearDatabase } = require('../helpers/memoryMongo');
 *   beforeAll(async () => { await connect(); });
 *   afterEach(async () => { await clearDatabase(); });
 *   afterAll(async () => { await disconnect(); });
 */

const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

/** @type {import('mongodb-memory-server').MongoMemoryReplSet | null} */
let replSet = null;

async function connect() {
  if (replSet) return mongoose.connection;

  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  const uri = replSet.getUri();

  await mongoose.connect(uri, {
    // keep server selection snappy so a misconfigured RS fails fast in CI
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose.connection;
}

async function disconnect() {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
    }
  } catch (_) {
    /* ignore */
  }
  try {
    await mongoose.disconnect();
  } catch (_) {
    /* ignore */
  }
  if (replSet) {
    try {
      await replSet.stop({ doCleanup: true, force: true });
    } catch (_) {
      /* ignore — process teardown will reap it */
    }
    replSet = null;
  }
}

async function clearDatabase() {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((c) => c.deleteMany({})),
  );
}

module.exports = { connect, disconnect, clearDatabase, get replSet() { return replSet; } };
