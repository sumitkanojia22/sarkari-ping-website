import mongoose from "mongoose";
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true, index: true }, job: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs", index: true }, eventType: { type: String, required: true, enum: ["JOB_VIEW", "JOB_APPLY_CLICK", "JOB_NOTIFICATION_CLICK", "JOB_SEARCH", "JOB_FILTER", "JOB_SAVE", "JOB_UNSAVE", "PREFERENCE_UPDATE"], index: true }, metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} } }, { timestamps: true });
schema.index({ user: 1, eventType: 1, createdAt: -1 });
export default schema;
