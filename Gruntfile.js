module.exports = function(grunt) {

  grunt.initConfig({
    env: {
      dev: {
        NODE_ENV: 'test'
      }
    },
    jshint: {
      options: {
          "curly": false,
          "eqeqeq": false,
          "immed": true,
          "latedef": false,
          "newcap": true,
          "noarg": true,
          "sub": true,
          "undef": true,
          "unused": false,
          "boss": true,
          "eqnull": true,
          "node": true,
          multistr: true,
          esnext: true
      },
      files: {
        src: ['Gruntfile.js', 'lib/**/*.js']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          globals: ['typeOf','isEmpty','maxdeep','ix'],
          require: 'blanket'
        },
        src: ['test/**/*.js']
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage.html'
        },
        src: ['test/**/*.js']
      },
      'travis-cov': {
        options: {
          reporter: 'travis-cov'
        },
        src: ['test/**/*.js']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-env');


  // Default task.
  grunt.registerTask('default', ['env', 'jshint', 'mochaTest']);
  grunt.registerTask('test', ['mochaTest']);

};