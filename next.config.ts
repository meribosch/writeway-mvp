/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Asegurarse de que Tailwind se procese correctamente
  webpack: (config: any) => {
    return config;
  },
};

export default nextConfig;
