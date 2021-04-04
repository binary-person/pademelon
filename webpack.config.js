const path = require('path');

const pademelonConfig = {
    entry: './src/browser-module.ts',
    mode: 'development',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader'
        }]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'pademelon.min.js',
        library: 'Pademelon',
        path: path.resolve(__dirname, 'dist')
    },
    watchOptions: {
        ignored: /node_modules/
    }
};

const workerPademelonConfig = {
    ...pademelonConfig,
    entry: './src/worker-browser-module.ts',
    mode: 'development',
    output: {
        filename: 'pademelon.worker.min.js',
        library: 'PademelonWorker',
        path: path.resolve(__dirname, 'dist')
    }
};

module.exports = [pademelonConfig, workerPademelonConfig];