module.exports = config => {
  config.module.rules[1].oneOf.splice(
    config.module.rules[1].oneOf.length - 1,
    0,
    {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader']
    }
  )
  // console.dir(config, { depth: 10, colors: true })
  return config
}
