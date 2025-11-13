//Esto le dice a Babel que compile tu código moderno (ES6) a la versión actual de Node, para que Jest lo entienda bien.

export default {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
