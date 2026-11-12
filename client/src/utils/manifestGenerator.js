export const generateManifest = (settings) => {
  const institutionName = settings?.institution?.name || "Pydah Hostel";
  const shortName = settings?.institution?.shortName || "Pydah Hostel";
  const fullName = settings?.institution?.fullName || "Pydah Educational Institutions";
  const websiteUrl = settings?.urls?.website || "https://hms.pydahsoft.in";
  const pydahSoftInfo = settings?.pydahsoft || { companyName: "PydahSoft", website: "https://pydahsoft.in" };

  return {
    "name": `${institutionName} Management System`,
    "short_name": shortName,
    "description": `Digital hostel management system for ${fullName}. Manage complaints, attendance, fees, and student services.`,
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#1e40af",
    "orientation": "portrait-primary",
    "scope": "/",
    "lang": "en",
    "categories": ["education", "productivity", "utilities"],
    "keywords": [`${institutionName.toLowerCase()}`, "hostel management", "student portal", "digital hostel", pydahSoftInfo.companyName.toLowerCase()],
    "author": pydahSoftInfo.companyName,
    "icons": [
      {
        "src": "/campo-logos/icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": "/campo-logos/icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable any"
      }
    ],
    "shortcuts": [
      {
        "name": "Student Dashboard",
        "short_name": "Dashboard",
        "description": "Access student dashboard",
        "url": "/student/dashboard",
        "icons": [{ "src": "/campo-logos/icon-192.png", "sizes": "192x192" }]
      },
      {
        "name": "Leave Management",
        "short_name": "Leave",
        "description": "Apply for leave or permission",
        "url": "/student/leave",
        "icons": [{ "src": "/campo-logos/icon-192.png", "sizes": "192x192" }]
      },
      {
        "name": "Complaints",
        "short_name": "Complaints",
        "description": "Raise hostel complaints",
        "url": "/student/complaints",
        "icons": [{ "src": "/campo-logos/icon-192.png", "sizes": "192x192" }]
      }
    ],
    "related_applications": [
      {
        "platform": "webapp",
        "url": websiteUrl
      }
    ],
    "prefer_related_applications": false,
    "edge_side_panel": {
      "preferred_width": 400
    }
  };
};

export default generateManifest;
