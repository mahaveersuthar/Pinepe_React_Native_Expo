import fs from "fs";
import path from "path";

const PROJECT_IDS = {
  pinepe: "b54319dc-24f4-4efa-88b2-8bf3e75a8559",
  "klj-pay": "REPLACE_WITH_ID_FROM_EXPO",
  laxmeepay: "98add4ed-acbe-4fdc-a574-881813ac2981",
};

export default ({ config }) => {
  const metadataPath = path.join(__dirname, "tenant-metadata.json");
  const iconPath = "./assets/generated/icon.png";

  let tenant = null;
  if (fs.existsSync(metadataPath)) {
    tenant = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  }

  if (!tenant) return config;

  const tenantSlug = tenant.name.toLowerCase().replace(/\s/g, "-");

  return {
    ...config,
    name: tenant.name,
    slug: tenantSlug,
    icon: iconPath,

    plugins: [
      ...(config.plugins || []),
      "expo-secure-store",
    ],

    ios: {
      ...config.ios,
      bundleIdentifier: `in.pinepe.${tenantSlug}`,
      icon: iconPath,

      /** ✅ LOCATION PERMISSION (iOS) */
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "We need your location to show nearby services and offers.",
      },
    },

    android: {
      ...config.android,
      package: `in.pinepe.${tenantSlug}`,
      icon: iconPath,
      adaptiveIcon: {
        foregroundImage: iconPath,
        backgroundColor: "#FFFFFF",
      },

      /** ✅ LOCATION PERMISSION (Android) */
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
      ],
    },

    extra: {
      tenantData: tenant,
      eas: {
        projectId:
          PROJECT_IDS[tenantSlug] ||
          "3d149857-ae73-4ed1-a34d-12a0018a87c8",
      },
    },
  };
};
