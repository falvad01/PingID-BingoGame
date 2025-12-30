const ExtensionVersion = require("./models/extension_version");
const User = require("./models/user");

class ExtensionDAO {
    /**
     * Create a new extension version
     */
    async createVersion(versionData) {
        try {
            const { version, filename, filepath, file_size, release_notes, uploaded_by } = versionData;

            const extensionVersion = await ExtensionVersion.create({
                version,
                filename,
                filepath,
                file_size,
                release_notes,
                uploaded_by
            });

            return extensionVersion.toJSON();
        } catch (error) {
            console.error('Error in ExtensionDAO.createVersion:', error);
            throw error;
        }
    }

    /**
     * Get all extension versions
     */
    async getAllVersions() {
        try {
            const versions = await ExtensionVersion.findAll({
                where: {
                    is_active: true
                },
                include: [{
                    model: User,
                    as: 'uploader',
                    attributes: ['id', 'name_surname']
                }],
                order: [['created_at', 'DESC']]
            });

            // Format response to match expected structure
            return versions.map(v => {
                const version = v.toJSON();
                return {
                    ...version,
                    uploaded_by_name: version.uploader ? version.uploader.name_surname : null
                };
            });
        } catch (error) {
            console.error('Error in ExtensionDAO.getAllVersions:', error);
            throw error;
        }
    }

    /**
     * Get latest extension version
     */
    async getLatestVersion() {
        try {
            const version = await ExtensionVersion.findOne({
                where: {
                    is_active: true
                },
                include: [{
                    model: User,
                    as: 'uploader',
                    attributes: ['id', 'name_surname']
                }],
                order: [['created_at', 'DESC']]
            });

            if (!version) return null;

            const versionData = version.toJSON();
            return {
                ...versionData,
                uploaded_by_name: versionData.uploader ? versionData.uploader.name_surname : null
            };
        } catch (error) {
            console.error('Error in ExtensionDAO.getLatestVersion:', error);
            throw error;
        }
    }

    /**
     * Get extension version by ID
     */
    async getVersionById(id) {
        try {
            const version = await ExtensionVersion.findOne({
                where: {
                    id,
                    is_active: true
                },
                include: [{
                    model: User,
                    as: 'uploader',
                    attributes: ['id', 'name_surname']
                }]
            });

            if (!version) return null;

            const versionData = version.toJSON();
            return {
                ...versionData,
                uploaded_by_name: versionData.uploader ? versionData.uploader.name_surname : null
            };
        } catch (error) {
            console.error('Error in ExtensionDAO.getVersionById:', error);
            throw error;
        }
    }

    /**
     * Delete (soft delete) an extension version
     */
    async deleteVersion(id) {
        try {
            const result = await ExtensionVersion.update(
                { is_active: false },
                { where: { id } }
            );

            return result[0] > 0;
        } catch (error) {
            console.error('Error in ExtensionDAO.deleteVersion:', error);
            throw error;
        }
    }

    /**
     * Check if version already exists
     */
    async versionExists(version) {
        try {
            const count = await ExtensionVersion.count({
                where: {
                    version,
                    is_active: true
                }
            });

            return count > 0;
        } catch (error) {
            console.error('Error in ExtensionDAO.versionExists:', error);
            throw error;
        }
    }
}

module.exports = new ExtensionDAO();
