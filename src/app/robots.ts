import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
      {
        userAgent: [
          "Google-Extended",
          "Googlebot",
          "Googlebot-Image",
          "Googlebot-Mobile",
          "Google-InspectionTool",
          "GoogleOther",
        ],
        allow: ["/", "/preview-3d"],
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
    ],
    sitemap: "https://kananlimpieza.mx/sitemap.xml",
  };
}
