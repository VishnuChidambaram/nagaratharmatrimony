// Test script to identify registration validation issues
const testData = {
  name: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  gender: "Male",
  dateOfBirth: "2000-01-01",
  password: "Test@123"
};

console.log("Testing basic validation...");
console.log("Data:", testData);

// Check phone format
const cleanPhone = testData.phone.replace(/[\s\-\+]/g, "");
const phoneValid = /^[0-9]{10}$/.test(cleanPhone) || /^91[0-9]{10}$/.test(cleanPhone);
console.log("Phone valid:", phoneValid);

// Check email format  
const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testData.email);
console.log("Email valid:", emailValid);

// Check gender
const genderValid = ["Male", "Female"].includes(testData.gender);
console.log("Gender valid:", genderValid);

// Check age
const dob = new Date(testData.dateOfBirth);
const today = new Date();
const age = today.getFullYear() - dob.getFullYear();
console.log("Age:", age, "Valid:", age >= 2 && age <= 100);
