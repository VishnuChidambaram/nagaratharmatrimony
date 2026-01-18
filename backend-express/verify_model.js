import UserDetail from "./models/UserDetail.js";

async function verifyModel() {
  try {
    const rawAttributes = UserDetail.rawAttributes;
    
    const fieldsToVerify = [
      "referralDetails1Email",
      "referralDetails1Address",
      "referralDetails2Email",
      "referralDetails2Address"
    ];

    let allOk = true;
    fieldsToVerify.forEach(field => {
      const attr = rawAttributes[field];
      if (attr) {
        console.log(`Field: ${field}`);
        console.log(`  Database Column (field): ${attr.field || field}`);
      } else {
        console.log(`Field: ${field} NOT FOUND in model attributes`);
        allOk = false;
      }
    });

    if (allOk) {
        console.log("\nSUCCESS: All critical fields present and mapped.");
    } else {
        console.log("\nFAILURE: Some fields are missing.");
    }

    process.exit(allOk ? 0 : 1);
  } catch (error) {
    console.error("Error verifying model:", error);
    process.exit(1);
  }
}

verifyModel();
