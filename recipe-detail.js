"use strict";


/* =========================================================
   PACO'S
   Ficha completa de una receta
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    cargarFichaReceta
);


/* ---------------------------------------------------------
   1. CARGAR LA RECETA
   --------------------------------------------------------- */

async function cargarFichaReceta() {

    const contenedor = document.getElementById(
        "recipe-detail"
    );


    const parametros = new URLSearchParams(
        window.location.search
    );

    const recipeId = parametros.get("id");


    /*
       Toda ficha debe corresponder a una receta
       guardada en la biblioteca.
    */

    if (!recipeId) {

        contenedor.replaceChildren();

        const mensaje = crearElemento(
            "p",
            "recipe-error",
            "No se ha indicado qué receta debe abrirse."
        );

        contenedor.appendChild(mensaje);

        return;
    }


    try {

        const receta =
            await PacosStorage.getRecipe(
                recipeId
            );


        if (!receta) {

            throw new Error(
                "La receta no existe en la biblioteca."
            );
        }


        document.title =
            `${receta.title} — Paco's`;


        mostrarFichaReceta(
            receta,
            contenedor
        );
        
                prepararEnlaceEdicion(
            receta
        );

    } catch (error) {

        console.error(error);

        contenedor.replaceChildren();


        const mensaje = crearElemento(
            "p",
            "recipe-error",
            "No se ha encontrado esta receta en la biblioteca."
        );


        contenedor.appendChild(mensaje);
    }
}

/* ---------------------------------------------------------
   REGRESAR A LA CATEGORÍA DE ORIGEN
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    prepararRegresoCategoria
);


function prepararRegresoCategoria() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    const familia =
        parametros.get("fromFamily");

    const categoria =
        parametros.get("fromCategory");


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
        return;
    }


    const botonRegreso =
        document.querySelector(
            ".back-button"
        );


    botonRegreso.href =
        "index.html?family=" +
        encodeURIComponent(familia) +
        "&category=" +
        encodeURIComponent(
            categoria.trim()
        );


    botonRegreso.setAttribute(
        "aria-label",
        `Volver a las recetas de ${categoria.trim()}`
    );
}

/* ---------------------------------------------------------
   PREPARAR EL ENLACE DE EDICIÓN
   --------------------------------------------------------- */

function prepararEnlaceEdicion(receta) {

    const enlace = document.getElementById(
        "edit-recipe-link"
    );

    if (!enlace) {
        return;
    }

    const parametrosActuales =
        new URLSearchParams(
            window.location.search
        );

    const destino = new URLSearchParams();

    destino.set(
        "id",
        receta.id
    );


    const familia =
        parametrosActuales.get("fromFamily");

    const categoria =
        parametrosActuales.get("fromCategory");


    if (
        familia &&
        categoria
    ) {

        destino.set(
            "fromFamily",
            familia
        );

        destino.set(
            "fromCategory",
            categoria
        );
    }


    enlace.href =
        `editor.html?${destino.toString()}`;

    enlace.hidden = false;
}

/* ---------------------------------------------------------
   2. CONSTRUIR LA FICHA COMPLETA
   --------------------------------------------------------- */

function mostrarFichaReceta(receta, contenedor) {

    contenedor.replaceChildren();

    const cabecera = crearCabeceraReceta(receta);
    const contenido = crearContenidoReceta(receta);

    contenedor.append(
        cabecera,
        contenido
    );
}


/* ---------------------------------------------------------
   3. CABECERA DE LA RECETA
   --------------------------------------------------------- */

