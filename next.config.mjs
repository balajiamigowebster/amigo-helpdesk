/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  api: {
    bodyParser: {
      sizeLimit: "100mb", // Express-la pannuna athe mathiri
    },
  },
};

export default nextConfig;
