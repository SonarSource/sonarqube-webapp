/* global module:false, karma:false */

// Karma configuration for JS application

// GLOBAL INSTALLATION
// sonar-server$ npm install -g
// sonar-server$ karma start

// LOCAL INSTALLATION
// sonar-server$ npm install
// sonar-server$ ./node_modules/.bin/karma start

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: 'src/main/webapp/js',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        // dependencies
        'sonar.js',
        'require.js',

        // libs
        { pattern: 'third-party/backbone.js', included: false },
        { pattern: 'third-party/backbone.marionette.js', included: false },
        { pattern: 'third-party/handlebars.js', included: false },
        { pattern: 'third-party/moment.js', included: false },
        { pattern: 'third-party/jquery.mockjax.js', included: false },

        // common
        { pattern: 'common/**/*.js', included: false },

        // app
        { pattern: 'navigator/**/*.js', included: false },
        { pattern: 'quality-gate/**/*.js', included: false },
        { pattern: 'issues/**/*.js', included: false },
        { pattern: 'component-viewer/**/*.js', included: false },
        { pattern: 'templates/**/*.js', included: false },

        // tests
        { pattern: 'tests/**/*Spec.js', included: false },

        'tests/main.js'
    ],


    // list of files to exclude
    exclude: [

    ],


    preprocessors: {
      'navigator/**/*.js': 'coverage',
      'component-viewer/**/*.js': 'coverage',
      'common/inputs.js': 'coverage',
      'translate.js': 'coverage'
    },


    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-coverage',
      'karma-junit-reporter'
    ],


    // test results reporter to use
    reporters: ['progress', 'coverage', 'junit'],


    coverageReporter: {
      type : 'lcovonly',
      dir : '../../../../target/karma/coverage/'
    },

    junitReporter: {
      outputFile : '../../../../target/karma/test-results.xml'
    },

    // WARNING - the 2 following ports should not be hardcoded in CI environments
    // web server port
    port: 9876,


    // cli runner port
    runnerPort: 9100,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG
    logLevel: config.LOG_WARN,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
