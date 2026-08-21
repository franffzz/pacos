"use strict";


/* =========================================================
   PACO'S
   Archivos esenciales disponibles sin conexión
   ========================================================= */


const CACHE_PREFIX = "pacos-static-";
const STATIC_CACHE = CACHE_PREFIX + "v8-4";


/*
   Esta lista contiene únicamente la aplicación.
   Las recetas y las notas permanecen en IndexedDB
   y nunca se copian ni se eliminan desde este archivo.
*/

const CORE_ASSETS = [
    "./",
    "./index.html",
    "./categories.html",
    "./recipe.html",
    "./editor.html",
    "./faq.html",
    "./styles.css?v=7-1",
    "./storage.js?v=6-2",
    "./recipe-validator.js?v=6-2",
    "./app.js?v=6-2",
    "./categories.js?v=8-1",
    "./editor.js?v=6-2",
    "./recipe-detail.js?v=6-2",
    "./pwa.js?v=8-1",
    "./manifest.webmanifest",
    "./assets/PacosWordmark.png",
    "./assets/PacosAppIcon-1024.png",
    "./assets/PacosAppIcon-180.png",
    "./assets/PacosAppIcon-192.png",
    "./assets/PacosAppIcon-512.png"
];


/* ---------------------------------------------------------
   1. PREPARAR UNA COPIA COMPLETA DE LA APLICACIÓN
   --------------------------------------------------------- */

self.addEventListener(
    "install",
    function (event) {

        event.waitUntil(
            caches.open(STATIC_CACHE).then(
                function (cache) {

                    /*
                       Evitamos reutilizar respuestas antiguas
                       del caché HTTP del navegador durante
                       una actualización de la aplicación.
                    */

                    const freshRequests =
                        CORE_ASSETS.map(
                            function (assetUrl) {

                                return new Request(
                                    assetUrl,
                                    {
                                        cache: "reload"
                                    }
                                );
                            }
                        );


                    return cache.addAll(
                        freshRequests
                    );
                }
            )
        );
    }
);


/* ---------------------------------------------------------
   2. RETIRAR SOLO CACHÉS ANTIGUOS DE PACO'S
   --------------------------------------------------------- */

self.addEventListener(
    "activate",
    function (event) {

        event.waitUntil(
            caches.keys().then(
                function (cacheNames) {

                    const oldPacosCaches =
                        cacheNames.filter(
                            function (cacheName) {

                                return (
                                    cacheName.startsWith(
                                        CACHE_PREFIX
                                    ) &&
                                    cacheName !== STATIC_CACHE
                                );
                            }
                        );


                    return Promise.all(
                        oldPacosCaches.map(
                            function (cacheName) {

                                return caches.delete(
                                    cacheName
                                );
                            }
                        )
                    );
                }
            ).then(
                function () {

                    return self.clients.claim();
                }
            )
        );
    }
);


/* ---------------------------------------------------------
   3. ELEGIR ENTRE LA RED Y LA COPIA LOCAL
   --------------------------------------------------------- */

self.addEventListener(
    "fetch",
    function (event) {

        const request = event.request;
        const requestUrl = new URL(request.url);


        if (
            request.method !== "GET" ||
            requestUrl.origin !== self.location.origin
        ) {
            return;
        }


        if (request.mode === "navigate") {

            event.respondWith(
                getPage(request)
            );

            return;
        }


        event.respondWith(
            getAsset(request)
        );
    }
);


/* ---------------------------------------------------------
   4. PÁGINAS: RED PRIMERO, CACHÉ SI NO HAY CONEXIÓN
   --------------------------------------------------------- */

async function getPage(request) {

    const cleanUrl = new URL(request.url);

    cleanUrl.search = "";
    cleanUrl.hash = "";


    try {

        const response = await fetch(request);


        if (response && response.ok) {

            const cache = await caches.open(
                STATIC_CACHE
            );

            await cache.put(
                cleanUrl.href,
                response.clone()
            );
        }


        return response;


    } catch (error) {

        const cachedPage = await caches.match(
            cleanUrl.href
        );


        if (cachedPage) {
            return cachedPage;
        }


        return caches.match("./index.html");
    }
}


/* ---------------------------------------------------------
   5. RECURSOS: CACHÉ PRIMERO, RED COMO ALTERNATIVA
   --------------------------------------------------------- */

async function getAsset(request) {

    const cachedAsset = await caches.match(
        request
    );


    if (cachedAsset) {
        return cachedAsset;
    }


    const response = await fetch(request);


    if (response && response.ok) {

        const cache = await caches.open(
            STATIC_CACHE
        );

        await cache.put(
            request,
            response.clone()
        );
    }


    return response;
}
