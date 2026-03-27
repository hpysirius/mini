// babel.config.js
module.exports = {
    presets: [
        ['taro', {
            framework: 'react',
            ts: true
        }]
    ],
    plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-transform-class-properties', { loose: true }],
        ['@babel/plugin-transform-private-methods', { loose: true }],
        ['@babel/plugin-transform-private-property-in-object', { loose: true }]
    ]
}