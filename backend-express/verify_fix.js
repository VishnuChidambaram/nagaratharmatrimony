import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import path from 'path';

async function verifyFix() {
  const form = new FormData();
  form.append('name', 'Test User ' + Date.now());
  form.append('email', 'test' + Date.now() + '@example.com');
  form.append('phoneNumber', '999' + Date.now().toString().slice(-7));
  form.append('description', 'Test Description');
  
  // Create a dummy image file
  fs.writeFileSync('test_image.jpg', 'dummy image content');
  form.append('image', fs.createReadStream('test_image.jpg'));

  try {
    const response = await fetch('http://localhost:5000/upload-details', {
      method: 'POST',
      body: form
    });
    
    const data = await response.json();
    console.log('Upload Response:', data);
    
    if (data.success) {
      console.log('User created successfully.');
    } else {
      console.error('User creation failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (fs.existsSync('test_image.jpg')) {
      fs.unlinkSync('test_image.jpg');
    }
  }
}

verifyFix();
