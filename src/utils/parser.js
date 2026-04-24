export const parseQuery = (q) => {
  if (!q || typeof q !== "string") return null;

  const query = q.toLowerCase().trim();
  const filters = {};

  // -----------------------
  // GENDER (CRITICAL FIX)
  // -----------------------
  const hasMale = /\bmale\b/.test(query);
  const hasFemale = /\bfemale\b/.test(query);

  // IMPORTANT RULE:
  // If BOTH appear → DO NOT SET gender
  if (hasMale && hasFemale) {
    // intentionally empty
  } else if (hasMale) {
    filters.gender = "male";
  } else if (hasFemale) {
    filters.gender = "female";
  }

  // -----------------------
  // AGE GROUP
  // -----------------------
  if (query.includes("child")) filters.age_group = "child";
  if (query.includes("teenager") || query.includes("teenagers") || query.includes("teen")) {
    filters.age_group = "teenager";
  }
  if (query.includes("adult")) filters.age_group = "adult";
  if (query.includes("senior")) filters.age_group = "senior";

  // -----------------------
  // YOUNG RULE (IMPORTANT)
  // -----------------------
  if (query.includes("young")) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  // -----------------------
  // AGE CONDITIONS
  // -----------------------
  const aboveMatch = query.match(/(?:above|older than)\s*(\d+)|(\d+)\+/);
  if (aboveMatch) {
    filters.min_age = Number(aboveMatch[1] || aboveMatch[2]);
  }

  const betweenMatch = query.match(/between\s*(\d+)\s*and\s*(\d+)/);
  if (betweenMatch) {
    filters.min_age = Number(betweenMatch[1]);
    filters.max_age = Number(betweenMatch[2]);
  }

  // -----------------------
  // COUNTRY
  // -----------------------
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

  for (const [key, value] of Object.entries(countryMap)) {
    if (query.includes(key)) {
      filters.country_id = value;
      break;
    }
  }

  return Object.keys(filters).length ? filters : null;
};
