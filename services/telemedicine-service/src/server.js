const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const telemedicineRoutes = require("./routes/telemedicineRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Telemedicine service is running");
});

app.use("/api/telemedicine", telemedicineRoutes);

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`Telemedicine service running on port ${PORT}`);
});