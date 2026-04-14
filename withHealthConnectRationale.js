const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withHealthConnectRationale(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Find the main activity
    const mainActivity = androidManifest.application[0].activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      // Ensure intent-filter array exists
      if (!mainActivity['intent-filter']) {
        mainActivity['intent-filter'] = [];
      }

      // Add the intent filter for Health Connect
      mainActivity['intent-filter'].push({
        action: [
          {
            $: {
              'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE',
            },
          },
        ],
      });
    }

    return config;
  });
};
