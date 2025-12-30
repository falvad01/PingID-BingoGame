const seasonModel = require("./models/season");

/**
 * Season Data Access Object
 * Handles all database operations for seasons
 */
class SeasonDAO {

    /**
     * Get the active season
     * @returns {Promise<Object|null>}
     */
    async getActiveSeason() {
        try {
            return await seasonModel.findOne({
                where: { is_active: true }
            });
        } catch (error) {
            console.error("Error in SeasonDAO.getActiveSeason:", error);
            throw error;
        }
    }

    /**
     * Get all seasons
     * @param {Object} options - Sequelize options (order, attributes, etc.)
     * @returns {Promise<Array>}
     */
    async getAllSeasons(options = {}) {
        try {
            const defaultOptions = {
                order: [['created_at', 'DESC']]
            };
            return await seasonModel.findAll({
                ...defaultOptions,
                ...options
            });
        } catch (error) {
            console.error("Error in SeasonDAO.getAllSeasons:", error);
            throw error;
        }
    }

    /**
     * Find season by ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        try {
            return await seasonModel.findByPk(id);
        } catch (error) {
            console.error("Error in SeasonDAO.findById:", error);
            throw error;
        }
    }

    /**
     * Create a new season
     * @param {Object} seasonData - { name, start_date, end_date, is_active }
     * @returns {Promise<Object>}
     */
    async create(seasonData) {
        try {
            return await seasonModel.create({
                name: seasonData.name,
                start_date: seasonData.start_date || null,
                end_date: seasonData.end_date || null,
                is_active: seasonData.is_active || false
            });
        } catch (error) {
            console.error("Error in SeasonDAO.create:", error);
            throw error;
        }
    }

    /**
     * Deactivate all seasons
     * @returns {Promise<Array>}
     */
    async deactivateAll() {
        try {
            return await seasonModel.update(
                { is_active: false },
                { where: { is_active: true } }
            );
        } catch (error) {
            console.error("Error in SeasonDAO.deactivateAll:", error);
            throw error;
        }
    }

    /**
     * Activate a season by ID
     * @param {number} id 
     * @returns {Promise<Array>}
     */
    async activate(id) {
        try {
            return await seasonModel.update(
                { is_active: true },
                { where: { id: id } }
            );
        } catch (error) {
            console.error("Error in SeasonDAO.activate:", error);
            throw error;
        }
    }
}

module.exports = new SeasonDAO();
