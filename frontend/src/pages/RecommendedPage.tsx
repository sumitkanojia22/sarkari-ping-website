import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getRecommendations, type Job } from "../services/auth.api";

type Recommendation = Job & {
  match: { score: number; matched: string[]; missing: string[] };
};

export default function RecommendedPage() {
  const [jobs, setJobs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getRecommendations()
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch(() => {
        if (!cancelled)
          setError("Unable to load your recommendations right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedJobs = [...jobs].sort((a, b) => b.match.score - a.match.score);
  const bestMatch = sortedJobs[0]?.match?.score ?? 0;

  return (
    <main className="page-shell">
      <section className="recommend-page">
        <section className="recommend-head">
          <div className="recommend-title-wrap">
            <span className="eyebrow">Recommendations</span>
            <h1>Recommended for you</h1>
            <p className="recommend-subtitle">
              Scores reflect your stated preferences, not eligibility.
            </p>
          </div>

          <div className="recommend-count-card">
            <span className="recommend-count-number">{jobs.length}</span>
            <span className="recommend-count-label">
              {jobs.length === 1 ? "recommended job" : "recommended jobs"}
            </span>
          </div>
        </section>

        <section className="recommend-summary">
          <div className="summary-tile">
            <span className="summary-label">Best match</span>
            <span className="summary-value text-data">{bestMatch}%</span>
          </div>
          <div className="summary-tile">
            <span className="summary-label">Matched preferences</span>
            <span className="summary-value text-data">
              {sortedJobs[0]?.match?.matched.length ?? 0}
            </span>
          </div>
          <div className="summary-tile">
            <span className="summary-label">Opportunity window</span>
            <span className="summary-value text-data">
              {sortedJobs.length ? "Updated" : "No data"}
            </span>
          </div>
        </section>

        {loading ? (
          <section className="empty-state">
            <div className="spinner" />
            <p>Loading recommendations...</p>
          </section>
        ) : null}

        {error ? (
          <section className="empty-state error-state">
            <p>{error}</p>
            <Link className="btn btn-primary" to="/">
              Back to jobs
            </Link>
          </section>
        ) : null}

        {!loading && !error && jobs.length === 0 ? (
          <section className="empty-state">
            <div className="empty-icon">✦</div>
            <h2>No recommendations yet</h2>
            <p>
              No jobs meet your current threshold yet. Update your preferences
              or check back after the next scrape.
            </p>
            <Link className="btn btn-primary" to="/settings/preferences">
              Update preferences
            </Link>
          </section>
        ) : null}

        {!loading && !error && jobs.length > 0 ? (
          <section className="recommend-list">
            {sortedJobs.map((job) => (
              <article className="recommend-card card" key={job._id}>
                <div className="recommend-card-top">
                  <div>
                    <span className="recommend-card-category">
                      {job.category || "Government job"}
                    </span>
                    <h2>
                      <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                    </h2>
                  </div>
                  <span className="match-score">{job.match.score}% match</span>
                </div>

                <div className="recommend-card-body">
                  <div className="match-tags">
                    {job.match.matched.length ? (
                      job.match.matched.map((item) => (
                        <span className="match-tag" key={item}>
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="match-tag muted-tag">
                        No matching preferences
                      </span>
                    )}
                  </div>

                  <div className="recommend-detail-row">
                    <span className="detail-label">Vacancies</span>
                    <span className="detail-value">
                      {job.totalVacancies || "Vacancies not listed"}
                    </span>
                  </div>

                  <div className="recommend-detail-row">
                    <span className="detail-label">Closing date</span>
                    <span className="detail-value">
                      {job.applicationLastDate
                        ? new Date(job.applicationLastDate).toLocaleDateString()
                        : "TBA"}
                    </span>
                  </div>

                  {job.match.missing?.length ? (
                    <div className="recommend-detail-row">
                      <span className="detail-label">Missing preferences</span>
                      <span className="detail-value muted-text">
                        {job.match.missing.slice(0, 2).join(", ")}
                      </span>
                    </div>
                  ) : null}

                  <div className="recommend-card-action">
                    <Link className="btn btn-secondary" to={`/jobs/${job._id}`}>
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </section>
    </main>
  );
}
