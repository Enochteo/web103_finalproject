import { pool } from "../config/database.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

const createUser = async (req, res) => {
  const { username, email, role: rawRole, password } = req.body;
  if (!password) return res.status(400).json({ error: "Password is required" });
  if (!username || !email)
    return res.status(400).json({ error: "username and email are required" });

  // normalize role
  const role = (rawRole || "STUDENT").toString().toUpperCase();
  const allowed = ["STUDENT", "TECHNICIAN", "ADMIN"];
  if (!allowed.includes(role))
    return res.status(400).json({ error: "Invalid role" });

  // Prevent open registration of ADMIN accounts. Only an authenticated admin
  // (server-side) may create ADMIN users.
  if (role === "ADMIN") {
    if (
      !req.user ||
      !(req.user.role && req.user.role.toUpperCase() === "ADMIN")
    ) {
      return res.status(403).json({ error: "Cannot create admin account" });
    }
  }

  const insertUserQuery = `INSERT INTO Users (username, email, role, hashed_password) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at;`;
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
    res.status(201).json(results.rows[0]);
  } catch (error) {
    // handle unique constraint violation for email
    if (error && error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
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
  // Support single fetch by id (route param or ?id=), and
  // list with pagination, sorting and filtering for admin UI.

  const paramId = req.params.id ?? req.query.id ?? null;
  if (paramId) {
    const id = parseInt(paramId, 10);
    if (Number.isNaN(id))
      return res.status(400).json({ error: "Invalid id parameter" });
    try {
      const results = await pool.query(`SELECT * FROM Requests WHERE id = $1`, [
        id,
      ]);
      if (!results.rows || results.rows.length === 0)
        return res.status(404).json({ error: "Request not found" });
      return res.status(200).json(results.rows[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // List mode: pagination, sorting, filtering
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  let limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
  if (limit > 100) limit = 100;
  const offset = (page - 1) * limit;

  const allowedSort = [
    "id",
    "created_at",
    "urgency",
    "status",
    "category_id",
    "assigned_to",
  ];
  const sort_by = allowedSort.includes(req.query.sort_by)
    ? req.query.sort_by
    : "id";
  const sort_dir =
    (req.query.sort_dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

  const filters = [];
  const values = [];
  let idx = 1;

  if (req.query.status) {
    filters.push(`status = $${idx++}`);
    values.push(req.query.status.toUpperCase());
  }
  if (req.query.category_id) {
    filters.push(`category_id = $${idx++}`);
    values.push(parseInt(req.query.category_id, 10));
  }
  if (req.query.user_id) {
    filters.push(`user_id = $${idx++}`);
    values.push(parseInt(req.query.user_id, 10));
  }
  if (req.query.assigned_to) {
    filters.push(`assigned_to = $${idx++}`);
    values.push(parseInt(req.query.assigned_to, 10));
  }
  if (req.query.urgency) {
    filters.push(`urgency = $${idx++}`);
    values.push(req.query.urgency.toUpperCase());
  }
  if (req.query.q) {
    filters.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
    values.push(`%${req.query.q}%`);
    idx++;
  }

  const whereClause =
    filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const countSql = `SELECT COUNT(*)::int AS total FROM Requests ${whereClause}`;
    const countRes = await pool.query(countSql, values);
    const total = countRes.rows[0]?.total ?? 0;

    const pageSql = `SELECT * FROM Requests ${whereClause} ORDER BY ${sort_by} ${sort_dir} LIMIT $${idx++} OFFSET $${idx++}`;
    const pageValues = values.concat([limit, offset]);
    const results = await pool.query(pageSql, pageValues);

    return res.status(200).json({
      data: results.rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
  // Accept either `id` or `Id` (route files have used both in history).
  const idParam = req.params.id ?? req.params.Id;
  if (!idParam) return res.status(400).json({ error: "Missing id parameter" });

  const id = parseInt(idParam, 10);
  if (Number.isNaN(id))
    return res.status(400).json({ error: "Invalid id parameter" });

  try {
    // Confirm the request exists
    const existing = await pool.query(`SELECT * FROM Requests WHERE id = $1`, [
      id,
    ]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Authorization: only owner or admin can delete
    const requestRow = existing.rows[0];
    const requestingUser = req.user;
    if (!requestingUser) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const isOwner = requestRow.user_id === requestingUser.id;
    const isAdmin =
      requestingUser.role && requestingUser.role.toLowerCase() === "admin";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Forbidden: cannot delete this request" });
    }

    const deleteQuery = `DELETE FROM Requests WHERE id = $1 RETURNING *`;
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

const getTechnicianRequests = async (req, res) => {
  // Returns requests assigned to the authenticated technician
  const technicianId = req.user && req.user.id;
  if (!technicianId)
    return res.status(401).json({ error: "Not authenticated" });
  // Reuse the generic getRequests list logic but force assigned_to to this technician.
  // This allows support for pagination, filtering and sorting via the same query params.
  try {
    // Ensure assigned_to is set to the authenticated technician
    req.query = req.query || {};
    req.query.assigned_to = req.query.assigned_to || String(technicianId);
    return getRequests(req, res);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateRequestStatus = async (req, res) => {
  const idParam = req.params.id ?? req.params.Id;
  if (!idParam) return res.status(400).json({ error: "Missing id parameter" });
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id))
    return res.status(400).json({ error: "Invalid id parameter" });

  const { status } = req.body;
  const allowed = ["PENDING", "IN_PROGRESS", "RESOLVED", "CANCELLED"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid or missing status" });
  }

  try {
    const existing = await pool.query(`SELECT * FROM Requests WHERE id = $1`, [
      id,
    ]);
    if (!existing.rows || existing.rows.length === 0)
      return res.status(404).json({ error: "Request not found" });
    const requestRow = existing.rows[0];

    const requestingUser = req.user;
    if (!requestingUser)
      return res.status(401).json({ error: "Not authenticated" });

    const isAdmin =
      requestingUser.role && requestingUser.role.toLowerCase() === "admin";
    const isTechnician =
      requestingUser.role && requestingUser.role.toLowerCase() === "technician";
    // If technician, ensure they are assigned to this request
    if (isTechnician && requestRow.assigned_to !== requestingUser.id) {
      return res
        .status(403)
        .json({ error: "Forbidden: not assigned to this request" });
    }

    const updateQuery = `UPDATE Requests SET status = $1 WHERE id = $2 RETURNING *`;
    const results = await pool.query(updateQuery, [status, id]);
    res.status(200).json(results.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const assignRequest = async (req, res) => {
  // Only admins should call this (route middleware will enforce)
  const idParam = req.params.id ?? req.params.Id;
  if (!idParam) return res.status(400).json({ error: "Missing id parameter" });
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id))
    return res.status(400).json({ error: "Invalid id parameter" });

  const { assigned_to } = req.body;
  if (!assigned_to)
    return res.status(400).json({ error: "Missing assigned_to field" });

  try {
    const updateQuery = `UPDATE Requests SET assigned_to = $1 WHERE id = $2 RETURNING *`;
    const results = await pool.query(updateQuery, [assigned_to, id]);
    res.status(200).json(results.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createResolution = async (req, res) => {
  // Accepts: request_id, admin_notes, technician_photo_url
  const { request_id, admin_notes, technician_photo_url } = req.body;
  if (!request_id) return res.status(400).json({ error: "Missing request_id" });

  try {
    const insertQuery = `INSERT INTO Resolutions (request_id, admin_notes, resolved_at, technician_photo_url) VALUES ($1, $2, now(), $3) RETURNING *`;
    const results = await pool.query(insertQuery, [
      request_id,
      admin_notes || null,
      technician_photo_url || null,
    ]);
    res.status(201).json(results.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getResolutions = async (req, res) => {
  // Support: ?request_id=123  OR  ?request_ids=1,2,3
  const { request_id, request_ids } = req.query;
  try {
    if (request_id) {
      const q = `SELECT * FROM Resolutions WHERE request_id = $1`;
      const results = await pool.query(q, [parseInt(request_id, 10)]);
      return res.status(200).json(results.rows);
    }

    if (request_ids) {
      const ids = request_ids
        .toString()
        .split(",")
        .map((s) => parseInt(s, 10))
        .filter((n) => !Number.isNaN(n));
      if (ids.length === 0)
        return res.status(400).json({ error: "No valid ids provided" });
      const q = `SELECT * FROM Resolutions WHERE request_id = ANY($1::int[])`;
      const results = await pool.query(q, [ids]);
      return res.status(200).json(results.rows);
    }

    // If no params, return all (be cautious)
    const results = await pool.query(`SELECT * FROM Resolutions`);
    return res.status(200).json(results.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  const idParam = req.params.id ?? req.params.Id;
  if (!idParam) return res.status(400).json({ error: "Missing id parameter" });
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id))
    return res.status(400).json({ error: "Invalid id parameter" });

  try {
    const deleteQuery = `DELETE FROM Categories WHERE id = $1 RETURNING *`;
    const results = await pool.query(deleteQuery, [id]);
    if (!results.rows || results.rows.length === 0)
      return res.status(404).json({ error: "Category not found" });
    res.status(200).json(results.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  getTechnicianRequests,
  updateRequestStatus,
  assignRequest,
  createResolution,
  getResolutions,
  deleteCategory,
};
