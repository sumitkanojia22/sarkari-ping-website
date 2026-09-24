import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "@heroui/react";
import { getSavedJobs, toggleSavedJob, type Job } from "../services/auth.api";
export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getSavedJobs()
      .then(setJobs)
      .catch(() => toast.danger("Could not load saved jobs"))
      .finally(() => setLoading(false));
  }, []);
  const remove = async (job: Job) => {
    const result = await toggleSavedJob(job._id);
    if (!result.saved) {
      setJobs((current) => current.filter((item) => item._id !== job._id));
      toast.success("Removed from saved jobs");
    }
  };
  return (
    <main className="page-shell">
      <section className="hero compact">
        <p className="eyebrow">Your shortlist</p>
        <h1>Saved jobs</h1>
        <p>Keep roles here while you compare notifications and deadlines.</p>
      </section>
      {loading ? (
        <p>Loading saved jobs…</p>
      ) : !jobs.length ? (
        <section className="empty-state">
          <h2>No saved jobs</h2>
          <p>
            Save a role from the job list or its detail page to find it here.
          </p>
          <Link className="btn btn-primary" to="/">
            Browse jobs
          </Link>
        </section>
      ) : (
        <section className="job-list">
          {jobs.map((job) => (
            <article className="job-row" key={job._id}>
              <div>
                <p className="eyebrow">{job.status || "SAVED"}</p>
                <h2>
                  <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                </h2>
                <p>{job.organization || job.category}</p>
              </div>
              <div className="flex gap-2">
                <Link className="btn btn-secondary" to={`/jobs/${job._id}`}>
                  View
                </Link>
                <button
                  className="btn btn-secondary"
                  onClick={() => remove(job)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
