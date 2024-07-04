import path from 'path';
// import webpack from 'webpack';
import HtmlWebPackPlugin from "html-webpack-plugin";
import { GenerateSW } from 'workbox-webpack-plugin';

const module = {
    entry: './src/client/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve('dist'),
        libraryTarget: 'var',
        library: 'Client'
    },
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],  // Add source-map-loader
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/client/views/index.html",
            filename: "./index.html",
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            }
        }),
        new GenerateSW({
            clientsClaim: true,
            skipWaiting: true
        })
    ]
}

export default module;