function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { Control } from 'leaflet';
import PropTypes from 'prop-types';

import MapControl from './MapControl';
import controlPositionType from './propTypes/controlPosition';

var ScaleControl = function (_MapControl) {
  _inherits(ScaleControl, _MapControl);

  function ScaleControl() {
    _classCallCheck(this, ScaleControl);

    return _possibleConstructorReturn(this, _MapControl.apply(this, arguments));
  }

  ScaleControl.prototype.createLeafletElement = function createLeafletElement(props) {
    return new Control.Scale(props);
  };

  return ScaleControl;
}(MapControl);

ScaleControl.propTypes = {
  imperial: PropTypes.bool,
  maxWidth: PropTypes.number,
  metric: PropTypes.bool,
  position: controlPositionType,
  updateWhenIdle: PropTypes.bool
};
export default ScaleControl;