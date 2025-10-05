// backend/test-connection.js
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔄 Testing MongoDB v4.4.6 Connection...');
console.log('Connection String:', process.env.MONGODB_URI);
console.log('');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('✅ SUCCESS! Connected to MongoDB v4.4.6');
  console.log('');
  console.log('📊 Connection Details:');
  console.log('   Database Name:', mongoose.connection.name);
  console.log('   Host:', mongoose.connection.host);
  console.log('   Port:', mongoose.connection.port);
  console.log('   Ready State:', mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Not Connected');
  console.log('');
  console.log('🎉 Everything is working perfectly!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: node scripts/seedData.js');
  console.log('2. Run: npm run dev');
  console.log('');

  mongoose.connection.close();
  process.exit(0);
})
.catch((err) => {
  console.error('❌ FAILED to connect:', err.message);
  console.log('');
  console.log('Troubleshooting tips:');
  console.log('1. Make sure MongoDB is running: mongod');
  console.log('2. Check your .env file has: MONGODB_URI=mongodb://localhost:27017/food_delivery_nepal');
  console.log('3. Try: mongo --version (should show v4.4.6)');
  process.exit(1);
});
