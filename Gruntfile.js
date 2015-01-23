'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var istanbulCmd = {
    bin: 'istanbul',
    report: 'cobertura',
    cover: '--x "" node_modules/mocha/bin/_mocha',
    params: [
      '--timeout 30000',
      '--reporter spec'
    ],
    files: [
      grunt.file.expand('tests/*.js').join(' ')
    ],
    construct: function () {
      console.log("generating coverage information for files", this.files);
      var cover = this.bin + ' cover ' + this.cover + ' -- ' + this.params.join(' ') + ' ' + this.files.join(' ');
      var report = this.bin + ' report ' + this.report;
      return cover + ' && ' + report;
    }
  };

  grunt.initConfig({
    clean: {
      node: ['./node_modules'],
      coverage: {
        src: ['./coverage']
      }
    },

    env: {
      options: {},
      istanbul: {
        COVERAGE: 'istanbul'
      },
      test: {
        NODE_ENV: 'test'
      }
    },

    exec: {
      flush: {
        exitCode: 1,
        cmd: function () {
          var command = '(echo "flush_all"; sleep 1; echo "quit" ) | telnet localhost 11211';
          grunt.log.writeln('> ' + command);
          return command;
        }
      },
      istanbul: {
        cmd: function () {
          return istanbulCmd.construct();
        }
      }
    },

    cafemocha: {
      options: {
        reporter: (process.env.MOCHA_REPORTER || 'spec'),
        timeout: 20000,
        colors: true,
        debug: true
      },
      all: {
        src: ['tests/*.js',
              '!node_modules/**/*.js']
      }
    }
  });

  grunt.registerTask('test', 'Run Tests', function () {
    var tasks = ['exec:flush', 'env:test', 'cafemocha:all'];
    grunt.task.run(tasks);
  });

  grunt.registerTask('coverage', ['exec:flush', 'clean:coverage', 'env:test', 'env:istanbul', 'exec:istanbul']);

  grunt.registerTask('default', ['test']);
};
