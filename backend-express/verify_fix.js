const fetch = global.fetch;

async function checkUserExists() {
  const url = "http://127.0.0.1:5000/check-user-exists";
  const body = {
    email: "test_verification_local@example.com",
    phone: "9999999999"
  };

  console.log(`Checking user exists at ${url}...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Response:", data);
      console.log("SUCCESS: Endpoint reachable and executed.");
    } else {
      console.error(`HTTP Error: ${response.status}`);
      const text = await response.text();
      console.error("Response body:", text);
    }
  } catch (error) {
    console.error("Connection failed:", error.message);
    if (error.cause) console.error("Cause:", error.cause);
    console.log("Ensure the backend server is running on port 5000.");
  }
}

checkUserExists();
