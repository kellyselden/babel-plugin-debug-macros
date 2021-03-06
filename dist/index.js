'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _macros = require('./lib/utils/macros');

var _macros2 = _interopRequireDefault(_macros);

var _fs = require('fs');

var _path = require('path');

var _normalizeOptions = require('./lib/utils/normalize-options');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function macros(babel) {
  var t = babel.types;

  var macroBuilder = void 0;
  var options = void 0;

  return {
    name: "babel-feature-flags-and-debug-macros",
    visitor: {

      Program: {
        enter(path, state) {
          var _this = this;

          options = (0, _normalizeOptions.normalizeOptions)(state.opts);
          this.macroBuilder = new _macros2.default(t, options);

          var body = path.get('body');

          body.forEach(function (item) {
            if (item.isImportDeclaration()) {
              var importPath = item.node.source.value;

              var _options = options,
                  featureSources = _options.featureSources,
                  debugToolsImport = _options.debugTools.debugToolsImport,
                  _options$envFlags = _options.envFlags,
                  envFlagsImport = _options$envFlags.envFlagsImport,
                  flags = _options$envFlags.flags;


              var isFeaturesImport = featureSources.indexOf(importPath) > -1;

              if (debugToolsImport && debugToolsImport === importPath) {
                if (!item.node.specifiers.length) {
                  item.remove();
                } else {
                  _this.macroBuilder.collectDebugToolsSpecifiers(item.get('specifiers'));
                }
              }if (envFlagsImport && envFlagsImport === importPath) {
                if (!item.node.specifiers.length) {
                  item.remove();
                } else {
                  _this.macroBuilder.collectEnvFlagSpecifiers(item.get('specifiers'));
                }
              }
            }
          });
        },

        exit(path) {
          this.macroBuilder.expand(path);
        }
      },

      ExpressionStatement(path) {
        this.macroBuilder.build(path);
      }
    }
  };
}

macros.baseDir = function () {
  return (0, _path.dirname)(__dirname);
};

exports.default = macros;