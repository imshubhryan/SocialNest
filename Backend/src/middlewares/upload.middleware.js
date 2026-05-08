const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return cb(new ApiError(400, `File type '${file.mimetype}' not allowed. Allowed: JPEG, PNG, WEBP, GIF, MP4, WEBM`), false);
    }
    cb(null, true);
};

// Standard image upload (posts, profiles)
const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return cb(new ApiError(400, `Only image files allowed. Got: ${file.mimetype}`), false);
        }
        cb(null, true);
    }
});

// Media upload (stories — images + videos)
const uploadMedia = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_VIDEO_SIZE },
    fileFilter
});

module.exports = { uploadImage, uploadMedia };
