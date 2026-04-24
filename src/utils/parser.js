export const parseQuery = (q) => {
  if (!q || typeof q !== "string") return null;
  const query = q.toLowerCase().trim();
  const filters = {};

  // 1. Gender Logic
  const hasMale = /\bmales?\b/.test(query);
  const hasFemale = /\bfemales?\b/.test(query);
  if (hasMale && !hasFemale) filters.gender = "male";
  if (hasFemale && !hasMale) filters.gender = "female";

  // 2. Age Expressions
  const between = query.match(/between\s*(\d+)\s*and\s*(\d+)/);
  const above = query.match(/(above|older than|over)\s*(\d+)/);
  if (between) {
    filters.min_age = Number(between[1]);
    filters.max_age = Number(between[2]);
  } else if (above) {
    filters.min_age = Number(above[2]);
  }

  // 3. Keyword Groups
  if (/\bchild\b/.test(query)) filters.age_group = "child";
  if (/\bteen(ager)?s?\b/.test(query)) filters.age_group = "teenager";
  if (/\badult\b/.test(query)) filters.age_group = "adult";
  if (/\bsenior\b/.test(query)) filters.age_group = "senior";

  // 4. "Young" Rule (16-24) - Priority over age_group if present
  if (/\byoung\b/.test(query)) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  // 5. Country Mapping (ISO)
  const countries = { nigeria: "NG", kenya: "KE", angola: "AO", ghana: "GH", usa: "US" }; // Expand as needed
  for (const [name, code] of Object.entries(countries)) {
    if (new RegExp(`\\b${name}\\b`).test(query)) {
      filters.country_id = code;
      break;
    }
  }

  return Object.keys(filters).length ? filters : null;
};