function crearCabeceraReceta(receta) {

    const cabecera = document.createElement("section");
    cabecera.className = "recipe-hero";

       const etiqueta = crearElemento(
        "p",
        "recipe-demo-label",
        "Biblioteca"
    );

    const titulo = crearElemento(
        "h1",
        "recipe-title",
        receta.title
    );

    const categorias = document.createElement("div");
    categorias.className = "recipe-categories";

    const nombresCategorias = [
        ...receta.categories.cuisines,
        ...receta.categories.dishTypes,
        ...receta.categories.mainIngredients,
        ...receta.categories.cookingMethods
    ];

    nombresCategorias.forEach(function (nombre) {

        const categoria = crearElemento(
            "span",
            "recipe-category",
            nombre
        );

        categorias.appendChild(categoria);
    });

    cabecera.append(
        etiqueta,
        titulo,
        categorias
    );

    return cabecera;
}


/* ---------------------------------------------------------
   4. CONTENIDO PRINCIPAL
   --------------------------------------------------------- */

function crearContenidoReceta(receta) {

    const contenido = document.createElement("div");
    contenido.className = "recipe-content-grid";

    const resumen = crearResumen(receta);
    const ingredientes = crearIngredientes(receta);
    const pasos = crearPasos(receta);

    contenido.append(
        resumen,
        ingredientes,
        pasos
    );

    return contenido;
}


/* ---------------------------------------------------------
   5. RESUMEN
   --------------------------------------------------------- */

function crearResumen(receta) {

    const seccion = document.createElement("section");
    seccion.className = "recipe-information-card";

    const titulo = crearElemento(
        "h2",
        "recipe-section-title",
        "Información"
    );

    const datos = document.createElement("div");
    datos.className = "recipe-statistics";


	const raciones = crearSelectorRaciones(receta);

    const ingredientes = crearDatoResumen(
        receta.ingredients.length,
        receta.ingredients.length === 1
            ? "Ingrediente"
            : "Ingredientes"
    );

    const pasos = crearDatoResumen(
        receta.steps.length,
        receta.steps.length === 1
            ? "Paso"
            : "Pasos"
    );


    datos.append(
        raciones,
        ingredientes,
        pasos
    );

    seccion.append(
        titulo,
        datos
    );

    return seccion;
}


function crearDatoResumen(numero, nombre) {

    const dato = document.createElement("div");
    dato.className = "recipe-statistic";

    const valor = crearElemento(
        "strong",
        "recipe-statistic-value",
        String(numero)
    );

    const etiqueta = crearElemento(
        "span",
        "recipe-statistic-label",
        nombre
    );

    dato.append(
        valor,
        etiqueta
    );

    return dato;
}

function crearSelectorRaciones(receta) {

    let racionesSeleccionadas = receta.servings;


    const dato = document.createElement("div");

    dato.className =
        "recipe-statistic recipe-servings-statistic";


    const control = document.createElement("div");
    control.className = "recipe-servings-control";


    const reducir = document.createElement("button");

    reducir.className = "recipe-servings-button";
    reducir.type = "button";
    reducir.textContent = "−";

    reducir.setAttribute(
        "aria-label",
        "Reducir una ración"
    );


    const valor = crearElemento(
        "strong",
        "recipe-statistic-value recipe-servings-value",
        String(racionesSeleccionadas)
    );


    const aumentar = document.createElement("button");

    aumentar.className = "recipe-servings-button";
    aumentar.type = "button";
    aumentar.textContent = "+";

    aumentar.setAttribute(
        "aria-label",
        "Añadir una ración"
    );


    const etiqueta = crearElemento(
        "span",
        "recipe-statistic-label",
        "Raciones"
    );


    function actualizarSelector() {

        valor.textContent = String(
            racionesSeleccionadas
        );

        etiqueta.textContent =
            racionesSeleccionadas === 1
                ? "Ración"
                : "Raciones";

        reducir.disabled =
            racionesSeleccionadas === 1;
        
        actualizarCantidadesIngredientes(
            receta,
            racionesSeleccionadas
        );
    }


    reducir.addEventListener(
        "click",
        function () {

            racionesSeleccionadas -= 1;

            actualizarSelector();
        }
    );


    aumentar.addEventListener(
        "click",
        function () {

            racionesSeleccionadas += 1;

            actualizarSelector();
        }
    );


    control.append(
        reducir,
        valor,
        aumentar
    );

    dato.append(
        control,
        etiqueta
    );


    actualizarSelector();

    return dato;
}

