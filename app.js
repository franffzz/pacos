"use strict";


/* =========================================================
   PACO'S
   Funcionamiento general de la aplicación
   ========================================================= */





/* ---------------------------------------------------------
   3. CREAR EL RESUMEN DE LA RECETA
   --------------------------------------------------------- */

function crearResumenReceta(receta) {

    const textoRaciones =
        receta.servings === 1
            ? "1 ración"
            : `${receta.servings} raciones`;

    const textoIngredientes =
        receta.ingredients.length === 1
            ? "1 ingrediente"
            : `${receta.ingredients.length} ingredientes`;

    const textoPasos =
        receta.steps.length === 1
            ? "1 paso"
            : `${receta.steps.length} pasos`;

    return [
        textoRaciones,
        textoIngredientes,
        textoPasos
    ].join(" · ");
}


/* ---------------------------------------------------------
   4. FUNCIÓN AUXILIAR PARA CREAR TEXTO SEGURO
   --------------------------------------------------------- */

function crearElementoConTexto(
    etiqueta,
    clase,
    contenido
) {

    const elemento = document.createElement(etiqueta);

    elemento.className = clase;
    elemento.textContent = contenido;

    return elemento;
}


/* =========================================================
   BIBLIOTECA GUARDADA EN EL DISPOSITIVO
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    cargarBibliotecaGuardada
);


/* ---------------------------------------------------------
   5. CARGAR LAS RECETAS REALES
   --------------------------------------------------------- */

async function cargarBibliotecaGuardada() {

    const seccionBiblioteca = document.querySelector(
        ".empty-library-card"
    );

    const buscador = document.getElementById(
        "buscador-recetas"
    );


    try {

        const recetas =
            await PacosStorage.getAllRecipes();


        /*
           Si no hay recetas, conservamos la tarjeta
           de biblioteca vacía y desactivamos el buscador.
        */

        if (recetas.length === 0) {

            buscador.disabled = true;

            buscador.placeholder =
                "Añade una receta para poder buscar";

            return;
        }


        recetas.sort(
            function (primera, segunda) {

                return primera.title.localeCompare(
                    segunda.title,
                    "es",
                    {
                        sensitivity: "base"
                    }
                );
            }
        );


        mostrarBibliotecaGuardada(
            recetas,
            seccionBiblioteca
        );


        activarBuscadorRecetas(
            recetas,
            seccionBiblioteca
        );


    } catch (error) {

        console.error(
            "No se ha podido cargar la biblioteca:",
            error
        );

        buscador.disabled = true;

        seccionBiblioteca.replaceChildren();

        const mensaje = crearElementoConTexto(
            "p",
            "empty-library-text",
            "No se ha podido abrir la biblioteca guardada."
        );

        seccionBiblioteca.appendChild(mensaje);
    }
}


/* ---------------------------------------------------------
   6. MOSTRAR LA BIBLIOTECA
   --------------------------------------------------------- */

function mostrarBibliotecaGuardada(
    recetas,
    seccionBiblioteca
) {

    seccionBiblioteca.replaceChildren();

    seccionBiblioteca.className =
        "library-section";


    const cabecera = document.createElement("div");
    cabecera.className = "section-heading";


    const titulo = crearElementoConTexto(
        "h2",
        "section-title",
        "Tu biblioteca"
    );


    const descripcion = crearElementoConTexto(
        "p",
        "section-description",
        crearTextoCantidadBiblioteca(recetas.length)
    );

    descripcion.id = "library-results-count";


    cabecera.append(
        titulo,
        descripcion
    );


    const lista = document.createElement("div");
    lista.className = "library-list";


    recetas.forEach(function (receta) {

        const tarjeta =
            crearTarjetaBiblioteca(receta);

        lista.appendChild(tarjeta);
    });


        const mensajeSinResultados =
        crearElementoConTexto(
            "p",
            "empty-library-text",
            ""
        );

    mensajeSinResultados.id =
        "library-empty-results";

    mensajeSinResultados.hidden = true;

    mensajeSinResultados.setAttribute(
        "role",
        "status"
    );

    mensajeSinResultados.setAttribute(
        "aria-live",
        "polite"
    );


    const botonLimpiarBusqueda =
        document.createElement("button");

    botonLimpiarBusqueda.className =
        "primary-button";

    botonLimpiarBusqueda.type = "button";

    botonLimpiarBusqueda.id =
        "clear-library-search";

    botonLimpiarBusqueda.textContent =
        "Limpiar búsqueda";

    botonLimpiarBusqueda.hidden = true;


    seccionBiblioteca.append(
        cabecera,
        lista,
        mensajeSinResultados,
        botonLimpiarBusqueda
    );
}


