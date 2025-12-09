


const cloudinary = require("./cloudinary");

exports.uploadToCloudinary = (buffer, folder, mimetype) => {
  return new Promise((resolve, reject) => {

    const resourceType = mimetype.startsWith("video")
      ? "video"
      : mimetype === "application/pdf"
      ? "raw"
      : "image";

    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};


// ✅ Delete from Cloudinary
exports.deleteFromCloudinary = async (publicId, resourceType = "image") => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

