const numberModel = require("./models/number");
const userModel = require("./models/user");
const seasonModel = require("./models/season");
const { Op } = require("sequelize");

/**
 * Number Data Access Object
 * Handles all database operations for numbers
 */
class NumberDAO {

    /**
     * Create a new number
     * @param {Object} numberData - { user_id, season_id, number, created_at }
     * @returns {Promise<Object>}
     */
    async create(numberData) {
        try {
            return await numberModel.create(numberData);
        } catch (error) {
            console.error("Error in NumberDAO.create:", error);
            throw error;
        }
    }

    /**
     * Find or create a number
     * @param {Object} whereClause 
     * @param {Object} defaults 
     * @returns {Promise<[Object, boolean]>}
     */
    async findOrCreate(whereClause, defaults) {
        try {
            return await numberModel.findOrCreate({
                where: whereClause,
                defaults: defaults
            });
        } catch (error) {
            console.error("Error in NumberDAO.findOrCreate:", error);
            throw error;
        }
    }

    /**
     * Find number by ID
     * @param {number} id 
     * @param {Object} options - Optional Sequelize options (include, attributes, etc.)
     * @returns {Promise<Object|null>}
     */
    async findById(id, options = {}) {
        try {
            return await numberModel.findByPk(id, options);
        } catch (error) {
            console.error("Error in NumberDAO.findById:", error);
            throw error;
        }
    }

    /**
     * Find one number by criteria
     * @param {Object} whereClause 
     * @param {Object} options 
     * @returns {Promise<Object|null>}
     */
    async findOne(whereClause, options = {}) {
        try {
            return await numberModel.findOne({
                where: whereClause,
                ...options
            });
        } catch (error) {
            console.error("Error in NumberDAO.findOne:", error);
            throw error;
        }
    }

    /**
     * Update a number
     * @param {number} id 
     * @param {Object} updates 
     * @returns {Promise<Array>}
     */
    async update(id, updates) {
        try {
            const number = await numberModel.findByPk(id);
            if (!number) {
                throw new Error("Number not found");
            }
            return await number.update(updates);
        } catch (error) {
            console.error("Error in NumberDAO.update:", error);
            throw error;
        }
    }

    /**
     * Delete a number
     * @param {number} id 
     * @returns {Promise<number>}
     */
    async delete(id) {
        try {
            const number = await numberModel.findByPk(id);
            if (!number) {
                throw new Error("Number not found");
            }
            return await number.destroy();
        } catch (error) {
            console.error("Error in NumberDAO.delete:", error);
            throw error;
        }
    }

    /**
     * Get all numbers for a user in a season
     * @param {number} userId 
     * @param {number} seasonId 
     * @returns {Promise<Array>}
     */
    async getUserNumbers(userId, seasonId) {
        try {
            return await numberModel.findAll({
                attributes: ["number", "created_at", "is_extension"],
                where: {
                    user_id: userId,
                    season_id: seasonId
                }
            });
        } catch (error) {
            console.error("Error in NumberDAO.getUserNumbers:", error);
            throw error;
        }
    }

    /**
     * Get all numbers with filters
     * @param {Object} filters - { seasonId, userId, startDate, endDate, number, limit, offset }
     * @returns {Promise<Array>}
     */
    async getAllNumbers(filters = {}) {
        try {
            const whereClause = {};

            if (filters.seasonId) {
                whereClause.season_id = filters.seasonId;
            }
            if (filters.userId) {
                whereClause.user_id = filters.userId;
            }
            if (filters.number) {
                whereClause.number = filters.number;
            }
            if (filters.startDate || filters.endDate) {
                whereClause.created_at = {};
                if (filters.startDate) {
                    whereClause.created_at[Op.gte] = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    whereClause.created_at[Op.lte] = endDate;
                }
            }

            const queryOptions = {
                where: whereClause,
                include: [
                    {
                        model: userModel,
                        attributes: ["id", "username", "name_surname", "profile_image"]
                    },
                    {
                        model: seasonModel,
                        attributes: ["id", "name"]
                    }
                ],
                order: [["created_at", "DESC"]]
            };

            // Add pagination if specified
            if (filters.limit) {
                queryOptions.limit = filters.limit;
            }
            if (filters.offset !== undefined) {
                queryOptions.offset = filters.offset;
            }

            return await numberModel.findAll(queryOptions);
        } catch (error) {
            console.error("Error in NumberDAO.getAllNumbers:", error);
            throw error;
        }
    }

    /**
     * Count numbers with filters
     * @param {Object} filters - { seasonId, userId, startDate, endDate, number }
     * @returns {Promise<number>}
     */
    async countNumbers(filters = {}) {
        try {
            const whereClause = {};

            if (filters.seasonId) {
                whereClause.season_id = filters.seasonId;
            }
            if (filters.userId) {
                whereClause.user_id = filters.userId;
            }
            if (filters.number) {
                whereClause.number = filters.number;
            }
            if (filters.startDate || filters.endDate) {
                whereClause.created_at = {};
                if (filters.startDate) {
                    whereClause.created_at[Op.gte] = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    whereClause.created_at[Op.lte] = endDate;
                }
            }

            return await numberModel.count({ where: whereClause });
        } catch (error) {
            console.error("Error in NumberDAO.countNumbers:", error);
            throw error;
        }
    }

    /**
     * Get all numbers for a season (for statistics)
     * @param {number} seasonId 
     * @returns {Promise<Array>}
     */
    async getNumbersForSeason(seasonId) {
        try {
            const whereClause = seasonId ? { season_id: seasonId } : {};
            return await numberModel.findAll({
                attributes: ["number", "created_at", "is_extension"],
                where: whereClause,
                include: [
                    {
                        model: userModel,
                        attributes: ["username"]
                    }
                ]
            });
        } catch (error) {
            console.error("Error in NumberDAO.getNumbersForSeason:", error);
            throw error;
        }
    }

    /**
     * Get today's numbers for a season
     * @param {number} seasonId 
     * @param {Date} startOfDay 
     * @param {Date} endOfDay 
     * @returns {Promise<Array>}
     */
    async getTodayNumbers(seasonId, startOfDay, endOfDay) {
        try {
            const whereClause = {
                created_at: {
                    [Op.between]: [startOfDay.getTime(), endOfDay.getTime()]
                }
            };

            if (seasonId) {
                whereClause.season_id = seasonId;
            }

            return await numberModel.findAll({
                attributes: ["number", "created_at", "is_extension"],
                where: whereClause,
                include: [
                    {
                        model: userModel,
                        attributes: ["username", "profile_image", "id"]
                    }
                ]
            });
        } catch (error) {
            console.error("Error in NumberDAO.getTodayNumbers:", error);
            throw error;
        }
    }

    /**
     * Check if user has number for specific date and season
     * @param {number} userId 
     * @param {number} seasonId 
     * @param {Date} startOfDay 
     * @param {Date} endOfDay 
     * @returns {Promise<Object|null>}
     */
    async findByUserAndDate(userId, seasonId, startOfDay, endOfDay) {
        try {
            return await numberModel.findOne({
                where: {
                    user_id: userId,
                    season_id: seasonId,
                    created_at: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            });
        } catch (error) {
            console.error("Error in NumberDAO.findByUserAndDate:", error);
            throw error;
        }
    }
}

module.exports = new NumberDAO();
