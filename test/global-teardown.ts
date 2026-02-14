module.exports = async function () {
  if (global.__REDIS_CONTAINER__) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await global.__REDIS_CONTAINER__.stop();
  }
  if (global.__POSTGRES_CONTAINER__) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await global.__POSTGRES_CONTAINER__.stop();
  }
};
