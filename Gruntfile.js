'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    vars: {
      port: 8080,
    },
    'closure-compiler': {
      frontend: {
        closurePath: '/home/d1mmmk/closure-compiler',
        js: 'jquery.touch.js', //входные данные
        jsOutputFile: 'jquery.touch.min.js', //выходные
        noreport: true, //означает что в папке js не будет создаваться txt файл с отчетом
        options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          externs: [
            // 'jquery.js', 
            ], 
          // formatting: 'pretty_print',
          warning_level: 'QUIET',
        }
      }
    },
    connect: {
      server: {
        options: {
          port: "<%= vars.port %>",
          keepalive: true,
          base: '.',
          static: '.'
        }
      }
    },
    coffee: {
      app: {
        files: {
          'jquery.touch.js': 'jquery.touch.coffee',
        }
      },
    },
    watch: {
      coffee: {
        files: [
          '**/*.coffee',
          ],
        tasks: ['coffee','closure-compiler']
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-closure-compiler');

  // Default task.
  grunt.registerTask('default', ['coffee', 'closure-compiler', 'connect']);

};
