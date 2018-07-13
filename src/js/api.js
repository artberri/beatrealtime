let clientId;

let apiKey;

const scopes = 'https://www.googleapis.com/auth/analytics.readonly';

let onAuthorized;

let onUnAuthorized;

const methods = {
    init: function () {
        const that = this;

        return function (config, onAuthorizedCallback, onUnAuthorizedCallback) {
            clientId = config.clientId;
            apiKey = config.apiKey;
            onAuthorized = onAuthorizedCallback;
            onUnAuthorized = onUnAuthorizedCallback;
            gapi.client.setApiKey(apiKey);
            window.setTimeout(that.checkAuth(), 16);
        };
    },
    checkAuth: function () {
        const that = this;

        return function () {
            gapi.auth.authorize({
                'client_id': clientId,
                scope: scopes,
                immediate: true
            }, that.handleAuthResult());
        };
    },
    handleAuthResult: function () {
        const that = this;

        return function (authResult) {
            if (!authResult.error) {
                // The user has authorized access
                // Load the Analytics Client. This function is defined in the next section.
                that.loadAnalyticsClient();
            } else {
                // User has not Authenticated and Authorized
                that.handleUnAuthorized();
            }
        };
    },
    handleUnAuthorized: function () {
        onUnAuthorized();
    },
    handleAuthClick: function () {
        const that = this;

        return function () {
            gapi.auth.authorize({
                'client_id': clientId,
                scope: scopes,
                immediate: false
            }, that.handleAuthResult());

            return false;
        };
    },
    loadAnalyticsClient: function () {
        // Load the Analytics client and set handleAuthorized as the callback function
        gapi.client.load('analytics', 'v3', this.handleAuthorized());
    },
    handleAuthorized: function () {
        return function () {
            onAuthorized();
        };
    },
    queryAccounts: function () {
        const that = this;

        return function (callback) {
            gapi.client.analytics.management.accounts.list().execute(that.handleAccounts(callback));
        };
    },
    handleAccounts: function (callback) {
        return function (results) {
            if (!results.code) {
                if (results && results.items && results.items.length) {
                    callback(results.items);
                }
            }
        };
    },
    queryWebproperties: function () {
        const that = this;

        // Get a list of all the Web Properties for the account
        return function (accountId, callback) {
            gapi.client.analytics.management.webproperties.list({
                'accountId': accountId
            }).execute(that.handleWebproperties(callback));
        };
    },
    handleWebproperties: function (callback) {
        return function (results) {
            if (!results.code) {
                if (results && results.items && results.items.length) {
                    callback(results.items);
                }
            }
        };
    },
    queryProfiles: function () {
        const that = this;

        return function (accountId, webpropertyId, callback) {
            // Get a list of all Views (Profiles) for the first Web Property of the first Account
            gapi.client.analytics.management.profiles.list({
                'accountId': accountId,
                'webPropertyId': webpropertyId
            }).execute(that.handleProfiles(callback));
        };
    },
    handleProfiles: function (callback) {
        return function (results) {
            if (!results.code) {
                if (results && results.items && results.items.length) {
                    callback(results.items);
                }
            }
        };
    },
    realtime: function () {
        const that = this;

        return function (firstProfileId, callback) {
            const request = gapi.client.request({
                method: 'GET',
                path: '/analytics/v3/data/realtime',
                params: {
                    ids: 'ga:' + firstProfileId,
                    metrics: 'ga:activeVisitors',
                    dimensions: 'ga:country,ga:browser,ga:deviceCategory,ga:medium'
                }
            });

            request.execute(function (resp) {
                if (!resp.error) {
                    const data = that.formatData(resp.rows);
                    if (typeof callback === 'function') {
                        callback(data);
                    }
                }
            });
        };
    },
    formatData: function (data) {
        let newData = {
            country: {},
            browser: {},
            device: {},
            medium: {}
        };

        let c; let b; let d; let m; let value; let total = 0; let typeIndex; let typeObject; let currentType;

        if (data) {
            for (let i = 0; i < data.length; i++) {
                c = data[i][0];
                b = data[i][1];
                d = data[i][2];
                m = data[i][3];
                value = parseFloat(data[i][4]);

                total += value;

                for (typeIndex in newData) {
                    if (newData.hasOwnProperty(typeIndex)) {
                        typeObject = newData[typeIndex];

                        switch (typeIndex) {
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

                        if (typeof typeObject[currentType] !== 'undefined') {
                            typeObject[currentType] += value;
                        } else {
                            typeObject[currentType] = value;
                        }
                    }
                }
            }

            // Pasar a array
            let newDataArray, elementName;
            for (typeIndex in newData) {
                if (newData.hasOwnProperty(typeIndex)) {
                    newDataArray = [];
                    typeObject = newData[typeIndex];

                    for (elementName in typeObject) {
                        if (typeObject.hasOwnProperty(elementName)) {
                            newDataArray.push({
                                name: elementName,
                                value: typeObject[elementName],
                                percent: (typeObject[elementName] / total * 100).toFixed(2)
                            });
                        }
                    }
                    newData[typeIndex] = newDataArray;
                }
            }

            const sort = function (a, b) {
                return b.value - a.value;
            };

            newData.country.sort(sort);
            newData.browser.sort(sort);
            newData.device.sort(sort);
            newData.medium.sort(sort);
        } else {
            newData = {
                country: [],
                browser: [],
                device: [],
                medium: []
            };
        }

        return {
            total: total,
            data: newData
        };
    }
};

const api = {
    init: methods.init(),
    handleAuthClick: methods.handleAuthClick(),
    queryAccounts: methods.queryAccounts(),
    queryWebproperties: methods.queryWebproperties(),
    queryProfiles: methods.queryProfiles(),
    realtime: methods.realtime()
};

export default api;
