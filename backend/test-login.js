const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login endpoint...');
    
    const loginData = {
      emailOrUsername: 'admin@vedant.edu',
      password: 'Admin@123'
    };
    
    console.log('📤 Sending login request with:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Response:', error.response.data);
    } else {
      console.error('📋 Error:', error.message);
    }
  }
}

testLogin(); 