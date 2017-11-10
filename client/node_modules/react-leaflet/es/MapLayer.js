var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import PropTypes from 'prop-types';

import React, { Children } from 'react';

import MapComponent from './MapComponent';
import children from './propTypes/children';
import layerContainer from './propTypes/layerContainer';
import map from './propTypes/map';

var MapLayer = function (_MapComponent) {
  _inherits(MapLayer, _MapComponent);

  function MapLayer() {
    _classCallCheck(this, MapLayer);

    return _possibleConstructorReturn(this, _MapComponent.apply(this, arguments));
  }

  // eslint-disable-next-line no-unused-vars
  MapLayer.prototype.createLeafletElement = function createLeafletElement(props) {
    throw new Error('createLeafletElement() must be implemented');
  };

  // eslint-disable-next-line no-unused-vars


  MapLayer.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {};

  MapLayer.prototype.componentWillMount = function componentWillMount() {
    _MapComponent.prototype.componentWillMount.call(this);
    this.leafletElement = this.createLeafletElement(this.props);
  };

  MapLayer.prototype.componentDidMount = function componentDidMount() {
    _MapComponent.prototype.componentDidMount.call(this);
    this.layerContainer.addLayer(this.leafletElement);
  };

  MapLayer.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    this.updateLeafletElement(prevProps, this.props);
  };

  MapLayer.prototype.componentWillUnmount = function componentWillUnmount() {
    _MapComponent.prototype.componentWillUnmount.call(this);
    this.layerContainer.removeLayer(this.leafletElement);
  };

  MapLayer.prototype.render = function render() {
    var children = this.props.children;

    if (Children.count(children) > 1) {
      return React.createElement(
        'div',
        { style: { display: 'none' } },
        children
      );
    }
    return children == null ? null : children;
  };

  _createClass(MapLayer, [{
    key: 'layerContainer',
    get: function get() {
      return this.context.layerContainer || this.context.map;
    }
  }]);

  return MapLayer;
}(MapComponent);

MapLayer.propTypes = {
  children: children
};
MapLayer.contextTypes = {
  layerContainer: layerContainer,
  map: map,
  pane: PropTypes.string
};
export default MapLayer;