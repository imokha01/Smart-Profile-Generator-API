// src/utils/parser.js

const countryMap = {
  nigeria: "NG",
  kenya: "KE",
  angola: "AO",
  usa: "US"
};

export const parseQuery = (q) => {
  if (!q || typeof q !== "string") return null;

  const query = q.toLowerCase();

  const filters = {};

  // Gender
  if (query.includes("male")) filters.gender = "male";
  if (query.includes("female")) filters.gender = "female";

  // Age group
  if (query.includes("child")) filters.age_group = "child";
  if (query.includes("teen")) filters.age_group = "teenager";
  if (query.includes("adult")) filters.age_group = "adult";
  if (query.includes("senior")) filters.age_group = "senior";

  // "young" special case
  if (query.includes("young")) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  // Age numbers
  const ageMatch = query.match(/above (\d+)/);
  if (ageMatch) {
    filters.min_age = Number(ageMatch[1]);
  }

  // Country
  for (const country in countryMap) {
    if (query.includes(country)) {
      filters.country_id = countryMap[country];
    }
  }

  return Object.keys(filters).length ? filters : null;
};
