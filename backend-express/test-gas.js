import 'dotenv/config';

async function testBridge() {
  const url = process.env.EMAIL_BRIDGE_URL;
  const key = process.env.EMAIL_BRIDGE_KEY || "MATRIMONY_SECRET_2025";
  const to = process.argv[2] || "test@example.com";

  if (!url) {
    console.error("Error: EMAIL_BRIDGE_URL is not set in environment variables.");
    process.exit(1);
  }

  console.log(`Testing bridge at: ${url}`);
  console.log(`Sending test email to: ${to}`);

  const payload = {
    to: to,
    subject: "Bridge Test Connection",
    text: "This is a test email from the Matrimony backend bridge script.",
    key: key
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Response:", result);
    
    if (result.success) {
      console.log("Success! The bridge is working correctly.");
    } else {
      console.error("Bridge Error Message:", result.message);
    }
  } catch (error) {
    console.error("Fetch Error:", error.message);
    if (error.message.includes("404")) {
      console.error("Tip: Check if the URL is correct and published as a Web App.");
    }
  }
}

testBridge();
