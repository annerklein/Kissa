export default {
  expo: {
    name: 'Kissa',
    slug: 'kissa',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      backgroundColor: '#43302b',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.kissa.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#43302b',
      },
      package: 'com.kissa.app',
    },
    extra: {
      apiUrl: process.env.API_URL || 'http://kissa.local:3001',
    },
    plugins: ['expo-router'],
    scheme: 'kissa',
  },
};