/* ---------------------------------------------------------
   7. CREAR UNA TARJETA DE LA BIBLIOTECA
   --------------------------------------------------------- */

function crearTarjetaBiblioteca(receta) {

    const tarjeta = document.createElement("a");

    tarjeta.className =
        "demo-placeholder library-recipe-card";

    tarjeta.href =
        `recipe.html?id=${encodeURIComponent(receta.id)}`;

    tarjeta.dataset.searchText =
        crearIndiceBusquedaReceta(receta);

    tarjeta.setAttribute(
        "aria-label",
        `Abrir la receta: ${receta.title}`
    );


    const etiqueta = crearElementoConTexto(
        "p",
        "demo-label",
        "Biblioteca"
    );


    const titulo = crearElementoConTexto(
        "h3",
        "demo-title",
        receta.title
    );


    const categorias = [
        ...receta.categories.cuisines,
        ...receta.categories.dishTypes,
        ...receta.categories.mainIngredients,
        ...receta.categories.cookingMethods
    ];


    const textoCategorias = crearElementoConTexto(
        "p",
        "demo-text",
        categorias.length > 0
            ? categorias.join(" · ")
            : "Sin categorías"
    );


    const resumen = crearElementoConTexto(
        "p",
        "demo-text",
        crearResumenReceta(receta)
    );


    tarjeta.append(
        etiqueta,
        titulo,
        textoCategorias,
        resumen
    );


    return tarjeta;
}


/* ---------------------------------------------------------
   8. CREAR EL ÍNDICE DE BÚSQUEDA DE UNA RECETA
   --------------------------------------------------------- */

function crearIndiceBusquedaReceta(receta) {

    const ingredientes =
        receta.ingredients.map(
            function (ingrediente) {
                return ingrediente.name;
            }
        );


    const categorias = [
        ...receta.categories.cuisines,
        ...receta.categories.dishTypes,
        ...receta.categories.mainIngredients,
        ...receta.categories.cookingMethods
    ];


    return normalizarTextoBusqueda(
        [
            receta.title,
            ...ingredientes,
            ...categorias
        ].join(" ")
    );
}


/* ---------------------------------------------------------
   9. ACTIVAR EL BUSCADOR DE RECETAS
   --------------------------------------------------------- */

