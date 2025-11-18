import { pool } from "../config/database.js";
import bcrypt from "bcrypt";

// Hash any stored passwords that don't look like bcrypt hashes (start with $2)
// WARNING: Run this only if you know the current values in `hashed_password` are plaintext passwords.
// Usage: node scripts/hash_existing_passwords.js

const hashExisting = async () => {
  try {
    const res = await pool.query("SELECT id, hashed_password FROM Users");
    const users = res.rows;

    for (const user of users) {
      const cur = user.hashed_password || "";
      if (!cur.startsWith("$2")) {
        console.log(`Hashing password for user id=${user.id}`);
        const newHash = await bcrypt.hash(cur, 10);
        await pool.query(
          "UPDATE Users SET hashed_password = $1 WHERE id = $2",
          [newHash, user.id]
        );
      }
    }

    console.log("Finished hashing plaintext passwords (if any).");
    process.exit(0);
  } catch (err) {
    console.error("Error hashing passwords:", err);
    process.exit(1);
  }
};

hashExisting();
