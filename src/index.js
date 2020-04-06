const fs = require('fs');
const { join } = require('path');
const yaml = require('js-yaml');
const merge = require('merge');

const download = require('./download.js');
const config = require('../config.json');

const DIST_DIR = './dist';

const indexFile = `
  module.exports.linguist = require('./linguist.json');
  module.exports.languages = require('./languages.json');
`;

function mergeOverrides(linguist) {
  const overrides = yaml.safeLoad(
    fs.readFileSync(join(__dirname, 'override.yml')),
  );

  return merge.recursive(linguist, overrides);
}

function transformLanguage(name, data) {
  const color = data.color
    ? data.color.slice(1)
    : undefined;

  const extension = data.extensions
    ? data.extensions[0].replace(/^\./, '')
    : undefined;

  return {
    name,
    color,
    extension,
    aliases: data.aliases,
    aceMode: data.ace_mode,
  };
}

function transformLinguist(githubLinguist) {
  const output = {};

  for (const [name, data] of Object.entries(githubLinguist)) {
    output[data.language_id] = transformLanguage(name, data);
  }

  return output;
}

function transformLanguages(githubLinguist) {
  const output = {};

  for (const [name, data] of Object.entries(githubLinguist)) {
    output[name] = data.language_id;
  }

  return output;
}

download(config.url).then((githubLinguist) => {
  const linguist = mergeOverrides(githubLinguist);

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR);
  }

  fs.writeFileSync(
    join(DIST_DIR, 'index.js'),
    indexFile,
  );

  fs.writeFileSync(
    join(DIST_DIR, 'linguist.json'),
    JSON.stringify(transformLinguist(linguist), null, 2),
  );

  fs.writeFileSync(
    join(DIST_DIR, 'languages.json'),
    JSON.stringify(transformLanguages(linguist), null, 2),
  );
});
