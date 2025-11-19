#!/usr/bin/env node
import readline from "readline";
import bcrypt from "bcrypt";
import { pool } from "../config/database.js";

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function createAdmin({ username, email, password }) {
  if (!username || !email || !password) {
    throw new Error("username, email and password are required");
  }

  const hashed = await bcrypt.hash(password, 10);
  if (!hashed || !hashed.startsWith("$2")) {
    throw new Error("Password hashing failed");
  }

  const insertSql = `INSERT INTO Users (username, email, role, hashed_password) VALUES ($1, $2, 'ADMIN', $3) RETURNING id, username, email, role, created_at`;
  const client = await pool.connect();
  try {
    const res = await client.query(insertSql, [username, email, hashed]);
    console.log("Admin user created:", res.rows[0]);
  } catch (err) {
    if (err && err.code === "23505") {
      console.error("A user with that email already exists.");
    } else {
      console.error("Error creating admin user:", err.message || err);
    }
    throw err;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    const argv = process.argv.slice(2);
    let username = argv[0];
    let email = argv[1];
    let password = argv[2];

    if (!username) {
      username = (await prompt("Username for admin: ")).trim();
    }
    if (!email) {
      email = (await prompt("Email for admin: ")).trim();
    }
    if (!password) {
      // hide echoing would require more setup; keep simple and warn
      password = (await prompt("Password for admin (will echo): ")).trim();
    }

    if (!username || !email || !password) {
      console.error(
        "All fields are required. Usage: node scripts/create_admin_user.js <username> <email> <password>"
      );
      process.exit(2);
    }

    await createAdmin({ username, email, password });
    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to create admin user.");
    process.exit(1);
  }
}

main();
