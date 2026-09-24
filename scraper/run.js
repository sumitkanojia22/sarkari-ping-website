import dotenv from "dotenv";
import mongoose from "mongoose";
import { CheerioCrawler, log } from "crawlee";
import jobSchema from "../shared/jobSchema.js";
dotenv.config({ path: "./config.env" });
const SOURCE_URL = process.env.SOURCE_URL || "https://sarkariresult.com.cm/";
const SOURCE_NAME = new URL(SOURCE_URL).hostname;
const database = process.env.DATABASE?.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD ?? "",
);
if (!database) throw new Error("DATABASE must be set in scraper/config.env.");
const Job = mongoose.models.Jobs || mongoose.model("Jobs", jobSchema);
const clean = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .trim();
const absolute = (url, base) => {
  try {
    const value = new URL(url, base);
    return value.protocol === "http:" || value.protocol === "https:"
      ? value.href
      : null;
  } catch {
    return null;
  }
};
const parseDate = (value) => {
  const text = clean(value).replace(/(\d{1,2})(st|nd|rd|th)/gi, "$1");
  const match = text.match(
    /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{4}|[A-Za-z]+\s+\d{1,2},?\s+\d{4}/,
  );
  if (!match) return null;
  const date = new Date(match[0]);
  return Number.isNaN(date.valueOf()) ? null : date;
};
const linkType = (label) =>
  /apply/.test(label)
    ? "apply"
    : /notification|notice/.test(label)
      ? "notification"
      : /admit/.test(label)
        ? "admit-card"
        : /result/.test(label)
          ? "result"
          : /answer/.test(label)
            ? "answer-key"
            : /official/.test(label)
              ? "official-website"
              : "other";
