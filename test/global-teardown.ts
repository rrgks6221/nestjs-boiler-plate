module.exports = async function () {
  if (global.__POSTGRES_CONTAINER__) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await global.__POSTGRES_CONTAINER__.stop();
  }
};
