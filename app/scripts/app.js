/*global define,ga */
define(['gapi', 'world', 'zepto'], function (gapi, world, $) {
    'use strict';

    var theProperty;

    var previousData = {
        total: 0,
        data: {
            country: [],
            browser: [],
            device: [],
            medium: []
        }
    };

    var $authorizeButtonContainer = $('#gSignInWrapper'),
        $authorizeButton = $('#authorize-button'),
        $accountSelector = $('#account-selector'),
        $propertiesSelector = $('#properties-selector'),
        $profileSelector = $('#profile-selector'),
        $home = $('#home'),
        $headerText = $('.header-text'),
        $authorInfo = $('#home-info');

    var methods = {
        init: function() {
            var that = this;

            return function(config) {
                gapi.init(config, that.logged(), that.unlogged());
            };
        },
        logged: function() {
            var that = this;

            return function() {
                // Hide login button
                $authorizeButtonContainer.addClass('hide');
                $authorInfo.addClass('down');
                // Query accounts
                gapi.queryAccounts(function(accounts) {
                    $('.selector-container:first-child').removeClass('toright');
                    // Populate selector
                    $.each(accounts, function(index, account) {
                        $('<option value="' + account.id + '">' + account.name + '</option>').appendTo($accountSelector);
                    });
                    // Onchange query profile and show selector
                    $accountSelector.change(function() {
                        var $this = $(this),
                            $parent = $this.parent(),
                            accountId = parseFloat($this.val());

                        var $selectedAccount = $.grep(accounts, function(item) {
                            return parseFloat(item.id) === accountId;
                        });

                        // If selects...
                        if($selectedAccount.length === 1) {
                            // ...query web properties
                            $parent.addClass('toleft');
                            gapi.queryWebproperties(accountId, function(properties) {
                                $propertiesSelector.parent().removeClass('toright');
                                // Populate selector
                                $.each(properties, function(index, property) {
                                    $('<option value="' + property.id + '">' + property.name + '</option>').appendTo($propertiesSelector);
                                });
                                // Onchange query profile and show selector
                                $propertiesSelector.change(function() {
                                    var $this = $(this),
                                        $parent = $this.parent(),
                                        propertyId = $this.val();

                                    var $selectedProperty = $.grep(properties, function(item) {
                                        return item.id === propertyId;
                                    });

                                    // If selects...
                                    if($selectedProperty.length === 1) {
                                        theProperty = $selectedProperty[0];
                                        $parent.addClass('toleft');
                                        // ...query web profiles
                                        gapi.queryProfiles(accountId, propertyId, function(profiles) {
                                            $profileSelector.parent().removeClass('toright');
                                            // Populate selector
                                            $.each(profiles, function(index, profile) {
                                                $('<option value="' + profile.id + '">' + profile.name + '</option>').appendTo($profileSelector);
                                            });
                                            // Onchange query profile and show selector
                                            $profileSelector.change(function() {
                                                var $this = $(this),
                                                    $parent = $this.parent(),
                                                    profileId = parseFloat($this.val());

                                                var $selectedProfile = $.grep(profiles, function(item) {
                                                    return parseFloat(item.id) === profileId;
                                                });

                                                // If selects...
                                                if($selectedProfile.length === 1) {
                                                    // Magic starts
                                                    $parent.addClass('toleft');
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
            };
        },
        unlogged: function() {

            return function() {
                // When the 'Authorize' button is clicked, call the handleAuthClick function
                $authorizeButton.click(function(e) {
                    e.preventDefault();

                    gapi.handleAuthClick();
                });
            };
        },
        realtime: function(profileId) {

            function camelCase(input) {
                return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
                    return group1.toUpperCase();
                });
            }

            // Init world
            world.init();

            (function exec() {
                // Track event
                if(typeof ga !== undefined) {
                    ga('send', 'event', 'request', theProperty.websiteUrl);
                }

                // Get data
                gapi.realtime(profileId, function(response) {

                    $home.addClass('down');
                    setTimeout(function() {
                        $headerText.addClass('show');
                    }, 500);

                    // Update total
                    $('#visits-count').html(response.total);
                    // Update tables
                    $.each(response.data, function(tableName, table) {
                        var $table = $('#' + tableName + '-table');
                        $.each(table, function(rowIndex, row) {
                            var previousRow = previousData.data[tableName][rowIndex];
                            if(previousRow !== row) {
                                var selector = rowIndex === 0 ? '*:first-child' : '*:nth-child(' + (rowIndex+1) + ')',
                                    $li = $table.children(selector),
                                    template = '<p>' +
                                            '<span class="name">' + camelCase(row.name) + '</span> ' +
                                            '<span class="value">' + row.value + '</span> ' +
                                            '<span class="percent">' + row.percent + '%</span>' +
                                        '</p>';

                                if($li.length > 0) {
                                    $li.html(template);
                                }
                                else {
                                    $li = $('<li>' + template + '</li>');
                                    $li.appendTo($table);
                                }

                                // Cambia el dato
                                if((!previousRow) || (previousRow.name !== row.name) || (previousRow.value !== row.value)) {
                                    $li.addClass('change');
                                }
                            }
                        });
                    });

                    setTimeout(function() {
                        $('.panels li').removeClass('change');
                    }, 500);

                    // Serch for new visits by country
                    var newCountries = [];
                    $.each(response.data.country, function(index, country) {
                        var countryName = country.name,
                            previousCountry = $.grep(previousData.data.country, function(e){
                                return e.name === countryName;
                            });

                        if(previousCountry.length === 0) {
                            newCountries.push(country.name);
                        }
                        else if(previousCountry.length === 1 && country.value > previousCountry[0].value) {
                            newCountries.push(country.name);
                        }
                    });

                    // Move world
                    if(newCountries.length > 0) {
                        world.moveTo(newCountries);
                    }

                    previousData = response;

                    // Infinite
                    setTimeout(function() {
                        exec();
                    }, 10000);
                });
            })();
        }
    };

    return {
        init: methods.init()
    };
});