export const parseQuery = (q) => {
  if (!q || typeof q !== "string") return null;

  const query = q.toLowerCase().trim();
  const filters = {};

  // -----------------------
  // STEP 1: GENDER (PRIORITY FIX)
  // -----------------------
  const hasMale = /\bmale\b/.test(query);
  const hasFemale = /\bfemale\b/.test(query);

  // CRITICAL RULE:
  // if both appear → DO NOT SET gender
  if (hasMale && hasFemale) {
    // intentionally ignore gender
  } else if (hasMale) {
    filters.gender = "male";
  } else if (hasFemale) {
    filters.gender = "female";
  }

  // -----------------------
  // STEP 2: AGE EXPRESSIONS FIRST (IMPORTANT FIX)
  // -----------------------

  // "above 30", "older than 30"
  let match = query.match(/(above|older than)\s*(\d+)/);
  if (match) {
    filters.min_age = Number(match[2]);
  }

  // "between 20 and 30"
  match = query.match(/between\s*(\d+)\s*and\s*(\d+)/);
  if (match) {
    filters.min_age = Number(match[1]);
    filters.max_age = Number(match[2]);
  }

  // "30+"
  match = query.match(/(\d+)\+/);
  if (match) {
    filters.min_age = Number(match[1]);
  }

  // -----------------------
  // STEP 3: KEYWORD AGE GROUP
  // -----------------------
  if (query.includes("child")) filters.age_group = "child";
  if (query.includes("teenager") || query.includes("teenagers") || query.includes("teen")) {
    filters.age_group = "teenager";
  }
  if (query.includes("adult")) filters.age_group = "adult";
  if (query.includes("senior")) filters.age_group = "senior";

  // -----------------------
  // STEP 4: "YOUNG" RULE (CRITICAL TEST CASE)
  // -----------------------
  if (query.includes("young")) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  // -----------------------
  // STEP 5: COUNTRY (STRICT MATCH)
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