function activarBuscadorRecetas(
    recetas,
    seccionBiblioteca
) {

    const buscador = document.getElementById(
        "buscador-recetas"
    );

    const tarjetas = Array.from(
        seccionBiblioteca.querySelectorAll(
            ".library-recipe-card"
        )
    );

    const descripcion = document.getElementById(
        "library-results-count"
    );

    const mensajeSinResultados =
        document.getElementById(
            "library-empty-results"
        );
        
            const botonLimpiarBusqueda =
        document.getElementById(
            "clear-library-search"
        );

    const filtroCategoria =
        obtenerFiltroCategoriaBiblioteca();
        
            /*
       Si la receta se abre desde una categoría,
       conservamos el origen en su dirección.
    */

    if (filtroCategoria) {

        tarjetas.forEach(function (tarjeta) {

            const direccion =
                tarjeta.getAttribute("href");

            tarjeta.setAttribute(
                "href",

                direccion +
                "&fromFamily=" +
                encodeURIComponent(
                    filtroCategoria.familia
                ) +
                "&fromCategory=" +
                encodeURIComponent(
                    filtroCategoria.categoria
                )
            );
        });
    }

    /*
       Si hemos llegado desde la pestaña Categorías,
       explicamos qué filtro está activo y ofrecemos
       una forma clara de retirarlo.
    */

    if (filtroCategoria) {

        const cabecera = seccionBiblioteca.querySelector(
            ".section-heading"
        );

        const titulo = cabecera.querySelector(
            ".section-title"
        );

        titulo.textContent =
            `Recetas de «${filtroCategoria.categoria}»`;


        const quitarFiltro =
            document.createElement("a");

        quitarFiltro.className = "primary-button";
        quitarFiltro.href = "index.html";

        quitarFiltro.textContent =
            "Ver todas las recetas";

        quitarFiltro.setAttribute(
            "aria-label",
            `Quitar el filtro ${filtroCategoria.categoria}`
        );


        cabecera.appendChild(quitarFiltro);
    }


    function actualizarResultados() {

        const consulta =
            normalizarTextoBusqueda(
                buscador.value
            );

        const palabras = consulta === ""
            ? []
            : consulta.split(" ");

        let cantidadVisible = 0;


        tarjetas.forEach(function (
            tarjeta,
            indice
        ) {

            const receta = recetas[indice];


            const coincideCategoria =
                !filtroCategoria ||
                recetaPerteneceCategoria(
                    receta,
                    filtroCategoria
                );


            const coincideBusqueda =
                palabras.every(
                    function (palabra) {

                        return tarjeta.dataset
                            .searchText
                            .includes(palabra);
                    }
                );


            const coincide =
                coincideCategoria &&
                coincideBusqueda;


            /*
               Las tarjetas tienen una regla visual
               display: block, por lo que controlamos
               su visibilidad mediante el estilo.
            */

            tarjeta.style.display =
                coincide
                    ? ""
                    : "none";


            if (coincide) {
                cantidadVisible += 1;
            }
        });


        if (
            consulta === "" &&
            !filtroCategoria
        ) {

            descripcion.textContent =
                crearTextoCantidadBiblioteca(
                    recetas.length
                );


        } else if (
            consulta === "" &&
            filtroCategoria
        ) {

            descripcion.textContent =
                cantidadVisible === 1
                    ? "1 receta en esta categoría"
                    : `${cantidadVisible} recetas en esta categoría`;


        } else {

            descripcion.textContent =
                crearTextoResultadosBusqueda(
                    cantidadVisible
                );
        }


        mensajeSinResultados.hidden =
            cantidadVisible !== 0;
            
                    botonLimpiarBusqueda.hidden =
            !(
                cantidadVisible === 0 &&
                consulta !== ""
            );


        if (cantidadVisible === 0) {

            if (
                filtroCategoria &&
                consulta !== ""
            ) {

                mensajeSinResultados.textContent =
                    `No hay recetas de «${filtroCategoria.categoria}» ` +
                    `que coincidan con «${buscador.value.trim()}».`;


            } else if (filtroCategoria) {

                mensajeSinResultados.textContent =
                    "No hay recetas guardadas en la categoría " +
                    `«${filtroCategoria.categoria}».`;


            } else {

                mensajeSinResultados.textContent =
                    "No hay recetas que coincidan con " +
                    `«${buscador.value.trim()}». ` +
                    "Prueba con otro título, ingrediente " +
                    "o categoría.";
            }
        }
    }

    botonLimpiarBusqueda.addEventListener(
        "click",
        function () {

            buscador.value = "";

            actualizarResultados();

            buscador.focus();
        }
    );

    buscador.addEventListener(
        "input",
        actualizarResultados
    );


    /*
       Aplicamos inmediatamente el posible filtro
       incluido en la dirección.
    */

    actualizarResultados();
}


