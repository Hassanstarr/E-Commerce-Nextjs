import mongoose, { Schema } from "mongoose";

const schema = new Schema({ key: { type: String, required: true, unique: true }, cursor: { type: String, default: "" } });
export default mongoose.models.NotificationJobState || mongoose.model("NotificationJobState", schema);
