import express from "express";
import { pool } from "../config/database.js";

const router = express.Router();

/**
 * GET /api/students/:userId/requests
 * Get all requests for a specific student
 * Query params:
 *   - search: search by request title/name
 *   - sortBy: 'timestamp' or 'status'
 *   - order: 'asc' or 'desc' (default: 'desc' for timestamp, 'asc' for status)
 *   - status: filter by status ('PENDING', 'IN_PROGRESS', 'RESOLVED')
 */
router.get("/:userId/requests", async (req, res) => {
  try {
    const { userId } = req.params;
    const { search, sortBy, order, status } = req.query;

    // Build the base query
    let query = `
      SELECT 
        r.id,
        r.title,
        r.description,
        r.location,
        r.urgency,
        r.status,
        r.photo_url,
        r.created_at,
        r.user_id,
        r.assigned_to,
        u.username as user_name,
        u.email as user_email,
        t.username as assigned_to_name
      FROM Requests r
      LEFT JOIN Users u ON r.user_id = u.id
      LEFT JOIN Users t ON r.assigned_to = t.id
      WHERE r.user_id = $1
    `;

    const queryParams = [userId];
    let paramCount = 1;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND r.title ILIKE $${paramCount}`;
      queryParams.push(`%${search}%`);
    }

    // Add status filter
    if (status) {
      paramCount++;
      query += ` AND r.status = $${paramCount}`;
      queryParams.push(status.toUpperCase());
    }

    // Add sorting
    const sortOrder = order?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    if (sortBy === "status") {
      query += ` ORDER BY r.status ${sortOrder === "ASC" ? "ASC" : "DESC"}`;
    } else if (sortBy === "timestamp" || !sortBy) {
      // Default sort by timestamp (newest first)
      query += ` ORDER BY r.created_at ${sortOrder}`;
    } else {
      query += ` ORDER BY r.created_at DESC`;
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/students/:userId/requests/:requestId
 * Get detailed view of a specific request
 */
router.get("/:userId/requests/:requestId", async (req, res) => {
  try {
    const { userId, requestId } = req.params;

    const query = `
      SELECT 
        r.id,
        r.title,
        r.description,
        r.location,
        r.urgency,
        r.status,
        r.photo_url,
        r.created_at,
        r.user_id,
        r.assigned_to,
        u.username as user_name,
        u.email as user_email,
        t.username as assigned_to_name,
        t.email as assigned_to_email,
        res.admin_notes,
        res.photo_url as resolution_photo_url,
        res.resolved_at
      FROM Requests r
      LEFT JOIN Users u ON r.user_id = u.id
      LEFT JOIN Users t ON r.assigned_to = t.id
      LEFT JOIN Resolutions res ON r.id = res.request_id
      WHERE r.id = $1 AND r.user_id = $2
    `;

    const result = await pool.query(query, [requestId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Get categories for this request
    const categoriesQuery = `
      SELECT c.id, c.name
      FROM Categories c
      INNER JOIN RequestCategory rc ON c.id = rc.category_id
      WHERE rc.request_id = $1
    `;
    const categoriesResult = await pool.query(categoriesQuery, [requestId]);

    const request = result.rows[0];
    request.categories = categoriesResult.rows;

    res.json(request);
  } catch (error) {
    console.error("Error fetching request details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/students/:userId/requests/:requestId
 * Update a specific request
 * Body can include: title, description, location, urgency, status, photo_url
 */
router.patch("/:userId/requests/:requestId", async (req, res) => {
  try {
    const { userId, requestId } = req.params;
    const { title, description, location, urgency, status, photo_url } = req.body;

    // First verify the request belongs to the user
    const verifyQuery = `SELECT id FROM Requests WHERE id = $1 AND user_id = $2`;
    const verifyResult = await pool.query(verifyQuery, [requestId, userId]);

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: "Request not found or access denied" });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (urgency !== undefined) {
      if (!["LOW", "MEDIUM", "HIGH"].includes(urgency.toUpperCase())) {
        return res.status(400).json({ error: "Invalid urgency value" });
      }
      updates.push(`urgency = $${paramCount++}`);
      values.push(urgency.toUpperCase());
    }
    if (status !== undefined) {
      if (!["PENDING", "IN_PROGRESS", "RESOLVED"].includes(status.toUpperCase())) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      updates.push(`status = $${paramCount++}`);
      values.push(status.toUpperCase());
    }
    if (photo_url !== undefined) {
      updates.push(`photo_url = $${paramCount++}`);
      values.push(photo_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(requestId, userId);
    const query = `
      UPDATE Requests 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount++} AND user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/students/:userId/requests/:requestId
 * Delete a specific request
 */
router.delete("/:userId/requests/:requestId", async (req, res) => {
  try {
    const { userId, requestId } = req.params;

    // First verify the request belongs to the user
    const verifyQuery = `SELECT id FROM Requests WHERE id = $1 AND user_id = $2`;
    const verifyResult = await pool.query(verifyQuery, [requestId, userId]);

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: "Request not found or access denied" });
    }

    // Delete related records first (RequestCategory, Resolutions)
    await pool.query(`DELETE FROM RequestCategory WHERE request_id = $1`, [requestId]);
    await pool.query(`DELETE FROM Resolutions WHERE request_id = $1`, [requestId]);

    // Delete the request
    const deleteQuery = `DELETE FROM Requests WHERE id = $1 AND user_id = $2 RETURNING id`;
    const result = await pool.query(deleteQuery, [requestId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({ message: "Request deleted successfully", id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

