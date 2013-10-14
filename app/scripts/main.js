window.twttr = (function (d,s,id) {
    'use strict';
    var t, js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js=d.createElement(s);
    js.id=id;
    js.src='//platform.twitter.com/widgets.js';
    fjs.parentNode.insertBefore(js, fjs);
    return window.twttr || (t = {
        _e: [],
        ready: function(f){
            t._e.push(f);
        }
    });
}(document, 'script', 'twitter-wjs'));
(function() {
    'use strict';
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
})();

require.config({
    paths: {
        async: '../bower_components/requirejs-plugins/src/async',
        d3: '../bower_components/d3/d3',
        queue: '../bower_components/queue-async/queue',
        topojson: '../bower_components/topojson/topojson',
        zepto: '../bower_components/zepto/zepto',
        nanoscroller: '../bower_components/nanoscroller/bin/javascripts/jquery.nanoscroller'
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


