"use strict";


/* =========================================================
   PACO'S
   Editor visual de recetas
   ========================================================= */

let recetaEnEdicion = null;

const CUSTOM_UNIT_VALUE = "__custom__";

const PREDEFINED_UNITS = new Set([
    "microgram",
    "milligram",
    "gram",
    "kilogram",
    "milliliter",
    "centiliter",
    "deciliter",
    "liter",
    "unit",
    "clove",
    "tablespoon",
    "teaspoon",
    "cup",
    "toTaste"
]);

document.addEventListener(
    "DOMContentLoaded",
    prepararEditor
);

/* ---------------------------------------------------------
   1. PREPARAR EL EDITOR
   --------------------------------------------------------- */

async function prepararEditor() {

    const ingredientes = document.getElementById(
        "ingredients-editor"
    );

    const pasos = document.getElementById(
        "steps-editor"
    );


    ingredientes.replaceChildren();
    pasos.replaceChildren();


    document
        .getElementById("add-ingredient-button")
        .addEventListener(
            "click",
            añadirFilaIngrediente
        );


    document
        .getElementById("add-step-button")
        .addEventListener(
            "click",
            añadirFilaPaso
        );


    document
        .getElementById("recipe-form")
        .addEventListener(
            "submit",
            comprobarReceta
        );


    const parametros = new URLSearchParams(
        window.location.search
    );

    const recipeId = parametros.get("id");


    /*
       Sin identificador, el editor continúa
       funcionando como creador de recetas.
    */

    if (!recipeId) {

        añadirFilaIngrediente();
        añadirFilaPaso();

        return;
    }


    /*
       Con identificador, cargamos la receta existente
       y activamos el modo de edición.
    */

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


        recetaEnEdicion = receta;

        configurarEditorParaEdicion(
            receta
        );

        cargarRecetaEnFormulario(
            receta
        );


    } catch (error) {

        console.error(
            "No se ha podido abrir la receta para editarla:",
            error
        );

        window.alert(
            "No se ha encontrado la receta que quieres editar."
        );

        window.location.replace(
            "index.html"
        );
    }
}


/* ---------------------------------------------------------
   CONFIGURAR EL MODO DE EDICIÓN
   --------------------------------------------------------- */

function configurarEditorParaEdicion(receta) {

    document.title =
        `Editar ${receta.title} — Paco's`;

    document.querySelector(
        ".editor-page-title"
    ).textContent =
        "Editar receta";

    document.querySelector(
        ".save-recipe-button"
    ).textContent =
        "Guardar cambios";


    const botonCerrar = document.querySelector(
        ".editor-close-button"
    );

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


    botonCerrar.href =
        `recipe.html?${destino.toString()}`;
    botonCerrar.setAttribute(
        "aria-label",
        "Cerrar y volver a la receta"
    );


    const nota = document.querySelector(
        ".editor-automatic-data-note"
    );

    nota.textContent =
        "Paco’s conservará el identificador y la fecha de creación, " +
        "y actualizará automáticamente la fecha de modificación.";
}


/* ---------------------------------------------------------
   CARGAR LOS DATOS EXISTENTES EN EL FORMULARIO
   --------------------------------------------------------- */

