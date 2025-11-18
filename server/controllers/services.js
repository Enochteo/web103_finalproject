import { pool } from "../config/database.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

const createUser = async (req, res) => {
  const { username, email, role, password } = req.body;
  if (!password) return res.status(400).json({ error: "Password is required" });
  const insertUserQuery = `INSERT INTO Users (username, email, role, hashed_password) VALUES ($1, $2, $3, $4) RETURNING *;`;
  try {
    const hashed = await bcrypt.hash(password, 10);
    if (!hashed || !hashed.startsWith("$2")) {
      console.error("Unexpected hash produced", hashed);
      return res.status(500).json({ error: "Password hashing failed" });
    }
    const results = await pool.query(insertUserQuery, [
      username,
      email,
      role,
      hashed,
    ]);
    res.status(201).send(results.rows[0]);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  const getUsersQuery = `SELECT * FROM Users;`;
  try {
    const results = await pool.query(getUsersQuery);
    res.status(200).json(results.rows);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
const createRequest = async (req, res) => {
  const {
    title,
    description,
    location,
    urgency,
    category_id,
    user_id,
    photo_url,
  } = req.body;
  const insertRequestQuery = `INSERT INTO Requests (title, description, location, urgency, status, user_id, category_id, photo_url, assigned_to) VALUES ($1, $2, $3, $4, 'PENDING', $5, $6, $7, NULL)`;
  try {
    const results = await pool.query(insertRequestQuery, [
      title,
      description,
      location,
      urgency,
      user_id,
      category_id,
      photo_url,
    ]);
    res.status(201).send(results.rows[0]);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
};

const getRequests = async (req, res) => {
  const getQuery = `SELECT * FROM Requests;`;
  try {
    const results = await pool.query(getQuery);
    res.status(200).send(results.rows);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateRequestStudent = async (req, res) => {
  const { id } = req.params;
  const { title, description, location, urgency, user_id, category_id } =
    req.body;
  const updateQuery = `UPDATE Requests SET title = $1, description = $2, location = $3, urgency = $4, user_id = $5, category_id = $6 WHERE id = $7 RETURNING *`;
  try {
    const results = await pool.query(updateQuery, [
      title,
      description,
      location,
      urgency,
      user_id,
      category_id,
      id,
    ]);
    res.status(200).send(results.rows[0]);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
};

const deleteRequest = async (req, res) => {
  const { id } = req.params;
  const deleteQuery = `DELETE FROM Requests WHERE id = $1 RETURNING *`;
  try {
    const results = await pool.query(deleteQuery, [id]);
    res.status(200).send(results.rows[0]);
  } catch (error) {
    res.status(409).send({ error: error.message });
  }
};

const createCategory = async (req, res) => {
  const { name } = req.body;
  const createCategoryQuery = `INSERT INTO Categories (name) VALUES ($1)`;
  try {
    const results = await pool.query(createCategoryQuery, [name]);
    res.status(201).send(results.rows[0]);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
};

const getCategories = async (req, res) => {
  const getCategoriesQuery = `SELECT * FROM Categories;`;
  try {
    const results = await pool.query(getCategoriesQuery);
    res.status(200).json(results.rows);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
};

export default {
  getUsers,
  createUser,
  createRequest,
  getRequests,
  updateRequestStudent,
  deleteRequest,
  createCategory,
  getCategories,
};
