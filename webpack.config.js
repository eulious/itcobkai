const path = require('path');

module.exports = {
    mode: "production",
    entry: "./src/index.tsx",
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
        publicPath: '/build',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    watchOptions: {
        ignored: ['**/build', '**/node_modules'],
    },
    devtool: 'source-map',
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: new RegExp(`[\\/]node_modules[\\/]`),
                    name: 'vendor',
                    chunks: 'initial',
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader'
            },
        ]
    }
};