/* ---------------------------------------------------------
   LEER EL FILTRO RECIBIDO DESDE CATEGORÍAS
   --------------------------------------------------------- */

function obtenerFiltroCategoriaBiblioteca() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    const familia = parametros.get("family");
    const categoria = parametros.get("category");


    const familiasPermitidas = new Set([
        "cuisines",
        "dishTypes",
        "mainIngredients",
        "cookingMethods"
    ]);


    if (
        !familiasPermitidas.has(familia) ||
        typeof categoria !== "string" ||
        categoria.trim() === ""
    ) {

        return null;
    }


    return {

        familia,

        categoria: categoria.trim(),

        valorNormalizado:
            normalizarTextoBusqueda(categoria)
    };
}


/* ---------------------------------------------------------
   COMPROBAR SI UNA RECETA PERTENECE A LA CATEGORÍA
   --------------------------------------------------------- */

function recetaPerteneceCategoria(
    receta,
    filtroCategoria
) {

    const valores =
        receta.categories[
            filtroCategoria.familia
        ] || [];


    return valores.some(function (valor) {

        return (
            normalizarTextoBusqueda(valor) ===
            filtroCategoria.valorNormalizado
        );
    });
}


/* ---------------------------------------------------------
   10. TEXTOS DE RECUENTO
   --------------------------------------------------------- */

function crearTextoCantidadBiblioteca(cantidad) {

    if (cantidad === 1) {
        return "1 receta guardada";
    }

    return `${cantidad} recetas guardadas`;
}


function crearTextoResultadosBusqueda(cantidad) {

    if (cantidad === 1) {
        return "1 receta encontrada";
    }

    return `${cantidad} recetas encontradas`;
}


/* ---------------------------------------------------------
   11. NORMALIZAR EL TEXTO DE BÚSQUEDA
   --------------------------------------------------------- */

function normalizarTextoBusqueda(texto) {

    return String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es")
        .trim()
        .replace(/\s+/g, " ");
}



/* =========================================================
   INTERFAZ PARA IMPORTAR RECETAS
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    prepararInterfazImportacion
);


/* ---------------------------------------------------------
   9. PREPARAR EL MENÚ Y EL CUADRO DE IMPORTACIÓN
   --------------------------------------------------------- */

function prepararInterfazImportacion() {

    const contenedorMenu = document.querySelector(
        ".recipe-options"
    );

    const botonMenu = document.getElementById(
        "library-options-button"
    );

    const menu = document.getElementById(
        "library-options-menu"
    );

    const botonAbrir = document.getElementById(
        "open-import-button"
    );

    const dialogo = document.getElementById(
        "import-recipe-dialog"
    );

    const botonCerrar = document.getElementById(
        "close-import-button"
    );

    const botonCancelar = document.getElementById(
        "cancel-import-button"
    );

    const selectorArchivo = document.getElementById(
        "import-recipe-file"
    );


    botonMenu.addEventListener(
        "click",
        function () {

            const estaAbierto = !menu.hidden;

            menu.hidden = estaAbierto;

            botonMenu.setAttribute(
                "aria-expanded",
                String(!estaAbierto)
            );
        }
    );


    botonAbrir.addEventListener(
        "click",
        function () {

            cerrarMenuBiblioteca(
                botonMenu,
                menu
            );

            limpiarCuadroImportacion();

            dialogo.showModal();
        }
    );


    botonCerrar.addEventListener(
        "click",
        function () {

            dialogo.close();
        }
    );


    botonCancelar.addEventListener(
        "click",
        function () {

            dialogo.close();
        }
    );


    /*
       Pulsar sobre el fondo oscuro también
       cierra el cuadro.
    */

    dialogo.addEventListener(
        "click",
        function (evento) {

            if (evento.target === dialogo) {
                dialogo.close();
            }
        }
    );


    /*
       Cerramos el menú al pulsar fuera.
    */

    document.addEventListener(
        "click",
        function (evento) {

            if (
                !contenedorMenu.contains(
                    evento.target
                )
            ) {

                cerrarMenuBiblioteca(
                    botonMenu,
                    menu
                );
            }
        }
    );


    selectorArchivo.addEventListener(
        "change",
        cargarArchivoEnImportador
    );
}


