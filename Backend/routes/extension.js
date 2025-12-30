const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const tokenUtils = require('../utils/TokenUtils');

const ExtensionService = require('../business/ExtensionService');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/extensions');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'extension-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    },
    fileFilter: function (req, file, cb) {
        // Only accept ZIP files
        if (path.extname(file.originalname).toLowerCase() !== '.zip') {
            return cb(new Error('Only ZIP files are allowed'));
        }
        cb(null, true);
    }
});

/**
 * Upload new extension version (Admin only)
 */
router.post('/upload', tokenUtils.verifyToken, upload.single('file'), async (req, res) => {
    try {
        // Get user from token
        let token = req.headers['x-access-token'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, '');
        const decoded = tokenUtils.parseJwt(token);

        // Verify user is admin
        if (!decoded.administrator || decoded.administrator !== 1) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { version, release_notes } = req.body;

        if (!version) {
            return res.status(400).json({ error: 'Version is required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const result = await ExtensionService.uploadVersion({
            version,
            release_notes,
            uploaded_by: decoded.userId
        }, req.file);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error uploading extension:', error);
        if (error.message.includes('already exists')) {
            res.status(400).json({ error: error.message });
        } else if (error.message.includes('Invalid version')) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

/**
 * Get all extension versions
 */
router.get('/versions', tokenUtils.verifyToken, async (req, res) => {
    try {
        const versions = await ExtensionService.getAllVersions();
        res.status(200).json(versions);
    } catch (error) {
        console.error('Error getting versions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get latest extension version
 */
router.get('/latest', tokenUtils.verifyToken, async (req, res) => {
    try {
        const version = await ExtensionService.getLatestVersion();
        res.status(200).json(version);
    } catch (error) {
        console.error('Error getting latest version:', error);
        if (error.message === 'No version found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

/**
 * Download specific extension version
 * Accepts token from query parameter OR header for compatibility with browser downloads
 */
router.get('/download/:id', async (req, res) => {
    try {
        // Try to get token from query parameter first, then from headers
        let token = req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Remove Bearer prefix if present
        token = token.replace(/^Bearer\s+/, '');

        // Verify token
        try {
            const decoded = tokenUtils.parseJwt(token);
            if (!decoded || !decoded.userId) {
                return res.status(401).json({ error: 'Invalid token' });
            }
        } catch (tokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const versionId = parseInt(req.params.id);
        const version = await ExtensionService.getVersionById(versionId);

        // Check if file exists
        if (!fs.existsSync(version.filepath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Send file
        res.download(version.filepath, version.filename, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error downloading file' });
                }
            }
        });
    } catch (error) {
        console.error('Error downloading extension:', error);
        if (error.message === 'Version not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

/**
 * Delete extension version (Admin only)
 */
router.delete('/:id', tokenUtils.verifyToken, async (req, res) => {
    try {
        // Get user from token
        let token = req.headers['x-access-token'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, '');
        const decoded = tokenUtils.parseJwt(token);

        // Verify user is admin
        if (!decoded.administrator || decoded.administrator !== 1) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const versionId = parseInt(req.params.id);
        const result = await ExtensionService.deleteVersion(versionId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting extension:', error);
        if (error.message === 'Version not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

module.exports = router;
