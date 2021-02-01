const pkg = require('./package.json');

module.exports = [
	{
		input: 'src/index.js',
		output: {
			file: `dist/${pkg.name}.js`,
			format: 'umd',
			indent: false,
			globals: {
				'chart.js': 'Chart'
			}
		},
		external: [
			'chart.js'
		]
	}
];