function cargarRecetaEnFormulario(receta) {

    document.getElementById(
        "recipe-title"
    ).value = receta.title;

    document.getElementById(
        "recipe-servings"
    ).value = String(receta.servings);


    document.getElementById(
        "recipe-cuisine"
    ).value =
        receta.categories.cuisines.join(", ");

    document.getElementById(
        "recipe-dish-type"
    ).value =
        receta.categories.dishTypes.join(", ");

    document.getElementById(
        "recipe-main-ingredient"
    ).value =
        receta.categories.mainIngredients.join(", ");

    document.getElementById(
        "recipe-cooking-method"
    ).value =
        receta.categories.cookingMethods.join(", ");


    const contenedorIngredientes =
        document.getElementById(
            "ingredients-editor"
        );


    receta.ingredients.forEach(
        function (ingrediente) {

            añadirFilaIngrediente();

            const fila =
                contenedorIngredientes
                    .lastElementChild;

            const nombre = fila.querySelector(
                '[data-ingredient-field="name"]'
            );

            const cantidad = fila.querySelector(
                '[data-ingredient-field="quantity"]'
            );

            const unidad = fila.querySelector(
                '[data-ingredient-field="unit"]'
            );

            const unidadPersonalizada = fila.querySelector(
                '[data-ingredient-field="customUnit"]'
            );

            const escalado = fila.querySelector(
                '[data-ingredient-field="scaling"]'
            );


            nombre.value =
                ingrediente.name;

            escalado.value =
                ingrediente.scaling;


            if (
                ingrediente.scaling === "free"
            ) {

                cantidad.value = "";
                unidad.value = "toTaste";

            } else {

                cantidad.value =
                    String(ingrediente.quantity);

                if (
                    PREDEFINED_UNITS.has(
                        ingrediente.unit
                    )
                ) {

                    unidad.value = ingrediente.unit;

                } else {

                    unidad.value = CUSTOM_UNIT_VALUE;
                    unidadPersonalizada.value =
                        ingrediente.unit;
                }
            }


            adaptarCampoUnidadPersonalizada(
                unidad,
                unidadPersonalizada
            );


            adaptarCamposAlEscalado(
                escalado,
                cantidad,
                unidad
            );
        }
    );


    const contenedorPasos =
        document.getElementById(
            "steps-editor"
        );


    receta.steps.forEach(
        function (textoPaso) {

            añadirFilaPaso();

            const fila =
                contenedorPasos
                    .lastElementChild;

            fila.querySelector(
                '[data-step-field="text"]'
            ).value = textoPaso;
        }
    );


    /*
       Las funciones que crean filas enfocan sus campos.
       Al terminar la carga evitamos abrir automáticamente
       el teclado del móvil.
    */

    if (document.activeElement) {
        document.activeElement.blur();
    }
}


/* ---------------------------------------------------------
   2. CREAR UNA FILA DE INGREDIENTE
   --------------------------------------------------------- */

