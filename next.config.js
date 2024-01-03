/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/dice",
  // Trailing slash is needed for compatibility with my website's Nginx config.
  trailingSlash: true,

  reactStrictMode: true,
};

module.exports = nextConfig;
