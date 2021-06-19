const path = require('path');
const mode = process.env.NODE_ENV

const moduleList = ["react", "react-dom"];

module.exports = {
    mode: mode,
    entry: "./src/index.tsx",
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
        publicPath: '/build',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    devServer: {
        contentBase: ".",
        hot: true
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: new RegExp(
                        `[\\/]node_modules[\\/](${moduleList.join("|")})[\\/]`
                    ),
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
            {
                test: /\.(sc|sa|c)ss/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                            sourceMap: mode === "development",
                            importLoaders: 2
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: mode === "development"
                        },
                    },
                ],
            }
        ]
    }
};
