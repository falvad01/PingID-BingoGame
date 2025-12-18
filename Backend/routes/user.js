const express = require("express");
const router = express.Router();
const tokenUtils = require("../utils/TokenUtils");
const adminTokenUtils = require("../utils/AdminTokenUtils");
const { body, validationResult } = require("express-validator");
const utils = require("../utils/utils");

// Import Services
const UserService = require("../business/UserService");
const SeasonService = require("../business/SeasonService");
const NumberService = require("../business/NumberService");

require("dotenv").config();

// Validation rules
const validateLogin = [
  body("username").isString().notEmpty().trim(),
  body("password").isString().notEmpty().trim(),
];

/**
 * Login for normal user
 */
router.post("/login", validateLogin, async (request, response) => {
  try {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const { username, password } = request.body;
    console.log(`User ${username} starts the login process`);

    const result = await UserService.login(username, password);

    console.log(`Authentication success for user, 200`);
    response.status(200).json({ token: result.token });
  } catch (error) {
    console.error("Error during login process:", error);
    if (error.message === "User does not exist" || error.message === "Authentication failed") {
      response.status(401).json({ error: error.message });
    } else {
      response.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Login for administrators
 */
router.post("/login/admin", validateLogin, async (request, response) => {
  try {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const { username, password } = request.body;
    console.log(`Admin ${username} starts the login process`);

    const result = await UserService.loginAdmin(username, password);

    console.log(`Authentication success for admin, 200`);
    response.status(200).json({ token: result.token });
  } catch (error) {
    console.error("Error during admin login process:", error);
    if (error.message === "User does not exist" || error.message === "Authentication failed") {
      response.status(401).json({ error: error.message });
    } else {
      response.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Register new user (Admin only)
 */
router.post("/register", tokenUtils.verifyToken, async (request, response) => {
  try {
    // Verify admin status
    let token = request.headers["x-access-token"] || request.headers["authorization"];
    token = token.replace(/^Bearer\s+/, "");
    const decoded = tokenUtils.parseJwt(token);

    if (decoded.administrator !== 1) {
      console.error("Access denied: User is not an administrator");
      return response.status(403).json({ error: "Access denied. Admin only." });
    }

    const { username, nameSurname, password, admin } = request.body;

    const result = await UserService.register({
      username,
      nameSurname,
      password,
      admin
    });

    response.status(200).json({ msg: result.message });
  } catch (error) {
    console.error("Error during registration:", error);
    if (error.message === "User already exists") {
      response.status(400).json({ error: error.message });
    } else {
      response.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Get users classification/ranking
 * Optional seasonId parameter for specific season
 */
router.get("/getUsersQualify/:seasonId?", tokenUtils.verifyToken, async (req, res) => {
  try {
    const seasonId = req.params.seasonId ? parseInt(req.params.seasonId) : null;
    console.log(`Getting user classification for season ${seasonId || 'active'}`);

    const classification = await UserService.getUserClassification(seasonId);

    console.log(`Qualification list obtained successfully`);
    res.status(200).json(classification);
  } catch (error) {
    console.error("Error getting user classification:", error);
    if (error.message === "No active season found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Get all users with statistics
 */
router.get("/getAllUsers", tokenUtils.verifyToken, async (req, res) => {
  try {
    console.log("Getting all users with stats");

    const users = await UserService.getAllUsersWithStats();

    console.log(`Users obtained successfully`);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get user profile
 */
router.get("/getProfile", tokenUtils.verifyToken, async (req, res) => {
  try {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    token = token.replace(/^Bearer\s+/, "");
    const decoded = tokenUtils.parseJwt(token);

    const profile = await UserService.getProfile(decoded.userId);

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error getting profile:", error);
    if (error.message === "User not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Edit user profile
 */
router.post("/editProfile", tokenUtils.verifyToken, async (req, res) => {
  try {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    token = token.replace(/^Bearer\s+/, "");
    const decoded = tokenUtils.parseJwt(token);

    const { username, name_surname, profile_image } = req.body;

    const result = await UserService.editProfile(decoded.userId, {
      username,
      name_surname,
      profile_image
    });

    res.status(200).json({ msg: result.message });
  } catch (error) {
    console.error("Error editing profile:", error);
    if (error.message.includes("too long") || error.message.includes("Invalid image")) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Get bingo line status for a season
 * Optional seasonId parameter
 */
router.get("/bingoLine/:seasonId?", tokenUtils.verifyToken, async (req, res) => {
  try {
    const seasonId = req.params.seasonId ? parseInt(req.params.seasonId) : null;
    console.log(`Getting bingo line for season ${seasonId || 'active'}`);

    // Get active season if not specified
    let targetSeasonId = seasonId;
    if (!targetSeasonId) {
      const activeSeason = await SeasonService.getActiveSeason();
      targetSeasonId = activeSeason.id;
    }

    // Get classification to have all users and numbers
    const classification = await UserService.getUserClassification(targetSeasonId);

    res.status(200).json(classification);
  } catch (error) {
    console.error("Error getting bingo line:", error);
    if (error.message === "No active season found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Check if user has added number today
 */
router.get("/isDayNumberAdded", tokenUtils.verifyToken, async (req, res) => {
  try {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    token = token.replace(/^Bearer\s+/, "");
    const decoded = tokenUtils.parseJwt(token);

    const hasNumber = await UserService.isDayNumberAdded(decoded.userId);

    res.status(200).json({ hasNumber });
  } catch (error) {
    console.error("Error checking day number:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get active season
 */
router.get("/season/active", tokenUtils.verifyToken, async (req, res) => {
  try {
    console.log("Getting active season");

    const season = await SeasonService.getActiveSeason();

    res.status(200).json(season);
  } catch (error) {
    console.error("Error getting active season:", error);
    if (error.message === "No active season found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Get all seasons
 */
router.get("/season", tokenUtils.verifyToken, async (req, res) => {
  try {
    console.log("Getting all seasons");

    const seasons = await SeasonService.getAllSeasons();

    res.status(200).json(seasons);
  } catch (error) {
    console.error("Error getting seasons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Create new season (Admin only)
 */
router.post("/season/create", tokenUtils.verifyToken, async (req, res) => {
  try {
    // Verify admin status
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    token = token.replace(/^Bearer\s+/, "");
    const decoded = tokenUtils.parseJwt(token);

    if (decoded.administrator !== 1) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { name, start_date, end_date, is_active } = req.body;

    const result = await SeasonService.createSeason({
      name,
      start_date,
      end_date,
      is_active
    });

    res.status(200).json(result.season);
  } catch (error) {
    console.error("Error creating season:", error);
    if (error.message === "Season name is required") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Activate a season (Admin only)
 */
router.put("/season/activate/:id", tokenUtils.verifyToken, async (req, res) => {
  try {
    // Verify admin status
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    token = token.replace(/^Bearer\s+/, "");
    const decoded = tokenUtils.parseJwt(token);

    if (decoded.administrator !== 1) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const seasonId = parseInt(req.params.id);

    const result = await SeasonService.activateSeason(seasonId);

    res.status(200).json({ msg: result.message });
  } catch (error) {
    console.error("Error activating season:", error);
    if (error.message === "Season not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
