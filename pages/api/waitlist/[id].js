import { connectDB } from "../../../lib/db";
import Waitlist from "../../../models/Waitlist";

export default async function handler(req, res) {
    // ✅ CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        await connectDB();

        if (req.method === "DELETE") {
            const { id } = req.query;

            console.log("Deleting ID:", id); // 🔍 debug

            if (!id) {
                return res.status(400).json({
                    message: "ID is required",
                });
            }

            const deleted = await Waitlist.findByIdAndDelete(id);

            if (!deleted) {
                return res.status(404).json({
                    message: "Record not found",
                });
            }

            return res.status(200).json({
                message: "Deleted successfully",
            });
        }

        return res.status(405).json({
            message: "Method not allowed",
        });

    } catch (error) {
        console.error("DELETE ERROR:", error);

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
}