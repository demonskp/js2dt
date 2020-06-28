const path = require('path');
const { execSync } = require('child_process');
const { CLIEngine, alsk } = require('eslint');

const lintFramework = require('./eslintrc-framework');
const lintStrict = require('./eslintrc-strict');
const lintFdd = require('./eslintrc-fdd-lint');

function lint({
  fix = false,
  staged = false,
  normal,
  name = 'eslintrc-fdd-lint',
  log = () => {},
}) {
  log('Lint code, please wait ...');

  let eslintOptions;

  if (normal) {
    eslintOptions = {
      cwd: path.resolve('./'),
      extensions: ['.js', '.jsx'],
    };
  } else {
    eslintOptions = {
      cwd: path.resolve('./'),
      ignore: true,
      useEslintrc: false,
      configFile: path.resolve(__dirname, `./${name}.js`),
      ignorePath: path.resolve(__dirname, './eslintignore-fdd-lint'),
      extensions: ['.js', '.jsx'],
    };
  }

  // Automatically fix problems
  if (fix) {
    eslintOptions.fix = true;
  }

  let fileAry = [path.resolve('./')];
  // Get staged files
  if (staged) {
    try {
      const stdout = execSync('git diff --cached --name-only| grep -E ".js$|.jsx$"');
      const str = stdout.toString('utf8');
      if (str.length) {
        const array = str.split('\n');
        array.pop();
        fileAry = array;
      }
    } catch (e) {
      // 没有修改js|jsx文件时会返回非零退出码
      fileAry = [];
    }
  }

  const cli = new CLIEngine(eslintOptions);

  return new Promise((resolve) => {
    const report = cli.executeOnFiles(fileAry);

    if (fix) {
      CLIEngine.outputFixes(report);
    }

    const errorReport = CLIEngine.getErrorResults(report.results);

    if (errorReport && errorReport.length) {
      const formatter = cli.getFormatter();
      log('Lint failed!!');
      console.log(formatter(errorReport));
      // signal
      resolve({ code: 1 });
    } else {
      log('Congrates! Lint success!');
      resolve({ code: 0 });
    }
  });
}
module.exports = lint;
exports = lint;
exports.lintFramework = lintFramework;
exports.lintStrict = lintStrict;
exports.lintFdd = lintFdd;
