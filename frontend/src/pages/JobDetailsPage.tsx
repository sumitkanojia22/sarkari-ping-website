import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getJobById, recordEvent, type Job } from "../services/auth.api";
import { toggleSavedJob } from "../services/auth.api";
import { toast } from "@heroui/react";
export default function JobDetailsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!jobId) return;
    getJobById(jobId)
      .then((data) => {
        setJob(data);
        return recordEvent("JOB_VIEW", jobId);
      })
      .catch(() => setError("Unable to load this job."));
  }, [jobId]);
  if (error || !job)
    return (
      <main className="page-shell">
        <p>{error || "Loading job details..."}</p>
        <Link to="/">Back to jobs</Link>
      </main>
    );
  const apply = async () => {
    if (!job.applicationUrl) return;
    await recordEvent("JOB_APPLY_CLICK", job._id);
    window.open(job.applicationUrl, "_blank", "noopener,noreferrer");
  };
  const save = async () => {
    const response = await toggleSavedJob(job._id);
    setSaved(response.saved);
    toast.success(response.saved ? "Job saved" : "Job removed");
  };
  const date = (value?: string) =>
    value ? new Date(value).toLocaleDateString() : "Not announced";
  return (
    <>
      <main className="page-shell">
        <Link to="/">Back to jobs</Link>
        <article className="detail">
          <div className="detail-head">
            <div>
              <p className="eyebrow">{job.status}</p>
              <h1>{job.title}</h1>
              <p>{job.organization || job.source}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary" onClick={save}>
                {saved ? "Saved" : "Save job"}
              </button>
              {job.applicationUrl ? (
                <button className="btn btn-primary" onClick={apply}>
                  Apply on official website
                </button>
              ) : (
                <a
                  className="btn btn-secondary"
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View source listing
                </a>
              )}
            </div>
          </div>
          <section>
            <h2>Overview</h2>
            <p>
              {job.description ||
                "Read the official notification for complete details."}
            </p>
          </section>
          <section className="info-grid">
            {[
              ["Application start", date(job.applicationStartDate)],
              ["Application deadline", date(job.applicationLastDate)],
              ["Exam date", date(job.examDate)],
              ["Total vacancies", job.totalVacancies || "Not listed"],
              [
                "Qualification",
                job.education || job.eligibility || "Not listed",
              ],
              ["Age limit", job.ageLimit || "Not listed"],
            ].map(([label, value]) => (
              <div className="info-cell" key={String(label)}>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </section>
          {job.vacancies?.length ? (
            <section>
              <h2>Vacancies</h2>
              <table>
                <thead>
                  <tr>
                    <th>Post / category</th>
                    <th>Vacancies</th>
                  </tr>
                </thead>
                <tbody>
                  {job.vacancies.map((v, i) => (
                    <tr key={i}>
                      <td>{v.postName || "Category"}</td>
                      <td>{v.postCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
          {job.selectionProcess?.length ? (
            <section>
              <h2>Selection process</h2>
              <ol>
                {job.selectionProcess.map((stage) => (
                  <li key={stage}>{stage}</li>
                ))}
              </ol>
            </section>
          ) : null}
          {job.importantLinks?.length ? (
            <section>
              <h2>Official and important links</h2>
              <div className="link-grid">
                {job.importantLinks.map((link) => (
                  <a
                    className="btn btn-secondary"
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    key={link.url}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          ) : null}
          <p className="text-muted">
            Source: {job.source} · Last scraped:{" "}
            {new Date(job.lastSeenAt).toLocaleString()}
          </p>
        </article>
      </main>
    </>
  );
}
