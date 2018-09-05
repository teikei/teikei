module.exports = config => {
  config.module.rules[1].oneOf.splice(
    config.module.rules[1].oneOf.length - 1,
    0,
    {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader']
    }
  )
  return config
}
