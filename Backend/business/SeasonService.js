const SeasonDAO = require("../DAO/SeasonDAO");

/**
 * Season Service
 * Contains all business logic for season operations
 */
class SeasonService {

    /**
     * Get the active season
     * @returns {Promise<Object|null>}
     */
    async getActiveSeason() {
        try {
            const season = await SeasonDAO.getActiveSeason();
            if (!season) {
                throw new Error("No active season found");
            }
            return season;
        } catch (error) {
            console.error("Error in SeasonService.getActiveSeason:", error);
            throw error;
        }
    }

    /**
     * Get all seasons
     * @returns {Promise<Array>}
     */
    async getAllSeasons() {
        try {
            return await SeasonDAO.getAllSeasons();
        } catch (error) {
            console.error("Error in SeasonService.getAllSeasons:", error);
            throw error;
        }
    }

    /**
     * Create a new season (Admin only)
     * @param {Object} seasonData - { name, start_date, end_date, is_active }
     * @returns {Promise<Object>}
     */
    async createSeason(seasonData) {
        try {
            // Validate required fields
            if (!seasonData.name) {
                throw new Error("Season name is required");
            }

            // If this season should be active, deactivate all others
            if (seasonData.is_active) {
                await SeasonDAO.deactivateAll();
            }

            // Create season
            const newSeason = await SeasonDAO.create(seasonData);

            return {
                success: true,
                message: "Season created successfully",
                season: newSeason
            };
        } catch (error) {
            console.error("Error in SeasonService.createSeason:", error);
            throw error;
        }
    }

    /**
     * Activate a season (Admin only)
     * @param {number} seasonId 
     * @returns {Promise<Object>}
     */
    async activateSeason(seasonId) {
        try {
            // Validate season exists
            const season = await SeasonDAO.findById(seasonId);
            if (!season) {
                throw new Error("Season not found");
            }

            // Deactivate all seasons first
            await SeasonDAO.deactivateAll();

            // Activate the selected season
            await SeasonDAO.activate(seasonId);

            return {
                success: true,
                message: "Season activated successfully",
                seasonId: seasonId
            };
        } catch (error) {
            console.error("Error in SeasonService.activateSeason:", error);
            throw error;
        }
    }
}

module.exports = new SeasonService();
