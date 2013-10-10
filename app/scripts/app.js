/*global define */
define(['gapi', 'world', 'zepto'], function (gapi, world, $) {
    'use strict';

    var $authorizeButtonContainer = $('#customBtn'),
        $authorizeButton = $('#authorize-button'),
        $accountSelector = $('#account-selector'),
        $propertiesSelector = $('#properties-selector'),
        $profileSelector = $('#profile-selector');

    var methods = {
        init: function() {
            var that = this;

            return function(config) {
                gapi.init(config, that.logged, that.unlogged);
            };
        },
        logged: function() {
            var that = this;

            // Hide login button
            $authorizeButtonContainer.addClass('hide');
            // Query accounts
            gapi.queryAccounts(function(accounts) {
                console.log(accounts);
                // Populate selector
                $.each(accounts, function(index, account) {
                    $('<option value="' + account.id + '"></option>');
                }).appendTo($accountSelector);
                // Onchange query profile and show selector
                $accountSelector.change(function() {
                    var $this = $(this),
                        accountId = parseFloat($this.val());
                    // If selects...
                    if(accountId > 0) {
                        // ...query web properties
                        gapi.queryWebproperties(accountId, function(properties) {
                            console.log(properties);
                            // Populate selector
                            $.each(properties, function(index, property) {
                                $('<option value="' + property.id + '"></option>');
                            }).appendTo($propertiesSelector);
                            // Onchange query profile and show selector
                            $propertiesSelector.change(function() {
                                var $this = $(this),
                                    propertyId = parseFloat($this.val());
                                // If selects...
                                if(propertyId > 0) {
                                    // ...query web profiles
                                    gapi.queryWebproperties(accountId, propertyId, function(profiles) {
                                        console.log(profiles);
                                        // Populate selector
                                        $.each(profiles, function(index, profile) {
                                            $('<option value="' + profile.id + '"></option>');
                                        }).appendTo($profileSelector);
                                        // Onchange query profile and show selector
                                        $profileSelector.change(function() {
                                            var $this = $(this),
                                                profileId = parseFloat($this.val());
                                            // If selects...
                                            if(profileId > 0) {
                                                // Magic starts
                                                that.realtime(profileId);
                                            }
                                        }).addClass('show');
                                    });
                                }
                            }).addClass('show');
                        });
                    }
                }).addClass('show');
            });
        },
        unlogged: function() {
            // When the 'Authorize' button is clicked, call the handleAuthClick function
            $authorizeButton.click(function(e) {
                e.preventDefault();

                gapi.handleAuthClick();
            });
        },
        realtime: function(profileId) {

            function camelCase(input) {
                return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
                    return group1.toUpperCase();
                });
            }

            // Init world
            world.init();

            // Get data
            gapi.realtime(profileId, function(response) {
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

            });
        }
    };

    return {
        init: methods.init()
    };
});