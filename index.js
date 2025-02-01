require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { GiConsoleController } = require("react-icons/gi");
const { log } = require("console");

const app = express();
app.use(cors());
app.use(express.json());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("❌ Cloudinary configuration is missing. Check your .env file.");
    process.exit(1);
}

console.log("✅ Cloudinary Config Loaded:", process.env.CLOUDINARY_CLOUD_NAME);

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.array("images", 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded." });
        }

        const uploadResults = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const filePath = file.path;
            const originalFileName = file.originalname;
            const fileExtension = path.extname(originalFileName);
            const newFileName = Date.now() + "_" + i + fileExtension;

            // Upload each file to Cloudinary
            const result = await cloudinary.uploader.upload(filePath, {
                public_id: `uploads/${newFileName}`,
                folder: "uploads",
            });

            // Store the result (URL and publicId) for each file
            uploadResults.push({
                url: result.secure_url,
            });

            // Remove the temporary file after upload
            fs.unlinkSync(filePath);
        }
        

        console.log(uploadResults);

        return res.json({
            message: "Files uploaded successfully",
            results: uploadResults,
        });
    } catch (error) {
        // Clean up the files in case of an error
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }

        console.error("Upload Error:", error); // Log error for debugging

        return res.status(500).json({
            error: "Upload failed",
            details: error.message,
        });
    }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));