function añadirFilaIngrediente() {

    const contenedor = document.getElementById(
        "ingredients-editor"
    );

    const fila = document.createElement("div");
    fila.className =
        "editor-dynamic-row ingredient-editor-row";


    /*
       Nombre del ingrediente.
    */

    const campoNombre = crearCampo(
        "Ingrediente",
        "text",
        "Ej. Carne de ternera"
    );

    campoNombre.classList.add(
        "ingredient-name-field"
    );

    const nombre = campoNombre.querySelector("input");

    nombre.dataset.ingredientField = "name";
    nombre.required = true;


    /*
       Cantidad.
    */

    const campoCantidad = crearCampo(
        "Cantidad",
        "number",
        "Ej. 500"
    );

    campoCantidad.classList.add(
        "ingredient-quantity-field"
    );

    const cantidad =
        campoCantidad.querySelector("input");

    cantidad.dataset.ingredientField = "quantity";
    cantidad.min = "0.01";
    cantidad.step = "any";
    cantidad.inputMode = "decimal";
    cantidad.required = true;


    /*
       Unidad.
    */

    const campoUnidad = crearCampoSeleccion(
        "Unidad",
        [
            ["microgram", "Microgramos (µg)"],
            ["milligram", "Miligramos (mg)"],
            ["gram", "Gramos"],
            ["kilogram", "Kilogramos"],
            ["milliliter", "Mililitros (ml)"],
            ["centiliter", "Centilitros (cl)"],
            ["deciliter", "Decilitros (dl)"],
            ["liter", "Litros (l)"],
            ["unit", "Unidades"],
            ["clove", "Dientes"],
            ["tablespoon", "Cucharadas"],
            ["teaspoon", "Cucharaditas"],
            ["cup", "Tazas"],
            ["toTaste", "Al gusto"],
            [CUSTOM_UNIT_VALUE, "Otra unidad métrica…"]
        ]
    );

    campoUnidad.classList.add(
        "ingredient-unit-field"
    );

    const unidad =
        campoUnidad.querySelector("select");

    unidad.dataset.ingredientField = "unit";

    const unidadPersonalizada =
        document.createElement("input");

    unidadPersonalizada.className =
        "editor-input ingredient-custom-unit-input";
    unidadPersonalizada.type = "text";
    unidadPersonalizada.placeholder = "Ej. µl, hg o t";
    unidadPersonalizada.maxLength = 40;
    unidadPersonalizada.autocapitalize = "none";
    unidadPersonalizada.spellcheck = false;
    unidadPersonalizada.hidden = true;
    unidadPersonalizada.disabled = true;
    unidadPersonalizada.dataset.ingredientField =
        "customUnit";

    campoUnidad.appendChild(
        unidadPersonalizada
    );


    /*
       Tipo de escalado.
    */

    const campoEscalado = crearCampoSeleccion(
        "Escalado",
        [
            ["exact", "Exacto"],
            ["culinary", "Culinario"],
            ["discrete", "Discreto"],
            ["soft", "Suave"],
            ["free", "Libre / al gusto"]
        ]
    );

    campoEscalado.classList.add(
        "ingredient-scaling-field"
    );

    const escalado =
        campoEscalado.querySelector("select");

    escalado.dataset.ingredientField = "scaling";


    /*
       Botón para eliminar la fila.
    */

    const eliminar = document.createElement("button");

    eliminar.className = "editor-remove-button";
    eliminar.type = "button";
    eliminar.textContent = "×";

    eliminar.setAttribute(
        "aria-label",
        "Eliminar ingrediente"
    );


    escalado.addEventListener(
        "change",
        function () {

            adaptarCamposAlEscalado(
                escalado,
                cantidad,
                unidad
            );
        }
    );
    
        unidad.addEventListener(
        "change",
        function () {

            adaptarCampoUnidadPersonalizada(
                unidad,
                unidadPersonalizada
            );

            if (unidad.value === "toTaste") {

                escalado.value = "free";

                adaptarCamposAlEscalado(
                    escalado,
                    cantidad,
                    unidad
                );
            }
        }
    );


        eliminar.addEventListener(
        "click",
        function () {

            eliminarFilaIngrediente(fila);
        }
    );


    const controlesOrden = crearControlesOrden(
        fila,
        "ingrediente"
    );


    fila.append(
        campoNombre,
        campoCantidad,
        campoUnidad,
        campoEscalado,
        eliminar,
        controlesOrden
    );

    contenedor.appendChild(fila);

    actualizarBotonesOrden(contenedor);

    nombre.focus();
}


/* ---------------------------------------------------------
   3. ADAPTAR LOS CAMPOS AL TIPO DE ESCALADO
   --------------------------------------------------------- */

function adaptarCamposAlEscalado(
    escalado,
    cantidad,
    unidad
) {

    const esLibre =
        escalado.value === "free";

    const unidadPersonalizada =
        unidad.parentElement.querySelector(
            '[data-ingredient-field="customUnit"]'
        );


    if (esLibre) {

        cantidad.value = "";
        cantidad.disabled = true;
        cantidad.required = false;

        unidad.value = "toTaste";
        unidad.disabled = true;

        adaptarCampoUnidadPersonalizada(
            unidad,
            unidadPersonalizada
        );

    } else {

        cantidad.disabled = false;
        cantidad.required = true;

        unidad.disabled = false;

        if (unidad.value === "toTaste") {
            unidad.value = "gram";
        }

        adaptarCampoUnidadPersonalizada(
            unidad,
            unidadPersonalizada
        );
    }
}


function adaptarCampoUnidadPersonalizada(
    unidad,
    unidadPersonalizada
) {

    const mostrar =
        !unidad.disabled &&
        unidad.value === CUSTOM_UNIT_VALUE;

    unidadPersonalizada.hidden = !mostrar;
    unidadPersonalizada.disabled = !mostrar;
    unidadPersonalizada.required = mostrar;
}


/* ---------------------------------------------------------
   4. ELIMINAR UN INGREDIENTE
   --------------------------------------------------------- */

