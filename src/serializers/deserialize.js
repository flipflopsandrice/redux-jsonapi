import { camelize } from 'humps';

function deserializeRelationships(resources = [], store, options) {
  return resources
    .map((resource) => deserializeRelationship(resource, store, options))
    .filter((resource) => !!resource);
}

function deserializeRelationship(resource = {}, store, options) {
  const key = options.camelize === false ? resource.type : camelize(resource.type);
  if (store[key] && store[key][resource.id]) {
    return deserialize({ ...store[key][resource.id], meta: { loaded: true } }, store, options);
  }

  return deserialize({ ...resource, meta: { loaded: false } }, store);
}

function deserialize({ id, type, attributes, relationships, meta }, store, options = {}) {
  let resource = { _type: type, _meta: meta };

  if (id) resource = { ...resource, id };

  if (attributes) {
    resource = Object.keys(attributes).reduce((resource, key) => {
      key = options.camelize === false ? key : camelize(key);
      return { ...resource, [key]: attributes[key] };
    }, resource);
  }

  if (relationships) {
    resource = Object.keys(relationships).reduce((resource, key) => {
      return {
        ...resource,
        [options.camelize === false ? key : camelize(key)]: () => {
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
