function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
        navigator.serviceWorker.ready.then(reg => {
            console.log('Service Worker registered successfully.');

            // Send a 'start' message to the service worker, 'fetchData' respectively
            reg.active.postMessage('start');
            //reg.active.postMessage('fetchData');
            //reg.active.postMessage('setAlarmStatus');
        });
    }
}
function startListening(dotnetHelper) {
    if ('serviceWorker' in navigator) {
        // Listen for messages from the service worker
        navigator.serviceWorker.addEventListener('message', event => {
            console.log('Received message from Service Worker:', event.data);
            if (event.data.type === 'testupdate') {
                dotnetHelper.invokeMethodAsync('TestUpdate', event.data.states, event.data.devices);
            }
            else if (event.data.type === 'getalarmstatusfromserver') {
                console.log('GetAlarmStatusFromServer: ', event.data);
                var datahelper = event.data.data[0];
                dotnetHelper.invokeMethodAsync('SetAlarmSwitchStatus', datahelper);
            }
            else if (event.data.type === 'getalarmswitchstatus') {
                dotnetHelper.invokeMethodAsync('GetAlarmSwitchStatus')
                    .then(result => {
                        console.log('Result: ', result);
                        sendDataToServer(result);
                    });
            }
        });
    }
}
async function storeToken(jwtBearer) {
    return await new Promise((resolve) => {
        console.log('storeToken gestartet');
        try {
            // Öffnen der Datenbank und speichern des JWT
            var openRequest = indexedDB.open('myDatabase', 1);
            openRequest.onupgradeneeded = function (e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains('jwtStore')) {
                    db.createObjectStore('jwtStore');
                }
            };
            openRequest.onsuccess = function (e) {
                var db = e.target.result;
                var transaction = db.transaction(['jwtStore'], 'readwrite');
                var store = transaction.objectStore('jwtStore');
                var request = store.put(jwtBearer, 'jwtBearer');

                request.onsuccess = function () {
                    console.log('JWT-Token erfolgreich gespeichert');
                    resolve(true);
                };
                request.onerror = function () {
                    console.error('Fehler beim Speichern des JWT-Tokens');
                    resolve(false);
                };
            };
            openRequest.onerror = function (e) {
                console.error('Fehler beim Öffnen der Datenbank:', e);
                resolve(false);
            };
        } catch (error) {
            console.log('Error:', error);
            resolve(false)
        }
    });
}
async function deleteToken() {
    return await new Promise((resolve) => {
        try {
            var openRequest = indexedDB.open('myDatabase', 1);

            openRequest.onsuccess = function (e) {
                var db = e.target.result;
                var transaction = db.transaction(['jwtStore'], 'readwrite');
                var store = transaction.objectStore('jwtStore');

                // Löschen des JWT-Tokens
                var deleteRequest = store.delete('jwtBearer');

                deleteRequest.onsuccess = function (e) {
                    console.log('JWT-Token erfolgreich gelöscht');
                    resolve(true);
                };

                deleteRequest.onerror = function (e) {
                    console.error('Fehler beim Löschen des JWT-Tokens:', e);
                    resolve(false);
                };
            };
            openRequest.onerror = function (e) {
                console.error('Fehler beim Öffnen der Datenbank:', e);
                resolve(false);
            };
        } catch (error) {
            console.log('Error:', error);
            resolve(false);
        }
    });
}

async function getJwtBearer() {
    return await new Promise((resolve, reject) => {
        var openRequest = indexedDB.open('myDatabase', 1);
        openRequest.onsuccess = function (e) {
            var db = e.target.result;
            var transaction = db.transaction(['jwtStore'], 'readonly');
            var store = transaction.objectStore('jwtStore');
            var request = store.get('jwtBearer');
            request.onsuccess = function () {
                resolve(request.result);
            };
            request.onerror = function () {
                reject('Fehler beim Abrufen des JWT-Bearer-Tokens.');
            };
        };
        openRequest.onerror = function () {
            reject('Fehler beim Öffnen der Datenbank.');
        };
    });
}

async function checkLoginStatus() {
    try {
        var jwtBearer = await getJwtBearer();
        const response = await fetch('https://localhost:7009/api/Account/Test', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + jwtBearer
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Es gab ein Problem mit Ihrer Fetch-Operation: ', error);
        return false;
    }
}

async function sendDataToServer(data) {
    console.log('AlarmSwitchVorDemSenden: ', data);
    try {
        var jwtBearer = await getJwtBearer();
        const response = await fetch('https://localhost:7009/api/Alarm', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + jwtBearer,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.ok;
    } catch (error) {
        console.error('Es gab ein Problem mit Ihrer Fetch-Operation: ', error);
        return false;
    }
}
async function getAlertDataFromServer() {
    try {
        var jwtBearer = await getJwtBearer();
        const response = await fetch('https://localhost:7009/api/Alarm', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + jwtBearer,
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        if (data === true) {
            console.log('Alarm ist aktiv!');
            return true;
        } else {
            console.log('Alarm ist nicht aktiv!');
            return false;
        }
    } catch (error) {
        console.error('Es gab ein Problem mit Ihrer Fetch-Operation: ', error);
        return false;
    }
}

async function JSAddNewDevice(device) {
    console.log('JSAddNewDevice gestartet');
    var jwtBearer = await getJwtBearer();
    const response = await fetch('https://localhost:7009/api/Devices', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + jwtBearer,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(device)
    });

    if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return false;
    }
    return true;
}