/* ---------------------------------------------------------
   10. CERRAR EL MENÚ DE LA BIBLIOTECA
   --------------------------------------------------------- */

function cerrarMenuBiblioteca(
    botonMenu,
    menu
) {

    menu.hidden = true;

    botonMenu.setAttribute(
        "aria-expanded",
        "false"
    );
}


/* ---------------------------------------------------------
   11. LIMPIAR EL CUADRO
   --------------------------------------------------------- */

function limpiarCuadroImportacion() {

    document.getElementById(
        "import-recipe-file"
    ).value = "";

    document.getElementById(
        "import-json-text"
    ).value = "";

    document.getElementById(
        "import-file-name"
    ).textContent =
        "Ningún archivo seleccionado";

    document.getElementById(
        "import-status"
    ).textContent = "";
}


/* ---------------------------------------------------------
   12. LEER EL ARCHIVO SELECCIONADO
   --------------------------------------------------------- */

async function cargarArchivoEnImportador(evento) {

    const archivo = evento.target.files[0];

    const nombre = document.getElementById(
        "import-file-name"
    );

    const texto = document.getElementById(
        "import-json-text"
    );

    const estado = document.getElementById(
        "import-status"
    );


    if (!archivo) {

        nombre.textContent =
            "Ningún archivo seleccionado";

        return;
    }


    nombre.textContent = archivo.name;
    estado.textContent = "Leyendo archivo…";


    try {

        texto.value = await archivo.text();

        estado.textContent =
            "Archivo preparado para importar.";


    } catch (error) {

        console.error(
            "No se ha podido leer el archivo:",
            error
        );

        texto.value = "";

        estado.textContent =
            "No se ha podido leer este archivo.";
    }
}



/* =========================================================
   VALIDAR Y GUARDAR UNA RECETA IMPORTADA
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    prepararBotonImportar
);


/* ---------------------------------------------------------
   13. PREPARAR EL BOTÓN IMPORTAR
   --------------------------------------------------------- */

function prepararBotonImportar() {

    const botonImportar = document.getElementById(
        "confirm-import-button"
    );


    botonImportar.addEventListener(
        "click",
        importarRecetaDesdeCuadro
    );
}


/* ---------------------------------------------------------
   14. VALIDAR E IMPORTAR LA RECETA
   --------------------------------------------------------- */

