import { OutcognitoEventSchema } from "./index.js";

const sampleEvent = {
  eventId: crypto.randomUUID(),
  category: "ai",
  eventType: "ai_dependency",
  description: "User returned to an AI assistant repeatedly during a work session.",
  stats: {
    count: 6,
  },
  roastability: 0.62,
  privacyLevel: "safe",
  timestamp: new Date().toISOString(),
};

const result = OutcognitoEventSchema.safeParse(sampleEvent);

if (result.success) {
  console.log("VALID EVENT:");
  console.log(result.data);
} else {
  console.error("INVALID EVENT:");
  console.error(result.error.format());
  process.exit(1);
}

// Also test that a bad event correctly FAILS validation
const badEvent = {
  eventId: "abc",
  category: "not-a-real-category",
  eventType: "test",
  description: "test",
  roastability: 5,
  privacyLevel: "safe",
  timestamp: new Date().toISOString(),
};

const badResult = OutcognitoEventSchema.safeParse(badEvent);

if (badResult.success) {
  console.error("ERROR: bad event incorrectly passed validation!");
  process.exit(1);
} else {
  console.log("\nBAD EVENT CORRECTLY REJECTED:");
  console.log(badResult.error.issues.map((i) => i.path.join(".") + ": " + i.message));
}