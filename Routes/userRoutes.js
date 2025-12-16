const express = require("express");
const { auth } = require("../middleware/auth");
const Course = require("../model/Course");
const Enrollement = require("../model/Enrollement");
const userRoutes = express.Router();

const upload = require("../utils/multer");
const User = require("../model/User");

userRoutes.get("/courses/mycourses", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    

    const responseData = await Enrollement.find({ userId }).populate(
      "courseId"
    );

    res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

userRoutes.get("/courses", auth, async (req, res) => {
  try {
    const courses = await Course.find({});
    res.send(courses);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRoutes.get("/courses/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).send("Invalid course ID");
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRoutes.post("/courses/:id/enroll", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.user;
    const EnrolledData = await Enrollement({
      userId: userData._id,
      courseId: id,
    });
    await EnrolledData.save();
    res.status(200).json(EnrolledData);
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
});

userRoutes.put(
  "/profile/photo",
  auth,
  upload.single("photo"),
  async (req, res) => {
    try {
      console.log("Profile photo API hit");

      if (!req.file) return res.status(400).send("No file uploaded");

      const imageUrl = req.file.path; // Cloudinary URL

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: imageUrl },
        { new: true }
      ).select("-password");

      res.status(200).json({
        message: "Profile picture updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).send(error.message);
      console.log(error.message);
    }
  }
);

module.exports = userRoutes;
