import _ from "lodash";

export const recursiveMongooseUpdate = (src, dest) => {
  function recursiveFunc(src, dest) {
    _.forOwn(src, function(value, key) {
      if (_.isObject(value) && _.keys(value).length !== 0) {
        if (dest[key] && dest[key]._id) {
          dest[key] =
            src[key].id !== dest[key].toString() && dest[key] ? dest[key] : {};
        } else {
          dest[key] = dest[key] || {};
        }
        recursiveFunc(src[key], dest[key]);
      } else {
        dest[key] = value;
      }
    });
  }

  recursiveFunc(src, dest);

  return dest;
};
