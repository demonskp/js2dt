const dataPromise = require('./dataPromise');
const { config } = require('./config');

async function isomorphicData({
  method = 'GET',
  action,
  qs,
  form,
  restfulParams,
  json,
  body,
  req,
  headers,
}) {
  const data = await dataPromise({
    method,
    action,
    actionDirname: config.actionDirname,
    transformerDirname: config.transformerDirname,
    actions: config.requestActions,
    requestFn: config.requestFn,
    req,
    qs,
    form,
    restfulParams,
    json,
    body,
    headers,
  });
  return data;
}

module.exports = isomorphicData;
