/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from the development server
  allowedDevOrigins: [
    '38.45.65.66',
    'localhost',
    '127.0.0.1',
    'bigbraincoding.com',
    'bryanwills.dev'
  ],
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
  // Set the port for development server
  env: {
    PORT: '4000'
  }
}

module.exports = nextConfig