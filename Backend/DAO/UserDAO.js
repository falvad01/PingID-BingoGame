const userModel = require("./models/user");
const { Op } = require("sequelize");

/**
 * User Data Access Object
 * Handles all database operations for users
 */
class UserDAO {

    /**
     * Find user by username
     * @param {string} username 
     * @returns {Promise<Object|null>}
     */
    async findByUsername(username) {
        try {
            return await userModel.findOne({
                where: { username: username }
            });
        } catch (error) {
            console.error("Error in UserDAO.findByUsername:", error);
            throw error;
        }
    }

    /**
     * Find user by ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        try {
            return await userModel.findByPk(id);
        } catch (error) {
            console.error("Error in UserDAO.findById:", error);
            throw error;
        }
    }

    /**
     * Get all users
     * @returns {Promise<Array>}
     */
    async getAllUsers() {
        try {
            return await userModel.findAll();
        } catch (error) {
            console.error("Error in UserDAO.getAllUsers:", error);
            throw error;
        }
    }

    /**
     * Get users with specific attributes (no password)
     * @param {Array} attributes - Array of attribute names to include
     * @returns {Promise<Array>}
     */
    async getAllUsersWithAttributes(attributes) {
        try {
            return await userModel.findAll({
                attributes: attributes
            });
        } catch (error) {
            console.error("Error in UserDAO.getAllUsersWithAttributes:", error);
            throw error;
        }
    }

    /**
     * Create a new user
     * @param {Object} userData - { username, name_surname, password, administrator }
     * @returns {Promise<Object>}
     */
    async create(userData) {
        try {
            const [user, created] = await userModel.findOrCreate({
                where: { username: userData.username },
                defaults: {
                    name_surname: userData.name_surname,
                    password: userData.password,
                    administrator: userData.administrator || 0
                }
            });
            return { user, created };
        } catch (error) {
            console.error("Error in UserDAO.create:", error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {number} id 
     * @param {Object} updateData - { username, name_surname, profile_image }
     * @returns {Promise<Array>} - [numberOfAffectedRows, affectedRows]
     */
    async update(id, updateData) {
        try {
            return await userModel.update(updateData, {
                where: { id: id }
            });
        } catch (error) {
            console.error("Error in UserDAO.update:", error);
            throw error;
        }
    }

    /**
     * Get user profile without password
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    async getProfile(id) {
        try {
            return await userModel.findOne({
                attributes: ["username", "name_surname", "profile_image"],
                where: { id: id }
            });
        } catch (error) {
            console.error("Error in UserDAO.getProfile:", error);
            throw error;
        }
    }

    /**
     * Check if user is admin
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    async isAdmin(id) {
        try {
            const user = await userModel.findByPk(id, {
                attributes: ["administrator"]
            });
            return user ? user.administrator === 1 : false;
        } catch (error) {
            console.error("Error in UserDAO.isAdmin:", error);
            throw error;
        }
    }
}

module.exports = new UserDAO();
