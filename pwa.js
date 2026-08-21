"use strict";


/* =========================================================
   PACO'S
   Activación de la aplicación sin conexión
   ========================================================= */


if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        async function () {

            try {

                await navigator.serviceWorker.register(
                    "./service-worker.js",
                    {
                        scope: "./",
                        updateViaCache: "none"
                    }
                );


            } catch (error) {

                console.error(
                    "No se ha podido activar el funcionamiento sin conexión.",
                    error
                );
            }
        }
    );
}
