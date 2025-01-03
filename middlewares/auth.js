const jwt = require("jsonwebtoken");
const SECRET_KEY = "GEttingdata!@#";

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ Message: "Token is missing. Unauthorized." });
        }

        if (!token.startsWith("Bearer ")) {
            return res.status(401).json({ Message: "Token format is incorrect." });
        }

        const actualtoken = token.split(" ")[1];
        const decoded = jwt.verify(actualtoken, SECRET_KEY);
        req.userId = decoded.id;

        next();
    } catch (error) {
        return res.status(401).json({ Message: "Unautorized user", error: error.message });
    }
}
module.exports = auth;