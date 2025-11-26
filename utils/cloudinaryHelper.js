const cloudinary = require("./cloudinary");

// Upload buffer to Cloudinary (image / video / raw)
exports.uploadToCloudinary = (buffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
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

// Delete from Cloudinary
exports.deleteFromCloudinary = async (publicId, resourceType = "image") => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};