/* ---------------------------------------------------------
   6. INGREDIENTES
   --------------------------------------------------------- */

function crearIngredientes(receta) {

    const seccion = document.createElement("section");
    seccion.className =
        "recipe-information-card recipe-ingredients-card";

    const titulo = crearElemento(
        "h2",
        "recipe-section-title",
        "Ingredientes"
    );

    const lista = document.createElement("ul");
    lista.className = "recipe-ingredients-list";


        receta.ingredients.forEach(function (
        ingrediente,
        indice
    ) {

        const elemento = document.createElement("li");
        elemento.className = "recipe-ingredient";

        const cantidad = crearElemento(
            "span",
            "recipe-ingredient-quantity",
            formatearCantidad(ingrediente)
        );
        
                cantidad.dataset.ingredientIndex =
            String(indice);

        const nombre = crearElemento(
            "span",
            "recipe-ingredient-name",
            ingrediente.name
        );

        elemento.append(
            cantidad,
            nombre
        );

        lista.appendChild(elemento);
    });


    seccion.append(
        titulo,
        lista
    );

    return seccion;
}

function actualizarCantidadesIngredientes(
    receta,
    racionesSeleccionadas
) {

    const factor =
        racionesSeleccionadas /
        receta.servings;


    const cantidades = document.querySelectorAll(
        "[data-ingredient-index]"
    );


    cantidades.forEach(function (elemento) {

        const indice = Number(
            elemento.dataset.ingredientIndex
        );

        const ingrediente =
            receta.ingredients[indice];


        elemento.textContent =
            formatearCantidad(
                ingrediente,
                factor
            );
    });
}

/* ---------------------------------------------------------
   7. PASOS
   --------------------------------------------------------- */

function crearPasos(receta) {

    const seccion = document.createElement("section");
    seccion.className =
        "recipe-information-card recipe-steps-card";

    const titulo = crearElemento(
        "h2",
        "recipe-section-title",
        "Preparación"
    );

    const lista = document.createElement("ol");
    lista.className = "recipe-steps-list";


    receta.steps.forEach(function (textoPaso) {

        const paso = document.createElement("li");
        paso.className = "recipe-step";

        const texto = crearElemento(
            "p",
            "recipe-step-text",
            textoPaso
        );

        paso.appendChild(texto);
        lista.appendChild(paso);
    });


    seccion.append(
        titulo,
        lista
    );

    return seccion;
}


/* ---------------------------------------------------------
   8. ESCALAR Y MOSTRAR CANTIDADES
   --------------------------------------------------------- */

function formatearCantidad(
    ingrediente,
    factor = 1
) {

    const resultado = escalarCantidad(
        ingrediente,
        factor
    );


    if (resultado.type === "free") {
        return "Al gusto";
    }


    if (resultado.type === "range") {

        const inferior = formatearNumero(
            resultado.lower
        );

        const superior = formatearNumero(
            resultado.upper
        );

        const unidad = traducirUnidad(
            resultado.unit,
            resultado.upper
        );

        return `${inferior}–${superior} ${unidad}`;
    }


    let cantidad = resultado.quantity;
    let unidad = resultado.unit;


    /*
       A partir de 1000 gramos resulta más natural
       mostrar la cantidad en kilogramos.
    */

    if (
        unidad === "gram" &&
        cantidad >= 1000
    ) {

        cantidad /= 1000;
        unidad = "kilogram";
    }


    const numero = formatearNumero(cantidad);

    const textoUnidad = traducirUnidad(
        unidad,
        cantidad
    );


    return `${numero} ${textoUnidad}`.trim();
}


