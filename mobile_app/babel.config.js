module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      // React Native Reanimated plugin (must be last)
      'react-native-reanimated/plugin',
    ],
  };
};
