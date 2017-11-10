function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { Control } from 'leaflet';
import PropTypes from 'prop-types';

import MapControl from './MapControl';
import controlPosition from './propTypes/controlPosition';

var AttributionControl = function (_MapControl) {
  _inherits(AttributionControl, _MapControl);

  function AttributionControl() {
    _classCallCheck(this, AttributionControl);

    return _possibleConstructorReturn(this, _MapControl.apply(this, arguments));
  }

  AttributionControl.prototype.createLeafletElement = function createLeafletElement(props) {
    return new Control.Attribution(props);
  };

  return AttributionControl;
}(MapControl);

AttributionControl.propTypes = {
  position: controlPosition,
  prefix: PropTypes.string
};
export default AttributionControl;