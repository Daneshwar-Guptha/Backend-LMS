const express = require("express");
const instructorRouter = express.Router();

const Course = require("../model/Course");
const Enrollment = require("../model/Enrollement");

// IMPORTS YOU MISSED
const upload = require("../utils/multer");
const { auth } = require("../middleware/auth");
const { RoleBased } = require("../middleware/auth");

const {
  uploadToCloudinary,
  deleteFromCloudinary
} = require("../utils/cloudinaryHelper");

// -------- VIEW PROFILE --------
instructorRouter.get("/view", auth, RoleBased("instructor"), (req, res) => {
  res.status(200).json(req.user);
});

// -------- ADD COURSE --------
instructorRouter.post(
  "/add/course",
  auth,
  RoleBased("instructor"),
  upload.fields([
    { name: "coverPhoto", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, description, price, startDate, endDate } = req.body;

      // ---------------- VALIDATION ----------------
      if (!title) {
        return res.status(400).json({ message: "Course title is required" });
      }
      if (!description) {
        return res.status(400).json({ message: "Course description is required" });
      }
      if (!price) {
        return res.status(400).json({ message: "Course price is required" });
      }

      // ---------------- FILE UPLOADS ----------------
      let coverPhotoUrl = "";
      let coverPhotoPublicId = "";

      if (req.files && req.files.coverPhoto) {
        const cover = await uploadToCloudinary(
          req.files.coverPhoto[0].buffer,
          "course_covers"
        );
        coverPhotoUrl = cover.secure_url;
        coverPhotoPublicId = cover.public_id;
      }

      let thumbnailUrl = "";
      let thumbnailPublicId = "";

      if (req.files && req.files.thumbnail) {
        const thumb = await uploadToCloudinary(
          req.files.thumbnail[0].buffer,
          "course_thumbnails"
        );
        thumbnailUrl = thumb.secure_url;
        thumbnailPublicId = thumb.public_id;
      }

      // ---------------- CREATE COURSE ----------------
      const course = new Course({
        title,
        description,
        price,
        startDate,
        endDate,
        instructorId: req.user._id,

        thumbnail: thumbnailUrl,       // For front-end card UI
        thumbnailPublicId,

        coverPhoto: coverPhotoUrl,     // Optional
        coverPhotoPublicId,

        sections: []                   // Empty initially
      });

      const savedCourse = await course.save();

      return res.status(201).json({
        message: "Course created successfully",
        data: savedCourse
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);






module.exports = instructorRouter;
