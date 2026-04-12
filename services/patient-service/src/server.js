const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const patientRoutes = require("./routes/patientRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Patient service is running");
});

app.use("/api/patients", patientRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Patient service running on port ${PORT}`);
});