async function importarRecetaDesdeCuadro() {

    const botonImportar = document.getElementById(
        "confirm-import-button"
    );

    const campoTexto = document.getElementById(
        "import-json-text"
    );

    const estado = document.getElementById(
        "import-status"
    );

    const dialogo = document.getElementById(
        "import-recipe-dialog"
    );

    const contenido = campoTexto.value.trim();


    if (contenido === "") {

        estado.textContent =
            "Pega una receta JSON o selecciona un archivo.";

        campoTexto.focus();
        return;
    }


    botonImportar.disabled = true;
    botonImportar.textContent = "Comprobando…";

    estado.textContent =
        "Comprobando la receta…";


    try {

        let receta;


        try {

            receta = JSON.parse(contenido);

        } catch (error) {

            estado.textContent =
                "El contenido no es un JSON válido.";

            return;
        }

               /*
           Detectamos las exportaciones del formato
           anterior de Paco's antes de validarlas como
           recetas individuales de la PWA.
        */

        if (
            receta !== null &&
            typeof receta === "object" &&
            !Array.isArray(receta) &&
            Array.isArray(receta.recipes) &&
            Object.prototype.hasOwnProperty.call(
                receta,
                "version"
            )
        ) {

            estado.textContent =
                "Este archivo pertenece al formato anterior de Paco's. " +
                "Para importarlo, primero debe convertirse al formato pacos-recipe.";

            return;
        }
       
        const resultado =
            PacosRecipeValidator.validateRecipe(receta);


        if (!resultado.valid) {

            estado.textContent =
                "No se puede importar: " +
                resultado.errors.join(" ");

            return;
        }


        const recetaExistente =
            await PacosStorage.getRecipe(receta.id);

        let mensajeFinal;


        if (recetaExistente) {

            const esIdentica =
                PacosRecipeValidator.areRecipesIdentical(
                    recetaExistente,
                    receta
                );


            if (esIdentica) {

                estado.textContent =
                    "Esta receta ya está guardada y es idéntica.";

                return;
            }


            const sustituir = window.confirm(
                `Ya existe una receta llamada «${recetaExistente.title}» ` +
                "con el mismo identificador.\n\n" +
                "¿Quieres sustituirla por la receta importada?"
            );


            if (!sustituir) {

                estado.textContent =
                    "La receta existente no se ha modificado.";

                return;
            }


            await PacosStorage.replaceRecipe(receta);

            mensajeFinal =
                "Receta sustituida correctamente.";


        } else {

            await PacosStorage.addRecipe(receta);

            mensajeFinal =
                "Receta importada correctamente.";
        }


        estado.textContent = mensajeFinal;
        botonImportar.textContent = "Importada";


        window.setTimeout(
            function () {

                dialogo.close();
                window.location.reload();

            },
            900
        );


    } catch (error) {

        console.error(
            "No se ha podido importar la receta:",
            error
        );


        if (error.name === "ConstraintError") {

            estado.textContent =
                "Ya existe una receta con este identificador. No se ha sobrescrito.";

        } else {

            estado.textContent =
                "No se ha podido guardar la receta.";
        }


    } finally {

        botonImportar.disabled = false;

        if (botonImportar.textContent !== "Importada") {
            botonImportar.textContent = "Importar";
        }
    }
}



/* =========================================================
   COPIA COMPLETA DE LA BIBLIOTECA
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    prepararCopiaSeguridad
);


/* ---------------------------------------------------------
   15. PREPARAR LA COPIA DE SEGURIDAD
   --------------------------------------------------------- */

function prepararCopiaSeguridad() {

    const botonCopia = document.getElementById(
        "export-backup-button"
    );


    botonCopia.addEventListener(
        "click",
        descargarCopiaSeguridad
    );
}


/* ---------------------------------------------------------
   16. CREAR Y DESCARGAR LA COPIA
   --------------------------------------------------------- */

async function descargarCopiaSeguridad() {

    const botonCopia = document.getElementById(
        "export-backup-button"
    );

    const botonMenu = document.getElementById(
        "library-options-button"
    );

    const menu = document.getElementById(
        "library-options-menu"
    );


    botonCopia.disabled = true;
    botonCopia.textContent = "Preparando…";


    try {

        const resultados = await Promise.all([
            PacosStorage.getAllRecipes(),
            PacosStorage.getAllNotes()
        ]);

        const recetas = resultados[0];
        const notas = resultados[1];


        const copia = {

            format: "pacos-backup",
            schemaVersion: 1,

            exportedAt:
                new Date().toISOString(),

            recipes: recetas,
            notes: notas
        };


        const contenido = JSON.stringify(
            copia,
            null,
            2
        );

        const archivo = new Blob(
            [contenido],
            {
                type: "application/json"
            }
        );

        const direccionTemporal =
            URL.createObjectURL(archivo);

        const descarga =
            document.createElement("a");

        descarga.href = direccionTemporal;

        descarga.download =
            crearNombreCopiaSeguridad();

        descarga.hidden = true;


        document.body.appendChild(descarga);

        descarga.click();
        descarga.remove();


        window.setTimeout(
            function () {

                URL.revokeObjectURL(
                    direccionTemporal
                );
            },
            1000
        );


        cerrarMenuBiblioteca(
            botonMenu,
            menu
        );


    } catch (error) {

        console.error(
            "No se ha podido crear la copia de seguridad:",
            error
        );

        window.alert(
            "No se ha podido crear la copia de seguridad."
        );


    } finally {

        botonCopia.disabled = false;

        botonCopia.textContent =
            "Crear copia de seguridad";
    }
}


