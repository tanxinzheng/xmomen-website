const resolve = require('path').resolve;
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const publicPath = '';

module.exports = (option = {}) => ({
    entry: './src/app.js',
    output: {
        path: resolve(__dirname, "dist"),
        filename: option.dev ? '[name].js' : '[name].js?[chunkhash]',
        chunkFilename: '[id].js?[chunkhash]',
        publicPath: option.dev ? '/assets/' : publicPath
    },
    devServer: {
        host: '127.0.0.1',
        port: 9000
    },
    resolve: {
        alias: {
            '~': resolve(__dirname, 'src')
        }
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'mainfast']
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ]
});