function eliminarFilaIngrediente(fila) {

    const filas = document.querySelectorAll(
        ".ingredient-editor-row"
    );


    /*
       El esquema exige al menos un ingrediente.
       Si solo queda uno, limpiamos sus campos.
    */

    if (filas.length === 1) {

        fila
            .querySelectorAll("input")
            .forEach(function (campo) {

                campo.value = "";
            });

        return;
    }


        const contenedor = fila.parentElement;

    fila.remove();

    actualizarBotonesOrden(contenedor);
}


/* ---------------------------------------------------------
   5. CREAR UNA FILA DE PASO
   --------------------------------------------------------- */

function añadirFilaPaso() {

    const contenedor = document.getElementById(
        "steps-editor"
    );

    const fila = document.createElement("div");
    fila.className =
        "editor-dynamic-row step-editor-row";


    const numero = document.createElement("span");

    numero.className = "step-editor-number";
    numero.setAttribute("aria-hidden", "true");


    const campo = document.createElement("label");
    campo.className = "editor-field step-text-field";

    const etiqueta = document.createElement("span");
    etiqueta.className = "visually-hidden";
    etiqueta.textContent = "Descripción del paso";


    const texto = document.createElement("textarea");

    texto.className =
        "editor-input editor-textarea";

    texto.placeholder =
        "Describe este paso de la preparación";

    texto.required = true;

    texto.dataset.stepField = "text";


    const eliminar = document.createElement("button");

    eliminar.className = "editor-remove-button";
    eliminar.type = "button";
    eliminar.textContent = "×";

    eliminar.setAttribute(
        "aria-label",
        "Eliminar paso"
    );


       eliminar.addEventListener(
        "click",
        function () {

            eliminarFilaPaso(fila);
        }
    );


    const controlesOrden = crearControlesOrden(
        fila,
        "paso"
    );


    campo.append(
        etiqueta,
        texto
    );

    fila.append(
        numero,
        campo,
        eliminar,
        controlesOrden
    );

    contenedor.appendChild(fila);

    renumerarPasos();
    actualizarBotonesOrden(contenedor);

    texto.focus();
}


/* ---------------------------------------------------------
   6. ELIMINAR Y RENUMERAR PASOS
   --------------------------------------------------------- */

function eliminarFilaPaso(fila) {

    const filas = document.querySelectorAll(
        ".step-editor-row"
    );


    /*
       El esquema exige al menos un paso.
    */

    if (filas.length === 1) {

        const texto = fila.querySelector("textarea");

        texto.value = "";
        texto.focus();

        return;
    }


        const contenedor = fila.parentElement;

    fila.remove();

    renumerarPasos();
    actualizarBotonesOrden(contenedor);
}


function renumerarPasos() {

    const filas = document.querySelectorAll(
        ".step-editor-row"
    );


    filas.forEach(function (fila, indice) {

        const numero = fila.querySelector(
            ".step-editor-number"
        );

        numero.textContent = String(indice + 1);
    });
}


/* ---------------------------------------------------------
   7. COMPROBAR EL FORMULARIO
   --------------------------------------------------------- */

async function comprobarReceta(evento) {

    evento.preventDefault();

    const formulario = evento.currentTarget;

    const botonGuardar = document.querySelector(
        ".save-recipe-button"
    );


    if (!formulario.reportValidity()) {
        return;
    }


    const receta = construirRecetaDesdeFormulario();


    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando…";


    /*
       Solicitamos almacenamiento persistente cuando
       el navegador ofrece esta posibilidad.

       Que el navegador no lo conceda no impide guardar:
       las copias de seguridad seguirán siendo necesarias.
    */

    try {

        await PacosStorage.requestPersistence();

    } catch (error) {

        console.warn(
            "No se ha podido solicitar almacenamiento persistente.",
            error
        );
    }


        try {

        if (recetaEnEdicion) {

            await PacosStorage.replaceRecipe(
                receta
            );

            mostrarAvisoEditor(
                "Cambios guardados correctamente."
            );

        } else {

            /*
               addRecipe utiliza add() para impedir
               sobrescrituras silenciosas.
            */

            await PacosStorage.addRecipe(
                receta
            );

            mostrarAvisoEditor(
                "Receta guardada correctamente."
            );
        }


        botonGuardar.textContent =
            recetaEnEdicion
                ? "Cambios guardados"
                : "Guardada";


    } catch (error) {

        console.error(
            "No se ha podido guardar la receta:",
            error
        );


        if (error.name === "ConstraintError") {

            mostrarAvisoEditor(
                "Ya existe una receta con este identificador."
            );

        } else {

            mostrarAvisoEditor(
                "No se ha podido guardar la receta."
            );
        }


        botonGuardar.disabled = false;
        botonGuardar.textContent =
            recetaEnEdicion
                ? "Guardar cambios"
                : "Guardar";
    }
}


