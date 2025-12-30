const NumberDAO = require("../DAO/NumberDAO");
const SeasonDAO = require("../DAO/SeasonDAO");
const moment = require("moment");
const { Op } = require("sequelize");

/**
 * Number Service
 * Contains all business logic for number operations
 */
class NumberService {

    /**
     * Add a new number for the user
     * @param {number} userId 
     * @param {number} numberValue 
     * @param {number} seasonId - Optional, uses active season if not provided
     * @returns {Promise<Object>}
     */
    async addNumber(userId, numberValue, seasonId = null) {
        try {
            // Validate number range
            const parsedNumber = parseInt(numberValue, 10);
            if (!Number.isInteger(parsedNumber) || parsedNumber < 10 || parsedNumber > 99) {
                throw new Error("Number must be between 10 and 99");
            }

            // Get season
            let targetSeasonId = seasonId;
            if (!targetSeasonId) {
                const activeSeason = await SeasonDAO.getActiveSeason();
                if (!activeSeason) {
                    throw new Error("No active season found. Please contact administrator.");
                }
                targetSeasonId = activeSeason.id;
            }

            // Check if user already has a number today
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            const [number, created] = await NumberDAO.findOrCreate(
                {
                    user_id: userId,
                    season_id: targetSeasonId,
                    created_at: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                },
                {
                    number: parsedNumber,
                    created_at: new Date()
                }
            );

            if (!created) {
                throw new Error("Number already created for today");
            }

            return {
                success: true,
                message: "Number added correctly",
                number: number
            };
        } catch (error) {
            console.error("Error in NumberService.addNumber:", error);
            throw error;
        }
    }

    /**
     * Get user numbers with count for each number (10-99)
     * @param {number} userId 
     * @param {number} seasonId 
     * @returns {Promise<Array>}
     */
    async getUserNumbers(userId, seasonId) {
        try {
            const data = await NumberDAO.getUserNumbers(userId, seasonId);

            // Initialize counts for numbers 10-99
            const numberCounts = {};
            const numberDates = {};
            for (let i = 10; i <= 99; i++) {
                numberCounts[i] = 0;
                numberDates[i] = [];
            }

            // Count occurrences and store dates
            data.forEach(record => {
                const num = record.number;

                // Skip numbers outside valid range (data integrity check)
                if (num < 10 || num > 99) {
                    console.warn(`Invalid number ${num} found for user ${userId} in season ${seasonId}. Skipping.`);
                    return;
                }

                numberCounts[num]++;
                numberDates[num].push(record.created_at);
            });

            // Convert to array format
            const result = Object.keys(numberCounts).map(number => ({
                number: parseInt(number, 10),
                count: numberCounts[number],
                dates: numberDates[number]
            }));

            return result;
        } catch (error) {
            console.error("Error in NumberService.getUserNumbers:", error);
            throw error;
        }
    }

    /**
     * Get all numbers with user information and metadata
     * @param {number} seasonId 
     * @returns {Promise<Object>} - { numbers: [], metadata: {} }
     */
    async getAllNumbers(seasonId) {
        try {
            const data = await NumberDAO.getNumbersForSeason(seasonId);

            const numberData = {};
            const allDates = new Set();

            // Process numbers
            data.forEach(record => {
                const num = record.number;
                const username = record.User.username;
                const createdAt = record.created_at;

                // Track unique dates
                const dateOnly = new Date(createdAt).toISOString().split('T')[0];
                allDates.add(dateOnly);

                if (!numberData[num]) {
                    numberData[num] = {
                        number: num,
                        repetitions: 0,
                        users: {},
                        dates: []
                    };
                }

                numberData[num].repetitions++;
                if (!numberData[num].users[username]) {
                    numberData[num].users[username] = 0;
                }
                numberData[num].users[username]++;
                numberData[num].dates.push(createdAt);
            });

            // Convert users object to array
            const numbers = Object.values(numberData).map(({ number, repetitions, users, dates }) => ({
                number,
                repetitions,
                users: Object.keys(users).map(username => ({
                    username,
                    count: users[username]
                })),
                dates
            }));

            const metadata = {
                totalActiveDays: allDates.size,
                totalEntries: data.length
            };

            return { numbers, metadata };
        } catch (error) {
            console.error("Error in NumberService.getAllNumbers:", error);
            throw error;
        }
    }

    /**
     * Get number statistics for a season
     * @param {number} seasonId 
     * @returns {Promise<Object>}
     */
    async getStatistics(seasonId) {
        try {
            const data = await NumberDAO.getNumbersForSeason(seasonId);

            // Count occurrences
            const numberCount = new Map();
            data.forEach(entry => {
                const number = entry.number;
                numberCount.set(number, (numberCount.get(number) || 0) + 1);
            });

            let mostFrequentNumber = 0;
            let allNumbersIntroduced = data.length;
            let totalNumbers = 0;
            let missingNumbers = 0;
            let onceAppearedCount = 0;
            let moreThanOnceCount = 0;
            let maxCount = 0;
            let minCount = Infinity;

            // Calculate statistics for range 10-99
            for (let i = 10; i <= 99; i++) {
                const count = numberCount.get(i) || 0;

                if (count > maxCount) {
                    maxCount = count;
                    mostFrequentNumber = i;
                }

                if (count < minCount) {
                    minCount = count;
                }

                if (count > 0) {
                    totalNumbers++;
                    if (count === 1) {
                        onceAppearedCount++;
                    } else {
                        moreThanOnceCount++;
                    }
                } else {
                    missingNumbers++;
                }
            }

            if (minCount === Infinity) {
                minCount = 0;
                allNumbersIntroduced = null;
            }

            return {
                mostFrequentNumber,
                allNumbersIntroduced,
                totalNumbers,
                missingNumbers,
                onceAppearedCount,
                moreThanOnceCount
            };
        } catch (error) {
            console.error("Error in NumberService.getStatistics:", error);
            throw error;
        }
    }

