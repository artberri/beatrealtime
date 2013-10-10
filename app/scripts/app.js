/*global define */
define(['gapi', 'world', 'zepto'], function (gapi, world, $) {
    'use strict';

    var $authorizeButton = $('#authorize-button');

    var methods = {
        init: function() {
            var that = this;

            return function(config) {
                gapi.init(config, that.logged, that.unlogged);
            };
        },
        logged: function() {
            $authorizeButton.hide();

            function camelCase(input) {
                return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
                    return group1.toUpperCase();
                });
            }

            // gapi.makeApiCall();
            // When the 'Get Visits' button is clicked, call the makeAapiCall function
            gapi.realtime(53340307, function(response) {
                // Update total
                $('#visits-count').html(response.total);
                $.each(response.data, function(tableName, table) {
                    var $table = $('#' + tableName + '-table');
                    $.each(table, function(rowIndex, row) {
                        $('<li><p>' +
                                '<span class="name">' + camelCase(row.name) + '</span> ' +
                                '<span class="value">' + row.value + '</span> ' +
                                '<span class="percent">' + row.percent + '%</span>' +
                            '</p></li>').appendTo($table);
                    });
                });
                world.init();
            });

        },
        unlogged: function() {
            $authorizeButton.show();

            // When the 'Authorize' button is clicked, call the handleAuthClick function
            $authorizeButton.click(function(e) {
                e.preventDefault();

                gapi.handleAuthClick();
            });
        }
    };

    return {
        init: methods.init()
    };
});