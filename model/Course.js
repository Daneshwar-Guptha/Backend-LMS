const { Schema, model, mongoose } = require("mongoose");

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: 0,
    },
    sections: [
      {

        title: String,
        lessons: [
          {
            title: { type: String, required: true },
            videoUrl: { type: String },
            videoPublicId: String,

            cheatSheetUrl: { type: String },
            cheatSheetPublicId: String,
            duration: { type: Number }
          }
        ]

      }
    ]
    ,
    thumbnail: {
      type: String,
      default: "",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);



module.exports = model("Course", courseSchema);
