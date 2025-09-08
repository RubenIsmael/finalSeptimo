module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }]
    ],
    plugins: [
      // Remover 'expo-router/babel' - ya está incluido en babel-preset-expo
      'react-native-reanimated/plugin', // debe ser el último
    ],
  };
};