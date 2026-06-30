// bcrypt dotenv jsonwebtoken express nodemon cors

const express = require("express");
const cors = require("cors");

const app = express();
const routes = require("./Routes/UserRoutes");

// Middleware
app.use(cors({
    origin: "*"
}));

app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.send("Backend is working");
});

// API Routes
app.use("/pages", routes);

// Render uses process.env.PORT
const PORT = process.env.PORT || 8888;

// Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});