/* ---------------------------------------------------------
   8. CONSTRUIR EL OBJETO DE RECETA
   --------------------------------------------------------- */

function construirRecetaDesdeFormulario() {

    const ahora = new Date().toISOString();


    const ingredientes = Array.from(
        document.querySelectorAll(
            ".ingredient-editor-row"
        )
    ).map(function (fila) {

        const nombre = fila.querySelector(
            '[data-ingredient-field="name"]'
        );

        const cantidad = fila.querySelector(
            '[data-ingredient-field="quantity"]'
        );

        const unidad = fila.querySelector(
            '[data-ingredient-field="unit"]'
        );

        const unidadPersonalizada = fila.querySelector(
            '[data-ingredient-field="customUnit"]'
        );

        const escalado = fila.querySelector(
            '[data-ingredient-field="scaling"]'
        );


        return {

            name: nombre.value.trim(),

            quantity:
                escalado.value === "free"
                    ? null
                    : Number(cantidad.value),

            unit:
                escalado.value === "free"
                    ? "toTaste"
                    : unidad.value ===
                        CUSTOM_UNIT_VALUE
                        ? unidadPersonalizada.value.trim()
                        : unidad.value,

            scaling: escalado.value
        };
    });


    const pasos = Array.from(
        document.querySelectorAll(
            '[data-step-field="text"]'
        )
    ).map(function (campo) {

        return campo.value.trim();
    });


    return {

        format: "pacos-recipe",

        schemaVersion: 1,

               id:
            recetaEnEdicion
                ? recetaEnEdicion.id
                : crypto.randomUUID(),

        title: document
            .getElementById("recipe-title")
            .value
            .trim(),

        servings: Number(
            document
                .getElementById("recipe-servings")
                .value
        ),

                createdAt:
            recetaEnEdicion
                ? recetaEnEdicion.createdAt
                : ahora,

        updatedAt: ahora,

        categories: {

            cuisines:
                crearListaCategoria(
                    "recipe-cuisine"
                ),

            dishTypes:
                crearListaCategoria(
                    "recipe-dish-type"
                ),

            mainIngredients:
                crearListaCategoria(
                    "recipe-main-ingredient"
                ),

            cookingMethods:
                crearListaCategoria(
                    "recipe-cooking-method"
                )
        },

        ingredients: ingredientes,

        steps: pasos
    };
}


/* ---------------------------------------------------------
   9. CONVERTIR UN CAMPO EN LISTA DE CATEGORÍAS
   --------------------------------------------------------- */

function crearListaCategoria(idCampo) {

    const valor = document
        .getElementById(idCampo)
        .value
        .trim();


    if (valor === "") {
        return [];
    }


    /*
       Permite escribir varias categorías
       separadas por comas.
    */

    return valor
        .split(",")
        .map(function (categoria) {

            return categoria.trim();
        })
        .filter(function (categoria) {

            return categoria !== "";
        });
}


/* ---------------------------------------------------------
   10. CREAR CAMPOS REUTILIZABLES
   --------------------------------------------------------- */

function crearCampo(
    textoEtiqueta,
    tipo,
    placeholder
) {

    const etiqueta = document.createElement("label");
    etiqueta.className = "editor-field";

    const texto = document.createElement("span");
    texto.className = "editor-field-label";
    texto.textContent = textoEtiqueta;

    const campo = document.createElement("input");

    campo.className = "editor-input";
    campo.type = tipo;
    campo.placeholder = placeholder;


    etiqueta.append(
        texto,
        campo
    );

    return etiqueta;
}


