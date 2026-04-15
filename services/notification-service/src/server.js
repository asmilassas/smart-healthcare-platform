const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Notification service is running");
});

app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});