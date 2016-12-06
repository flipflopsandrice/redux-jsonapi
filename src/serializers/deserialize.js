import { camelize } from 'humps';

function deserializeRelationships(resources = [], store) {
  return resources
    .map((resource) => deserializeRelationship(resource, store))
    .filter((resource) => !!resource);
}

function deserializeRelationship(resource = {}, store, options) {
  if (store[camelize(resource.type)] && store[camelize(resource.type)][resource.id]) {
    return deserialize({ ...store[camelize(resource.type)][resource.id], meta: { loaded: true } }, store, options);
  }

  return deserialize({ ...resource, meta: { loaded: false } }, store);
}

function deserialize({ id, type, attributes, relationships, meta }, store, options = {}) {
  let resource = { _type: type, _meta: meta };

  if (id) resource = { ...resource, id };

  if (attributes) {
    resource = Object.keys(attributes).reduce((resource, key) => {
      key = options.noCamelizeAttributeKeys ? key : camelize(key);
      return { ...resource, [key]: attributes[key] };
    }, resource);
  }

  if (relationships) {
    resource = Object.keys(relationships).reduce((resource, key) => {
      return {
        ...resource,
        [camelize(key)]: () => {
          if (Array.isArray(relationships[key].data)) {
            return deserializeRelationships(relationships[key].data, store, options);
          } else {
            return deserializeRelationship(relationships[key].data, store, options)
          }
        },
      };
    }, resource);
  }

  return resource;
}

export default deserialize;