const inferCategory = (title) => {
  const value = clean(title).toLowerCase();
  if (/railway|rrb|rrc/.test(value)) return "Railway";
  if (/bank|ibps|sbi|rbi/.test(value)) return "Banking";
  if (/ssc/.test(value)) return "SSC";
  if (/upsc/.test(value)) return "UPSC";
  if (/defence|army|navy|air force/.test(value)) return "Defence";
  if (/police/.test(value)) return "Police";
  if (/teacher|teaching|school/.test(value)) return "Teaching";
  if (/psu|oil|power|steel|coal|chemical/.test(value)) return "PSU";
  return "Latest jobs";
};
const extractSection = ($, keywords) => {
  const heading = $("h1,h2,h3,h4,strong,b,p")
    .filter((_, node) =>
      keywords.some((key) => clean($(node).text()).toLowerCase().includes(key)),
    )
    .first();
  return heading.length ? clean(heading.parent().text()) : "";
};
const parseVacancyNumber = (text) => {
  const value = clean(text || "");
  const normalized = value.replace(/,/g, "");
  const direct = normalized.match(/(\d+(?:\.\d+)?)\s*(?:posts?|vacancies?)/i);
  if (direct) return Number.parseInt(direct[1], 10);
  const inTitle = value.match(/\((\d+(?:,\d{3})*)\s*(?:posts?|vacancies?)\)/i);
  if (inTitle) return Number.parseInt(inTitle[1].replace(/,/g, ""), 10);
  return null;
};
const extractDetail = ($, url, fallbackTitle) => {
  const title = clean($("h1").first().text()) || fallbackTitle;
  const links = [];
  $("a[href]").each((_, node) => {
    const label = clean($(node).text());
    const href = absolute($(node).attr("href"), url);
    if (
      label &&
      href &&
      /apply|notification|official|admit|result|answer|correction/i.test(label)
    )
      links.push({ label, type: linkType(label.toLowerCase()), url: href });
  });
  const uniqueLinks = [
    ...new Map(links.map((link) => [link.url, link])).values(),
  ];
  const pageText = clean($("body").text());
  const datePairs = [];
  $("tr").each((_, row) => {
    const cells = $(row).find("th,td");
    if (cells.length >= 2) {
      const label = clean($(cells[0]).text());
      const date = parseDate($(cells[1]).text());
      if (label && date) datePairs.push({ label, date });
    }
  });
  const dateFor = (regex) =>
    datePairs.find((item) => regex.test(item.label))?.date ||
    parseDate(
      extractSection($, [regex.source.replace(/[\\^$.*+?()[\]{}|]/g, "")]),
    );
  const vacancyRows = [];
  $("tr").each((_, row) => {
    const cells = $(row).find("th,td");
    if (cells.length >= 2) {
      const name = clean($(cells[0]).text());
      const count = Number(clean($(cells[1]).text()).replace(/[^0-9]/g, ""));
      if (
        name &&
        Number.isFinite(count) &&
        count > 0 &&
        /vacancy|post|ur|obc|sc|st|ews|general/i.test(name)
      )
        vacancyRows.push({ postName: name, postCount: count });
    }
  });
  const titleTotalVacancies = parseVacancyNumber(title);
  const textTotalVacancies = parseVacancyNumber(pageText);
  const inferredVacancyTotal =
    Number.isFinite(titleTotalVacancies) || Number.isFinite(textTotalVacancies)
      ? Math.max(titleTotalVacancies || 0, textTotalVacancies || 0)
      : null;
  const textSection = (keys) => extractSection($, keys).slice(0, 5000);
  const applicationUrl = uniqueLinks.find((link) => link.type === "apply")?.url;
  const notificationUrl = uniqueLinks.find(
    (link) => link.type === "notification",
  )?.url;
  const education = textSection(["eligibility", "qualification"]);
  const fees = textSection(["application fee", "fee details"]);
  return {
    title,
    source: SOURCE_NAME,
    sourceUrl: url,
    applicationUrl,
    notificationUrl,
    officialWebsite: uniqueLinks.find(
      (link) => link.type === "official-website",
    )?.url,
    description:
      clean($("meta[name=description]").attr("content")) ||
      clean($("p").first().text()),
    organization: "",
    category: inferCategory(title),
    education,
    eligibility: education,
    qualifications: [education].filter(Boolean),
    ageLimit: textSection(["age limit"]),
    applicationFee: fees,
    selectionProcess: textSection(["selection process"])
      .split(/\n|,|\.|;/)
      .map(clean)
      .filter(Boolean)
      .slice(0, 10),
    importantDates: datePairs,
    applicationStartDate: dateFor(/start|begin/i),
    applicationLastDate: dateFor(/last|closing/i),
    examDate: dateFor(/exam/i),
    totalVacancies:
      Math.max(
        inferredVacancyTotal || 0,
        vacancyRows.reduce((sum, row) => sum + row.postCount, 0),
      ) || undefined,
    vacancies: vacancyRows,
    importantLinks: uniqueLinks,
    searchableText: clean(
      `${title} ${inferCategory(title)} ${education} ${pageText.slice(0, 10000)}`,
    ).toLowerCase(),
    rawData: { scrapedTitle: title },
    scrapedAt: new Date(),
  };
};
const run = async () => {
  await mongoose.connect(database, { serverSelectionTimeoutMS: 15000 });
  const stats = { found: 0, new: 0, updated: 0, failed: 0 };
  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: Number(process.env.MAX_JOBS || 80) + 1,
    maxRequestRetries: 2,
    requestHandlerTimeoutSecs: 30,
    navigationTimeoutSecs: 30,
    maxConcurrency: 2,
    requestHandler: async ({ $, request, enqueueLinks }) => {
      if (request.userData.listing) {
        const entries = new Map();
        $("a[href]").each((_, node) => {
          const title = clean($(node).text());
          const href = absolute($(node).attr("href"), request.url);
          if (
            title &&
            href &&
            href.startsWith(SOURCE_URL) &&
            /online|form|recruitment|vacancy|job/i.test(title)
          )
            entries.set(href, title);
        });
        stats.found = entries.size;
        await enqueueLinks({
          urls: [...entries.keys()],
          userData: { listing: false, titles: Object.fromEntries(entries) },
        });
        return;
      }
      const data = extractDetail(
        $,
        request.url,
        request.userData.titles?.[request.url] || "Government job",
      );
      const exists = await Job.exists({ sourceUrl: data.sourceUrl });
      await Job.updateOne(
        { sourceUrl: data.sourceUrl },
        {
          $set: { ...data, lastSeenAt: new Date(), isActive: true },
          $setOnInsert: { firstSeenAt: new Date() },
        },
        { upsert: true },
      );
      exists ? stats.updated++ : stats.new++;
    },
    failedRequestHandler: ({ request }) => {
      stats.failed++;
      log.warning(`Failed ${request.url}`);
    },
  });
  try {
    await crawler.run([{ url: SOURCE_URL, userData: { listing: true } }]);
    console.log(
      `SCRAPE_COMPLETE found=${stats.found} new=${stats.new} updated=${stats.updated} failed=${stats.failed}`,
    );
  } finally {
    await mongoose.disconnect();
  }
};
run().catch((error) => {
  log.error(error, "Job scrape failed");
  process.exitCode = 1;
});
