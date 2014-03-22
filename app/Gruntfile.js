module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      options: {
        hostname: 'localhost',
        port: 8001,
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: 'public'
        }
      }
    },

    watch: {
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '{,*/}*.html',
          '{,*/}*.css',
          '{,*/}*.js'
        ]
      }
    }

  });

  grunt.registerTask('serve', [
    'connect:livereload',
    'watch'
  ]);

};
