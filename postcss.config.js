module.exports = {
    plugins: [
        require('postcss-import')({
            path: ['src/css']
        }),
        require('postcss-url')({ url: 'copy', useHash: true }),
        require('precss')(),
        require('postcss-preset-env')(),
        require('autoprefixer')(),
        require('cssnano')({
            preset: 'default'
        })
    ]
};
