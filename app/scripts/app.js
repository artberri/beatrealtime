/*global define */
define(['gapi'], function (gapi) {
    'use strict';

    var methods = {
        init: function() {
            gapi.init();
        }
    };

    return {
        init: methods.init
    };
});