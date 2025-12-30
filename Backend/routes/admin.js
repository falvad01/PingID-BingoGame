const express = require("express");
const router = express.Router();
const tokenUtils = require("../utils/TokenUtils");

// Import Services
const NumberService = require("../business/NumberService");

require("dotenv").config();

/**
 * Get all numbers with filters (Admin only)
 * Query params: seasonId, userId, startDate, endDate, number
 */
router.get("/numbers", tokenUtils.verifyToken, async (req, res) => {
    try {
        const filters = {
            seasonId: req.query.seasonId ? parseInt(req.query.seasonId) : null,
            userId: req.query.userId ? parseInt(req.query.userId) : null,
            startDate: req.query.startDate || null,
            endDate: req.query.endDate || null,
            number: req.query.number ? parseInt(req.query.number) : null
        };

        console.info("Admin getting numbers with filters:", filters);

        const numbers = await NumberService.adminGetNumbers(filters);

        res.status(200).json(numbers);
    } catch (error) {
        console.error("Error getting numbers (admin):", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Add number for any user/season/date (Admin only)
 */
router.post("/numbers/add", tokenUtils.verifyToken, async (req, res) => {
    try {
        const { userId, seasonId, number, date } = req.body;

        if (!userId || !seasonId || !number || !date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.info(`Admin adding number ${number} for user ${userId} on date ${date}`);

        const result = await NumberService.adminAddNumber(
            parseInt(userId),
            parseInt(seasonId),
            parseInt(number),
            date
        );

        res.status(200).json(result.number);
    } catch (error) {
        console.error("Error adding number (admin):", error);
        if (error.message === "Number must be between 10 and 99") {
            res.status(400).json({ error: error.message });
        } else if (error.message === "User already has a number for this date and season") {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

/**
 * Edit a number (Admin only)
 */
router.put("/numbers/edit/:id", tokenUtils.verifyToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updates = {};

        if (req.body.number !== undefined) {
            updates.number = req.body.number;
        }
        if (req.body.date !== undefined) {
            updates.date = req.body.date;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        console.info(`Admin editing number ${id}:`, updates);

        const result = await NumberService.adminEditNumber(id, updates);

        res.status(200).json(result.number);
    } catch (error) {
        console.error("Error editing number (admin):", error);
        if (error.message === "Number not found") {
            res.status(404).json({ error: error.message });
        } else if (error.message === "Number must be between 10 and 99") {
            res.status(400).json({ error: error.message });
        } else if (error.message === "User already has a number for this date and season") {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

/**
 * Delete a number (Admin only)
 */
router.delete("/numbers/delete/:id", tokenUtils.verifyToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        console.info(`Admin deleting number ${id}`);

        const result = await NumberService.adminDeleteNumber(id);

        res.status(200).json({ msg: result.message });
    } catch (error) {
        console.error("Error deleting number (admin):", error);
        if (error.message === "Number not found") {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

module.exports = router;
