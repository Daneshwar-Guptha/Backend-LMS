const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },

    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: 0,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    sections: [
      {
        title: { type: String, required: true },

        lessons: [
          {
            title: { type: String, required: true },

            videoUrl: { type: String, default: "" },
            videoPublicId: { type: String, default: "" },

            cheatSheetUrl: { type: String, default: "" },
            cheatSheetPublicId: { type: String, default: "" },

            duration: { type: Number, default: 0 },
          },
        ],
      },
    ],
  },

  { timestamps: true }
);

module.exports = model("Course", courseSchema);
