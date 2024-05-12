const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    this.cache = new NodeCache();
  }

  set(key, value, ttl = 60) {
    this.cache.set(key, value, ttl);
  }

  del(key) {
    this.cache.del(key);
  }

  get(key) {
    return this.cache.get(key);
  }

  // take = get + del
  take(key) {
    return this.cache.take(key);
  }
}

module.exports = new CacheService();
