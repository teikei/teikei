function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { Rectangle as LeafletRectangle } from 'leaflet';

import Path from './Path';
import bounds from './propTypes/bounds';
import children from './propTypes/children';

var Rectangle = function (_Path) {
  _inherits(Rectangle, _Path);

  function Rectangle() {
    _classCallCheck(this, Rectangle);

    return _possibleConstructorReturn(this, _Path.apply(this, arguments));
  }

  Rectangle.prototype.createLeafletElement = function createLeafletElement(props) {
    return new LeafletRectangle(props.bounds, this.getOptions(props));
  };

  Rectangle.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    if (toProps.bounds !== fromProps.bounds) {
      this.leafletElement.setBounds(toProps.bounds);
    }
    this.setStyleIfChanged(fromProps, toProps);
  };

  return Rectangle;
}(Path);

Rectangle.propTypes = {
  children: children,
  bounds: bounds.isRequired
};
export default Rectangle;