'use strict';

exports.__esModule = true;

var _leaflet = require('leaflet');

var _Path2 = require('./Path');

var _Path3 = _interopRequireDefault(_Path2);

var _bounds = require('./propTypes/bounds');

var _bounds2 = _interopRequireDefault(_bounds);

var _children = require('./propTypes/children');

var _children2 = _interopRequireDefault(_children);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var Rectangle = function (_Path) {
  _inherits(Rectangle, _Path);

  function Rectangle() {
    _classCallCheck(this, Rectangle);

    return _possibleConstructorReturn(this, _Path.apply(this, arguments));
  }

  Rectangle.prototype.createLeafletElement = function createLeafletElement(props) {
    return new _leaflet.Rectangle(props.bounds, this.getOptions(props));
  };

  Rectangle.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    if (toProps.bounds !== fromProps.bounds) {
      this.leafletElement.setBounds(toProps.bounds);
    }
    this.setStyleIfChanged(fromProps, toProps);
  };

  return Rectangle;
}(_Path3.default);

Rectangle.propTypes = {
  children: _children2.default,
  bounds: _bounds2.default.isRequired
};
exports.default = Rectangle;