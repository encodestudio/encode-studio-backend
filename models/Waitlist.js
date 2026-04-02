import mongoose from "mongoose";

const WaitlistSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: {
        type: String,
        required: true,
    },
    product: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Waitlist ||
    mongoose.model("Waitlist", WaitlistSchema);