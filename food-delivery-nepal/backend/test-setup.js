// test-setup.js
const mongoose = require('mongoose');
require('dotenv').config();

async function testSetup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections:', collections.map(c => c.name));

    console.log('🎉 Setup test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup test failed:', error);
    process.exit(1);
  }
}

testSetup();
