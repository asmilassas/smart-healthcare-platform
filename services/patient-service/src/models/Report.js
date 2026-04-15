const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    reportType: {
      type: String,
      trim: true
    },
    reportDate: {
      type: Date,
      required: true
    },
    doctorName: {
      type: String,
      trim: true
    },
    hospitalName: {
      type: String,
      trim: true
    },
    fileUrl: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);