function crearCampoSeleccion(
    textoEtiqueta,
    opciones
) {

    const etiqueta = document.createElement("label");
    etiqueta.className = "editor-field";

    const texto = document.createElement("span");
    texto.className = "editor-field-label";
    texto.textContent = textoEtiqueta;

    const seleccion = document.createElement("select");
    seleccion.className = "editor-input";


    opciones.forEach(function (opcion) {

        const elemento = document.createElement("option");

        elemento.value = opcion[0];
        elemento.textContent = opcion[1];

        seleccion.appendChild(elemento);
    });


    etiqueta.append(
        texto,
        seleccion
    );

    return etiqueta;
}


/* ---------------------------------------------------------
   11. AVISO TRANSITORIO
   --------------------------------------------------------- */

function mostrarAvisoEditor(mensaje) {

    let aviso = document.getElementById(
        "editor-status-message"
    );


    if (!aviso) {

        aviso = document.createElement("div");

        aviso.id = "editor-status-message";
        aviso.className = "editor-status-message";

        aviso.setAttribute(
            "role",
            "status"
        );

        aviso.setAttribute(
            "aria-live",
            "polite"
        );

        document.body.appendChild(aviso);
    }


    aviso.textContent = mensaje;
    aviso.classList.add("visible");


    window.setTimeout(
        function () {

            aviso.classList.remove("visible");
        },
        4000
    );
}

/* ---------------------------------------------------------
   12. CONTROLES PARA REORDENAR FILAS
   --------------------------------------------------------- */

function crearControlesOrden(
    fila,
    nombreElemento
) {

    const controles = document.createElement("div");
    controles.className = "editor-order-controls";


    const subir = crearBotonOrden(
        "up",
        "↑ Subir",
        `Subir ${nombreElemento}`
    );

    const bajar = crearBotonOrden(
        "down",
        "↓ Bajar",
        `Bajar ${nombreElemento}`
    );


    subir.addEventListener(
        "click",
        function () {

            moverFila(fila, -1);
        }
    );


    bajar.addEventListener(
        "click",
        function () {

            moverFila(fila, 1);
        }
    );


    controles.append(
        subir,
        bajar
    );

    return controles;
}


function crearBotonOrden(
    accion,
    texto,
    etiquetaAccesible
) {

    const boton = document.createElement("button");

    boton.className = "editor-order-button";
    boton.type = "button";
    boton.textContent = texto;

    boton.dataset.orderAction = accion;

    boton.setAttribute(
        "aria-label",
        etiquetaAccesible
    );

    return boton;
}


function moverFila(
    fila,
    direccion
) {

    const contenedor = fila.parentElement;

    const filaVecina =
        direccion < 0
            ? fila.previousElementSibling
            : fila.nextElementSibling;


    if (
        !filaVecina ||
        !filaVecina.classList.contains(
            "editor-dynamic-row"
        )
    ) {
        return;
    }


    if (direccion < 0) {

        contenedor.insertBefore(
            fila,
            filaVecina
        );

    } else {

        contenedor.insertBefore(
            filaVecina,
            fila
        );
    }


    if (
        fila.classList.contains(
            "step-editor-row"
        )
    ) {
        renumerarPasos();
    }


    actualizarBotonesOrden(contenedor);
}


function actualizarBotonesOrden(contenedor) {

    const filas = Array.from(
        contenedor.children
    ).filter(function (elemento) {

        return elemento.classList.contains(
            "editor-dynamic-row"
        );
    });


    filas.forEach(function (fila, indice) {

        const subir = fila.querySelector(
            '[data-order-action="up"]'
        );

        const bajar = fila.querySelector(
            '[data-order-action="down"]'
        );


        if (subir) {
            subir.disabled = indice === 0;
        }

        if (bajar) {
            bajar.disabled =
                indice === filas.length - 1;
        }
    });
}
