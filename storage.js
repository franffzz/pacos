"use strict";


/* =========================================================
   PACO'S
   Almacenamiento permanente de la biblioteca
   ========================================================= */


/*
   IndexedDB guardará las recetas en el dispositivo.

   Este archivo no modifica todavía ninguna pantalla.
   En los siguientes cambios conectaremos el editor,
   la biblioteca, las categorías y la ficha.
*/

const PacosStorage = (function () {

    const DATABASE_NAME = "pacos-library";
    const DATABASE_VERSION = 1;

    const RECIPES_STORE = "recipes";
    const NOTES_STORE = "notes";

    let databasePromise = null;


    /* -----------------------------------------------------
       1. ABRIR O CREAR LA BASE DE DATOS
       ----------------------------------------------------- */

    function openDatabase() {

        if (!("indexedDB" in window)) {

            return Promise.reject(
                new Error(
                    "Este navegador no permite guardar la biblioteca."
                )
            );
        }


        if (databasePromise) {
            return databasePromise;
        }


        databasePromise = new Promise(
            function (resolve, reject) {

                const request = indexedDB.open(
                    DATABASE_NAME,
                    DATABASE_VERSION
                );


                request.onupgradeneeded = function () {

                    const database = request.result;


                    if (
                        !database.objectStoreNames.contains(
                            RECIPES_STORE
                        )
                    ) {

                        const recipes =
                            database.createObjectStore(
                                RECIPES_STORE,
                                {
                                    keyPath: "id"
                                }
                            );

                        recipes.createIndex(
                            "title",
                            "title",
                            {
                                unique: false
                            }
                        );

                        recipes.createIndex(
                            "updatedAt",
                            "updatedAt",
                            {
                                unique: false
                            }
                        );
                    }


                    /*
                       Las notas personales se almacenarán
                       por separado y no se incluirán al
                       compartir una receta individual.
                    */

                    if (
                        !database.objectStoreNames.contains(
                            NOTES_STORE
                        )
                    ) {

                        database.createObjectStore(
                            NOTES_STORE,
                            {
                                keyPath: "recipeId"
                            }
                        );
                    }
                };


                request.onsuccess = function () {

                    const database = request.result;


                    /*
                       Si una versión futura necesita cambiar
                       la estructura, cerramos esta conexión.
                    */

                    database.onversionchange = function () {
                        database.close();
                    };


                    resolve(database);
                };


                request.onerror = function () {

                    databasePromise = null;

                    reject(
                        request.error ||
                        new Error(
                            "No se ha podido abrir la biblioteca."
                        )
                    );
                };


                request.onblocked = function () {

                    console.warn(
                        "Paco's necesita cerrar otra pestaña para actualizar la biblioteca."
                    );
                };
            }
        );


        return databasePromise;
    }


    /* -----------------------------------------------------
       2. EJECUTAR UNA OPERACIÓN
       ----------------------------------------------------- */

    async function runRequest(
        storeName,
        mode,
        operation
    ) {

        const database = await openDatabase();


        return new Promise(
            function (resolve, reject) {

                const transaction =
                    database.transaction(
                        storeName,
                        mode
                    );

                const store =
                    transaction.objectStore(
                        storeName
                    );

                let request;


                try {

                    request = operation(store);

                } catch (error) {

                    transaction.abort();
                    reject(error);
                    return;
                }


                transaction.oncomplete = function () {

                    resolve(
                        request
                            ? request.result
                            : undefined
                    );
                };


                transaction.onerror = function () {

                    reject(
                        transaction.error ||
                        request.error ||
                        new Error(
                            "No se ha podido completar la operación."
                        )
                    );
                };


                transaction.onabort = function () {

                    reject(
                        transaction.error ||
                        new Error(
                            "La operación se ha cancelado."
                        )
                    );
                };
            }
        );
    }


    /* -----------------------------------------------------
       3. OPERACIONES CON RECETAS
       ----------------------------------------------------- */

    function addRecipe(recipe) {

        /*
           add() falla si ya existe el mismo id.
           Así evitamos sobrescribir duplicados
           silenciosamente.
        */

        return runRequest(
            RECIPES_STORE,
            "readwrite",
            function (store) {
                return store.add(recipe);
            }
        );
    }


    function replaceRecipe(recipe) {

        /*
           put() solo se utilizará después de que
           el usuario haya autorizado expresamente
           una sustitución o una edición.
        */

        return runRequest(
            RECIPES_STORE,
            "readwrite",
            function (store) {
                return store.put(recipe);
            }
        );
    }


    function getRecipe(recipeId) {

        return runRequest(
            RECIPES_STORE,
            "readonly",
            function (store) {
                return store.get(recipeId);
            }
        );
    }


    function getAllRecipes() {

        return runRequest(
            RECIPES_STORE,
            "readonly",
            function (store) {
                return store.getAll();
            }
        );
    }


    /* -----------------------------------------------------
       4. OPERACIONES CON NOTAS PERSONALES
       ----------------------------------------------------- */

    function getAllNotes() {

        return runRequest(
            NOTES_STORE,
            "readonly",
            function (store) {
                return store.getAll();
            }
        );
    }



/* ---------------------------------------------------------
   5. SUSTITUIR LA BIBLIOTECA COMPLETA
   --------------------------------------------------------- */

async function replaceLibrary(
    recipes,
    notes
) {

    const database = await openDatabase();


    return new Promise(
        function (resolve, reject) {

            let transaction;


            try {

                transaction =
                    database.transaction(
                        [
                            RECIPES_STORE,
                            NOTES_STORE
                        ],
                        "readwrite"
                    );


            } catch (error) {

                reject(error);
                return;
            }


            const recipesStore =
                transaction.objectStore(
                    RECIPES_STORE
                );

            const notesStore =
                transaction.objectStore(
                    NOTES_STORE
                );


            try {

                /*
                   Primero vaciamos ambos espacios dentro
                   de la misma operación.
                */

                recipesStore.clear();
                notesStore.clear();


                /*
                   Después introducimos todos los datos
                   contenidos en la copia validada.
                */

                recipes.forEach(
                    function (recipe) {

                        recipesStore.put(recipe);
                    }
                );


                notes.forEach(
                    function (note) {

                        notesStore.put(note);
                    }
                );


            } catch (error) {

                transaction.abort();
                reject(error);
                return;
            }


            transaction.oncomplete = function () {

                resolve();
            };


            transaction.onerror = function () {

                reject(
                    transaction.error ||
                    new Error(
                        "No se ha podido restaurar la biblioteca."
                    )
                );
            };


            transaction.onabort = function () {

                reject(
                    transaction.error ||
                    new Error(
                        "La restauración se ha cancelado."
                    )
                );
            };
        }
    );
}



/* ---------------------------------------------------------
   6. ELIMINAR UNA RECETA Y SUS DATOS ASOCIADOS
   --------------------------------------------------------- */

async function deleteRecipeAndNotes(recipeId) {

    const database = await openDatabase();


    return new Promise(
        function (resolve, reject) {

            let transaction;


            try {

                transaction =
                    database.transaction(
                        [
                            RECIPES_STORE,
                            NOTES_STORE
                        ],
                        "readwrite"
                    );


            } catch (error) {

                reject(error);
                return;
            }


            const recipesStore =
                transaction.objectStore(
                    RECIPES_STORE
                );

            const notesStore =
                transaction.objectStore(
                    NOTES_STORE
                );


            try {

                recipesStore.delete(recipeId);
                notesStore.delete(recipeId);


            } catch (error) {

                transaction.abort();
                reject(error);
                return;
            }


            transaction.oncomplete = function () {

                resolve();
            };


            transaction.onerror = function () {

                reject(
                    transaction.error ||
                    new Error(
                        "No se ha podido eliminar la receta."
                    )
                );
            };


            transaction.onabort = function () {

                reject(
                    transaction.error ||
                    new Error(
                        "La eliminación se ha cancelado."
                    )
                );
            };
        }
    );
}

    /* -----------------------------------------------------
       5. SOLICITAR AL NAVEGADOR ALMACENAMIENTO PERSISTENTE
       ----------------------------------------------------- */

    async function requestPersistence() {

        if (
            !navigator.storage ||
            !navigator.storage.persist
        ) {
            return false;
        }


        return navigator.storage.persist();
    }


    /* -----------------------------------------------------
       6. API DISPONIBLE PARA LOS DEMÁS ARCHIVOS
       ----------------------------------------------------- */

    return Object.freeze({

        openDatabase,
        addRecipe,
        replaceRecipe,
        getRecipe,
        getAllRecipes,
		getAllNotes,
		replaceLibrary,
		deleteRecipeAndNotes,
		requestPersistence
    });

})();