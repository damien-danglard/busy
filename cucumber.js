module.exports = {
  default: {
    require: [
      'tests/support/*.ts',
      'tests/step-definitions/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'junit:test-results/cucumber-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    publishQuiet: true,
    dryRun: false,
    failFast: false
  },
  
  // Profile for document module tests only
  document: {
    require: [
      'tests/support/*.ts',
      'tests/step-definitions/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['progress-bar'],
    paths: ['docs/features/document/**/*.feature'],
    publishQuiet: true
  },

  // Profile for CI/CD
  ci: {
    require: [
      'tests/support/*.ts',
      'tests/step-definitions/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'json:test-results/cucumber-report.json',
      'junit:test-results/cucumber-report.xml'
    ],
    publishQuiet: true,
    failFast: true
  }
};
