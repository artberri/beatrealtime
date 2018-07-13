import 'babel-polyfill';
import config from './config';
import api from './api';
import world from './world';

let forceStop = false;

let timer = null;

const defaultData = {
    total: 0,
    data: {
        country: [],
        browser: [],
        device: [],
        medium: []
    }
};

let previousData = defaultData;

const $authorizeButtonContainer = $('#gSignInWrapper');

const $authorizeButton = $('#authorize-button');

const $accountSelector = $('#account-selector');

const $propertiesSelector = $('#properties-selector');

const $profileSelector = $('#profile-selector');

const $home = $('#home');

const $headerText = $('.header-text');

const $authorInfo = $('#home-info');

const $gotohome = $('#gotohome');

const $visitCounter = $('#visits-count');

const $aboutLink = $('#about-link');

const $aboutPage = $('#about');

const methods = {
    init: function () {
        const that = this;

        // Header home button
        $gotohome.click(function (e) {
            e.preventDefault();

            forceStop = true;
            previousData = defaultData;

            clearTimeout(timer);
            that.resetData();
            $accountSelector.val(0).parent().removeClass('toleft').removeClass('toright');
            $propertiesSelector.val(0).parent().removeClass('toleft').addClass('toright');
            $profileSelector.val(0).parent().removeClass('toleft').addClass('toright');
            $home.removeClass('down');
            $headerText.removeClass('show');
            $aboutLink.removeClass('show');
        });

        $aboutLink.click(function (e) {
            e.preventDefault();

            const text = $aboutLink.html();

            $aboutPage.toggleClass('show');
            if (text === 'Close') {
                $aboutLink.html('About &amp; FAQ');
            } else {
                $aboutLink.html('Close');
            }
        });

        return function (config) {
            api.init(config, that.logged(), that.unlogged());
        };
    },
    resetData: function () {
        $('.data-table').html('');
        $visitCounter.html(0);
        // $('canvas').remove();
    },
    logged: function () {
        const that = this;

        return function () {
            // Hide login button
            $authorizeButtonContainer.addClass('hide');
            $authorInfo.addClass('down');
            // Query accounts
            api.queryAccounts(function (accounts) {
                $('.selector-container:first-child').removeClass('toright');
                // Reset selector
                $accountSelector.html('<option value="0">Choose account</option>').unbind('change');
                // Populate selector
                $.each(accounts, function (index, account) {
                    $('<option value="' + account.id + '">' + account.name + '</option>').appendTo($accountSelector);
                });
                // Onchange query profile and show selector
                $accountSelector.change(function () {
                    const $this = $(this);

                    const $parent = $this.parent();

                    const accountId = parseFloat($this.val());

                    const $selectedAccount = $.grep(accounts, function (item) {
                        return parseFloat(item.id) === accountId;
                    });

                    // If selects...
                    if ($selectedAccount.length === 1) {
                        // ...query web properties
                        $parent.addClass('toleft');
                        api.queryWebproperties(accountId, function (properties) {
                            $propertiesSelector.parent().removeClass('toright');
                            // Reset selector
                            $propertiesSelector.html('<option value="0">Choose property</option>').unbind('change');
                            // Populate selector
                            $.each(properties, function (index, property) {
                                $('<option value="' + property.id + '">' + property.name + '</option>').appendTo($propertiesSelector);
                            });
                            // Onchange query profile and show selector
                            $propertiesSelector.change(function () {
                                const $this = $(this);

                                const $parent = $this.parent();

                                const propertyId = $this.val();

                                const $selectedProperty = $.grep(properties, function (item) {
                                    return item.id === propertyId;
                                });

                                // If selects...
                                if ($selectedProperty.length === 1) {
                                    $parent.addClass('toleft');
                                    // ...query web profiles
                                    api.queryProfiles(accountId, propertyId, function (profiles) {
                                        $profileSelector.parent().removeClass('toright');
                                        // Reset selector
                                        $profileSelector.html('<option value="0">Choose profile</option>').unbind('change');
                                        // Populate selector
                                        $.each(profiles, function (index, profile) {
                                            $('<option value="' + profile.id + '">' + profile.name + '</option>').appendTo($profileSelector);
                                        });
                                        // Onchange query profile and show selector
                                        $profileSelector.change(function () {
                                            const $this = $(this);

                                            const $parent = $this.parent();

                                            const profileId = parseFloat($this.val());

                                            const $selectedProfile = $.grep(profiles, function (item) {
                                                return parseFloat(item.id) === profileId;
                                            });

                                            // If selects...
                                            if ($selectedProfile.length === 1) {
                                                // Magic starts
                                                $parent.addClass('toleft');
                                                forceStop = false;
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
    unlogged: function () {
        return function () {
            // When the 'Authorize' button is clicked, call the handleAuthClick function
            $authorizeButton.click(function (e) {
                e.preventDefault();

                api.handleAuthClick();
            });
        };
    },
    realtime: function (profileId) {
        function camelCase (input) {
            return input.toLowerCase().replace(/-(.)/g, function (match, group1) {
                return group1.toUpperCase();
            });
        }

        // Init world
        world.init();

        (function exec () {
            // Track event
            if (ga !== undefined) {
                ga('send', 'event', 'request');
            }

            // Get data
            api.realtime(profileId, function (response) {
                $home.addClass('down');
                setTimeout(function () {
                    $headerText.addClass('show');
                    $aboutLink.addClass('show');
                }, 500);

                // Update total
                $visitCounter.html(response.total);
                // Update tables
                $.each(response.data, function (tableName, table) {
                    const $table = $('#' + tableName + '-table');

                    const previousTable = previousData.data[tableName];

                    const previousTableIndexed = {};

                    // Construct array to know if up or down
                    $.each(previousTable, function (previousRowIndex, previousRow) {
                        previousTableIndexed[previousRow.name] = previousRow.value;
                    });

                    $.each(table, function (rowIndex, row) {
                        const previousRow = previousTable[rowIndex];
                        if (previousRow !== row) {
                            const selector = rowIndex === 0 ? '*:first-child' : '*:nth-child(' + (rowIndex + 1) + ')';

                            let $li = $table.children(selector);

                            const template = '<p>' +
                                '<span class="name">' + camelCase(row.name) + '</span> ' +
                                '<span class="value">' + row.value + '</span> ' +
                                '<span class="percent">' + row.percent + '%</span>' +
                                '</p>';

                            if ($li.length > 0) {
                                $li.html(template);
                            } else {
                                $li = $('<li>' + template + '</li>');
                                $li.appendTo($table);
                            }

                            // Cambia el dato
                            if ((!previousRow) || (previousRow.name !== row.name) || (previousRow.value !== row.value)) {
                                $li.addClass('change');
                                const previousValue = parseFloat(previousTableIndexed[row.name]);
                                if (previousValue > row.value) {
                                    $li.addClass('down');
                                }
                            }
                        }
                    });
                });

                setTimeout(function () {
                    $('.panels li').removeClass('change').removeClass('down');
                }, 500);

                // Serch for new visits by country
                const newCountries = [];

                const countriesByName = {};

                let maxCountryValue = 0;

                $.each(response.data.country, function (index, country) {
                    const countryName = country.name;

                    const previousCountry = $.grep(previousData.data.country, function (e) {
                        return e.name === countryName;
                    });

                    countriesByName[country.name] = country;
                    if (maxCountryValue < country.value) {
                        maxCountryValue = country.value;
                    }

                    if (previousCountry.length === 0) {
                        newCountries.push(country.name);
                    } else if (previousCountry.length === 1 && country.value > previousCountry[0].value) {
                        newCountries.push(country.name);
                    }
                });

                if (!forceStop) {
                    // Move world
                    if (newCountries.length > 0) {
                        world.moveTo(newCountries, countriesByName, maxCountryValue);
                    }

                    previousData = response;

                    // Infinite
                    timer = setTimeout(function () {
                        if (!forceStop) {
                            exec();
                        }
                    }, 10000);
                }
            });
        })();
    }
};

window.app = function () {
    const app = methods.init();
    app(config);
};