/* ---------------------------------------------------------
   17. NOMBRE DEL ARCHIVO DE COPIA
   --------------------------------------------------------- */

function crearNombreCopiaSeguridad() {

    const fecha = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

    return (
        "pacos-copia-seguridad-" +
        fecha +
        ".json"
    );
}



/* =========================================================
   VALIDAR UNA COPIA ANTES DE RESTAURARLA
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    prepararRestauracionCopia
);


/* ---------------------------------------------------------
   18. PREPARAR EL SELECTOR DE COPIAS
   --------------------------------------------------------- */

function prepararRestauracionCopia() {

    const botonRestaurar = document.getElementById(
        "restore-backup-button"
    );

    const selectorCopia = document.getElementById(
        "restore-backup-file"
    );


    botonRestaurar.addEventListener(
        "click",
        function () {

            const botonMenu = document.getElementById(
                "library-options-button"
            );

            const menu = document.getElementById(
                "library-options-menu"
            );


            cerrarMenuBiblioteca(
                botonMenu,
                menu
            );


            /*
               Vaciamos el selector para que sea posible
               volver a elegir el mismo archivo.
            */

            selectorCopia.value = "";
            selectorCopia.click();
        }
    );


    selectorCopia.addEventListener(
        "change",
        validarArchivoCopiaSeguridad
    );
}


/* ---------------------------------------------------------
   19. LEER Y VALIDAR LA COPIA
   --------------------------------------------------------- */

async function validarArchivoCopiaSeguridad(evento) {

    const archivo = evento.target.files[0];


    if (!archivo) {
        return;
    }


    try {

        const contenido = await archivo.text();

        let copia;


        try {

            copia = JSON.parse(contenido);

        } catch (error) {

            window.alert(
                "El archivo seleccionado no contiene un JSON válido."
            );

            return;
        }


        const resultado =
            PacosRecipeValidator.validateBackup(copia);


        if (!resultado.valid) {

            const erroresVisibles =
                resultado.errors
                    .slice(0, 5)
                    .join("\n");


            const erroresRestantes =
                resultado.errors.length > 5
                    ? (
                        "\n\nY " +
                        (resultado.errors.length - 5) +
                        " errores más."
                    )
                    : "";


            window.alert(
                "Este archivo no es una copia válida de Paco's.\n\n" +
                erroresVisibles +
                erroresRestantes
            );

            return;
        }


        const numeroRecetas =
            copia.recipes.length;

        const numeroNotas =
            copia.notes.length;


                const confirmarRestauracion =
            window.confirm(
                "La copia de seguridad es válida.\n\n" +
                `${numeroRecetas} recetas\n` +
                `${numeroNotas} notas personales\n\n` +
                "Si continúas, la biblioteca actual será " +
                "sustituida completamente por esta copia.\n\n" +
                "Las recetas que no estén incluidas en el " +
                "archivo dejarán de aparecer.\n\n" +
                "¿Quieres restaurar la copia?"
            );


        if (!confirmarRestauracion) {
            return;
        }


        try {

            await PacosStorage.replaceLibrary(
                copia.recipes,
                copia.notes
            );


        } catch (error) {

            console.error(
                "No se ha podido restaurar la copia:",
                error
            );

            window.alert(
                "No se ha podido restaurar la copia. " +
                "La biblioteca anterior se conserva."
            );

            return;
        }


        window.alert(
            "La biblioteca se ha restaurado correctamente."
        );

        window.location.reload();


    } catch (error) {

        console.error(
            "No se ha podido comprobar la copia:",
            error
        );

        window.alert(
            "No se ha podido leer la copia de seguridad."
        );
    }
}