/*global define */
define(['gapi', 'world'], function (gapi, d3) {
    'use strict';

    var methods = {

        logged: function() {
            var authorizeButton = document.getElementById('authorize-button');
            var makeApiCallButton = document.getElementById('make-api-call-button');

            // Show the 'Get Visits' button and hide the 'Authorize' button
            makeApiCallButton.style.visibility = '';
            authorizeButton.style.visibility = 'hidden';

            // When the 'Get Visits' button is clicked, call the makeAapiCall function
            makeApiCallButton.onclick = function() {
                gapi.makeApiCall();
            };
        },
        unlogged: function() {
            var authorizeButton = document.getElementById('authorize-button');
            var makeApiCallButton = document.getElementById('make-api-call-button');

            // Show the 'Authorize Button' and hide the 'Get Visits' button
            makeApiCallButton.style.visibility = 'hidden';
            authorizeButton.style.visibility = '';

            // When the 'Authorize' button is clicked, call the handleAuthClick function
            authorizeButton.onclick = function() {
                gapi.handleAuthClick();
            };
        },
        init: function() {
            var that = this;

            return function() {
                gapi.init(that.logged, that.unlogged);
            };
        }
    };

    return {
        init: methods.init()
    };
});