'use strict';

var mongoose = require('mongoose');

module.exports = function(router) {
  // Include the hook system.
  var hook = require('../util/hook')(router);

  /**
   * The Schema for Roles.
   *
   * @type {exports.Schema}
   */
  var RoleSchema = hook.alter('roleSchema', new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    deleted: {
      type: Number,
      default: null
    },
    default: {
      type: Boolean,
      default: false
    },
    admin: {
      type: Boolean,
      default: false
    }
  }));

  RoleSchema.path('title').validate(function(value, done) {
    var search = hook.alter('roleSearch', {
      title: value,
      deleted: {$eq: null}
    }, this, value);

    // Ignore the id of the role, if this is an update.
    if (this._id) {
      search._id = {
        $ne: this._id
      };
    }

    // Search for roles that exist, with the given parameters.
    mongoose.model('role').findOne(search, function(err, result) {
      if (err || result) {
        return done(false);
      }

      done(true);
    });
  }, 'Role title must be unique.');

  var model = require('./BaseModel')({
    schema: RoleSchema
  });

  // Add machineName to the schema.
  model.schema.plugin(require('../plugins/machineName'));

  // Set the default machine name.
  model.schema.machineName = function(document, done) {
    return hook.alter('roleMachineName', document.title.toLowerCase(), document, done);
  };

  // Return the defined roles and permissions functions.
  return model;
};
