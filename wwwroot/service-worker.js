// In development, always fetch from the network and do not enable offline support.
// This is because caching would make development more difficult (changes would not
// be reflected on the first load after each change).

//self.addEventListener('fetch', event => {
//    console.log('WORKER: Fetching', event.request);
//});
//window.addEventListener("online", function () {
//    console.log("You are online!");
//});
//window.addEventListener("offline", function () {
//    console.log("Oh no, you lost your network connection.");
//});
//self.addEventListener('install', function (event) {
//    // The service worker will install but won't activate until all the resources are fetched
//    event.waitUntil(fetchAndCacheResources());
//});

//var CACHE_NAME = 'my-cache-v002';
//var urlsToCache = [
//    '/',
//    '/js/serviceWorkerInterop.js'
//];
//function fetchAndCacheResources() {
//    return caches.open(CACHE_NAME)
//        .then(function (cache) {
//            console.log('Opened cache');
//            return cache.addAll(urlsToCache);
//        });
//}
self.addEventListener('message', function (event) {
    if (event.data === 'start') {
        //setInterval(fetchData, 600000);  // Fetch data every 10 minutes
        //setInterval(setAlarmStatus, 600000)  //jede Minute Alarmstatus von Server abfragen
    }
    else if (event.data === 'fetchData') {
        fetchData();  // Fetch data immediately
    }
});

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', function (event) {
    // The service worker is active and can start controlling new clients
    event.waitUntil(clients.claim());
});

//Event Listener für Push Benachrichtigungen
self.addEventListener('push', event => {
    const notification = event.data.json();
    self.registration.showNotification(notification.title, notification);
});

//Event Listener für Schließen der Push Notification
self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'ok') {
        event.waitUntil(
            client.openWindow(event.notification.data.url)
        );
    }
});

function fetchData() {
    // Lesen des JWT aus IndexedDB
    var openRequest = indexedDB.open('myDatabase', 1);
    openRequest.onsuccess = function (e) {
        var db = e.target.result;
        var transaction = db.transaction(['jwtStore'], 'readonly');
        var store = transaction.objectStore('jwtStore');
        var getRequest = store.get('jwtBearer');
        getRequest.onsuccess = function (e) {
            var jwtBearer = e.target.result;
            // Verwenden Sie hier das JWT
            var statesFetch = fetch('https://localhost:7009/api/States', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwtBearer
                }
            }).then(response => response.json());

            var devicesFetch = fetch('https://localhost:7009/api/Devices', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwtBearer
                }
            }).then(response => response.json());

            Promise.all([statesFetch, devicesFetch])
                .then(data => {
                    var states = data[0];
                    var devices = data[1];
                    clients.matchAll().then(clients => {
                        clients.forEach(client => client.postMessage({ type: 'testupdate', states: states, devices: devices }));
                    });
                })
                .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
        };
    };
}
