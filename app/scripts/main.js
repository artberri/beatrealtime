require.config({
    paths: {
        async: '../bower_components/requirejs-plugins/src/async',
        d3: '../bower_components/d3/d3',
        queue: '../bower_components/queue-async/queue',
        topojson: '../bower_components/topojson/topojson'
    },
    shim: {
        d3: {
            exports: 'd3'
        },
        queue: {
            exports: 'queue'
        },
        topojson: {
            exports: 'topojson'
        }
    }
});

require(['app'], function (app) {
    'use strict';

    app.init();
});


