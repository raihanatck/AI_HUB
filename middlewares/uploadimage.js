const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set the directory for uploads
const uploadDir = path.join(__dirname, 'uploads');

// Ensure the upload directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use the ensured directory for saving images
    },
    filename: (req, file, cb) => {
        // Generate a unique filename with the original extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only image files are allowed!'), false); // Reject file
    }
};

// Multer configuration with size limit and file filter
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // Limit file size to 20 MB
});

// Middleware to handle multer errors
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ Message: 'File size exceeds the 20 MB limit.' });
        }
    } else if (err) {
        // General errors
        return res.status(400).json({ Message: err.message });
    }
    next();
};

module.exports = {
    upload,
    multerErrorHandler
};
