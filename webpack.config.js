const path = require('path');
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const IS_DEV = (process.env.NODE_ENV === 'dev');

const dirApp = path.join(__dirname, 'src/app')
const dirStyles = path.join(__dirname, 'src/styles')
const dirAssets = path.join(__dirname, 'src/assets')
const dirDist = path.join(__dirname, 'dist')

module.exports = {
    mode: IS_DEV ? 'development' : 'production',
    entry: [
        path.join(dirApp, 'index.js'),
        path.join(dirStyles, 'index.scss')
    ],
    output: {
        path: dirDist,
        filename: '[name].js'
    },

    performance: {
        maxEntrypointSize: 500000,
        maxAssetSize: 500000,
        hints: IS_DEV ? false : 'warning',
    },

    resolve: {
        modules: [dirApp, dirStyles, dirAssets, 'node_modules'],
        fallback: {
            fs: false,
            path: false,
            os: false,
        }
    },

    plugins: [
        new webpack.DefinePlugin({
            IS_DEV: JSON.stringify(IS_DEV),
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: dirAssets,
                    to: path.join(dirDist, "assets"),
                    noErrorOnMissing: true,
                },
            ],
        }),

        new MiniCssExtractPlugin({
            filename: 'main.css'
        }),

        new CleanWebpackPlugin(),
        // Removed HotModuleReplacementPlugin - not needed when hot: true is set
        new BundleAnalyzerPlugin({
            openAnalyzer: false
        }),

    ],
    devtool: IS_DEV ? "inline-source-map" : false,
    optimization: {
        splitChunks: false,
        runtimeChunk: false,
        minimize: !IS_DEV,
        minimizer: [
            new TerserPlugin(),
            new CssMinimizerPlugin(),
        ],
    },



    // Move watchOptions to top level
    watchOptions: {
        ignored: ['node_modules']
    },

    devServer: {
        static: dirDist, // Changed from contentBase to static
        historyApiFallback: true,
        hot: false,
        open: false,
        port: 8030,
        devMiddleware: {
            writeToDisk: true,
        },
        // Fixed proxy configuration - now an array
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        ],
    },

    module: {
        rules: [
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: "asset/resource",
                generator: {
                    filename: "fonts/[name][ext]",
                },
            },
            {
                test: /\.js$/,
                use: ["babel-loader"],
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [
                    IS_DEV ? "style-loader" : MiniCssExtractPlugin.loader,
                    "css-loader",
                    "postcss-loader",
                    "sass-loader",
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg|fnt|webp)$/,
                type: "asset/resource",
                generator: {
                    filename: "images/[name][ext]",
                },
            },
            {
                test: /\.(glsl|frag|vert)$/,
                type: "asset/source",
            },
        ]
    }
}

