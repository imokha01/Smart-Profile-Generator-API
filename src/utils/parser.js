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
  usa: "US",
};

const parseQuery = (q) => {
  if (!q || typeof q !== "string") return null;

  const query = q.toLowerCase().trim();
  const filters = {};

  
  // GENDER (STRICT RULE)
  // -----------------------
  const hasMale = /\bmale\b/.test(query);
  const hasFemale = /\bfemale\b/.test(query);

  if (hasMale && !hasFemale) {
    filters.gender = "male";
  } else if (hasFemale && !hasMale) {
    filters.gender = "female";
  }
  

  // AGE GROUP (DIRECT)
  // -----------------------
  if (query.includes("child")) filters.age_group = "child";
  if (query.includes("teen")) filters.age_group = "teenager";
  if (query.includes("adult")) filters.age_group = "adult";
  if (query.includes("senior")) filters.age_group = "senior";

  // AGE RANGE (PRIORITY RULES)
  // -----------------------
  let hasAgeFilter = false;

  const betweenMatch = query.match(/between (\d+)\s*(?:and|-)\s*(\d+)/);
  if (betweenMatch) {
    filters.min_age = Number(betweenMatch[1]);
    filters.max_age = Number(betweenMatch[2]);
    hasAgeFilter = true;
  } else {
    const aboveMatch = query.match(/above (\d+)/);
    if (aboveMatch) {
      filters.min_age = Number(aboveMatch[1]);
      hasAgeFilter = true;
    }
  }

  // "young" ONLY if no numeric rule exists
  if (!hasAgeFilter && query.includes("young")) {
    filters.min_age = 16;
    filters.max_age = 24;
  }
  
  // COUNTRY MATCHING
  for (const key in countryMap) {
    if (query.includes(key)) {
      filters.country_id = countryMap[key];
      break;
    }
  }

  return Object.keys(filters).length ? filters : null;
};

export default parseQuery;
