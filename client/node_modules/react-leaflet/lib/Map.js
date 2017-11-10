'use strict';

exports.__esModule = true;

var _omit2 = require('lodash/omit');

var _omit3 = _interopRequireDefault(_omit2);

var _isUndefined2 = require('lodash/isUndefined');

var _isUndefined3 = _interopRequireDefault(_isUndefined2);

var _leaflet = require('leaflet');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _MapComponent2 = require('./MapComponent');

var _MapComponent3 = _interopRequireDefault(_MapComponent2);

var _bounds = require('./propTypes/bounds');

var _bounds2 = _interopRequireDefault(_bounds);

var _children = require('./propTypes/children');

var _children2 = _interopRequireDefault(_children);

var _latlng = require('./propTypes/latlng');

var _latlng2 = _interopRequireDefault(_latlng);

var _layerContainer = require('./propTypes/layerContainer');

var _layerContainer2 = _interopRequireDefault(_layerContainer);

var _map = require('./propTypes/map');

var _map2 = _interopRequireDefault(_map);

var _viewport = require('./propTypes/viewport');

var _viewport2 = _interopRequireDefault(_viewport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var OTHER_PROPS = ['children', 'className', 'id', 'style', 'useFlyTo', 'whenReady'];

var normalizeCenter = function normalizeCenter(pos) {
  return Array.isArray(pos) ? [pos[0], pos[1]] : [pos.lat, pos.lon ? pos.lon : pos.lng];
};

var Map = function (_MapComponent) {
  _inherits(Map, _MapComponent);

  function Map(props, context) {
    _classCallCheck(this, Map);

    var _this = _possibleConstructorReturn(this, _MapComponent.call(this, props, context));

    _this.viewport = {
      center: undefined,
      zoom: undefined
    };
    _this._updating = false;

    _this.onViewportChange = function () {
      var center = _this.leafletElement.getCenter();
      _this.viewport = {
        center: center ? [center.lat, center.lng] : undefined,
        zoom: _this.leafletElement.getZoom()
      };
      if (_this.props.onViewportChange && !_this._updating) {
        _this.props.onViewportChange(_this.viewport);
      }
    };

    _this.onViewportChanged = function () {
      if (_this.props.onViewportChanged && !_this._updating) {
        _this.props.onViewportChanged(_this.viewport);
      }
    };

    _this.bindContainer = function (container) {
      _this.container = container;
    };

    _this.className = props.className;
    return _this;
  }

  Map.prototype.getChildContext = function getChildContext() {
    return {
      layerContainer: this.leafletElement,
      map: this.leafletElement
    };
  };

  Map.prototype.createLeafletElement = function createLeafletElement(props) {
    var viewport = props.viewport,
        options = _objectWithoutProperties(props, ['viewport']);

    if (viewport) {
      if (viewport.center) {
        options.center = viewport.center;
      }
      if (typeof viewport.zoom === 'number') {
        options.zoom = viewport.zoom;
      }
    }
    return new _leaflet.Map(this.container, options);
  };

  Map.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    this._updating = true;

    var animate = toProps.animate,
        bounds = toProps.bounds,
        boundsOptions = toProps.boundsOptions,
        center = toProps.center,
        className = toProps.className,
        maxBounds = toProps.maxBounds,
        useFlyTo = toProps.useFlyTo,
        viewport = toProps.viewport,
        zoom = toProps.zoom;


    if (className !== fromProps.className) {
      if (fromProps.className != null) {
        _leaflet.DomUtil.removeClass(this.container, fromProps.className);
      }
      if (className != null) {
        _leaflet.DomUtil.addClass(this.container, className);
      }
    }

    if (viewport && viewport !== fromProps.viewport) {
      var c = viewport.center ? viewport.center : center;
      var z = viewport.zoom == null ? zoom : viewport.zoom;
      if (useFlyTo === true) {
        this.leafletElement.flyTo(c, z, { animate: animate });
      } else {
        this.leafletElement.setView(c, z, { animate: animate });
      }
    } else if (center && this.shouldUpdateCenter(center, fromProps.center)) {
      if (useFlyTo === true) {
        this.leafletElement.flyTo(center, zoom, { animate: animate });
      } else {
        this.leafletElement.setView(center, zoom, { animate: animate });
      }
    } else if (typeof zoom === 'number' && zoom !== fromProps.zoom) {
      if (fromProps.zoom == null) {
        this.leafletElement.setView(center, zoom);
      } else {
        this.leafletElement.setZoom(zoom);
      }
    }

    if (maxBounds && this.shouldUpdateBounds(maxBounds, fromProps.maxBounds)) {
      this.leafletElement.setMaxBounds(maxBounds);
    }

    if (bounds && (this.shouldUpdateBounds(bounds, fromProps.bounds) || boundsOptions !== fromProps.boundsOptions)) {
      if (useFlyTo === true) {
        this.leafletElement.flyToBounds(bounds, boundsOptions);
      } else {
        this.leafletElement.fitBounds(bounds, boundsOptions);
      }
    }

    this._updating = false;
  };

  Map.prototype.componentDidMount = function componentDidMount() {
    var props = (0, _omit3.default)(this.props, OTHER_PROPS);
    this.leafletElement = this.createLeafletElement(props);

    this.leafletElement.on('move', this.onViewportChange);
    this.leafletElement.on('moveend', this.onViewportChanged);

    if (!(0, _isUndefined3.default)(props.bounds)) {
      this.leafletElement.fitBounds(props.bounds, props.boundsOptions);
    }

    if (this.props.whenReady) {
      this.leafletElement.whenReady(this.props.whenReady);
    }

    _MapComponent.prototype.componentDidMount.call(this);
    this.forceUpdate(); // Re-render now that leafletElement is created
  };

  Map.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    this.updateLeafletElement(prevProps, this.props);
  };

  Map.prototype.componentWillUnmount = function componentWillUnmount() {
    _MapComponent.prototype.componentWillUnmount.call(this);
    this.leafletElement.off('move', this.onViewportChange);
    this.leafletElement.off('moveend', this.onViewportChanged);
    this.leafletElement.remove();
  };

  Map.prototype.shouldUpdateCenter = function shouldUpdateCenter(next, prev) {
    if (!prev) return true;
    next = normalizeCenter(next);
    prev = normalizeCenter(prev);
    return next[0] !== prev[0] || next[1] !== prev[1];
  };

  Map.prototype.shouldUpdateBounds = function shouldUpdateBounds(next, prev) {
    return prev ? !(0, _leaflet.latLngBounds)(next).equals((0, _leaflet.latLngBounds)(prev)) : true;
  };

  Map.prototype.render = function render() {
    var map = this.leafletElement;
    var children = map ? this.props.children : null;

    return _react2.default.createElement(
      'div',
      {
        className: this.className,
        id: this.props.id,
        ref: this.bindContainer,
        style: this.props.style },
      children
    );
  };

  return Map;
}(_MapComponent3.default);

Map.propTypes = {
  animate: _propTypes2.default.bool,
  bounds: _bounds2.default,
  boundsOptions: _propTypes2.default.object,
  center: _latlng2.default,
  children: _children2.default,
  className: _propTypes2.default.string,
  id: _propTypes2.default.string,
  maxBounds: _bounds2.default,
  maxZoom: _propTypes2.default.number,
  minZoom: _propTypes2.default.number,
  style: _propTypes2.default.object,
  useFlyTo: _propTypes2.default.bool,
  viewport: _viewport2.default,
  whenReady: _propTypes2.default.func,
  zoom: _propTypes2.default.number
};
Map.childContextTypes = {
  layerContainer: _layerContainer2.default,
  map: _map2.default
};
exports.default = Map;