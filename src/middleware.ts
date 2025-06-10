// Middleware de seguridad para Astro
import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();

  // Solo aplicar headers de seguridad en producción
  if (import.meta.env.PROD) {
    // Content Security Policy
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://unpkg.com",
        "style-src 'self' 'unsafe-inline' https://fonts.cdnfonts.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.cdnfonts.com",
        "connect-src 'self' https://www.google-analytics.com https://analytics.google.com",
        "media-src 'self' https:",
        "frame-src 'self' https://www.youtube.com https://youtube.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ].join("; ")
    );

    // Security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
    );

    // HSTS (solo en HTTPS)
    if (context.url.protocol === "https:") {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }
  }

  return response;
};
