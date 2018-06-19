'use strict';

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

var _babelCore = require('babel-core');

var _chai = require('chai');

var _chaiFiles = require('chai-files');

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var presets = [["latest", {
  "es2015": false,
  "es2016": false,
  "es2017": false
}]];

var cases = {
  'Feature Flags': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: false
          }
        },
        debugTools: {
          source: '@ember/debug-tools'
        },
        features: [{
          name: "ember-source",
          source: '@ember/features',
          flags: {
            FEATURE_A: false,
            FEATURE_B: true
          }
        }]
      }]]
    },
    fixtures: ['inline-feature-flags', 'missing-feature-flag'],
    errors: ['Imported FEATURE_C from @ember/features which is not a supported flag.']
  },

  'Debug Macros': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        debugTools: {
          source: '@ember/debug-tools',
          assertPredicateIndex: 0
        },
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: true
          }
        }
      }]]
    },
    fixtures: ['warn-expansion', 'assert-expansion', 'deprecate-expansion', 'deprecate-missing-id', 'hygenic-debug-injection', 'log-expansion'],
    errors: [`deprecate's meta information requires an "id" field.`, `deprecate's meta information requires an "until" field.`]
  },

  'foreign debug imports': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        externalizeHelpers: {
          global: 'Ember'
        },
        debugTools: {
          source: '@ember/debug-tools',
          assertPredicateIndex: 0
        },
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: true
          }
        }
      }], [function (babel) {
        var t = babel.types;

        return {
          name: 'import-remover',
          visitor: {
            ImportSpecifier(path) {
              var importedName = path.node.imported.name;
              if (importedName === 'inspect') {
                var importDeclarationPath = path.findParent(function (p) {
                  return p.isImportDeclaration();
                });
                var binding = path.scope.getBinding(importedName);
                var references = binding.referencePaths;

                var replacements = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = references[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var reference = _step.value;

                    replacements.push(t.variableDeclaration('var', [t.variableDeclarator(t.identifier(path.node.local.name), t.memberExpression(t.identifier('Ember'), t.identifier(importedName)))]));
                  }
                } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                      _iterator.return();
                    }
                  } finally {
                    if (_didIteratorError) {
                      throw _iteratorError;
                    }
                  }
                }

                path.remove();
                importDeclarationPath.insertAfter(replacements);
              }
            }
          }
        };
      }]]
    },
    fixtures: ['shared-debug-module'],
    errors: []
  },

  'Global External Test Helpers': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        externalizeHelpers: {
          global: '__debugHelpers__'
        },
        debugTools: {
          source: '@ember/debug-tools'
        },
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: true
          }
        }
      }]]
    },

    fixtures: ['global-external-helpers']
  },

  'ember-cli-babel default configuration': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        externalizeHelpers: {
          global: 'Ember'
        },
        debugTools: {
          source: '@ember/debug',
          assertPredicateIndex: 1
        },
        envFlags: {
          source: '@glimmer/env',
          flags: {
            DEBUG: true
          }
        }
      }]]
    },

    fixtures: ['ember-cli-babel-config']
  },

  'Retain Module External Test Helpers': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        externalizeHelpers: {
          module: true
        },
        debugTools: {
          source: '@ember/debug-tools'
        },
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: true
          }
        }
      }]]
    },

    fixtures: ['retain-module-external-helpers']
  },

  'Development Svelte Builds': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        debugTools: {
          source: '@ember/debug-tools'
        },
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: true
          }
        },

        svelte: {
          'ember-source': '2.15.0'
        },

        features: [{
          name: 'my-app',
          source: 'my-app/features',
          flags: {
            FEATURE_A: false,
            FEATURE_B: true
          }
        },
        // Note this going to have to be concated in by each lib
        {
          name: 'ember-source',
          source: '@ember/features',
          flags: {
            DEPRECATED_PARTIALS: '2.14.0',
            DEPRECATED_CONTROLLERS: '2.16.0'
          }
        }]
      }]]
    },

    fixtures: ['development-svelte-builds']
  },

  'Production Svelte Builds': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        debugTools: {
          source: '@ember/debug-tools'
        },
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: false
          }
        },

        svelte: {
          'ember-source': '2.15.0'
        },

        features: [{
          name: 'my-app',
          source: 'my-app/features',
          flags: {
            FEATURE_A: false,
            FEATURE_B: true
          }
        },
        // Note this going to have to be concated in by each lib
        {
          name: 'ember-source',
          source: '@ember/features',
          flags: {
            DEPRECATED_PARTIALS: '2.14.0',
            DEPRECATED_CONTROLLERS: '2.16.0'
          }
        }]
      }]]
    },

    fixtures: ['production-svelte-builds']
  },

  'Inline Env Flags': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: true,
            TESTING: false
          }
        },
        debugTools: {
          source: '@ember/debug-tools'
        },
        features: []
      }]]
    },
    fixtures: ['inject-env-flags', 'debug-flag']
  },

  'Retains non-macro types': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        debugTools: {
          source: '@ember/debug-tools'
        },
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: true
          }
        }
      }]]
    },
    fixtures: ['retains-import-for-non-macro-types', 'does-not-modify-non-imported-flags']
  },

  'Removes Imports Without Specifiers': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        debugTools: {
          source: '@ember/debug-tools'
        },
        envFlags: {
          source: '@glimmer/env',
          flags: {
            DEBUG: true
          }
        }
      }]]
    },
    fixtures: ['removes-imports-without-specifiers']
  },

  'Runtime Feature Flags': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: false
          }
        },
        debugTools: {
          source: '@ember/debug-tools'
        },
        features: {
          name: 'ember-source',
          source: '@ember/features',
          flags: {
            FEATURE_A: true,
            FEATURE_B: null
          }
        }
      }]]
    },
    fixtures: ['runtime-feature-flags']
  },

  'Runtime default export features': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: false
          }
        },
        debugTools: {
          source: '@ember/debug-tools'
        },
        features: {
          name: 'ember-source',
          source: '@ember/features',
          flags: {
            FEATURE_A: true,
            FEATURE_B: null
          }
        }
      }]]
    },
    fixtures: ['default-export-features']
  },

  'Retains runtime feature flag definitions': {
    transformOptions: {
      presets,
      plugins: [[_index2.default, {
        envFlags: {
          source: '@ember/env-flags',
          flags: {
            DEBUG: true
          }
        },
        debugTools: {
          source: '@ember/debug-tools'
        },
        features: {
          name: 'ember-source',
          source: '@ember/features',
          flags: {
            FOO_BAR: false,
            WIDGET_WOO: false
          }
        }
      }]]
    },
    fixtures: ['retains-runtime-definitions']
  }
};

