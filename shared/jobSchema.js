import mongoose from "mongoose";
const linkSchema = new mongoose.Schema({ label: String, type: String, url: String }, { _id: false });
const vacancySchema = new mongoose.Schema({ category: String, postName: String, postCount: Number }, { _id: false });
const dateSchema = new mongoose.Schema({ label: String, date: Date }, { _id: false });
const jobSchema = new mongoose.Schema({
  externalId: { type: String, trim: true, index: true }, title: { type: String, required: true, trim: true, maxlength: 300, index: "text" },
  organization: { type: String, default: "", index: true }, department: { type: String, default: "" }, recruitmentName: { type: String, default: "" }, description: { type: String, default: "" },
  source: { type: String, required: true, index: true }, sourceUrl: { type: String, required: true, unique: true, trim: true }, notificationUrl: String, applicationUrl: String, officialWebsite: String,
  category: { type: String, default: "latest-jobs", index: true }, jobType: String, states: { type: [String], default: [], index: true }, locations: { type: [String], default: [] }, qualifications: { type: [String], default: [], index: true }, education: String, experience: String, eligibility: String, ageLimit: String, ageRelaxation: String,
  applicationStartDate: Date, applicationLastDate: { type: Date, index: true }, examDate: Date, admitCardDate: Date, resultDate: Date, importantDates: { type: [dateSchema], default: [] }, totalVacancies: Number,
  vacancies: { type: [vacancySchema], default: [] }, categoryVacancies: { type: Map, of: Number, default: {} }, fees: { type: Map, of: String, default: {} }, applicationFee: String, selectionProcess: { type: [String], default: [] }, salary: { type: Map, of: String, default: {} }, importantLinks: { type: [linkSchema], default: [] },
  searchableText: { type: String, required: true, lowercase: true, index: "text" }, rawData: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }, firstSeenAt: { type: Date, default: Date.now }, lastSeenAt: { type: Date, default: Date.now, index: true }, scrapedAt: Date, isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, strict: true });
jobSchema.index({ isActive: 1, applicationLastDate: 1, lastSeenAt: -1 });
jobSchema.index({ source: 1, category: 1, organization: 1 });
export default jobSchema;
