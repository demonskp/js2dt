const dataPromise = require('./dataPromise');
const middleware = require('./data-middleware');
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

// blank function for server side render
isomorphicData.setEndPoint = () => isomorphicData;

// data handler dir, default is projectDir/data
// Deprecated, use init instead
isomorphicData.setDirname = (dirname) => {
  config.actionDirname = dirname;
};

isomorphicData.init = ({
  dirname,
  transformerDirname = '',
  requestActions,
  backupRequest,
}) => {
  config.actionDirname = dirname;
  config.requestActions = requestActions;
  config.requestFn = backupRequest;
  config.transformerDirname = transformerDirname;
};

isomorphicData.middleware = middleware;

isomorphicData.a = '12';

module.exports = isomorphicData;
