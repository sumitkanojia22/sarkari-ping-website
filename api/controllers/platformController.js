import User from "../models/userModel.js";
import Event from "../models/userJobEventModel.js";
import Job from "../models/jobModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
const fields = [
  "categories",
  "organizations",
  "departments",
  "states",
  "preferredLocations",
  "jobTypes",
  "qualifications",
  "degrees",
  "branches",
  "governmentTypes",
  "minSalary",
  "onlyActiveJobs",
  "closingSoon",
  "highVacancy",
  "minimumMatchThreshold",
  "onboardingComplete",
];
export const getPreferences = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("preferences");
  res.json({ status: "success", data: user.preferences });
});
export const updatePreferences = catchAsync(async (req, res, next) => {
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => fields.includes(key)),
  );
  if (!Object.keys(updates).length)
    return next(new AppError("No valid preference fields provided", 400));
  const user = await User.findById(req.user._id);
  for (const [key, value] of Object.entries(updates))
    user.set(`preferences.${key}`, value);
  user.set(
    "preferences.onboardingComplete",
    req.body.onboardingComplete ?? true,
  );
  user.markModified("preferences");
  await user.save();
  await Event.create({ user: req.user._id, eventType: "PREFERENCE_UPDATE" });
  res.json({ status: "success", data: user.preferences.toObject() });
});
export const resetPreferences = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.preferences = {};
  await user.save();
  res.status(204).end();
});
export const toggleSaveJob = catchAsync(async (req, res, next) => {
  if (!(await Job.exists({ _id: req.params.jobId })))
    return next(new AppError("Job not found", 404));
  const user = await User.findById(req.user._id);
  const saved = user.preferences.savedJobs.some(
    (id) => id.toString() === req.params.jobId,
  );
  user.preferences.savedJobs = saved
    ? user.preferences.savedJobs.filter(
        (id) => id.toString() !== req.params.jobId,
      )
    : [...user.preferences.savedJobs, req.params.jobId];
  await user.save();
  await Event.create({
    user: req.user._id,
    job: req.params.jobId,
    eventType: saved ? "JOB_UNSAVE" : "JOB_SAVE",
  });
  res.json({ status: "success", data: { saved: !saved } });
});
export const dashboard = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const [totalJobs, eventCounts, saved] = await Promise.all([
    Job.countDocuments({ isActive: true }),
    Event.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$eventType", count: { $sum: 1 } } },
    ]),
    User.findById(userId).select(
      "preferences.savedJobs preferences.minimumMatchThreshold",
    ),
  ]);
  const counts = Object.fromEntries(
    eventCounts.map((row) => [row._id, row.count]),
  );
  const activity = await Event.aggregate([
    { $match: { user: userId, eventType: "JOB_VIEW" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);
  res.json({
    status: "success",
    data: {
      totalJobs,
      viewed: counts.JOB_VIEW || 0,
      applyClicks: counts.JOB_APPLY_CLICK || 0,
      saved: saved.preferences.savedJobs.length,
      threshold: saved.preferences.minimumMatchThreshold,
      activity: activity.map((row) => ({ date: row._id, count: row.count })),
    },
  });
});
