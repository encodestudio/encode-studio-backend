import jwt from "jsonwebtoken";
import Cors from "cors";

const cors = Cors({
    methods: ["POST"],
    origin: "*",
});

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}

export default async function handler(req, res) {
    try {
        await runMiddleware(req, res, cors);

        // ✅ Allow only POST
        if (req.method !== "POST") {
            return res.status(405).json({ message: "Method not allowed" });
        }

        const { email, password } = req.body || {};

        // ✅ Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        // ✅ Normalize values (VERY IMPORTANT)
        const inputEmail = email.trim().toLowerCase();
        const inputPassword = password.trim();

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD?.trim();

        // 🔍 Optional Debug (remove after testing)
        // console.log("INPUT:", inputEmail, inputPassword);
        // console.log("ENV:", adminEmail, adminPassword);
        console.log("ENV EMAIL:", process.env.ADMIN_EMAIL);
        console.log("ENV PASSWORD:", process.env.ADMIN_PASSWORD);
        console.log("BODY:", req.body);

        // ✅ Credential Check
        if (inputEmail === adminEmail && inputPassword === adminPassword) {
            const token = jwt.sign(
                { email: inputEmail },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.status(200).json({ token });
        }

        return res.status(401).json({ message: "Invalid credentials" });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
}