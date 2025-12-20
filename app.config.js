import fs from 'fs';
import path from 'path';

export default ({ config }) => {
  const metadataPath = path.join(__dirname, 'tenant-metadata.json');
  const iconPath = "./assets/generated/icon.png"; // Local path created by script

  let tenant = null;
  if (fs.existsSync(metadataPath)) {
    tenant = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  }

  if (!tenant) return config;

  return {
    ...config,
    name: tenant.name,
    icon: iconPath, // Sets the app icon dynamically
    ios: {
      ...config.ios,
      bundleIdentifier: `in.pinepe.${tenant.name.toLowerCase().replace(/\s/g, '')}`,
      icon: iconPath
    },
    android: {
      ...config.android,
      package: `in.pinepe.${tenant.name.toLowerCase().replace(/\s/g, '')}`,
      icon: iconPath
    },
    extra: {
      tenantData: tenant,
      eas: {
        projectId: "3d149857-ae73-4ed1-a34d-12a0018a87c8"
      }
    },
  };
};