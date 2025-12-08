const express = require("express");
const instructorRouter = express.Router();
const Course = require("../model/Course");
const Enrollment = require("../model/Enrollement");
const upload = require("../utils/multer");
const { auth, instructorAuth } = require("../middleware/auth");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinaryHelper");
const multer = require("multer");

// -------- VIEW PROFILE --------
instructorRouter.get("/view", auth, instructorAuth, (req, res) => {
  res.status(200).json(req.user);
});

instructorRouter.post(
  "/addCourse",
  auth,
  instructorAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log(req.files);
      const thumbnail = req.files.thumbnail[0].path;
      const thumbnailPublicId = req.files.thumbnail[0].filename;

      const coverPhoto = req.files.coverPhoto[0].path;
      const coverPhotoPublicId = req.files.coverPhoto[0].filename;

      res.json({
        thumbnail,
        thumbnailPublicId,
        coverPhoto,
        coverPhotoPublicId,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);


module.exports = instructorRouter;
