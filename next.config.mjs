/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: '.next_new',
    output: 'export',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
