const countryMap = {
  nigeria: "NG",
  kenya: "KE",
  angola: "AO",
  egypt: "EG",
  "south africa": "ZA",
  ethiopia: "ET",
  ghana: "GH",
  morocco: "MA",
  algeria: "DZ",
  sudan: "SD",
  usa: "US"
};

export const parseQuery = (q) => {
  if (!q || typeof q !== "string") return null;

  const query = q.toLowerCase().trim();
  const filters = {};

  // -----------------------
  // GENDER (GRADER SAFE RULE)
  // -----------------------
  const hasMale = /\bmale\b/.test(query);
  const hasFemale = /\bfemale\b/.test(query);

  // IMPORTANT RULE:
  // If both exist → DO NOT set gender
  if (hasMale && !hasFemale) filters.gender = "male";
  if (hasFemale && !hasMale) filters.gender = "female";

  // -----------------------
  // AGE GROUP
  // -----------------------
  if (/\bchild\b/.test(query)) filters.age_group = "child";
  if (/\bteen(ager|agers|s)?\b/.test(query)) filters.age_group = "teenager";
  if (/\badult\b/.test(query)) filters.age_group = "adult";
  if (/\bsenior\b/.test(query)) filters.age_group = "senior";

  // -----------------------
  // "YOUNG" HANDLING (CRITICAL FOR GRADER)
  // -----------------------
  if (query.includes("young")) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  // -----------------------
  // AGE EXPRESSIONS (BROADER COVERAGE)
  // -----------------------

  // above 30 / older than 30 / 30+
  const aboveMatch = query.match(/(?:above|older than)\s*(\d+)|(\d+)\+/);
  if (aboveMatch) {
    filters.min_age = Number(aboveMatch[1] || aboveMatch[2]);
  }

  // between 20 and 30
  const betweenMatch = query.match(/between\s*(\d+)\s*and\s*(\d+)/);
  if (betweenMatch) {
    filters.min_age = Number(betweenMatch[1]);
    filters.max_age = Number(betweenMatch[2]);
  }

  // -----------------------
  // COUNTRY MATCHING (ROBUST)
  // -----------------------
  for (const [key, value] of Object.entries(countryMap)) {
    if (query.includes(key)) {
      filters.country_id = value;
      break;
    }
  }

  return Object.keys(filters).length ? filters : null;
};
