module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'jsengine.js',
    path: `${__dirname}/dist/`,
    library: 'jsengine',
    libraryTarget: 'umd'
  }
}