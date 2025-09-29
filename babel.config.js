// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // mantenha SEMPRE por último:
      'react-native-reanimated/plugin',
    ],
  };
};
