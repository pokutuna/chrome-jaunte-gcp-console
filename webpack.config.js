const exec = require('child_process').exec;
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

function versionName() {
  return new Promise(function(resolve, reject) {
    exec('git describe --tags --always --dirty', function(err, stdout) {
      return err ? reject(err) : resolve('Build ' + stdout.replace('\n', ''));
    });
  });
}

module.exports = {
  mode: 'development',
  entry: {
    background: './src/background.ts',
  },
  output: {
    path: __dirname + '/build/',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([
      {
        from: 'src/manifest.json',
        transform: content => {
          return versionName().then(versionName =>
            JSON.stringify({
              ...JSON.parse(content.toString()),
              version: process.env.npm_package_version,
              version_name: versionName,
            })
          );
        },
      },
    ]),
  ],
  devtool: 'inline-source-map',
};
