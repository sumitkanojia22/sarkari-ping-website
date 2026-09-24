import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  getPreferences,
  savePreferences,
  type Preferences,
} from "../services/auth.api";
import { toast } from "@heroui/react";
const options = {
  states: [
    "All India",
    "Delhi",
    "Maharashtra",
    "Uttar Pradesh",
    "Bihar",
    "Karnataka",
    "Tamil Nadu",
    "West Bengal",
    "Rajasthan",
    "Gujarat",
  ],
  preferredLocations: [
    "All India",
    "Metro cities",
    "Home state",
    "Remote / flexible",
  ],
  qualifications: [
    "10th",
    "12th",
    "Diploma",
    "ITI",
    "B.A.",
    "B.Sc.",
    "BCA",
    "B.E.",
    "B.Tech",
    "MCA",
    "M.Tech",
    "MBA",
    "Any Graduate",
  ],
  degrees: [
    "Engineering",
    "Science",
    "Commerce",
    "Arts",
    "Law",
    "Management",
    "Medical",
  ],
  branches: [
    "Computer Science",
    "IT",
    "Civil",
    "Mechanical",
    "Electrical",
    "Electronics",
    "Finance",
    "Agriculture",
  ],
  categories: [
    "Central Government",
    "State Government",
    "PSU",
    "Banking",
    "Railway",
    "SSC",
    "UPSC",
    "Defence",
    "Police",
    "Teaching",
    "Engineering",
    "IT",
  ],
  governmentTypes: [
    "Central Government",
    "State Government",
    "PSU",
    "Autonomous body",
  ],
  jobTypes: [
    "Permanent",
    "Contract",
    "Full-time",
    "Technical",
    "Non-technical",
  ],
  organizations: [
    "SSC",
    "UPSC",
    "Indian Railways",
    "IBPS",
    "SBI",
    "LIC",
    "DRDO",
    "ISRO",
  ],
  departments: [
    "Administration",
    "Engineering",
    "Information Technology",
    "Finance",
    "Education",
    "Healthcare",
    "Police",
  ],
} as const;
type Field = keyof typeof options;
export default function PreferencesPage() {
  const [data, setData] = useState<Preferences | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    getPreferences().then(setData);
  }, []);
  if (!data) return <main className="page-shell">Loading preferences…</main>;
  const picked = (field: Field, value: string) =>
    data[field].some((item) => item.toLowerCase() === value.toLowerCase());
  const toggle = (field: Field, value: string) =>
    setData({
      ...data,
      [field]: picked(field, value)
        ? data[field].filter(
            (item) => item.toLowerCase() !== value.toLowerCase(),
          )
        : [...data[field], value],
    });
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      const updated = await savePreferences({
        ...data,
        onboardingComplete: true,
      });
      setData(updated);
      setSaved(true);
      toast.success("Preferences saved", {
        description: "Your recommended jobs have been refreshed.",
      });
    } catch (error) {
      toast.danger("Could not save preferences", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };
  const label = (field: Field) =>
    ({
      states: "Preferred states",
      preferredLocations: "Work-location preference",
      qualifications: "Highest qualification",
      degrees: "Degree area",
      branches: "Branch / stream",
      categories: "Job categories",
      governmentTypes: "Government type",
      jobTypes: "Job characteristics",
      organizations: "Preferred organisations",
      departments: "Preferred departments",
    })[field];
  return (
    <main className="page-shell narrow">
      <Link to="/">Back to jobs</Link>
      <section className="hero compact">
        <p className="eyebrow">Your profile</p>
        <h1>Set what a good job looks like.</h1>
        <p>
          Selections improve ranking only; they never guarantee eligibility.
        </p>
      </section>
      <form className="preferences-form" onSubmit={submit}>
        {(Object.entries(options) as [Field, readonly string[]][]).map(
          ([field, values]) => (
            <fieldset key={field}>
              <legend>{label(field)}</legend>
              <div className="choice-grid">
                {values.map((value) => (
                  <label
                    className={`choice ${picked(field, value) ? "selected" : ""}`}
                    key={value}
                  >
                    <input
                      type="checkbox"
                      checked={picked(field, value)}
                      onChange={() => toggle(field, value)}
                    />
                    {value}
                  </label>
                ))}
              </div>
            </fieldset>
          ),
        )}
        <fieldset>
          <legend>
            Minimum recommended-job match: {data.minimumMatchThreshold}%
          </legend>
          <input
            className="range"
            type="range"
            min="50"
            max="90"
            step="10"
            value={data.minimumMatchThreshold}
            onChange={(e) =>
              setData({
                ...data,
                minimumMatchThreshold: Number(e.target.value),
              })
            }
          />
          <label className="switch">
            <input
              type="checkbox"
              checked={data.onlyActiveJobs}
              onChange={(e) =>
                setData({ ...data, onlyActiveJobs: e.target.checked })
              }
            />{" "}
            Only currently open jobs
          </label>
        </fieldset>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </button>
        {saved && (
          <p role="status">
            Preferences saved. Recommendations have been refreshed.
          </p>
        )}
      </form>
    </main>
  );
}
