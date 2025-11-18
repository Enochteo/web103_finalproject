import "./dotenv.js";
import { pool } from "./database.js";

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      role VARCHAR(20) CHECK (role IN ('STUDENT', 'TECHNICIAN', 'ADMIN')) NOT NULL,
      hashed_password TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log("Users table created");
};

const createRequestsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Requests (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(100) NOT NULL,
      urgency VARCHAR(10) CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH')) NOT NULL,
      status VARCHAR(20) CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED')) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER NOT NULL,
      assigned_to INTEGER,
      category_id INTEGER REFERENCES Categories(id),
      photo_url VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES Users(id),
      FOREIGN KEY (assigned_to) REFERENCES Users(id)
    );
  `;
  await pool.query(query);
  console.log("Requests table created");
};

const createCategoriesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );
  `;
  await pool.query(query);
  console.log("Categories table created");
};

const createResolutionsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Resolutions (
      id SERIAL PRIMARY KEY,
      request_id INTEGER UNIQUE NOT NULL,
      admin_notes TEXT,
      photo_url VARCHAR(255),
      resolved_at TIMESTAMP NOT NULL,
      FOREIGN KEY (request_id) REFERENCES Requests(id)
    );
  `;
  await pool.query(query);
  console.log("Resolutions table created");
};

const createRequestCategoryTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS RequestCategory (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      FOREIGN KEY (request_id) REFERENCES Requests(id),
      FOREIGN KEY (category_id) REFERENCES Categories(id)
    );
  `;
  await pool.query(query);
  console.log("RequestCategory table created");
};

const createAllTables = async () => {
  try {
    await pool.query(`
  DROP TABLE IF EXISTS RequestCategory, Resolutions, Requests, Categories, Users CASCADE;
`);
    await createUsersTable();
    await createCategoriesTable();
    await createRequestsTable();
    await createResolutionsTable();
    await createRequestCategoryTable();

    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    pool.end();
  }
};

createAllTables();
