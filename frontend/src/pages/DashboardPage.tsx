import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getDashboard } from "../services/auth.api";

type DashboardData = {
  totalJobs: number;
  viewed: number;
  applyClicks: number;
  saved: number;
  threshold: number;
  activity: Array<{ date: string; count: number }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDashboard()
      .then((dashboard) => {
        if (!cancelled) {
          setData(dashboard);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load your dashboard activity.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="page-shell">
        <section className="dashboard-page">
          <div className="empty-state">
            <div className="spinner" />
            <p>Loading dashboard…</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="page-shell">
        <section className="dashboard-page">
          <section className="empty-state error-state">
            <div className="empty-icon">!</div>
            <p>{error || "Unable to load your dashboard."}</p>
            <Link className="btn btn-primary" to="/">
              Back to jobs
            </Link>
          </section>
        </section>
      </main>
    );
  }

  const activityMax = Math.max(...data.activity.map((row) => row.count), 1);
  const metricCards = [
    { label: "Active jobs", value: data.totalJobs, tone: "jobs" },
    { label: "Jobs viewed", value: data.viewed, tone: "viewed" },
    { label: "Apply clicks", value: data.applyClicks, tone: "apply" },
    { label: "Saved jobs", value: data.saved, tone: "saved" },
    { label: "Match threshold", value: `${data.threshold}%`, tone: "match" },
  ];

  return (
    <main className="page-shell">
      <section className="dashboard-page">
        <section className="dashboard-head">
          <div>
            <span className="eyebrow">Overview</span>
            <h1>Your dashboard</h1>
          </div>
          <div className="dashboard-actions">
            <Link className="btn btn-secondary" to="/">
              ← Jobs
            </Link>
            <Link className="btn btn-primary" to="/recommended">
              Recommended jobs
            </Link>
          </div>
        </section>

        <section className="dashboard-summary-grid">
          {metricCards.map((item) => (
            <article className="dashboard-metric-card card" key={item.label}>
              <div className="metric-card-top">
                <span className={`metric-icon metric-${item.tone}`}>●</span>
                <span className="metric-label">{item.label}</span>
              </div>
              <div className="metric-value text-data">{item.value}</div>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel card chart-panel">
            <div className="panel-head">
              <div>
                <span className="panel-kicker">Activity</span>
                <h2>Job view trend</h2>
              </div>
              <span className="panel-chip">Last 30 days</span>
            </div>

            {data.activity.length ? (
              <div className="chart-wrap">
                <div className="bar-chart">
                  {data.activity.map((row) => {
                    const height = Math.max(4, (row.count / activityMax) * 100);
                    return (
                      <div className="bar-item" key={row.date}>
                        <div className="bar-track">
                          <span
                            className="bar-fill"
                            style={{ height: `${height}%` }}
                            title={`${row.date}: ${row.count}`}
                          />
                        </div>
                        <span className="bar-date">{row.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <section className="empty-state mini-empty">
                <p>No activity yet. Start viewing jobs to build your trend.</p>
              </section>
            )}
          </article>

          <article className="dashboard-panel card">
            <div className="panel-head">
              <div>
                <span className="panel-kicker">Focus</span>
                <h2>Performance</h2>
              </div>
              <span className="panel-chip status-ok">Live</span>
            </div>

            <div className="performance-list">
              <div className="performance-row">
                <span className="performance-label">Application activity</span>
                <span className="performance-bar">
                  <span
                    className="performance-fill apply-fill"
                    style={{
                      width: `${Math.min(100, data.applyClicks * 12)}%`,
                    }}
                  />
                </span>
                <span className="performance-value text-data">
                  {data.applyClicks}
                </span>
              </div>

              <div className="performance-row">
                <span className="performance-label">Saved shortlist</span>
                <span className="performance-bar">
                  <span
                    className="performance-fill saved-fill"
                    style={{ width: `${Math.min(100, data.saved * 10)}%` }}
                  />
                </span>
                <span className="performance-value text-data">
                  {data.saved}
                </span>
              </div>

              <div className="performance-row">
                <span className="performance-label">Match threshold</span>
                <span className="performance-bar">
                  <span
                    className="performance-fill match-fill"
                    style={{ width: `${Math.min(100, data.threshold)}%` }}
                  />
                </span>
                <span className="performance-value text-data">
                  {data.threshold}%
                </span>
              </div>
            </div>

            <div className="insight-box">
              <span className="insight-label">Today’s signal</span>
              <p>
                {data.applyClicks > 0
                  ? `You have started ${data.applyClicks} application flow${data.applyClicks > 1 ? "s" : ""}.`
                  : "No applications started yet. Browse opportunities to begin."}
              </p>
            </div>
          </article>
        </section>

        <section className="dashboard-note">
          <p>
            Apply clicks are tracked only after you click an application link.
            More activity will populate the trend chart as your job viewing and
            application behavior grows.
          </p>
        </section>
      </section>
    </main>
  );
}
