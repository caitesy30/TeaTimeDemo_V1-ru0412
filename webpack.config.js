// webpack.config.js
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: {
        vueApp: './TeaTimeDemo/wwwroot/js/app.js',       // Vue.js 編輯器入口
        mvcEditor: './TeaTimeDemo/wwwroot/js/editor.js' // MVC 編輯器入口
    },
    output: {
        path: path.resolve(__dirname, 'TeaTimeDemo/wwwroot/dist'), // 輸出目錄
        filename: '[name].bundle.js' // 生成 vueApp.bundle.js 和 mvcEditor.bundle.js
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js' // 使用完整版 Vue（含編譯器）
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    devtool: 'source-map'
};
