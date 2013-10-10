/*global define, gapi */
define(['async!https://apis.google.com/js/client.js!onload'], function() {
    'use strict';

    var clientId = '715077343701';
    var apiKey = 'AIzaSyAUs37-gXe06-up53wBa5-ceJIvZloFJH0';
    var scopes = 'https://www.googleapis.com/auth/analytics.readonly';
    var onAuthorized, onUnAuthorized;

    var methods = {
        init: function() {
            var that = this;

            return function(onAuthorizedCallback, onUnAuthorizedCallback) {
                onAuthorized = onAuthorizedCallback;
                onUnAuthorized = onUnAuthorizedCallback;
                gapi.client.setApiKey(apiKey);
                window.setTimeout(that.checkAuth(), 16);
            };
        },
        checkAuth: function() {
            var that = this;

            return function() {
                gapi.auth.authorize({'client_id': clientId, scope: scopes, immediate: true}, that.handleAuthResult());
            };
        },
        handleAuthResult: function() {
            var that = this;

            return function(authResult) {
                if (authResult) {
                    // The user has authorized access
                    // Load the Analytics Client. This function is defined in the next section.
                    that.loadAnalyticsClient();
                }
                else {
                    // User has not Authenticated and Authorized
                    that.handleUnAuthorized();
                }
            };
        },
        handleUnAuthorized: function() {
            onUnAuthorized();
        },
        handleAuthClick : function() {
            var that = this;

            return function() {
                gapi.auth.authorize({'client_id': clientId, scope: scopes, immediate: false}, that.handleAuthResult());
                return false;
            };
        },
        loadAnalyticsClient: function() {
            console.log('loadAnalyticsClient');
            // Load the Analytics client and set handleAuthorized as the callback function
            gapi.client.load('analytics', 'v3', this.handleAuthorized());
        },
        handleAuthorized : function() {
            return function() {
                onAuthorized();
            };
        },
        makeApiCall: function() {
            var that = this;

            return function() {
                that.queryAccounts();
            };
        },
        queryAccounts: function() {
            var that = this;
            console.log('Querying Accounts.');

            console.log(gapi.client);

            // Get a list of all Google Analytics accounts for this user
            gapi.client.analytics.management.accounts.list().execute(that.handleAccounts());
        },
        handleAccounts: function() {
            var that = this;

            return function(results) {
                if (!results.code) {
                    if (results && results.items && results.items.length) {

                        console.log( results.items);

                        // Get the first Google Analytics account
                        var firstAccountId = results.items[0].id;

                        // Guggen
                        firstAccountId = 27333748;

                        // Query for Web Properties
                        that.queryWebproperties(firstAccountId);

                    }
                    else {
                        console.log('No accounts found for this user.');
                    }
                }
                else {
                    console.log('There was an error querying accounts: ' + results.message);
                }
            };
        },
        queryWebproperties: function(accountId) {
            console.log('Querying Webproperties.');

            // Get a list of all the Web Properties for the account
            gapi.client.analytics.management.webproperties.list({'accountId': accountId}).execute(this.handleWebproperties());
        },
        handleWebproperties: function() {
            var that = this;

            return function(results) {
                if (!results.code) {
                    if (results && results.items && results.items.length) {

                        // Get the first Google Analytics account
                        console.log( results.items);
                        var firstAccountId = results.items[0].accountId;
                        // TODO
                        firstAccountId = 27333748;
                        // Get the first Web Property ID
                        var firstWebpropertyId = results.items[0].id;

                        // Query for Views (Profiles)
                        that.queryProfiles(firstAccountId, firstWebpropertyId);

                    }
                    else {
                        console.log('No webproperties found for this user.');
                    }
                }
                else {
                    console.log('There was an error querying webproperties: ' + results.message);
                }
            };
        },
        queryProfiles: function(accountId, webpropertyId) {
            console.log('Querying Views (Profiles). ' + webpropertyId);

            // Get a list of all Views (Profiles) for the first Web Property of the first Account
            gapi.client.analytics.management.profiles.list({
                'accountId': accountId,
                'webPropertyId': webpropertyId
            }).execute(this.handleProfiles());
        },
        handleProfiles: function() {
            var that = this;

            return function(results) {
                if (!results.code) {
                    if (results && results.items && results.items.length) {

                        console.log(results.items);

                        // Get the first View (Profile) ID
                        var firstProfileId = results.items[0].id;
                        console.log(firstProfileId + ' ---- ');

                        // Step 3. Query the Core Reporting API
                        //queryCoreReportingApi(firstProfileId);
                        // that.realtime(firstProfileId);

                    }
                    else {
                        console.log('No views (profiles) found for this user.');
                    }
                }
                else {
                    console.log('There was an error querying views (profiles): ' + results.message);
                }
            };
        },
        realtime: function() {
            var that = this;

            return function(firstProfileId) {
                console.log('realtime - ');
                console.log(firstProfileId);

                var request = gapi.client.request({
                    method:'GET',
                    path:'/analytics/v3/data/realtime',
                    params:{
                        ids: 'ga:' + firstProfileId,
                        metrics: 'ga:activeVisitors',
                        dimensions: 'ga:country,ga:browser,ga:deviceCategory,ga:medium'
                    }
                });

                request.execute(function(resp){
                    if(!resp.error) {
                        var visitsCount = document.getElementById('visits-count');


                        var data = that.formatData(resp.rows);
                        console.log(resp);
                        console.log(data);
                        visitsCount.innerHTML = data.total;
                    }
                    else {
                        console.log('error');
                    }
                });
            };
        },
        formatData: function(data) {
            var newData = {
                country: {},
                browser: {},
                device: {},
                medium: {}
            };

            var row, c, b, d, m, value, total = 0, typeIndex, typeObject, currentType;

            for(var i=0; i<data.length; i++) {
                row = data[i];
                c = data[i][0];
                b = data[i][1];
                d = data[i][2];
                m = data[i][3];
                value = parseFloat(data[i][4]);

                total += value;

                for(typeIndex in newData) {
                    if (newData.hasOwnProperty(typeIndex)) {
                        typeObject = newData[typeIndex];

                        switch(typeIndex) {
                        case 'browser':
                            currentType = b;
                            break;
                        case 'medium':
                            currentType = m;
                            break;
                        case 'device':
                            currentType = d;
                            break;
                        case 'country':
                            currentType = c;
                            break;
                        }

                        if(typeof typeObject[currentType] !== 'undefined') {
                            typeObject[currentType] += value;
                        }
                        else {
                            typeObject[currentType] = value;
                        }
                    }
                }
            }

            // Pasar a array
            var newDataArray, elementName;
            for(typeIndex in newData) {
                if (newData.hasOwnProperty(typeIndex)) {
                    newDataArray = [];
                    typeObject = newData[typeIndex];

                    for(elementName in typeObject) {
                        if (typeObject.hasOwnProperty(elementName)) {
                            newDataArray.push({
                                name: elementName,
                                value: typeObject[elementName]
                            });
                        }
                    }
                    newData[typeIndex] = newDataArray;
                }
            }

            var sort = function(a, b) {
                return b.value - a.value;
            };

            newData.country.sort(sort);
            newData.browser.sort(sort);
            newData.device.sort(sort);
            newData.medium.sort(sort);

            return {
                total: total,
                data: newData
            };
        }
    };

    return {
        init: methods.init(),
        handleAuthClick: methods.handleAuthClick(),
        makeApiCall: methods.makeApiCall(),
        realtime: methods.realtime()
    };
});