/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/**/*': ['./Data/**/*'],
  },
};

export default nextConfig;
