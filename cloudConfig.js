const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer'); // Make sure to import multer here

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'restify', // Replace with your folder name
        allowed_formats: ['jpeg', 'png', 'jpg'], // Specify allowed formats
    },
});

// Create the multer upload instance
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload }; // Export both cloudinary and upload
