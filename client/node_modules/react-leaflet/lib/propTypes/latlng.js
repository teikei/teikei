'use strict';

exports.__esModule = true;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.number), // [number, number]
_propTypes2.default.shape({ lat: _propTypes2.default.number, lng: _propTypes2.default.number }), _propTypes2.default.shape({ lat: _propTypes2.default.number, lon: _propTypes2.default.number })]);