function compile(source, transformOptions) {
  return (0, _babelCore.transform)(source, transformOptions);
}

Object.keys(cases).forEach(function (caseName) {
  describe(caseName, function () {
    var ep = 0;

    cases[caseName].fixtures.forEach(function (assertionName) {
      if (cases[caseName].only) {
        it.only(assertionName, function () {
          test(caseName, cases, assertionName, ep);
        });
      } else if (cases[caseName].skip) {
        it.skip(assertionName, function () {});
      } else {
        it(assertionName, function () {
          test(caseName, cases, assertionName, ep);
        });
      }
    });
  });
});

function test(caseName, cases, assertionName, ep) {
  var sample = (0, _chaiFiles.file)(`./fixtures/${assertionName}/sample.js`).content;
  var options = cases[caseName].transformOptions;
  var expectationPath = `./fixtures/${assertionName}/expectation.js`;
  var expectationExists = true;

  try {
    (0, _fs.lstatSync)(expectationPath);
  } catch (e) {
    expectationExists = false;
  }

  if (expectationExists) {
    var expectation = (0, _chaiFiles.file)(`./fixtures/${assertionName}/expectation.js`).content;
    var compiled = compile(sample, options);
    (0, _chai.expect)(compiled.code).to.equal(expectation);
  } else {
    var fn = function fn() {
      return compile(sample, options);
    };
    (0, _chai.expect)(fn).to.throw(new RegExp(cases[caseName].errors[ep++]));
  }
}