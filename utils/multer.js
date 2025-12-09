const multer = require("multer");

// ✅ Store files ONLY in RAM (Buffer)
const storage = multer.memoryStorage();

// ✅ File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/x-matroska", // MKV
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only images, videos, and PDFs are allowed"),
      false
    );
  }

  cb(null, true);
};

// ✅ 100MB limit
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
