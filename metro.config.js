const { getDefaultConfig } = require("@expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push("cjs");
config.resolver.unstable_enablePackageExports = false;
config.resolver.mainFields = ["react-native", "browser", "main"];

module.exports = withNativewind(config);
