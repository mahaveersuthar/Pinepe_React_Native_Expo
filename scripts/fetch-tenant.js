const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// --- 1. CONFIGURATION ---
const API_URL = 'https://api.pinepe.in/api/users?type=whitelabel&per_page=10&page=1';
const TOKEN = '346|y1Jka32RNDwMg1gGkNGAhO1txb319kghZkkIqfiHf5049b46';
const TENANT_ID = process.env.TENANT_ID;

// --- 2. IMAGE DOWNLOADER & PROCESSOR ---
async function downloadIcon(url) {
  const brandingDir = path.join(__dirname, '../assets/generated');
  const iconPath = path.join(brandingDir, 'icon.png');

  if (!fs.existsSync(brandingDir)) {
    fs.mkdirSync(brandingDir, { recursive: true });
  }

  try {
    console.log(`[Tenant] 📥 Downloading photo: ${url}`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    await sharp(Buffer.from(response.data))
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent
      })
      .png()
      .toFile(iconPath);

    console.log(`\x1b[32m[Tenant] ✅ Icon saved to: assets/generated/icon.png\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m[Tenant] ❌ Image Error: ${error.message}\x1b[0m`);
  }
}

// --- 3. MAIN LOGIC ---
async function fetchTenantData() {
  console.log(`\x1b[36m[Tenant] 🚀 Searching for ID: ${TENANT_ID}\x1b[0m`);

  if (!TENANT_ID) {
    console.error("\x1b[31m[Tenant] ❌ Error: No TENANT_ID provided.\x1b[0m");
    return;
  }

  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json'
      }
    });

    // Match your specific API structure: response.data.data.items
    const tenants = response.data.data.items;

    if (!Array.isArray(tenants)) {
      console.error("\x1b[31m[Tenant] ❌ API Structure Error: Could not find 'items' array.\x1b[0m");
      return;
    }

    // Find the tenant by unique_id or id
    const currentTenant = tenants.find(t => 
      t.unique_id === TENANT_ID || 
      t.id.toString() === TENANT_ID
    );

    if (currentTenant) {
      console.log(`[Tenant] ✨ Found Tenant: ${currentTenant.name}`);
      
      // Use the 'photo' field from your JSON
      if (currentTenant.photo) {
        await downloadIcon(currentTenant.photo);
      } else {
        console.warn("\x1b[33m[Tenant] ⚠️ Tenant found, but 'photo' field is empty.\x1b[0m");
      }
    } else {
      console.error(`\x1b[31m[Tenant] ❌ Tenant ID ${TENANT_ID} not found in current results.\x1b[0m`);
    }

  } catch (error) {
    console.error(`\x1b[31m[Tenant] ❌ API Error: ${error.message}\x1b[0m`);
  }
}

fetchTenantData();