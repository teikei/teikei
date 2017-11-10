'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _leaflet = require('leaflet');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _reactDom = require('react-dom');

var _MapComponent2 = require('./MapComponent');

var _MapComponent3 = _interopRequireDefault(_MapComponent2);

var _latlng = require('./propTypes/latlng');

var _latlng2 = _interopRequireDefault(_latlng);

var _layer = require('./propTypes/layer');

var _layer2 = _interopRequireDefault(_layer);

var _map = require('./propTypes/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var Popup = function (_MapComponent) {
  _inherits(Popup, _MapComponent);

  function Popup() {
    var _temp, _this, _ret;

    _classCallCheck(this, Popup);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _MapComponent.call.apply(_MapComponent, [this].concat(args))), _this), _this.onPopupOpen = function (_ref) {
      var popup = _ref.popup;

      if (popup === _this.leafletElement) {
        _this.renderPopupContent();
        if (_this.props.onOpen) {
          _this.props.onOpen();
        }
      }
    }, _this.onPopupClose = function (_ref2) {
      var popup = _ref2.popup;

      if (popup === _this.leafletElement) {
        _this.removePopupContent();
        if (_this.props.onClose) {
          _this.props.onClose();
        }
      }
    }, _this.renderPopupContent = function () {
      if (_this.props.children == null) {
        _this.removePopupContent();
      } else {
        (0, _reactDom.render)(_react.Children.only(_this.props.children), _this.leafletElement._contentNode);
        _this.leafletElement.update();
        if (_this.props.autoPan !== false) {
          if (_this.leafletElement._map && _this.leafletElement._map._panAnim) {
            _this.leafletElement._map._panAnim = undefined;
          }
          _this.leafletElement._adjustPan();
        }
      }
    }, _this.removePopupContent = function () {
      if (_this.leafletElement._contentNode) {
        (0, _reactDom.unmountComponentAtNode)(_this.leafletElement._contentNode);
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  Popup.prototype.getOptions = function getOptions(props) {
    return _extends({}, _MapComponent.prototype.getOptions.call(this, props), {
      autoPan: false
    });
  };

  Popup.prototype.createLeafletElement = function createLeafletElement(props) {
    return new _leaflet.Popup(this.getOptions(props), this.context.popupContainer);
  };

  Popup.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    if (toProps.position !== fromProps.position) {
      this.leafletElement.setLatLng(toProps.position);
    }
  };

  Popup.prototype.componentWillMount = function componentWillMount() {
    _MapComponent.prototype.componentWillMount.call(this);
    this.leafletElement = this.createLeafletElement(this.props);
    this.leafletElement.options.autoPan = this.props.autoPan !== false;

    this.context.map.on({
      popupopen: this.onPopupOpen,
      popupclose: this.onPopupClose
    });
  };

  Popup.prototype.componentDidMount = function componentDidMount() {
    var position = this.props.position;
    var _context = this.context,
        map = _context.map,
        popupContainer = _context.popupContainer;

    var el = this.leafletElement;

    if (popupContainer) {
      // Attach to container component
      popupContainer.bindPopup(el);
    } else {
      // Attach to a Map
      if (position) {
        el.setLatLng(position);
      }
      el.openOn(map);
    }
  };

  Popup.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    this.updateLeafletElement(prevProps, this.props);

    if (this.leafletElement.isOpen()) {
      this.renderPopupContent();
    }
  };

  Popup.prototype.componentWillUnmount = function componentWillUnmount() {
    this.removePopupContent();

    this.context.map.off({
      popupopen: this.onPopupOpen,
      popupclose: this.onPopupClose
    });
    this.context.map.removeLayer(this.leafletElement);

    _MapComponent.prototype.componentWillUnmount.call(this);
  };

  Popup.prototype.render = function render() {
    return null;
  };

  return Popup;
}(_MapComponent3.default);

Popup.propTypes = {
  children: _propTypes2.default.node,
  onClose: _propTypes2.default.func,
  onOpen: _propTypes2.default.func,
  position: _latlng2.default
};
Popup.contextTypes = {
  map: _map2.default,
  popupContainer: _layer2.default,
  pane: _propTypes2.default.string
};
exports.default = Popup;