    /**
     * Get today's numbers enriched with alreadyExists flag
     * @param {number} seasonId 
     * @returns {Promise<Array>}
     */
    async getTodayNumbers(seasonId) {
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const todayRecords = await NumberDAO.getTodayNumbers(seasonId, startOfDay, endOfDay);

            // Enrich with alreadyExists flag
            const enrichedRecords = await Promise.all(
                todayRecords.map(async record => {
                    const userId = record.User.id;
                    const number = record.number;

                    const startOfToday = moment().startOf("day").toDate();

                    // Check if number exists for user before today
                    const numberExistsForUser = await NumberDAO.findOne({
                        user_id: userId,
                        number: number,
                        season_id: seasonId,
                        created_at: { [Op.lt]: startOfToday }
                    }, { raw: true });

                    return {
                        ...record.toJSON(),
                        alreadyExists: !!numberExistsForUser
                    };
                })
            );

            return enrichedRecords;
        } catch (error) {
            console.error("Error in NumberService.getTodayNumbers:", error);
            throw error;
        }
    }

    /**
     * Admin: Add number for any user/season/date
     * @param {number} userId 
     * @param {number} seasonId 
     * @param {number} numberValue 
     * @param {string} date 
     * @returns {Promise<Object>}
     */
    async adminAddNumber(userId, seasonId, numberValue, date) {
        try {
            // Validate number
            const parsedNumber = parseInt(numberValue, 10);
            if (!Number.isInteger(parsedNumber) || parsedNumber < 10 || parsedNumber > 99) {
                throw new Error("Number must be between 10 and 99");
            }

            // Check for existing number on same date
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            const existingNumber = await NumberDAO.findByUserAndDate(userId, seasonId, startOfDay, endOfDay);

            if (existingNumber) {
                throw new Error("User already has a number for this date and season");
            }

            // Create number
            const newNumber = await NumberDAO.create({
                user_id: userId,
                season_id: seasonId,
                number: parsedNumber,
                created_at: targetDate
            });

            // Return with relations
            const createdNumber = await NumberDAO.findById(newNumber.id, {
                include: [
                    { model: require("../database/models/user"), attributes: ["id", "username", "name_surname"] },
                    { model: require("../database/models/season"), attributes: ["id", "name"] }
                ]
            });

            return {
                success: true,
                message: "Number added successfully",
                number: createdNumber
            };
        } catch (error) {
            console.error("Error in NumberService.adminAddNumber:", error);
            throw error;
        }
    }

    /**
     * Admin: Edit a number
     * @param {number} id 
     * @param {Object} updates - { number, date }
     * @returns {Promise<Object>}
     */
    async adminEditNumber(id, updates) {
        try {
            const existingNumber = await NumberDAO.findById(id);
            if (!existingNumber) {
                throw new Error("Number not found");
            }

            const updateData = {};

            // Validate and add number update
            if (updates.number !== undefined) {
                const numberValue = parseInt(updates.number, 10);
                if (!Number.isInteger(numberValue) || numberValue < 10 || numberValue > 99) {
                    throw new Error("Number must be between 10 and 99");
                }
                updateData.number = numberValue;
            }

            // Validate and add date update
            if (updates.date !== undefined) {
                const targetDate = new Date(updates.date);
                const startOfDay = new Date(targetDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(targetDate);
                endOfDay.setHours(23, 59, 59, 999);

                // Check for duplicates (excluding current number)
                const duplicateCheck = await NumberDAO.findOne({
                    id: { [Op.ne]: id },
                    user_id: existingNumber.user_id,
                    season_id: existingNumber.season_id,
                    created_at: { [Op.between]: [startOfDay, endOfDay] }
                });

                if (duplicateCheck) {
                    throw new Error("User already has a number for this date and season");
                }

                updateData.created_at = targetDate;
            }

            // Update number
            const updatedNumber = await NumberDAO.update(id, updateData);

            // Return with relations
            const result = await NumberDAO.findById(id, {
                include: [
                    { model: require("../database/models/user"), attributes: ["id", "username", "name_surname"] },
                    { model: require("../database/models/season"), attributes: ["id", "name"] }
                ]
            });

            return {
                success: true,
                message: "Number updated successfully",
                number: result
            };
        } catch (error) {
            console.error("Error in NumberService.adminEditNumber:", error);
            throw error;
        }
    }

    /**
     * Admin: Delete a number
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async adminDeleteNumber(id) {
        try {
            await NumberDAO.delete(id);
            return {
                success: true,
                message: "Number deleted successfully",
                deletedId: id
            };
        } catch (error) {
            console.error("Error in NumberService.adminDeleteNumber:", error);
            throw error;
        }
    }

    /**
     * Admin: Get all numbers with filters and pagination
     * @param {Object} filters - { seasonId, userId, startDate, endDate, number, page, limit }
     * @returns {Promise<Object>} - { data: [], total: number, page: number, totalPages: number }
     */
    async adminGetNumbers(filters) {
        try {
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 50;
            const offset = (page - 1) * limit;

            // Get total count
            const total = await NumberDAO.countNumbers(filters);

            // Get paginated results
            const data = await NumberDAO.getAllNumbers({
                ...filters,
                limit,
                offset
            });

            const totalPages = Math.ceil(total / limit);

            return {
                data,
                total,
                page,
                totalPages,
                limit
            };
        } catch (error) {
            console.error("Error in NumberService.adminGetNumbers:", error);
            throw error;
        }
    }
}

module.exports = new NumberService();
