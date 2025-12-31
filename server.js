const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/locations", require("./src/routes/LocationRoutes"));
app.use("/chargers", require("./src/routes/chargerRoutes"));
app.use("/connectors",require("./src/routes/connectorRoutes"));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
