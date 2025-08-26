module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        safe: true,
        allowUndefined: true,
        verbose: false,
      },
    ],
    [
      'module-resolver',
      {
        alias: {
          '@screens': './src/screens',
          '@modals': './src/modals',
          '@navigation': './src/navigation',
          '@constants': './src/constants',
          '@utils': './src/utils',
          '@components': './src/components',
          '@store': './src/store',
          '@api': './src/api',
          '@types': './src/types',
          '@assets': './assets',
          '@db': './src/db',
        },
      },
    ],
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    'react-native-reanimated/plugin',
  ],
};
