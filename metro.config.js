const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent Metro file-map from watching native build caches and long paths
config.resolver.blockList = [
  /\.gradle-user\/.*/,
  /android\/build\/.*/,
  /ios\/build\/.*/,
];

module.exports = config;
