// backend/test.js
require('dotenv').config();

async function testBackend() {
    console.log("1. Testing Registration...");
    
    // Attempt to register a dummy user
    const response = await fetch(`${process.env.NEXT_URL_BACK}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: "testuser@example.com", 
            password: "mypassword123" 
        })
    });

    const data = await response.json();
    console.log("Server Response:", data);
}

testBackend();
