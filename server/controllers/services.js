import { pool } from "../config/database.js";
import dotenv from "dotenv";

const createUser = async (req, res) => {
  const { username, email, role, password } = req.body;
  const insertUserQuery = `INSERT INTO Users (username, email, role, hashed_password) VALUES ($1, $2, $3, $4)`;
  try {
    const results = await pool.query(insertUserQuery, [
      username,
      email,
      role,
      password,
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
    res.status(404).error({ error: error.message });
  }
};
const createRequest = async (req, res) => {
  const { title, description, location, urgency, user_id } = req.body;
  const insertRequestQuery = `INSERT INTO Requests (title, description, location, urgency, status, user_id, assigned_to) VALUES ($1, $2, $3, $4, 'PENDING', $5, NULL)`;
  try {
    const results = await pool.query(insertRequestQuery, [
      title,
      description,
      location,
      urgency,
      user_id,
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
  const { title, description, location, urgency, user_id } = req.body;
  const updateQuery = `UPDATE Requests SET title = $1, description = $2, location = $3, urgency = $4, user_id = $5 WHERE id = $6 RETURNING *`;
  try {
    const results = await pool.query(updateQuery, [
      title,
      description,
      location,
      urgency,
      user_id,
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

export default {
  getUsers,
  createUser,
  createRequest,
  getRequests,
  updateRequestStudent,
  deleteRequest,
};
