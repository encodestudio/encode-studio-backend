import nodemailer from "nodemailer";
import { connectDB } from "../../lib/db";
import Waitlist from "../../models/Waitlist";

export default async function handler(req, res) {
    console.log("🔥 WAITLIST API HIT");

    // ✅ CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // ✅ 1. CONNECT DB FIRST
        await connectDB();

        // ✅ 2. SAFE BODY PARSING
        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : req.body;

        console.log("📩 BODY RECEIVED:", body);

        const { name, email, phone, mobile, product } = body;

        // ✅ 3. HANDLE PHONE CORRECTLY
        const finalPhone = phone || mobile;

        // ✅ 4. VALIDATION
        if (!name || !email || !finalPhone || !product) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        // ✅ 5. DUPLICATE CHECK (BEFORE INSERT)
        // ✅ Check duplicate email
        const existingEmail = await Waitlist.findOne({
            email,
            product,
        });

        // ✅ Check duplicate phone
        const existingPhone = await Waitlist.findOne({
            phone: String(finalPhone),
            product,
        });

        // 🎯 Smart error messaging
        if (existingEmail && existingPhone) {
            return res.status(400).json({
                message:
                    "This email and mobile number are already used for this product",
            });
        }

        if (existingEmail) {
            return res.status(400).json({
                message: "This email is already used for this product",
            });
        }

        if (existingPhone) {
            return res.status(400).json({
                message: "This mobile number is already used for this product",
            });
        }

        // ✅ 6. SAVE DATA (ONLY ONCE)
        const newEntry = await Waitlist.create({
            name,
            email,
            phone: String(finalPhone),
            product,
        });

        console.log("✅ SAVED ENTRY:", newEntry);

        // ✅ 7. EMAIL SETUP
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 📧 Admin Notification
        await transporter.sendMail({
            from: `"Encode Studio" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `New Waitlist Signup (${product})`,
            html: `
                <h3>New Waitlist Signup</h3>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Phone:</b> ${finalPhone}</p>
                <p><b>Product:</b> ${product}</p>
            `,
        });

        // 📧 User Confirmation
        await transporter.sendMail({
            from: `"Encode Studio" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "You're on the waitlist 🚀",
            html: `
                <p>Hi ${name},</p>
                <p>You're successfully on the waitlist for <b>${product}</b>.</p>
                <p>We’ll notify you once it’s live!</p>
                <br/>
                <p>– Team Encode Studio</p>
            `,
        });

        // ✅ 8. SUCCESS RESPONSE
        return res.status(200).json({
            message: "Successfully added to waitlist",
        });

    } catch (error) {
        console.error("🚨 ERROR:", error);

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
}