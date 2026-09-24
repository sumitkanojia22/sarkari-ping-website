import mongoose from "mongoose";
import Job from "../models/jobModel.js";
import User from "../models/userModel.js";
import Event from "../models/userJobEventModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { getJobStatus, scoreJob } from "../services/matchingService.js";

export const getLatestJobs = catchAsync(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100), search = String(req.query.search || "").trim();
  const query = { isActive: true }; if (search) query.$text = { $search: search };
  for (const [key, field] of [["category", "category"], ["organization", "organization"], ["state", "states"], ["qualification", "qualifications"], ["jobType", "jobType"]]) if (req.query[key]) query[field] = { $regex: String(req.query[key]), $options: "i" };
  if (req.query.open === "true") query.applicationLastDate = { $gte: new Date() };
  const sort = { deadline: { applicationLastDate: 1 }, vacancies: { totalVacancies: -1 }, updated: { updatedAt: -1 } }[req.query.sort] || { lastSeenAt: -1 };
  const [jobs, total] = await Promise.all([Job.find(query).select("-rawData").sort(sort).skip((page - 1) * limit).limit(limit), Job.countDocuments(query)]);
  res.json({ status: "success", results: jobs.length, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, data: jobs.map((job) => ({ ...job.toObject(), status: getJobStatus(job) })) });
});

export const getJobById = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError("Invalid job id.", 400));
  const job = await Job.findById(req.params.id).select("-rawData");

  if (!job) {
    return next(new AppError("No job found with that id.", 404));
  }

  res.status(200).json({ status: "success", data: { ...job.toObject(), status: getJobStatus(job) } });
});
export const getRecommendations = catchAsync(async (req, res) => { const user = await User.findById(req.user._id).select("preferences"); const jobs = await Job.find({ isActive: true }).select("-rawData").sort({ applicationLastDate: 1, lastSeenAt: -1 }).limit(200); const data = jobs.map((job) => ({ ...job.toObject(), match: scoreJob(job, user.preferences) })).filter((job) => job.match.status !== "CLOSED" && job.match.score >= user.preferences.minimumMatchThreshold).sort((a, b) => b.match.score - a.match.score).slice(0, 30); res.json({ status: "success", data }); });
export const recordEvent = catchAsync(async (req, res, next) => { const { eventType, jobId, metadata } = req.body; if (!eventType) return next(new AppError("eventType is required", 400)); if (jobId && !mongoose.isValidObjectId(jobId)) return next(new AppError("Invalid job id", 400)); if (jobId && !await Job.exists({ _id: jobId })) return next(new AppError("Job not found", 404)); if (eventType === "JOB_VIEW" && jobId) { const exists = await Event.exists({ user: req.user._id, job: jobId, eventType, createdAt: { $gte: new Date(Date.now() - 1800000) } }); if (exists) return res.status(204).end(); } await Event.create({ user: req.user._id, job: jobId, eventType, metadata: metadata && typeof metadata === "object" ? metadata : {} }); res.status(201).json({ status: "success" }); });
