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

        if (req.method !== "POST") {
            return res.status(405).json({ message: "Method not allowed" });
        }

        const { email, password } = req.body;

        if (
            email.trim() === process.env.ADMIN_EMAIL &&
            password.trim() === process.env.ADMIN_PASSWORD
        ) {
            const token = jwt.sign(
                { email },
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