function escalarCantidad(
    ingrediente,
    factor
) {

    if (
        ingrediente.scaling === "free" ||
        ingrediente.unit === "toTaste" ||
        ingrediente.quantity === null ||
        factor <= 0
    ) {

        return {
            type: "free"
        };
    }


    const cantidadOriginal =
        Number(ingrediente.quantity);


    switch (ingrediente.scaling) {

    case "exact":

        return {
            type: "value",
            quantity:
                cantidadOriginal * factor,
            unit: ingrediente.unit
        };


    case "culinary":

        return calcularCantidadCulinaria(
            cantidadOriginal * factor,
            ingrediente.unit
        );


    case "discrete":

        return calcularCantidadDiscreta(
            cantidadOriginal * factor,
            ingrediente.unit
        );


    case "soft":

        return calcularCantidadCulinaria(
            cantidadOriginal *
                Math.pow(factor, 0.63),

            ingrediente.unit
        );


    default:

        return {
            type: "free"
        };
    }
}


function calcularCantidadCulinaria(
    cantidad,
    unidad
) {

    /*
       Las piezas divisibles se expresan en medias
       unidades y siempre se redondean hacia arriba.
    */

    if (unidad === "unit") {

        return {
            type: "value",

            quantity: Math.max(
                0.5,
                Math.ceil(
                    cantidad * 2
                ) / 2
            ),

            unit: unidad
        };
    }

    if (unidad === "teaspoon") {

        const cucharaditas =
            redondearAlIncremento(
                cantidad,
                0.25
            );

        const cucharadas =
            cucharaditas / 3;

        const cucharadasRedondeadas =
            redondearAlIncremento(
                cucharadas,
                0.5
            );


        if (
            cucharaditas >= 3 &&
            Math.abs(
                cucharadas -
                cucharadasRedondeadas
            ) < 0.0001
        ) {

            return {
                type: "value",
                quantity:
                    cucharadasRedondeadas,
                unit: "tablespoon"
            };
        }


        return {
            type: "value",
            quantity: cucharaditas,
            unit: "teaspoon"
        };
    }


    if (unidad === "tablespoon") {

        return {
            type: "value",

            quantity:
                redondearAlIncremento(
                    cantidad,
                    0.5
                ),

            unit: "tablespoon"
        };
    }


    if (unidad === "cup") {

        return {
            type: "value",

            quantity:
                redondearAlIncremento(
                    cantidad,
                    0.25
                ),

            unit: "cup"
        };
    }


    return {
        type: "value",
        quantity: cantidad,
        unit: unidad
    };
}


function calcularCantidadDiscreta(
    cantidad,
    unidad
) {

    const enteroMasCercano =
        Math.round(cantidad);


    if (
        Math.abs(
            cantidad -
            enteroMasCercano
        ) < 0.0001
    ) {

        return {
            type: "value",
            quantity: enteroMasCercano,
            unit: unidad
        };
    }


    const inferior = Math.max(
        1,
        Math.floor(cantidad)
    );

    const superior = Math.max(
        1,
        Math.ceil(cantidad)
    );


    if (inferior === superior) {

        return {
            type: "value",
            quantity: inferior,
            unit: unidad
        };
    }


    return {
        type: "range",
        lower: inferior,
        upper: superior,
        unit: unidad
    };
}


function redondearAlIncremento(
    valor,
    incremento
) {

    if (valor <= 0) {
        return 0;
    }


    return Math.max(
        incremento,

        Math.round(
            valor / incremento
        ) * incremento
    );
}


function formatearNumero(valor) {

    const entero = Math.floor(valor);
    const fraccion = valor - entero;

    let textoFraccion = "";


    if (
        Math.abs(fraccion - 0.25) <
        0.001
    ) {

        textoFraccion = "¼";

    } else if (
        Math.abs(fraccion - 0.5) <
        0.001
    ) {

        textoFraccion = "½";

    } else if (
        Math.abs(fraccion - 0.75) <
        0.001
    ) {

        textoFraccion = "¾";
    }


    if (textoFraccion !== "") {

        if (entero === 0) {
            return textoFraccion;
        }

        return `${entero}${textoFraccion}`;
    }


    return new Intl.NumberFormat(
        "es-ES",
        {
            maximumFractionDigits: 2
        }
    ).format(valor);
}


