const getTopCountry = (countries) => {
  if (!countries?.length) return null;

  return countries.reduce((max, curr) =>
    curr.probability > max.probability ? curr : max
  );
};

export default getTopCountry;
