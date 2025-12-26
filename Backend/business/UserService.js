const UserDAO = require("../DAO/UserDAO");
const NumberDAO = require("../DAO/NumberDAO");
const SeasonDAO = require("../DAO/SeasonDAO");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const utils = require("../utils/utils");
require("dotenv").config();

/**
 * User Service
 * Contains all business logic for user operations
 */
class UserService {

    /**
     * Login user
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<Object>} - { success, token, message }
     */
    async login(username, password) {
        try {
            // Find user
            const user = await UserDAO.findByUsername(username);

            if (!user) {
                throw new Error("User does not exist");
            }

            // Compare password
            const isPasswordValid = await bcrypt.compare(password, String(user.password).trim());

            if (!isPasswordValid) {
                throw new Error("Authentication failed");
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    name_surname: user.name_surname,
                    administrator: user.administrator
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "1h" }
            );

            return {
                success: true,
                token: token
            };
        } catch (error) {
            console.error("Error in UserService.login:", error);
            throw error;
        }
    }

    /**
     * Login admin user
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<Object>} - { success, token, message }
     */
    async loginAdmin(username, password) {
        try {
            // Find user
            const user = await UserDAO.findByUsername(username);

            if (!user) {
                throw new Error("User does not exist");
            }

            // Check if user is admin
            if (user.administrator !== 1) {
                throw new Error("Authentication failed");
            }

            // Compare password
            const isPasswordValid = await bcrypt.compare(password, String(user.password).trim());

            if (!isPasswordValid) {
                throw new Error("Authentication failed");
            }

            // Generate admin JWT token with different secret
            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    admin: true
                },
                process.env.JWT_SECRET_KEY_ADMIN,
                { expiresIn: "1h" }
            );

            return {
                success: true,
                token: token
            };
        } catch (error) {
            console.error("Error in UserService.loginAdmin:", error);
            throw error;
        }
    }

    /**
     * Register new user (Admin only)
     * @param {Object} userData - { username, nameSurname, password, admin }
     * @returns {Promise<Object>}
     */
    async register(userData) {
        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create user
            const result = await UserDAO.create({
                username: userData.username,
                name_surname: userData.nameSurname,
                password: hashedPassword,
                administrator: userData.admin ? 1 : 0
            });

            if (!result.created) {
                throw new Error("User already exists");
            }

            return {
                success: true,
                message: "User created correctly"
            };
        } catch (error) {
            console.error("Error in UserService.register:", error);
            throw error;
        }
    }

    /**
     * Get user profile
     * @param {number} userId 
     * @returns {Promise<Object>}
     */
    async getProfile(userId) {
        try {
            const profile = await UserDAO.getProfile(userId);
            if (!profile) {
                throw new Error("User not found");
            }
            return profile;
        } catch (error) {
            console.error("Error in UserService.getProfile:", error);
            throw error;
        }
    }

    /**
     * Edit user profile
     * @param {number} userId 
     * @param {Object} profileData - { username, name_surname, profile_image }
     * @returns {Promise<Object>}
     */
    async editProfile(userId, profileData) {
        try {
            // Validate data
            if (profileData.username && profileData.username.length > 15) {
                throw new Error("Username too long (max 15 characters)");
            }
            if (profileData.name_surname && profileData.name_surname.length > 25) {
                throw new Error("Name surname too long (max 25 characters)");
            }

            // Validate and compress image if provided
            let processedImage = profileData.profile_image;
            if (processedImage && utils.isBase64Image(processedImage)) {
                processedImage = await utils.compressImage(processedImage, 228, 228);
            } else if (processedImage) {
                throw new Error("Invalid image format");
            }

            // Update profile
            await UserDAO.update(userId, {
                username: profileData.username,
                name_surname: profileData.name_surname,
                profile_image: processedImage
            });

            return {
                success: true,
                message: "User data edited correctly"
            };
        } catch (error) {
            console.error("Error in UserService.editProfile:", error);
            throw error;
        }
    }

    /**
     * Get all users with their number statistics
     * @returns {Promise<Array>}
     */
    async getAllUsersWithStats() {
        try {
            const users = await UserDAO.getAllUsers();
            const numbers = await NumberDAO.getAllNumbers();

            // Build user data map
            const userData = {};
            users.forEach(user => {
                const userDataValues = user.get({ plain: true });
                const { password, ...userWithoutPassword } = userDataValues;
                userData[user.id] = {
                    ...userWithoutPassword,
                    numbers: [],
                    totalNumbers: 0,
                    numberCount: 0,
                    repeatedCount: 0
                };
            });

            // Organize numbers by user
            numbers.forEach(numberObj => {
                const userId = numberObj.user_id;
                if (userData[userId]) {
                    userData[userId].numbers.push(numberObj.number);
                }
            });

            // Calculate statistics
            Object.values(userData).forEach(data => {
                data.totalNumbers = data.numbers.length;
                const uniqueNumbers = new Set(data.numbers);
                data.numberCount = uniqueNumbers.size;

                const numberFrequency = {};
                data.numbers.forEach(num => {
                    numberFrequency[num] = (numberFrequency[num] || 0) + 1;
                });

                data.repeatedCount = Object.values(numberFrequency).filter(count => count > 1).length;
            });

            // Return array without numbers
            return Object.values(userData).map(({ numbers, ...userWithoutNumbers }) => userWithoutNumbers);
        } catch (error) {
            console.error("Error in UserService.getAllUsersWithStats:", error);
            throw error;
        }
    }

    /**
     * Get user classification/ranking for a season
     * @param {number} seasonId - Optional, if null uses active season
     * @returns {Promise<Array>}
     */
    async getUserClassification(seasonId = null) {
        try {
            // Get active season if not specified
            let targetSeasonId = seasonId;
            if (!targetSeasonId) {
                const activeSeason = await SeasonDAO.getActiveSeason();
                if (!activeSeason) {
                    throw new Error("No active season found");
                }
                targetSeasonId = activeSeason.id;
            }

            // Get users and numbers
            const users = await UserDAO.getAllUsersWithAttributes([
                "id", "username", "name_surname", "profile_image", "administrator"
            ]);

            const numbersFilter = { seasonId: targetSeasonId };
            const numbers = await NumberDAO.getAllNumbers(numbersFilter);

            // Build user data map
            const userData = {};
            users.forEach(user => {
                const userDataValues = user.get({ plain: true });
                const { id, ...userWithoutId } = userDataValues;
                userData[id] = {
                    ...userWithoutId,
                    numbers: [],
                    numberCount: 0,
                    repeatedCount: 0,
                    totalRepetitions: 0,
                    lastEntryDate: null,
                    daysSinceLastEntry: null
                };
            });

            // Organize numbers by user
            numbers.forEach(numberObj => {
                const userId = numberObj.user_id;
                if (userData[userId]) {
                    userData[userId].numbers.push(numberObj.number);

                    // Track last entry date
                    if (!userData[userId].lastEntryDate ||
                        new Date(numberObj.created_at) > new Date(userData[userId].lastEntryDate)) {
                        userData[userId].lastEntryDate = numberObj.created_at;
                    }
                }
            });

            // Calculate statistics
            Object.values(userData).forEach(data => {
                const uniqueNumbers = new Set(data.numbers);
                data.numberCount = uniqueNumbers.size;

                const numberFrequency = {};
                let repeatedCount = 0;
                let totalRepetitions = 0;

                data.numbers.forEach(num => {
                    numberFrequency[num] = (numberFrequency[num] || 0) + 1;
                });

                Object.values(numberFrequency).forEach(count => {
                    if (count > 1) {
                        repeatedCount++;
                        totalRepetitions += count;
                    }
                });

                data.repeatedCount = repeatedCount;
                data.totalRepetitions = totalRepetitions;

                // Calculate days since last entry
                if (data.lastEntryDate) {
                    const currentDate = new Date();
                    const lastEntryDate = new Date(data.lastEntryDate);
                    const diffTime = Math.abs(currentDate - lastEntryDate);
                    data.daysSinceLastEntry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
            });

            // Sort and filter
            const sortedUsers = Object.values(userData)
                .filter(data => data.numberCount > 0) // Only users with numbers
                .map(({ numbers, ...userWithoutNumbers }) => userWithoutNumbers)
                .sort((a, b) => {
                    if (b.numberCount !== a.numberCount) {
                        return b.numberCount - a.numberCount;
                    }
                    return b.repeatedCount - a.repeatedCount;
                });

            return sortedUsers;
        } catch (error) {
            console.error("Error in UserService.getUserClassification:", error);
            throw error;
        }
    }

    /**
     * Check if user has added number today
     * @param {number} userId 
     * @returns {Promise<boolean>}
     */
    async isDayNumberAdded(userId) {
        try {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            const activeSeason = await SeasonDAO.getActiveSeason();
            if (!activeSeason) {
                return false;
            }

            const number = await NumberDAO.findByUserAndDate(userId, activeSeason.id, startOfDay, endOfDay);
            return !!number;
        } catch (error) {
            console.error("Error in UserService.isDayNumberAdded:", error);
            throw error;
        }
    }

    /**
     * Get players sorted by their progress towards completing a line
     * Returns top players with their best line (line with fewest missing numbers)
     * @param {number} seasonId - Optional, if null uses active season
     * @returns {Promise<Array>} - Array of users with their line progress
     */
    async getUserLineProgress(seasonId = null) {
        try {
            // Get active season if not specified
            let targetSeasonId = seasonId;
            if (!targetSeasonId) {
                const activeSeason = await SeasonDAO.getActiveSeason();
                if (!activeSeason) {
                    throw new Error("No active season found");
                }
                targetSeasonId = activeSeason.id;
            }

            // Get users and numbers
            const users = await UserDAO.getAllUsersWithAttributes([
                "id", "username", "name_surname", "profile_image", "administrator"
            ]);

            const numbersFilter = { seasonId: targetSeasonId };
            const numbers = await NumberDAO.getAllNumbers(numbersFilter);

            // Build user data map with their numbers
            const userData = {};
            users.forEach(user => {
                const userDataValues = user.get({ plain: true });
                const { id, ...userWithoutId } = userDataValues;
                userData[id] = {
                    ...userWithoutId,
                    numbers: new Set() // Use Set for faster lookups
                };
            });

            // Organize numbers by user and track timestamps
            const numbersByUser = {};
            users.forEach(user => {
                numbersByUser[user.id] = [];
            });

            numbers.forEach(numberObj => {
                const userId = numberObj.user_id;
                if (numbersByUser[userId]) {
                    numbersByUser[userId].push({
                        number: numberObj.number,
                        timestamp: numberObj.created_at
                    });
                }
            });

            // Calculate line progress for each user
            const usersWithLineProgress = [];
            Object.keys(userData).forEach(userId => {
                const data = userData[userId];
                const userNumbers = numbersByUser[userId] || [];

                // Only include users with at least one number
                if (userNumbers.length === 0) {
                    return;
                }

                // Sort numbers chronologically
                userNumbers.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                // Track which numbers we have and when each line was completed
                const numbersSet = new Set();
                const lineCompletionDates = {};

                // Process numbers chronologically to find when lines were completed
                userNumbers.forEach(({ number, timestamp }) => {
                    numbersSet.add(number);

                    // Check if this number completed any line
                    const decadeStart = Math.floor(number / 10) * 10;
                    if (decadeStart >= 10 && decadeStart <= 90) {
                        // Check if this decade is now complete
                        let isComplete = true;
                        for (let i = decadeStart; i < decadeStart + 10; i++) {
                            if (!numbersSet.has(i)) {
                                isComplete = false;
                                break;
                            }
                        }

                        // If complete and not yet recorded, record the completion date
                        if (isComplete && !lineCompletionDates[`${decadeStart}-${decadeStart + 9}`]) {
                            lineCompletionDates[`${decadeStart}-${decadeStart + 9}`] = timestamp;
                        }
                    }
                });

                // Find the line (decade) with fewest missing numbers
                // If multiple lines are complete (0 missing), choose the one completed first
                let bestLine = null;
                let fewestMissing = 10; // Max missing is 10
                let earliestCompletionDate = null;

                // Check each decade from 10-19, 20-29, ..., 90-99
                for (let decadeStart = 10; decadeStart <= 90; decadeStart += 10) {
                    let missingCount = 0;
                    let missingNumbers = [];

                    for (let i = decadeStart; i < decadeStart + 10; i++) {
                        if (!numbersSet.has(i)) {
                            missingCount++;
                            missingNumbers.push(i);
                        }
                    }

                    const lineKey = `${decadeStart}-${decadeStart + 9}`;
                    const completionDate = lineCompletionDates[lineKey];

                    // Update bestLine if:
                    // 1. This line has fewer missing numbers, OR
                    // 2. Same missing count but completed earlier (for completed lines)
                    if (missingCount < fewestMissing ||
                        (missingCount === fewestMissing && missingCount === 0 && completionDate &&
                            (!earliestCompletionDate || new Date(completionDate) < new Date(earliestCompletionDate)))) {

                        fewestMissing = missingCount;
                        earliestCompletionDate = completionDate;
                        bestLine = {
                            line: lineKey,
                            missingCount: missingCount,
                            missingNumbers: missingNumbers,
                            completedAt: completionDate || null
                        };
                    }
                }

                usersWithLineProgress.push({
                    username: data.username,
                    name_surname: data.name_surname,
                    profile_image: data.profile_image,
                    administrator: data.administrator,
                    numberCount: numbersSet.size,
                    fewestMissingLine: bestLine
                });
            });

            // Sort by fewest missing numbers in best line (ascending)
            // For completed lines (0 missing), sort by earliest completion date
            // Then by total numbers (descending)
            usersWithLineProgress.sort((a, b) => {
                // First, sort by missing count (fewer is better)
                if (a.fewestMissingLine.missingCount !== b.fewestMissingLine.missingCount) {
                    return a.fewestMissingLine.missingCount - b.fewestMissingLine.missingCount;
                }

                // If both have completed lines (0 missing), sort by completion date (earlier is better)
                if (a.fewestMissingLine.missingCount === 0 && b.fewestMissingLine.missingCount === 0) {
                    const dateA = a.fewestMissingLine.completedAt ? new Date(a.fewestMissingLine.completedAt) : null;
                    const dateB = b.fewestMissingLine.completedAt ? new Date(b.fewestMissingLine.completedAt) : null;

                    if (dateA && dateB) {
                        return dateA - dateB; // Earlier date first
                    }
                }

                // Finally, sort by total number count (more is better)
                return b.numberCount - a.numberCount;
            });

            console.info(`[getUserLineProgress] Returning ${usersWithLineProgress.length} users with line progress`);
            if (usersWithLineProgress.length > 0) {
                console.info(`[getUserLineProgress] Top 3:`, usersWithLineProgress.slice(0, 3).map(u => ({
                    username: u.username,
                    line: u.fewestMissingLine.line,
                    missing: u.fewestMissingLine.missingCount
                })));
            }

            return usersWithLineProgress;
        } catch (error) {
            console.error("Error in UserService.getUserLineProgress:", error);
            throw error;
        }
    }

    /**
     * Get all players who have completed at least one line
     * @param {number} seasonId - Optional, if null uses active season
     * @returns {Promise<Array>} - Array of all line winners sorted by completion date
     */
    async getAllLineWinners(seasonId = null) {
        try {
            // Get active season if not specified
            let targetSeasonId = seasonId;
            if (!targetSeasonId) {
                const activeSeason = await SeasonDAO.getActiveSeason();
                if (!activeSeason) {
                    throw new Error("No active season found");
                }
                targetSeasonId = activeSeason.id;
            }

            // Get users and numbers
            const users = await UserDAO.getAllUsersWithAttributes([
                "id", "username", "name_surname", "profile_image", "administrator"
            ]);

            const numbersFilter = { seasonId: targetSeasonId };
            const numbers = await NumberDAO.getAllNumbers(numbersFilter);

            // Organize numbers by user with timestamps
            const numbersByUser = {};
            users.forEach(user => {
                numbersByUser[user.id] = {
                    userData: user.get({ plain: true }),
                    numbers: []
                };
            });

            numbers.forEach(numberObj => {
                const userId = numberObj.user_id;
                if (numbersByUser[userId]) {
                    numbersByUser[userId].numbers.push({
                        number: numberObj.number,
                        timestamp: numberObj.created_at
                    });
                }
            });

            // Find all users who completed at least one line
            const lineWinners = [];
            Object.keys(numbersByUser).forEach(userId => {
                const { userData, numbers: userNumbers } = numbersByUser[userId];

                if (userNumbers.length === 0) return;

                // Sort chronologically
                userNumbers.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                const numbersSet = new Set();
                const lineCompletionDates = {};

                // Process to find when lines were completed
                userNumbers.forEach(({ number, timestamp }) => {
                    numbersSet.add(number);

                    const decadeStart = Math.floor(number / 10) * 10;
                    if (decadeStart >= 10 && decadeStart <= 90) {
                        let isComplete = true;
                        for (let i = decadeStart; i < decadeStart + 10; i++) {
                            if (!numbersSet.has(i)) {
                                isComplete = false;
                                break;
                            }
                        }

                        if (isComplete && !lineCompletionDates[`${decadeStart}-${decadeStart + 9}`]) {
                            lineCompletionDates[`${decadeStart}-${decadeStart + 9}`] = timestamp;
                        }
                    }
                });

                // If user completed at least one line, add to winners
                const completedLines = Object.keys(lineCompletionDates);
                if (completedLines.length > 0) {
                    // Find the earliest completed line
                    let earliestLine = null;
                    let earliestDate = null;

                    completedLines.forEach(line => {
                        const date = new Date(lineCompletionDates[line]);
                        if (!earliestDate || date < earliestDate) {
                            earliestDate = date;
                            earliestLine = line;
                        }
                    });

                    lineWinners.push({
                        username: userData.username,
                        name_surname: userData.name_surname,
                        profile_image: userData.profile_image,
                        administrator: userData.administrator,
                        completedLine: earliestLine,
                        completedAt: lineCompletionDates[earliestLine],
                        numberCount: numbersSet.size,
                        totalLinesCompleted: completedLines.length
                    });
                }
            });

            // Sort by completion date (earliest first)
            lineWinners.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

            console.info(`[getAllLineWinners] Found ${lineWinners.length} line winners`);
            return lineWinners;
        } catch (error) {
            console.error("Error in UserService.getAllLineWinners:", error);
            throw error;
        }
    }

    /**
     * Get all players who have completed bingo (all 90 numbers)
     * @param {number} seasonId - Optional, if null uses active season
     * @returns {Promise<Array>} - Array of all bingo winners sorted by completion date
     */
    async getAllBingoWinners(seasonId = null) {
        try {
            // Get active season if not specified
            let targetSeasonId = seasonId;
            if (!targetSeasonId) {
                const activeSeason = await SeasonDAO.getActiveSeason();
                if (!activeSeason) {
                    throw new Error("No active season found");
                }
                targetSeasonId = activeSeason.id;
            }

            // Get users and numbers
            const users = await UserDAO.getAllUsersWithAttributes([
                "id", "username", "name_surname", "profile_image", "administrator"
            ]);

            const numbersFilter = { seasonId: targetSeasonId };
            const numbers = await NumberDAO.getAllNumbers(numbersFilter);

            // Organize numbers by user with timestamps
            const numbersByUser = {};
            users.forEach(user => {
                numbersByUser[user.id] = {
                    userData: user.get({ plain: true }),
                    numbers: []
                };
            });

            numbers.forEach(numberObj => {
                const userId = numberObj.user_id;
                if (numbersByUser[userId]) {
                    numbersByUser[userId].numbers.push({
                        number: numberObj.number,
                        timestamp: numberObj.created_at
                    });
                }
            });

            // Find all users who completed bingo
            const bingoWinners = [];
            Object.keys(numbersByUser).forEach(userId => {
                const { userData, numbers: userNumbers } = numbersByUser[userId];

                if (userNumbers.length === 0) return;

                // Sort chronologically
                userNumbers.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                const numbersSet = new Set();
                let bingoCompletedAt = null;

                // Process to find when bingo was completed
                userNumbers.forEach(({ number, timestamp }) => {
                    numbersSet.add(number);

                    // Check if this number completed the bingo
                    if (!bingoCompletedAt && numbersSet.size === 90) {
                        // Verify all numbers 10-99 are present
                        let hasAllNumbers = true;
                        for (let i = 10; i <= 99; i++) {
                            if (!numbersSet.has(i)) {
                                hasAllNumbers = false;
                                break;
                            }
                        }
                        if (hasAllNumbers) {
                            bingoCompletedAt = timestamp;
                        }
                    }
                });

                // If user completed bingo, add to winners
                if (bingoCompletedAt) {
                    bingoWinners.push({
                        username: userData.username,
                        name_surname: userData.name_surname,
                        profile_image: userData.profile_image,
                        administrator: userData.administrator,
                        completedAt: bingoCompletedAt
                    });
                }
            });

            // Sort by completion date (earliest first)
            bingoWinners.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

            console.info(`[getAllBingoWinners] Found ${bingoWinners.length} bingo winners`);
            return bingoWinners;
        } catch (error) {
            console.error("Error in UserService.getAllBingoWinners:", error);
            throw error;
        }
    }
}

module.exports = new UserService();
