'use strict';

var path = require('path');

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({

    settings: {
    },

    clean: {
      docs: ['./docs'],
      node: ['./node_modules'],
      coverage: {
        src: ['./coverage']
      }
    },

    env: {
      options: {
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
          var cover = 'istanbul cover --x "" node_modules/mocha/bin/_mocha -- --timeout 60000 --reporter spec tests/index.js';
          var report = 'istanbul' + ' report ' + 'cobertura';
          return cover + ' && ' + report;
        }
      },
      mocha: {
        cmd: function runMocha(xarg) {
          var src = [];
          var arg = xarg ? xarg.toLowerCase() : '';
          if (arg === 'some-subtask'){
            src = [ ];
          } else {
            src = [
              'tests/*.js',
              '!node_modules/**/*.js'
            ];
          }
          var files = grunt.file.expand(src);
          var bin = path.resolve(__dirname, './node_modules/.bin/mocha');
          var options = ' --colors --reporter spec --timeout 20000 ';
          var cmd = bin + options + files.join(' ');
          console.log(cmd);
          return cmd;
        }
      }
    },
    jsdoc: {
      dist: {
        src: ['*.js', '!Gruntfile.js'],
        options: {
          destination: 'docs'
        }
      }
    }
  });

  grunt.registerTask('coverage', ['exec:flush', 'clean:coverage', 'env:test', 'exec:istanbul']);
  grunt.registerTask('docs', [ 'clean:docs', 'jsdoc' ]);
  grunt.registerTask('test', 'Run Tests', function () {
    grunt.task.run(['exec:flush', 'env:test', 'exec:mocha']);
  });

  grunt.registerTask('default', ['test']);
};
