
/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    // Add rule to handle .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'raw-loader', // or 'file-loader' depending on your preference
    });

    // Important: return the modified config
    return config;
  },
  images: {
    remotePatterns: [
      {
        hostname: 'utfs.io'
      }
    ]
  }
};
