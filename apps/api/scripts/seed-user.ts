import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), "../../../.env") });

import { getDatabase } from "../src/shared/db/mongo.js";
import bcrypt from "bcryptjs";

const testUser = {
  email: "jordan@test.com",
  password: "password123",
  name: "Jordan",
};

async function seedUser() {
  const db = await getDatabase();
  const users = db.collection("user");

  const existingUser = await users.findOne({ email: testUser.email });
  if (existingUser) {
    console.log(`User ${testUser.email} already exists`);
    return;
  }

  const passwordHash = await bcrypt.hash(testUser.password, 10);

  await users.insertOne({
    email: testUser.email,
    name: testUser.name,
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const account = db.collection("account");
  const user = await users.findOne({ email: testUser.email });

  if (user) {
    await account.insertOne({
      userId: user._id,
      accountId: user._id.toString(),
      providerId: "credential",
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log(`✅ User created: ${testUser.email} / ${testUser.password}`);
  process.exit(0);
}

seedUser().catch((err) => {
  console.error("Error seeding user:", err);
  process.exit(1);
});
