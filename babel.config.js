// 项目发布阶段需要用到的babel插件
const proPlugins = []
if (process.env.NODE_ENV === 'production') {
    proPlugins.push('transform-remove-console')
}


module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ],
    plugins: [
        [
            'component',
            {
                libraryName: 'element-ui',
                styleLibraryName: 'theme-chalk'
            }
        ],
        // 发布时的插件
        ...proPlugins,
        '@babel/plugin-syntax-dynamic-import'
    ]
}