const express = require("express");
const router = express.Router();
const tokenUtils = require("../utils/TokenUtils");

// Import Services
const NumberService = require("../business/NumberService");
const SeasonService = require("../business/SeasonService");

require("dotenv").config();

router.get("/", (req, res) => {
  res.send("Number endpoint");
});

/**
 * Add a new number for current user
 */
router.post("/add", tokenUtils.verifyToken, async (req, res) => {
  try {
    // Get user from token
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    token = token.replace(/^Bearer\s+/, "");
    const decoded = tokenUtils.parseJwt(token);

    const numberValue = parseInt(req.query.number, 10);
    console.info(`Adding number ${numberValue} for user ${decoded.userId}`);

    const result = await NumberService.addNumber(decoded.userId, numberValue);

    res.status(200).json({
      message: result.message,
      number: result.number
    });
  } catch (error) {
    console.error("Error adding number:", error);
    if (error.message === "Number must be between 10 and 99") {
      res.status(400).json({ message: error.message });
    } else if (error.message === "Number already created for today") {
      res.status(400).json({ message: error.message });
    } else if (error.message === "No active season found. Please contact administrator.") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Get user numbers (counts for each number 10-99)
 * Optional seasonId parameter
 */
router.get("/getUserNumbers/:seasonId?", tokenUtils.verifyToken, async (req, res) => {
  try {
    // Get user from token
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    token = token.replace(/^Bearer\s+/, "");
    const decoded = tokenUtils.parseJwt(token);

    // Get season
    let seasonId = req.params.seasonId ? parseInt(req.params.seasonId) : null;
    if (!seasonId) {
      const activeSeason = await SeasonService.getActiveSeason();
      if (!activeSeason) {
        return res.status(404).json({ error: "No active season found" });
      }
      seasonId = activeSeason.id;
    }

    console.info(`Getting numbers for user ${decoded.userId} in season ${seasonId}`);

    const numbers = await NumberService.getUserNumbers(decoded.userId, seasonId);

    res.status(200).json(numbers);
  } catch (error) {
    console.error("Error getting user numbers:", error);
    if (error.message === "No active season found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Get all numbers with metadata
 * Optional seasonId parameter
 */
router.get("/getAllNumbers/:seasonId?", tokenUtils.verifyToken, async (req, res) => {
  try {
    let seasonId = req.params.seasonId ? parseInt(req.params.seasonId) : null;
    if (!seasonId) {
      const activeSeason = await SeasonService.getActiveSeason();
      if (!activeSeason) {
        return res.status(404).json({ error: "No active season found" });
      }
      seasonId = activeSeason.id;
    }

    console.info(`Getting all numbers for season ${seasonId}`);

    const result = await NumberService.getAllNumbers(seasonId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting all numbers:", error);
    if (error.message === "No active season found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Get statistics for numbers
 * Optional seasonId parameter
 */
router.get("/getStadistics/:seasonId?", tokenUtils.verifyToken, async (req, res) => {
  try {
    let seasonId = req.params.seasonId ? parseInt(req.params.seasonId) : null;
    if (!seasonId) {
      const activeSeason = await SeasonService.getActiveSeason();
      if (!activeSeason) {
        return res.status(404).json({ error: "No active season found" });
      }
      seasonId = activeSeason.id;
    }

    console.info(`Getting statistics for season ${seasonId}`);

    const stats = await NumberService.getStatistics(seasonId);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting statistics:", error);
    if (error.message === "No active season found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Get today's numbers
 * Optional seasonId parameter
 */
router.get("/getTodayNumbers/:seasonId?", tokenUtils.verifyToken, async (req, res) => {
  try {
    let seasonId = req.params.seasonId ? parseInt(req.params.seasonId) : null;
    if (!seasonId) {
      const activeSeason = await SeasonService.getActiveSeason();
      if (!activeSeason) {
        return res.status(404).json({ error: "No active season found" });
      }
      seasonId = activeSeason.id;
    }

    console.info(`Getting today's numbers for season ${seasonId}`);

    const numbers = await NumberService.getTodayNumbers(seasonId);

    res.status(200).json(numbers);
  } catch (error) {
    console.error("Error getting today's numbers:", error);
    if (error.message === "No active season found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
