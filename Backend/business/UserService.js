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
}

module.exports = new UserService();
