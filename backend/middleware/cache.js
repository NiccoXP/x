const redisClient = require('../config/redis');

const cacheMessageRequests = async (req, res, next) => {
  const cacheKey = `requests:${req.user.id}`;
  
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }
  
  // Override res.json to catch the data and store it in Redis before sending
  const originalJson = res.json;
  res.json = (data) => {
    redisClient.setEx(cacheKey, 30, JSON.stringify(data)); // Cache for 30s
    originalJson.call(res, data);
  };
  
  next();
};

module.exports = cacheMessageRequests;
