const express = require("express");
const instructorRouter = express.Router();
const Course = require("../model/Course");
const Enrollment = require("../model/Enrollement");
const upload = require("../utils/multer");
const { auth, instructorAuth } = require("../middleware/auth");
const { uploadToCloudinary,deleteFromCloudinary} = require("../utils/cloudinaryHelper");
const multer = require("multer");
const User = require("../model/User");

// -------- VIEW PROFILE --------
instructorRouter.get("/view", auth, instructorAuth, (req, res) => {
  res.status(200).json(req.user);
});

//-------------- view Profile
instructorRouter.get("/profile", auth, instructorAuth, async (req, res) => {
  try {
    const user = req.user;
    const instructor = await User.findById(user._id);
    res.status(200).json(instructor);
  } catch (error) {
    res.status(400).send("something went wrong " + error.message);
  }
});
  
// ------------ Add Course -------------
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
      // ✅ File validation
      if (!req.files?.thumbnail || !req.files?.coverPhoto) {
        return res
          .status(400)
          .json({ error: "Thumbnail and Cover Photo are required" });
      }

      const thumbnailFile = req.files.thumbnail[0];
      const coverPhotoFile = req.files.coverPhoto[0];

      // ✅ Manual upload to Cloudinary using BUFFER
      const thumbnailUpload = await uploadToCloudinary(
        thumbnailFile.buffer,
        "LMS/courses",
        thumbnailFile.mimetype
      );

      const coverPhotoUpload = await uploadToCloudinary(
        coverPhotoFile.buffer,
        "LMS/courses",
        coverPhotoFile.mimetype
      );

      const { title, description, price } = req.body;
      const user = req.user;

      // ✅ Validation
      if (!title || title.trim() === "") {
        throw new Error("Invalid title");
      }

      if (!description || description.trim() === "") {
        throw new Error("Invalid description");
      }

      if (!price || isNaN(price)) {
        throw new Error("Invalid price");
      }

      // ✅ Save to DB with Cloudinary URLs
      const addCourse = new Course({
        title: title.trim(),
        description: description.trim(),
        instructorId: user.id,
        price: Number(price),

        thumbnail: thumbnailUpload.secure_url,
        thumbnailPublicId: thumbnailUpload.public_id,

        coverPhoto: coverPhotoUpload.secure_url,
        coverPhotoPublicId: coverPhotoUpload.public_id,
      });

      await addCourse.save();

      res.status(201).json({ message: "Course created successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

//------------- Create Section ---------------
instructorRouter.post(
  "/course/:courseId/section",
  auth,
  instructorAuth,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { sectionTitle } = req.body;

      if (!sectionTitle?.trim()) {
        return res.status(400).json({ error: "Section title is required" });
      }

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      course.sections.push({
        title: sectionTitle.trim(),
        lessons: [],
      });

      await course.save();

      res.status(201).json({ message: "Section created successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//------- Create Lesson in sectionId--------
instructorRouter.post(
  "/course/:courseId/section/:sectionId/lesson",
  auth,
  instructorAuth,
  upload.fields([
    { name: "videoUrl", maxCount: 1 },
    { name: "cheatSheetUrl", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { courseId, sectionId } = req.params;
      const { lessonTitle, duration } = req.body;

      if (!lessonTitle?.trim()) {
        return res.status(400).json({ error: "Lesson title required" });
      }

      if (!req.files?.videoUrl || !req.files?.cheatSheetUrl) {
        return res.status(400).json({ error: "Video & PDF required" });
      }

      const video = req.files.videoUrl[0];
      const pdf = req.files.cheatSheetUrl[0];

      const videoUpload = await uploadToCloudinary(
        video.buffer,
        "LMS/lessons",
        video.mimetype
      );
      const pdfUpload = await uploadToCloudinary(
        pdf.buffer,
        "LMS/lessons",
        pdf.mimetype
      );

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const section = course.sections.id(sectionId);
      if (!section) return res.status(404).json({ error: "Section not found" });

      section.lessons.push({
        title: lessonTitle.trim(),
        videoUrl: videoUpload.secure_url,
        videoPublicId: videoUpload.public_id,
        cheatSheetUrl: pdfUpload.secure_url,
        cheatSheetPublicId: pdfUpload.public_id,
        duration: Number(duration) || 0,
      });

      await course.save();

      res.status(201).json({ message: "Lesson added successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//---------- updateLesson -----
instructorRouter.put(
  "/course/:courseId/section/:sectionId/lesson/:lessonId",
  auth,
  instructorAuth,
  upload.fields([
    { name: "videoUrl", maxCount: 1 },
    { name: "cheatSheetUrl", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { courseId, sectionId, lessonId } = req.params;
      const { lessonTitle, duration } = req.body;

      const course = await Course.findById(courseId);
      const section = course.sections.id(sectionId);
      const lesson = section.lessons.id(lessonId);

      if (lessonTitle) lesson.title = lessonTitle.trim();
      if (duration) lesson.duration = Number(duration);

      // ✅ Replace video
      if (req.files?.videoUrl) {
        await deleteFromCloudinary(lesson.videoPublicId, "video");
        const upload = await uploadToCloudinary(
          req.files.videoUrl[0].buffer,
          "LMS/lessons",
          req.files.videoUrl[0].mimetype
        );
        lesson.videoUrl = upload.secure_url;
        lesson.videoPublicId = upload.public_id;
      }

      // ✅ Replace PDF
      if (req.files?.cheatSheetUrl) {
        await deleteFromCloudinary(lesson.cheatSheetPublicId, "raw");
        const upload = await uploadToCloudinary(
          req.files.cheatSheetUrl[0].buffer,
          "LMS/lessons",
          req.files.cheatSheetUrl[0].mimetype
        );
        lesson.cheatSheetUrl = upload.secure_url;
        lesson.cheatSheetPublicId = upload.public_id;
      }

      await course.save();
      res.json({ message: "Lesson updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//--------- Delete lesson -------
instructorRouter.delete(
  "/course/:courseId/section/:sectionId/lesson/:lessonId",
  auth,
  instructorAuth,
  async (req, res) => {
    try {
      const { courseId, sectionId, lessonId } = req.params;

      const course = await Course.findById(courseId);
      const section = course.sections.id(sectionId);
      const lesson = section.lessons.id(lessonId);

      await deleteFromCloudinary(lesson.videoPublicId, "video");
      await deleteFromCloudinary(lesson.cheatSheetPublicId, "raw");

      lesson.deleteOne();
      await course.save();

      res.json({ message: "Lesson deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//---------- Upadte sectionTitle ----------
instructorRouter.put(
  "/course/:courseId/section/:sectionId",
  auth,
  instructorAuth,
  async (req, res) => {
    try {
      const { courseId, sectionId } = req.params;
      const { sectionTitle } = req.body;

      const course = await Course.findById(courseId);
      const section = course.sections.id(sectionId);

      section.title = sectionTitle.trim();
      await course.save();

      res.json({ message: "Section updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//------ Delete Section --------
instructorRouter.delete(
  "/course/:courseId/section/:sectionId",
  auth,
  instructorAuth,
  async (req, res) => {
    try {
      const { courseId, sectionId } = req.params;

      const course = await Course.findById(courseId);
      const section = course.sections.id(sectionId);

      // ✅ Delete all lesson files
      for (const lesson of section.lessons) {
        if (lesson.videoPublicId)
          await deleteFromCloudinary(lesson.videoPublicId, "video");

        if (lesson.cheatSheetPublicId)
          await deleteFromCloudinary(lesson.cheatSheetPublicId, "raw");
      }

      section.deleteOne();
      await course.save();

      res.json({ message: "Section deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//----- Instructor Courses ----------
// how many enrolles 
// recently uplaod


module.exports = instructorRouter;
