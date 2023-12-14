async function deletePushSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
        console.log('Push Abo wird beendet');
        return subscription.unsubscribe();
    } else {
        console.log('Es gibt nichts zu deabonnieren');
    }
}
async function requestPushSubscription() {
    console.log('requestPushSubscription gestartet')

    var result = await window.blazorPushNotifications.requestSubscription();
    if (result !== null) {
        let response = await fetch('https://localhost:7009/api/Notification/savePushSub', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        });
        if (response.ok) return true;
        else return false;
        //const responsedata = await response.json();
    }
    return false;
}

window.blazorPushNotifications = {
    requestSubscription: async () => {
        try {
            const worker = await navigator.serviceWorker.getRegistration();
            let existingSubscription = await worker.pushManager.getSubscription();
            console.log('vor if !existingSubscription');
            if (!existingSubscription) {
                existingSubscription = await subscribe();
            }
            if (existingSubscription) {
                console.log('Neues Push-Abo erhalten');
                const subscription = {
                    url: existingSubscription.endpoint,
                    p256dh: await arrayBufferToBase64(existingSubscription.getKey('p256dh')),
                    auth: await arrayBufferToBase64(existingSubscription.getKey('auth'))
                };
                return subscription;
            }
        } catch (error) {
            console.error('Ein Fehler ist aufgetreten:', error);
        }
    }
};


//window.blazorPushNotifications = {
//    requestSubscription: async () => {
//        navigator.serviceWorker.getRegistration()
//            .then(worker => {
//            //    console.log('Worker:', worker);
//            //    if (worker) {
//            //        subscribe(worker);
//            //    } else {
//            //        console.log('Worker is not defined');
//            //    }
//            //})
//                return worker.pushManager.getSubscription();
//            })
//            .then(existingSubscription => {
//                console.log('vor if !existingSubscription');
//                if (!existingSubscription) {
//                    return subscribe();
//                }
//            })
//            .then(newSubscription => {
//                if (newSubscription) {
//                    console.log('Neues Push-Abo erhalten');
//                    const subscription = {
//                        url: newSubscription.endpoint,
//                        p256dh: arrayBufferToBase64(newSubscription.getKey('p256dh')),
//                        auth: arrayBufferToBase64(newSubscription.getKey('auth'))
//                    };
//                    var teststring = JSON.stringify(subscription);
//                    console.log('teststring: ', teststring);
//                    return teststring;
//                }
//            })
//            .catch(error => {
//                console.error('Ein Fehler ist aufgetreten:', error);
//            });
//    }
//};

async function subscribe() {
    console.log('subscribe gestartet');
    const applicationServerPublicKey = 'BFQOVKbDmzHnbmXCvt4kD8FrsKUBZILh9q4yFXqoJRaYj1tfOTmIUlek3C1QKFeIGJ9LQBUwTks_pJJhqFuUwYs';
    var worker = await navigator.serviceWorker.getRegistration();
    return worker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerPublicKey
    })
        .then(newSubscription => {
            console.log('Neues Push-Abo erhalten');
            return newSubscription;
        })
        .catch(error => {
            if (error.name === 'NotAllowedError') {
                return null;
            }
            throw error;
        });
}

//function subscribe(worker) {
//    console.log('subscribe gestartet');
//    const applicationServerPublicKey = 'BFQOVKbDmzHnbmXCvt4kD8FrsKUBZILh9q4yFXqoJRaYj1tfOTmIUlek3C1QKFeIGJ9LQBUwTks_pJJhqFuUwYs';
//    try {
//        return await worker.pushManager.subscribe({
//            userVisibleOnly: true,
//            applicationServerKey: base64ToArrayBuffer(applicationServerPublicKey)
//        });
//    } catch (error) {
//        if (error.name === 'NotAllowedError') {
//            return null;
//        }
//        throw error;
//    }
//}
async function arrayBufferToBase64(buffer) {
    console.log('arrayBufferToBase64 gestartet');
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
async function base64ToArrayBuffer(base64) {
    console.log('base64ToArrayBuffer gestartet');
    console.log('base64:', base64);
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function notifyMe() {
    if (!("Notification" in window)) {
        alert("Dieser Browser unterstützt keine Desktop-Benachrichtigungen");
    } else if (Notification.permission === "granted") {
        const notification = new Notification("Erlaubnis für Push-Benachrichtigungen erteilt!");
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                const notification = new Notification("Erlaubnis für Push-Benachrichtigungen erteilt!");
            }
        });
    }
}

//window.blazorPushNotifications = {
    //    requestSubscription: async () => {
    //        console.log(navigator.serviceWorker);
    //        try {
    //            const worker = await navigator.serviceWorker.getRegistration();
    //            const existingSubscription = await worker.pushManager.getSubscription();
    //            console.log('vor if !existingSubscription');
    //            if (!existingSubscription) {
    //                const newSubscription = await subscribe(worker);
    //                if (newSubscription) {
    //                    console.log('Neues Push-Abo erhalten')
    //                    const subscription =
    //                    {
    //                        url: newSubscription.endpoint,
    //                        p256dh: arrayBufferToBase64(newSubscription.getKey('p256dh')),
    //                        auth: arrayBufferToBase64(newSubscription.getKey('auth'))
    //                    };
    //                    return JSON.stringify(subscription);
    //                }
    //            }
    //        } catch (error) {
    //            console.log(error);
    //        }
    //    }
    //};
