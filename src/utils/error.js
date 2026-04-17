const externalError = (apiName) => ({
  status: "error",
  message: `${apiName} returned an invalid response`
});

export default externalError;