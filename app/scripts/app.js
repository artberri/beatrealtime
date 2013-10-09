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

            console.log('logged');

            var authorizeButton = document.getElementById('authorize-button');
            authorizeButton.style.visibility = 'hidden';

            // gapi.makeApiCall();
            // When the 'Get Visits' button is clicked, call the makeAapiCall function
            //
            console.log('World Init 3');
            world.init(function() {
                gapi.realtime(53340307);
            });
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