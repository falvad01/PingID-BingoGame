const ExtensionDAO = require('../DAO/ExtensionDAO');
const fs = require('fs').promises;
const path = require('path');

class ExtensionService {
    /**
     * Upload new extension version
     */
    async uploadVersion(versionData, file) {
        try {
            // Validate version format
            if (!this.isValidVersion(versionData.version)) {
                throw new Error('Invalid version format. Use semantic versioning (e.g., 1.0, 1.0.1)');
            }

            // Check if version already exists
            const exists = await ExtensionDAO.versionExists(versionData.version);
            if (exists) {
                throw new Error('Version already exists');
            }

            // Validate file
            if (!file) {
                throw new Error('No file provided');
            }

            if (!file.originalname.endsWith('.zip')) {
                throw new Error('File must be a ZIP archive');
            }

            // Create version record
            const version = await ExtensionDAO.createVersion({
                version: versionData.version,
                filename: file.originalname,
                filepath: file.path,
                file_size: file.size,
                release_notes: versionData.release_notes || '',
                uploaded_by: versionData.uploaded_by
            });

            return { message: 'Version uploaded successfully', version };
        } catch (error) {
            // If there was an error, delete the uploaded file
            if (file && file.path) {
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
            }

            console.error('Error in ExtensionService.uploadVersion:', error);
            throw error;
        }
    }

    /**
     * Get all versions
     */
    async getAllVersions() {
        try {
            const versions = await ExtensionDAO.getAllVersions();
            return versions;
        } catch (error) {
            console.error('Error in ExtensionService.getAllVersions:', error);
            throw error;
        }
    }

    /**
     * Get latest version
     */
    async getLatestVersion() {
        try {
            const version = await ExtensionDAO.getLatestVersion();
            if (!version) {
                throw new Error('No version found');
            }
            return version;
        } catch (error) {
            console.error('Error in ExtensionService.getLatestVersion:', error);
            throw error;
        }
    }

    /**
     * Get version by ID
     */
    async getVersionById(id) {
        try {
            const version = await ExtensionDAO.getVersionById(id);
            if (!version) {
                throw new Error('Version not found');
            }
            return version;
        } catch (error) {
            console.error('Error in ExtensionService.getVersionById:', error);
            throw error;
        }
    }

    /**
     * Delete version
     */
    async deleteVersion(id) {
        try {
            // Get version info first
            const version = await ExtensionDAO.getVersionById(id);
            if (!version) {
                throw new Error('Version not found');
            }

            // Soft delete in database
            const deleted = await ExtensionDAO.deleteVersion(id);

            if (!deleted) {
                throw new Error('Failed to delete version');
            }

            // Optionally delete the file
            // Uncomment if you want to delete files permanently:
            // try {
            //   await fs.unlink(version.filepath);
            // } catch (fileError) {
            //   console.error('Error deleting file:', fileError);
            // }

            return { message: 'Version deleted successfully' };
        } catch (error) {
            console.error('Error in ExtensionService.deleteVersion:', error);
            throw error;
        }
    }

    /**
     * Validate version format (semantic versioning)
     */
    isValidVersion(version) {
        // Accept formats like: 1.0, 1.0.0, 1.0.0-beta, etc.
        const versionRegex = /^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9]+)?$/;
        return versionRegex.test(version);
    }
}

module.exports = new ExtensionService();
