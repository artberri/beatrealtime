require.config({
    paths: {
        async: '../bower_components/requirejs-plugins/src/async',
        d3: '../bower_components/d3/d3',
        queue: '../bower_components/queue-async/queue',
        topojson: '../bower_components/topojson/topojson',
        zepto: '../bower_components/zepto/zepto'
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
        },
        zepto: {
            exports: '$'
        }
    }
});

require(['app', 'config'], function (app, config) {
    'use strict';

    app.init(config.get());
});


