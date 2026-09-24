import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "@heroui/react";
import {
  getLatestJobs,
  toggleSavedJob,
  type Job,
  type JobQuery,
  type JobResponse,
} from "../services/auth.api";

const initial: JobResponse = {
  data: [],
  pagination: { page: 1, limit: 12, total: 0, pages: 0 },
};

export default function HomePage() {
  const [result, setResult] = useState<JobResponse>(initial);
  const [filters, setFilters] = useState<JobQuery>({
    page: 1,
    limit: 12,
    sort: "updated",
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    getLatestJobs(filters)
      .then((response) => {
        if (!cancelled) {
          setResult(response);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load jobs. Please retry.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const update = (
    key: keyof JobQuery,
    value: string | boolean | number | undefined,
  ) => {
    const normalized = value === "" ? undefined : value;

    setFilters((old) => {
      if (key === "page") {
        return { ...old, page: Number(value) || 1 };
      }

      return { ...old, [key]: normalized, page: 1 };
    });
  };

  const resetFilters = () => {
    setFilters({ page: 1, limit: 12, sort: "updated" });
  };

  const save = async (job: Job) => {
    try {
      const response = await toggleSavedJob(job._id);
      setSaved((current) =>
        response.saved
          ? [...current, job._id]
          : current.filter((id) => id !== job._id),
      );
      toast.success(response.saved ? "Job saved" : "Job removed", {
        description: response.saved
          ? "Find it anytime in Saved jobs."
          : "The job was removed from your shortlist.",
      });
    } catch {
      toast.danger("Could not update saved jobs");
    }
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Government opportunities</p>
          <h1>Find the next role worth applying for.</h1>
          <p className="hero-copy-text">
            Search structured listings, then verify details on the official
            recruitment site.
          </p>
        </div>
        <div className="hero-summary-card">
          <span className="summary-side-label">Total results</span>
          <span className="summary-side-number text-data">
            {result.pagination.total}
          </span>
          <span className="summary-side-label">
            Page {result.pagination.page} /{" "}
            {Math.max(result.pagination.pages, 1)}
          </span>
        </div>
      </section>

      <section className="filter-panel">
        <div className="filter-topbar">
          <div className="search-cluster">
            <label className="search-label" htmlFor="search">
              Search jobs
            </label>
            <div className="search-input-wrap">
              <input
                id="search"
                value={filters.search || ""}
                onChange={(e) => update("search", e.target.value)}
                placeholder="Search title, organization or qualification"
              />
            </div>
          </div>
          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>

        <div className="filter-grid">
          <label className="select-label">
            <span>Category</span>
            <select
              value={filters.category || ""}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="">All categories</option>
              <option value="PSU">PSU</option>
              <option value="Banking">Banking</option>
              <option value="Railway">Railway</option>
              <option value="SSC">SSC</option>
              <option value="Defence">Defence</option>
              <option value="Teaching">Teaching</option>
            </select>
          </label>

          <label className="select-label">
            <span>Job type</span>
            <select
              value={filters.jobType || ""}
              onChange={(e) => update("jobType", e.target.value)}
            >
              <option value="">All job types</option>
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
              <option value="Full-time">Full-time</option>
            </select>
          </label>

          <label className="select-label">
            <span>Organization</span>
            <input
              value={filters.organization || ""}
              onChange={(e) => update("organization", e.target.value)}
              placeholder="Organization"
            />
          </label>

          <label className="select-label">
            <span>State</span>
            <input
              value={filters.state || ""}
              onChange={(e) => update("state", e.target.value)}
              placeholder="State"
            />
          </label>

          <label className="select-label">
            <span>Qualification</span>
            <input
              value={filters.qualification || ""}
              onChange={(e) => update("qualification", e.target.value)}
              placeholder="Qualification"
            />
          </label>

          <label className="select-label">
            <span>Sort by</span>
            <select
              value={filters.sort || "updated"}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="updated">Recently updated</option>
              <option value="deadline">Deadline soon</option>
              <option value="vacancies">Most vacancies</option>
            </select>
          </label>
        </div>
      </section>

      <section className="results-bar">
        <span className="results-label">
          {result.pagination.total} jobs found
        </span>
        {error && (
          <span className="error-alert" role="alert">
            {error}
          </span>
        )}
      </section>

      <section className="job-list">
        {result.data.map((job) => (
          <article className="job-row" key={job._id}>
            <div className="job-row-main">
              <div className="job-row-heading">
                <span className="eyebrow">{job.status || "OPEN"}</span>
                <span className="job-category">
                  {job.category || "Government"}
                </span>
              </div>
              <h2>
                <Link to={`/jobs/${job._id}`}>{job.title}</Link>
              </h2>
              <p className="job-detail-line">
                {job.organization || "Government recruitment"} · {job.category}
              </p>
              <div className="job-meta">
                <span>
                  {job.totalVacancies
                    ? `${job.totalVacancies} vacancies`
                    : "Vacancies not listed"}
                </span>
                <span>
                  {job.applicationLastDate
                    ? `Closes ${new Date(job.applicationLastDate).toLocaleDateString()}`
                    : "Deadline TBA"}
                </span>
              </div>
            </div>

            <div className="job-row-actions">
              <button className="btn btn-secondary" onClick={() => save(job)}>
                {saved.includes(job._id) ? "Saved" : "Save"}
              </button>
              <Link className="btn btn-primary" to={`/jobs/${job._id}`}>
                View job
              </Link>
            </div>
          </article>
        ))}
      </section>

      {!result.data.length && !error && (
        <section className="empty-state">
          <div className="empty-icon">✦</div>
          <h2>No matching jobs</h2>
          <p>
            Try clearing one or more filters or run the scraper to collect fresh
            listings.
          </p>
          <button className="btn btn-primary" onClick={resetFilters}>
            Clear filters
          </button>
        </section>
      )}

      <nav className="pagination" aria-label="Pagination">
        <button
          className="btn btn-secondary"
          disabled={result.pagination.page <= 1}
          onClick={() => update("page", result.pagination.page - 1)}
        >
          Previous
        </button>
        <span className="page-indicator">
          Page {result.pagination.page} of{" "}
          {Math.max(result.pagination.pages, 1)}
        </span>
        <button
          className="btn btn-secondary"
          disabled={result.pagination.page >= result.pagination.pages}
          onClick={() => update("page", result.pagination.page + 1)}
        >
          Next
        </button>
      </nav>
    </main>
  );
}
