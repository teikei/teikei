'use strict';

exports.__esModule = true;

var _leaflet = require('leaflet');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Path2 = require('./Path');

var _Path3 = _interopRequireDefault(_Path2);

var _children = require('./propTypes/children');

var _children2 = _interopRequireDefault(_children);

var _latlngList = require('./propTypes/latlngList');

var _latlngList2 = _interopRequireDefault(_latlngList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var Polyline = function (_Path) {
  _inherits(Polyline, _Path);

  function Polyline() {
    _classCallCheck(this, Polyline);

    return _possibleConstructorReturn(this, _Path.apply(this, arguments));
  }

  Polyline.prototype.createLeafletElement = function createLeafletElement(props) {
    return new _leaflet.Polyline(props.positions, this.getOptions(props));
  };

  Polyline.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    if (toProps.positions !== fromProps.positions) {
      this.leafletElement.setLatLngs(toProps.positions);
    }
    this.setStyleIfChanged(fromProps, toProps);
  };

  return Polyline;
}(_Path3.default);

Polyline.propTypes = {
  children: _children2.default,
  positions: _propTypes2.default.oneOfType([_latlngList2.default, _propTypes2.default.arrayOf(_latlngList2.default)]).isRequired
};
exports.default = Polyline;