function traducirUnidad(
    unidad,
    cantidad
) {

    const esSingular =
        Math.abs(cantidad - 1) <
        0.001;


    const unidades = {

        microgram: "µg",

        milligram: "mg",

        gram: "g",

        kilogram: "kg",

        milliliter: "ml",

        centiliter: "cl",

        deciliter: "dl",

        liter: "l",

        unit:
            esSingular
                ? "unidad"
                : "unidades",

        tablespoon:
            esSingular
                ? "cucharada"
                : "cucharadas",

        teaspoon:
            esSingular
                ? "cucharadita"
                : "cucharaditas",

        clove:
            esSingular
                ? "diente"
                : "dientes",

        cup:
            esSingular
                ? "taza"
                : "tazas",

        toTaste: "al gusto"
    };


    return unidades[unidad] || unidad;
}


/* ---------------------------------------------------------
   9. FUNCIÓN AUXILIAR
   --------------------------------------------------------- */

function crearElemento(
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
   MENÚ Y EXPORTACIÓN DE UNA RECETA
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    prepararMenuOpcionesReceta
);


/* ---------------------------------------------------------
   10. PREPARAR EL MENÚ DE OPCIONES
   --------------------------------------------------------- */

function prepararMenuOpcionesReceta() {

    const contenedor = document.querySelector(
        ".recipe-options"
    );

    const botonMenu = document.getElementById(
        "recipe-options-button"
    );

    const menu = document.getElementById(
        "recipe-options-menu"
    );

    const botonExportar = document.getElementById(
        "export-recipe-button"
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


    botonExportar.addEventListener(
        "click",
        exportarRecetaActual
    );


    /*
       Cerramos el menú al pulsar fuera.
    */

    document.addEventListener(
        "click",
        function (evento) {

            if (!contenedor.contains(evento.target)) {

                cerrarMenuOpcionesReceta(
                    botonMenu,
                    menu
                );
            }
        }
    );


    /*
       También puede cerrarse con la tecla Escape.
    */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (evento.key === "Escape") {

                cerrarMenuOpcionesReceta(
                    botonMenu,
                    menu
                );

                botonMenu.focus();
            }
        }
    );
}


/* ---------------------------------------------------------
   11. CERRAR EL MENÚ
   --------------------------------------------------------- */

