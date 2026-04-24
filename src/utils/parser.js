const countryMap = {
  nigeria: "NG",
  kenya: "KE",
  angola: "AO",
  egypt: "EG",
  south_africa: "ZA",
  ethiopia: "ET",
  ghana: "GH",
  morocco: "MA",
  algeria: "DZ",
  sudan: "SD",
  usa: "US"
};

export const parseQuery = (q) => {
  if (!q || typeof q !== "string") return null;

  const query = q.toLowerCase();
  const filters = {};

  // Gender
  if (query.includes("male") && !query.includes("female")) {
    filters.gender = "male";
  } else if (query.includes("female")) {
    filters.gender = "female";
  }

  // Age group
  if (query.includes("child")) filters.age_group = "child";
  if (query.includes("teen")) filters.age_group = "teenager";
  if (query.includes("adult")) filters.age_group = "adult";
  if (query.includes("senior")) filters.age_group = "senior";

  // Young = 16–24
  if (query.includes("young")) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

if (query.includes("teenager") || query.includes("teenagers")) {
    filters.age_group = "teenager";
  }


  // Above age
  const aboveMatch = query.match(/above (\d+)/);
  if (aboveMatch) {
    filters.min_age = Number(aboveMatch[1]);
  }

  // Between ages
  const betweenMatch = query.match(/between (\d+) and (\d+)/);
  if (betweenMatch) {
    filters.min_age = Number(betweenMatch[1]);
    filters.max_age = Number(betweenMatch[2]);
  }

  // Country
  for (const country in countryMap) {
    if (query.includes(country)) {
      filters.country_id = countryMap[country];
    }
  }

  return Object.keys(filters).length ? filters : null;
};
