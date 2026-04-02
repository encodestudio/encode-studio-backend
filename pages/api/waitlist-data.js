import jwt from "jsonwebtoken";
import { connectDB } from "../../lib/db";
import Waitlist from "../../models/Waitlist";

export default async function handler(req, res) {
    console.log("📊 WAITLIST DATA API HIT");

    // ✅ CORS HEADERS (MANDATORY)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

    // ✅ Handle OPTIONS
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // ❌ Only allow GET
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // 🔐 Auth check
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET);

        // ✅ DB
        await connectDB();

        const data = await Waitlist.find().sort({ createdAt: -1 });

        console.log("📦 DATA FOUND:", data.length);

        // ✅ ALWAYS RETURN RESPONSE
        return res.status(200).json(data);

    } catch (error) {
        console.error("🚨 ERROR:", error);

        return res.status(500).json({
            message: "Error fetching data",
            error: error.message,
        });
    }
}