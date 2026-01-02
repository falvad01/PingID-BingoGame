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
            // Store only the filename (relative path) instead of absolute path
            const filename = path.basename(file.path);
            const version = await ExtensionDAO.createVersion({
                version: versionData.version,
                filename: file.originalname,
                filepath: filename, // Store only filename, not full path
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
     * Delete version (complete deletion: file + database record)
     */
    async deleteVersion(id) {
        try {
            console.log(`[ExtensionService] Starting deletion of version ID: ${id}`);

            // Get version info first (use special method that doesn't filter by is_active)
            const version = await ExtensionDAO.getVersionByIdForDeletion(id);
            if (!version) {
                console.error(`[ExtensionService] Version not found: ${id}`);
                throw new Error('Version not found');
            }

            console.log(`[ExtensionService] Found version:`, {
                id: version.id,
                version: version.version,
                filepath: version.filepath,
                is_active: version.is_active
            });

            // Extract filename from filepath (handles both absolute and relative paths)
            let filename = version.filepath;
            if (filename.includes('/') || filename.includes('\\')) {
                filename = path.basename(filename);
            }

            // Resolve to absolute path in the uploads/extensions directory
            const absolutePath = path.join(__dirname, '../uploads/extensions/', filename);
            console.log(`[ExtensionService] Attempting to delete file:`, absolutePath);

            // Try to delete the physical file
            let fileDeleted = false;
            try {
                if (await fs.access(absolutePath).then(() => true).catch(() => false)) {
                    await fs.unlink(absolutePath);
                    fileDeleted = true;
                    console.log(`[ExtensionService] ✓ File deleted successfully: ${absolutePath}`);
                } else {
                    console.warn(`[ExtensionService] ⚠ File not found, skipping deletion: ${absolutePath}`);
                }
            } catch (fileError) {
                console.error('[ExtensionService] ✗ Error deleting file:', fileError);
                console.warn('[ExtensionService] Continuing with database deletion despite file error');
            }

            // Hard delete from database (permanent removal)
            console.log(`[ExtensionService] Attempting to delete from database: ${id}`);
            const deleted = await ExtensionDAO.hardDeleteVersion(id);

            if (!deleted) {
                console.error(`[ExtensionService] ✗ Failed to delete version from database: ${id}`);
                throw new Error('Failed to delete version from database');
            }

            console.log(`[ExtensionService] ✓ Version deleted from database: ${id}`);
            console.log(`[ExtensionService] ✓ Deletion complete for version ${version.version}`);

            return {
                message: 'Version deleted successfully',
                fileDeleted,
                databaseDeleted: true
            };
        } catch (error) {
            console.error('[ExtensionService] Error in deleteVersion:', error);
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
