export const logger = (type, message) => {
  console.log(`[${new Date().toISOString()}] [${type}] ${message}`);
};
