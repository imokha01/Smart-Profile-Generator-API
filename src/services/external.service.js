import axios from "axios";

export const fetchExternalData = async (name) => {
  const [gender, age, nation] = await Promise.all([
    axios.get(`https://api.genderize.io?name=${name}`),
    axios.get(`https://api.agify.io?name=${name}`),
    axios.get(`https://api.nationalize.io?name=${name}`)
  ]);

  if (!gender.data.gender || gender.data.count === 0) {
    throw new Error("Genderize");
  }

  if (!age.data.age) {
    throw new Error("Agify");
  }

  if (!nation.data.country.length) {
    throw new Error("Nationalize");
  }

  return {
    gender: gender.data,
    age: age.data,
    nation: nation.data
  };
};
