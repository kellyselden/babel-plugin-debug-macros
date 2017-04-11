import { satisfies } from 'semver';

export function normalizeOptions(options) {
  let {
    features = [],
    debugTools,
    envFlags,
    externalizeHelpers,
    svelte
  } = options;

  let featureSources = [];
  let featuresMap = {};
  let svelteMap = {};
  let hasSvelteBuild = false;

  if (!Array.isArray(features)) {
    features = [features]
  }

  features = features.map((feature) => {
    let featuresSource = feature.source;
    featureSources.push(featuresSource);
    let name = feature.name;

    let flags = {};
    featuresMap[featuresSource] = {};
    svelteMap[featuresSource] = {};

    Object.keys(feature.flags).forEach((flagName) => {
      let value = feature.flags[flagName];

      if (svelte !== undefined && typeof value === 'string' && svelte[name]) {
        hasSvelteBuild = true;
        flags[flagName] = svelteMap[featuresSource][flagName] = satisfies(value, `>=${svelte[name]}`);
      } else if (typeof value === 'boolean' || value === null) {
        flags[flagName] = featuresMap[featuresSource][flagName] = value;
      } else {
        throw new Error(`Flags must be a scalar value or semver version`);
      }
    });

    return {
      name,
      source: feature.source,
      flags
    }
  });


  if (!debugTools) {
    throw new Error('You must specify `debugTools.source`');
  }

  let debugToolsImport;
  if (debugTools) {
    debugToolsImport = debugTools.source;
  }

  let envFlagsImport;
  let _envFlags = {};

  if (envFlags) {
    envFlagsImport = envFlags.source;
    if (envFlags.flags) {
      _envFlags = envFlags.flags;
    }
  } else {
    throw new Error('You must specify envFlags.flags.DEBUG at minimum.')
  }

  return {
    featureSources,
    externalizeHelpers,
    features,
    featuresMap,
    svelteMap,
    hasSvelteBuild,
    svelte,
    envFlags: {
      envFlagsImport,
      flags: _envFlags
    },
    debugTools: {
      debugToolsImport
    }
  };
}