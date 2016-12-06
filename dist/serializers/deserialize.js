'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends4 = require('babel-runtime/helpers/extends');

var _extends5 = _interopRequireDefault(_extends4);

var _humps = require('humps');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function deserializeRelationships() {
  var resources = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var store = arguments[1];

  return resources.map(function (resource) {
    return deserializeRelationship(resource, store);
  }).filter(function (resource) {
    return !!resource;
  });
}

function deserializeRelationship() {
  var resource = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var store = arguments[1];
  var options = arguments[2];

  if (store[(0, _humps.camelize)(resource.type)] && store[(0, _humps.camelize)(resource.type)][resource.id]) {
    return deserialize((0, _extends5.default)({}, store[(0, _humps.camelize)(resource.type)][resource.id], { meta: { loaded: true } }), store, options);
  }

  return deserialize((0, _extends5.default)({}, resource, { meta: { loaded: false } }), store);
}

function deserialize(_ref, store) {
  var id = _ref.id,
      type = _ref.type,
      attributes = _ref.attributes,
      relationships = _ref.relationships,
      meta = _ref.meta;
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var resource = { _type: type, _meta: meta };

  if (id) resource = (0, _extends5.default)({}, resource, { id: id });

  if (attributes) {
    resource = (0, _keys2.default)(attributes).reduce(function (resource, key) {
      key = options.noCamelizeAttributeKeys ? key : (0, _humps.camelize)(key);
      return (0, _extends5.default)({}, resource, (0, _defineProperty3.default)({}, key, attributes[key]));
    }, resource);
  }

  if (relationships) {
    resource = (0, _keys2.default)(relationships).reduce(function (resource, key) {
      return (0, _extends5.default)({}, resource, (0, _defineProperty3.default)({}, (0, _humps.camelize)(key), function () {
        if (Array.isArray(relationships[key].data)) {
          return deserializeRelationships(relationships[key].data, store, options);
        } else {
          return deserializeRelationship(relationships[key].data, store, options);
        }
      }));
    }, resource);
  }

  return resource;
}

exports.default = deserialize;