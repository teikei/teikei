import _uniqueId from 'lodash-es/uniqueId';
import _omit from 'lodash-es/omit';
import _forEach from 'lodash-es/forEach';
// flowlint sketchy-null-string:off

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import warning from 'warning';

import children from './propTypes/children';
import map from './propTypes/map';

var LEAFLET_PANES = ['tile', 'shadow', 'overlay', 'map', 'marker', 'tooltip', 'popup'];

var isLeafletPane = function isLeafletPane(name) {
  return LEAFLET_PANES.indexOf(name.replace(/-*pane/gi, '')) !== -1;
};

var paneStyles = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};

var Pane = function (_Component) {
  _inherits(Pane, _Component);

  function Pane() {
    var _temp, _this, _ret;

    _classCallCheck(this, Pane);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      name: undefined
    }, _this.setStyle = function () {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.props,
          style = _ref.style,
          className = _ref.className;

      var pane = _this.getPane(_this.state.name);
      if (pane) {
        if (className) {
          pane.classList.add(className);
        }
        if (style) {
          _forEach(style, function (value, key) {
            pane.style[key] = value;
          });
        }
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  Pane.prototype.getChildContext = function getChildContext() {
    return {
      pane: this.state.name
    };
  };

  Pane.prototype.componentDidMount = function componentDidMount() {
    this.createPane(this.props);
  };

  Pane.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (!this.state.name) {
      // Do nothing if this.state.name is undefined due to errors or
      // an invalid props.name value
      return;
    }

    // If the 'name' prop has changed the current pane is unmounted and a new
    // pane is created.
    if (nextProps.name !== this.props.name) {
      this.removePane();
      this.createPane(nextProps);
    } else {
      // Remove the previous css class name from the pane if it has changed.
      // setStyle will take care of adding in the updated className
      if (this.props.className && nextProps.className !== this.props.className) {
        var _pane = this.getPane();
        if (_pane && this.props.className) _pane.classList.remove(this.props.className);
      }

      // Update the pane's DOM node style and class
      this.setStyle(nextProps);
    }
  };

  Pane.prototype.componentWillUnmount = function componentWillUnmount() {
    this.removePane();
  };

  Pane.prototype.createPane = function createPane(props) {
    var map = this.context.map;
    var name = props.name || 'pane-' + _uniqueId();

    if (map && map.createPane) {
      var isDefault = isLeafletPane(name);
      var existing = isDefault || this.getPane(name);

      if (!existing) {
        map.createPane(name, this.getParentPane());
      } else {
        var message = isDefault ? 'You must use a unique name for a pane that is not a default leaflet pane (' + name + ')' : 'A pane with this name already exists. (' + name + ')';
        process.env.NODE_ENV !== 'production' ? warning(false, message) : void 0;
      }

      this.setState({ name: name }, this.setStyle);
    }
  };

  Pane.prototype.removePane = function removePane() {
    // Remove the created pane
    var name = this.state.name;

    if (name) {
      var _pane2 = this.getPane(name);
      if (_pane2 && _pane2.remove) _pane2.remove();

      var _map = this.context.map;
      if (_map && _map._panes) {
        _map._panes = _omit(_map._panes, name);
        _map._paneRenderers = _omit(_map._paneRenderers, name);
      }

      this.setState({ name: undefined });
    }
  };

  Pane.prototype.getParentPane = function getParentPane() {
    return this.getPane(this.props.pane || this.context.pane);
  };

  Pane.prototype.getPane = function getPane(name) {
    return name ? this.context.map.getPane(name) : undefined;
  };

  Pane.prototype.render = function render() {
    return this.state.name ? React.createElement(
      'div',
      { style: paneStyles },
      this.props.children
    ) : null;
  };

  return Pane;
}(Component);

Pane.propTypes = {
  name: PropTypes.string,
  children: children,
  map: map,
  className: PropTypes.string,
  style: PropTypes.object,
  pane: PropTypes.string
};
Pane.contextTypes = {
  map: map,
  pane: PropTypes.string
};
Pane.childContextTypes = {
  pane: PropTypes.string
};
export default Pane;