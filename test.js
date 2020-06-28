const _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;

const _reactLoadable = _interopRequireDefault(require('react-loadable'));

/**
 * async component
 */
function loadable(options) {
  const LoadableComponent = (0, _reactLoadable.default)(options);
  LoadableComponent.LOADER_PROMISE = options.loader;
  return LoadableComponent;
}

const _default = loadable;
exports.default = _default;
// # sourceMappingURL=loadable.js.map
