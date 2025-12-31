const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/locations", require("./src/routes/locationRoutes"));
app.use("/chargers", require("./src/routes/chargerRoutes"));
app.use("/connectors", require("./src/routes/connectorRoutes"));

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env");

  try {
    await mongoose.connect(uri); // ✅ no useNewUrlParser / useUnifiedTopology
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

start();
app.get("/", (req, res) => {
  res.send("server is running");
});

