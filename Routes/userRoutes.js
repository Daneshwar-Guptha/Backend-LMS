const express = require('express');
const {auth} = require('../middleware/auth');
const Course = require('../model/Course');
const Enrollement = require('../model/Enrollement');
const userRoutes = express.Router();

userRoutes.get('/courses', auth, async (req, res) => {

  try {
    const courses = await Course.find({});
    res.send(courses);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

userRoutes.get('/courses/:id', auth, async (req, res) => {
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

userRoutes.post('/courses/:id/enroll', auth, async (req, res) => {
  try {
    const { id } = req.body;
    const userData = req.user;
    const EnrolledData = await Enrollement({
      userId: userData._id,
      courseId: id

    })
    await EnrolledData.save();
    res.status(200).json(EnrolledData);

  } catch (error) {
    res.status(400).json(error.message);

  }
}) // Testing was not completed

userRoutes.get('/courses/my-courses', auth, async (req, res) => {
  try {
    const userData = req.user;
    const ResponseData = await Enrollement.find(userData._id);
    res.status(200).json(ResponseData)
  } catch (error) {
    res.status(400).json(error.message);
  }
})




module.exports = userRoutes;