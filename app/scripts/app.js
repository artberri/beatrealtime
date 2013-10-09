/*global define */
define(['gapi', 'world'], function (gapi, world) {
    'use strict';

    var methods = {
        init: function() {
            var that = this;

            return function() {
                gapi.init(that.logged, that.unlogged);
            };
        },
        logged: function() {
            var authorizeButton = document.getElementById('authorize-button');

            // Show the 'Get Visits' button and hide the 'Authorize' button
            authorizeButton.style.visibility = 'hidden';

            // When the 'Get Visits' button is clicked, call the makeAapiCall function
            world.init();
            // gapi.makeApiCall();

        },
        unlogged: function() {
            var authorizeButton = document.getElementById('authorize-button');

            // Show the 'Authorize Button' and hide the 'Get Visits' button
            authorizeButton.style.visibility = '';

            // When the 'Authorize' button is clicked, call the handleAuthClick function
            authorizeButton.onclick = function() {
                gapi.handleAuthClick();
            };
        }
    };

    return {
        init: methods.init()
    };
});