function cerrarMenuOpcionesReceta(
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
   12. OBTENER Y EXPORTAR LA RECETA ACTUAL
   --------------------------------------------------------- */

async function exportarRecetaActual() {

    const botonExportar = document.getElementById(
        "export-recipe-button"
    );

    const botonMenu = document.getElementById(
        "recipe-options-button"
    );

    const menu = document.getElementById(
        "recipe-options-menu"
    );


    botonExportar.disabled = true;
    botonExportar.textContent = "Preparando…";


    try {

        const receta =
            await obtenerRecetaActualParaExportar();


        const contenido = JSON.stringify(
            receta,
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


        const descarga = document.createElement("a");

        descarga.href = direccionTemporal;

        descarga.download =
            crearNombreArchivoReceta(receta.title);

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


        cerrarMenuOpcionesReceta(
            botonMenu,
            menu
        );


    } catch (error) {

        console.error(
            "No se ha podido exportar la receta:",
            error
        );

        window.alert(
            "No se ha podido exportar esta receta."
        );


    } finally {

        botonExportar.disabled = false;
        botonExportar.textContent =
            "Exportar receta";
    }
}


/* ---------------------------------------------------------
   13. LEER LA RECETA MOSTRADA
   --------------------------------------------------------- */

async function obtenerRecetaActualParaExportar() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    const recipeId = parametros.get("id");


    if (!recipeId) {

        throw new Error(
            "No se ha indicado qué receta debe exportarse."
        );
    }


    const receta =
        await PacosStorage.getRecipe(
            recipeId
        );


    if (!receta) {

        throw new Error(
            "La receta no existe en la biblioteca."
        );
    }


    return receta;
}


/* ---------------------------------------------------------
   14. CREAR UN NOMBRE DE ARCHIVO SEGURO
   --------------------------------------------------------- */

function crearNombreArchivoReceta(titulo) {

    const nombreBase = titulo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");


    return (
        nombreBase || "receta"
    ) + ".pacos-recipe.json";
}



/* =========================================================
   COLOR OPCIONAL DE LA TARJETA
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    prepararSelectorColorTarjeta
);


async function prepararSelectorColorTarjeta() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    const recipeId = parametros.get("id");

    if (!recipeId) {
        return;
    }

    const botonAbrir = document.getElementById(
        "change-card-color-button"
    );

    const dialogo = document.getElementById(
        "card-color-dialog"
    );

    const formulario = document.getElementById(
        "card-color-form"
    );

    const cerrarDialogo = function () {
        dialogo.close();
        botonAbrir.focus();
    };


    try {

        const receta = await PacosStorage.getRecipe(recipeId);

        if (!receta) {
            return;
        }

        botonAbrir.hidden = false;

        botonAbrir.addEventListener(
            "click",
            async function () {

                cerrarMenuOpcionesReceta(
                    document.getElementById(
                        "recipe-options-button"
                    ),
                    document.getElementById(
                        "recipe-options-menu"
                    )
                );

                const preferencia =
                    await PacosStorage.getCardColor(recipeId);

                construirOpcionesColorTarjeta(
                    preferencia
                        ? preferencia.color
                        : PacosCardColors.AUTOMATIC
                );

                document.getElementById(
                    "card-color-status"
                ).textContent = "";

                dialogo.showModal();
            }
        );

        document.getElementById(
            "close-card-color-dialog-button"
        ).addEventListener("click", cerrarDialogo);

        document.getElementById(
            "cancel-card-color-button"
        ).addEventListener("click", cerrarDialogo);

        dialogo.addEventListener(
            "click",
            function (evento) {
                if (evento.target === dialogo) {
                    cerrarDialogo();
                }
            }
        );

        formulario.addEventListener(
            "submit",
            async function (evento) {

                evento.preventDefault();

                const seleccion = formulario.elements.cardColor.value;
                const estado = document.getElementById(
                    "card-color-status"
                );
                const botonGuardar = formulario.querySelector(
                    'button[type="submit"]'
                );

                botonGuardar.disabled = true;
                estado.textContent = "Guardando…";

                try {

                    if (
                        seleccion ===
                        PacosCardColors.AUTOMATIC
                    ) {
                        await PacosStorage.removeCardColor(recipeId);

                    } else if (
                        PacosCardColors.isValidColor(seleccion)
                    ) {
                        await PacosStorage.setCardColor(
                            recipeId,
                            seleccion
                        );

                    } else {
                        throw new Error(
                            "El color seleccionado no es válido."
                        );
                    }

                    cerrarDialogo();

                } catch (error) {

                    console.error(
                        "No se ha podido guardar el color:",
                        error
                    );

                    estado.textContent =
                        "No se ha podido guardar el color.";

                } finally {
                    botonGuardar.disabled = false;
                }
            }
        );

    } catch (error) {

        console.error(
            "No se ha podido preparar el selector de color:",
            error
        );
    }
}


function construirOpcionesColorTarjeta(colorActual) {

    const contenedor = document.getElementById(
        "card-color-options"
    );

    contenedor.replaceChildren();

    const automatico = crearOpcionColorTarjeta({
        id: PacosCardColors.AUTOMATIC,
        name: "Automático",
        automatic: true
    }, colorActual);

    automatico.classList.add("card-color-option-automatic");
    contenedor.appendChild(automatico);

    [
        ["warm", "Tonos cálidos"],
        ["opposite", "Tonos opuestos"]
    ].forEach(function (grupo) {

        const seccion = document.createElement("fieldset");
        seccion.className = "card-color-group";

        const titulo = document.createElement("legend");
        titulo.textContent = grupo[1];

        const opciones = document.createElement("div");
        opciones.className = "card-color-grid";

        PacosCardColors.getColorsByGroup(grupo[0]).forEach(
            function (color) {
                opciones.appendChild(
                    crearOpcionColorTarjeta(color, colorActual)
                );
            }
        );

        seccion.append(titulo, opciones);
        contenedor.appendChild(seccion);
    });
}


function crearOpcionColorTarjeta(color, colorActual) {

    const etiqueta = document.createElement("label");
    etiqueta.className = "card-color-option";

    const campo = document.createElement("input");
    campo.type = "radio";
    campo.name = "cardColor";
    campo.value = color.id;
    campo.checked = color.id === colorActual;

    const muestra = document.createElement("span");
    muestra.className = "card-color-swatch";
    muestra.setAttribute("aria-hidden", "true");

    if (color.automatic) {
        muestra.classList.add("card-color-swatch-automatic");
    } else {
        muestra.dataset.cardColor = color.id;
    }

    const nombre = document.createElement("span");
    nombre.className = "card-color-name";
    nombre.textContent = color.name;

    etiqueta.append(campo, muestra, nombre);

    return etiqueta;
}



/* =========================================================
   ELIMINAR UNA RECETA GUARDADA
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    prepararEliminacionReceta
);


/* ---------------------------------------------------------
   15. MOSTRAR LA OPCIÓN CUANDO CORRESPONDA
   --------------------------------------------------------- */

async function prepararEliminacionReceta() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    const recipeId = parametros.get("id");


        /*
       Si no hay identificador, no existe una receta
       guardada sobre la que ofrecer la eliminación.
    */

    if (!recipeId) {
        return;
    }


    const botonEliminar = document.getElementById(
        "delete-recipe-button"
    );


    try {

        const receta =
            await PacosStorage.getRecipe(recipeId);


        /*
           Tampoco mostramos la acción si la receta
           no existe realmente en la biblioteca.
        */

        if (!receta) {
            return;
        }


        botonEliminar.hidden = false;


        botonEliminar.addEventListener(
            "click",
            function () {

                eliminarRecetaGuardada(receta);
            }
        );


    } catch (error) {

        console.error(
            "No se ha podido preparar la eliminación:",
            error
        );
    }
}


/* ---------------------------------------------------------
   16. CONFIRMAR Y ELIMINAR
   --------------------------------------------------------- */

async function eliminarRecetaGuardada(receta) {

    const botonEliminar = document.getElementById(
        "delete-recipe-button"
    );


    const confirmar = window.confirm(
        `¿Quieres eliminar «${receta.title}»?\n\n` +
        "También se eliminarán sus notas personales y " +
        "su color de tarjeta.\n\n" +
        "Esta acción no se puede deshacer, salvo restaurando " +
        "una copia de seguridad."
    );


    if (!confirmar) {
        return;
    }


    botonEliminar.disabled = true;
    botonEliminar.textContent = "Eliminando…";


    try {

        await PacosStorage.deleteRecipeAndNotes(
            receta.id
        );


        window.location.replace(
            "index.html"
        );


    } catch (error) {

        console.error(
            "No se ha podido eliminar la receta:",
            error
        );

        window.alert(
            "No se ha podido eliminar la receta."
        );

        botonEliminar.disabled = false;
        botonEliminar.textContent =
            "Eliminar receta";
    }
}
