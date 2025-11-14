import { pool } from "./database.js";
import "./dotenv.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";

const currentPath = fileURLToPath(import.meta.url);

const requestsFile = fs.readFileSync(
  path.join(dirname(currentPath), "../config/data/data.json")
);

const createRequestsTable = async () => {
  const createRequestsTableQuery = `
      DROP TABLE IF EXISTS requests;

      CREATE TABLE IF NOT EXISTS requests (
          id serial PRIMARY KEY,
          title varchar(100) NOT NULL,
          description text NOT NULL,
          location varchar(100) NOT NULL,
          urgency enum(LOW, MEDIUM, HIGH) NOT NULL,
          status enum(PENDING, IN-PROGRESS, RESOLVED) NOT NULL,
          created_at timestamp NOT NULL,
          user_id integer NOT NULL,
          assigned_to integer NOT NULL
      );
  `;
  try {
    const res = await pool.query(createRequestsTableQuery);
    console.log("🎉 requests table created successfully");
  } catch (err) {
    console.error("⚠️ error creating requests table", err);
  }
};

const createUsersTable = async () => {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id serial PRIMARY KEY,
        username varchar(100) NOT NULL,
        email varchar(200) NOT NULL,
        role enum(STUDENT, TECHNICIAN, ADMIN) NOT NULL
        hashed_password text NOT NULL
        created_at timestamp NOT NULL
)
    `;
};

const createCategoryTable = async () => {
  const createCategoryTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
        id serial PRIMARY KEY,
        name varchar NOT NULL,
    `;
};
