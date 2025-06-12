const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
    //console.log("Received Authorization Header:", req.header("Authorization"));
    const token = req.header("Authorization")?.split(" ")[1];
    //console.log(token);
    if (!token) return res.status(401).json({ message: "Unauthorizeds" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //console.log("Decoded token:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Error verifying token:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
