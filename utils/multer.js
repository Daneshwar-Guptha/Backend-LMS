const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "LMS",   // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "pdf"],
  },
});

const upload = multer({ storage: storage });


module.exports = upload;
