"use strict";


/* =========================================================
   PACO'S
   Pantalla de categorías de la biblioteca
   ========================================================= */


const FAMILIAS_CATEGORIAS = [

    {
        propiedad: "cuisines",
        titulo: "Gastronomía",
        descripcion: "Tradiciones y cocinas",
        inicial: "G"
    },

    {
        propiedad: "dishTypes",
        titulo: "Tipo de plato",
        descripcion: "La función dentro del menú",
        inicial: "T"
    },

    {
        propiedad: "mainIngredients",
        titulo: "Ingrediente principal",
        descripcion: "El ingrediente central",
        inicial: "I"
    },

    {
        propiedad: "cookingMethods",
        titulo: "Sistema de cocción",
        descripcion: "La técnica empleada",
        inicial: "C"
    }
];


document.addEventListener(
    "DOMContentLoaded",
    cargarCategoriasBiblioteca
);


document.addEventListener(
    "DOMContentLoaded",
    prepararMenuOpcionesCategorias
);


/* ---------------------------------------------------------
   MENÚ DE OPCIONES DE CATEGORÍAS
   --------------------------------------------------------- */

function prepararMenuOpcionesCategorias() {

    const contenedor = document.getElementById(
        "categories-options"
    );

    const boton = document.getElementById(
        "categories-options-button"
    );

    const menu = document.getElementById(
        "categories-options-menu"
    );


    if (!contenedor || !boton || !menu) {
        return;
    }


    function cerrarMenu() {

        menu.hidden = true;

        boton.setAttribute(
            "aria-expanded",
            "false"
        );
    }


    boton.addEventListener(
        "click",
        function () {

            const debeAbrirse = menu.hidden;

            menu.hidden = !debeAbrirse;

            boton.setAttribute(
                "aria-expanded",
                String(debeAbrirse)
            );
        }
    );


    document.addEventListener(
        "click",
        function (evento) {

            if (
                !menu.hidden &&
                !contenedor.contains(evento.target)
            ) {
                cerrarMenu();
            }
        }
    );


    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key === "Escape" &&
                !menu.hidden
            ) {

                cerrarMenu();
                boton.focus();
            }
        }
    );
}


/* ---------------------------------------------------------
   1. CARGAR LAS CATEGORÍAS REALES
   --------------------------------------------------------- */

async function cargarCategoriasBiblioteca() {

    const contenedor = document.getElementById(
        "categories-container"
    );

    const buscador = document.getElementById(
        "buscador-categorias"
    );


    try {

        const recetas =
            await PacosStorage.getAllRecipes();


        if (recetas.length === 0) {

            mostrarBibliotecaCategoriasVacia(
                contenedor
            );

            buscador.disabled = true;

            buscador.placeholder =
                "Añade una receta para crear categorías";

            return;
        }


        const categorias =
            reunirCategoriasBiblioteca(recetas);


        mostrarCategorias(
            categorias,
            contenedor
        );


        activarBuscadorCategorias(
            contenedor
        );


    } catch (error) {

        console.error(
            "No se han podido cargar las categorías:",
            error
        );

        buscador.disabled = true;

        contenedor.replaceChildren();

        const mensaje = crearElemento(
            "p",
            "categories-error",
            "No se han podido abrir las categorías de la biblioteca."
        );

        contenedor.appendChild(mensaje);
    }
}




/* ---------------------------------------------------------
   3. MOSTRAR EL ESTADO VACÍO
   --------------------------------------------------------- */

function mostrarBibliotecaCategoriasVacia(
    contenedor
) {

    contenedor.replaceChildren();


    const tarjeta = document.createElement("section");

    tarjeta.className =
        "categories-library-note";

    tarjeta.style.gridColumn =
        "1 / -1";


    const titulo = crearElemento(
        "h2",
        "categories-library-title",
        "Todavía no hay categorías"
    );


    const texto = crearElemento(
        "p",
        "categories-library-text",
        "Las cuatro familias se completarán automáticamente cuando añadas o importes recetas."
    );


    const enlace = document.createElement("a");

    enlace.className = "primary-button";
    enlace.href = "editor.html";
    enlace.textContent = "Crear primera receta";


    tarjeta.append(
        titulo,
        texto,
        enlace
    );

    contenedor.appendChild(tarjeta);
}


/* ---------------------------------------------------------
   4. REUNIR Y CONTAR LAS CATEGORÍAS
   --------------------------------------------------------- */

function reunirCategoriasBiblioteca(recetas) {

    const resultado = {};


    FAMILIAS_CATEGORIAS.forEach(
        function (familia) {

            const recuento = new Map();


            recetas.forEach(function (receta) {

                const valores =
                    receta.categories[
                        familia.propiedad
                    ] || [];

                const valoresContados =
                    new Set();


                valores.forEach(function (valor) {

                    const nombreOriginal =
                        valor
                            .trim()
                            .replace(/\s+/g, " ");

                    const valorNormalizado =
                        normalizarTexto(
                            nombreOriginal
                        );


                    /*
                       La misma receta solo puede sumar
                       una vez dentro de cada categoría.
                    */

                    if (
                        valoresContados.has(
                            valorNormalizado
                        )
                    ) {
                        return;
                    }


                    valoresContados.add(
                        valorNormalizado
                    );


                    if (
                        !recuento.has(
                            valorNormalizado
                        )
                    ) {

                        recuento.set(
                            valorNormalizado,
                            {
                                nombre:
                                    nombreOriginal,

                                cantidad: 0
                            }
                        );
                    }


                    recuento.get(
                        valorNormalizado
                    ).cantidad += 1;
                });
            });


            resultado[familia.propiedad] =
                Array.from(
                    recuento.values()
                )
                    .sort(
                        function (
                            primera,
                            segunda
                        ) {

                            return primera.nombre
                                .localeCompare(
                                    segunda.nombre,
                                    "es",
                                    {
                                        sensitivity:
                                            "base"
                                    }
                                );
                        }
                    );
        }
    );


    return resultado;
}


/* ---------------------------------------------------------
   5. MOSTRAR LAS CUATRO FAMILIAS
   --------------------------------------------------------- */

function mostrarCategorias(
    categorias,
    contenedor
) {

    contenedor.replaceChildren();


    const indiceConDatos =
        FAMILIAS_CATEGORIAS.findIndex(
            function (familia) {

                return (
                    categorias[
                        familia.propiedad
                    ].length > 0
                );
            }
        );

    const indiceAbierto =
        indiceConDatos === -1
            ? 0
            : indiceConDatos;


    FAMILIAS_CATEGORIAS.forEach(
        function (familia, indice) {

            const grupo =
                crearGrupoCategoria(
                    familia,

                    categorias[
                        familia.propiedad
                    ],

                    indice === indiceAbierto
                );


            contenedor.appendChild(grupo);
        }
    );


    const mensajeSinResultados =
        crearElemento(
            "p",
            "categories-error",
            ""
        );

    mensajeSinResultados.id =
        "categories-empty-results";

    mensajeSinResultados.hidden = true;

    mensajeSinResultados.style.gridColumn =
        "1 / -1";

    mensajeSinResultados.setAttribute(
        "role",
        "status"
    );

    mensajeSinResultados.setAttribute(
        "aria-live",
        "polite"
    );


    contenedor.appendChild(
        mensajeSinResultados
    );
}


/* ---------------------------------------------------------
   6. CONSTRUIR UN GRUPO DESPLEGABLE
   --------------------------------------------------------- */

function crearGrupoCategoria(
    familia,
    entradas,
    abiertoInicialmente
) {

    const grupo = document.createElement("section");

    grupo.className = "category-group";

    grupo.dataset.initiallyOpen =
        String(abiertoInicialmente);


    const boton = document.createElement("button");

    boton.className = "category-group-button";
    boton.type = "button";

    boton.setAttribute(
        "aria-expanded",
        String(abiertoInicialmente)
    );


    const contenido = document.createElement("div");

    contenido.className =
        "category-group-content";

    contenido.id =
        `category-group-${familia.propiedad}`;

    contenido.hidden =
        !abiertoInicialmente;


    boton.setAttribute(
        "aria-controls",
        contenido.id
    );


    const simbolo = crearElemento(
        "span",
        "category-group-symbol",
        familia.inicial
    );

    simbolo.setAttribute(
        "aria-hidden",
        "true"
    );


    const textos = document.createElement("span");

    textos.className =
        "category-group-texts";


    const titulo = crearElemento(
        "strong",
        "category-group-title",
        familia.titulo
    );


    const descripcion = crearElemento(
        "small",
        "category-group-description",
        familia.descripcion
    );


    textos.append(
        titulo,
        descripcion
    );


    const cantidad = crearElemento(
        "span",
        "category-group-count",
        crearTextoCantidadCategorias(
            entradas.length
        )
    );


    const flecha = crearElemento(
        "span",
        "category-group-chevron",
        "›"
    );

    flecha.setAttribute(
        "aria-hidden",
        "true"
    );


    boton.append(
        simbolo,
        textos,
        cantidad,
        flecha
    );


    if (entradas.length === 0) {

        const mensaje = crearElemento(
            "p",
            "categories-loading",
            "Todavía no hay categorías en esta familia."
        );

        contenido.appendChild(mensaje);


    } else {

        entradas.forEach(function (entrada) {

            const enlace =
                crearEnlaceCategoria(
                    familia,
                    entrada
                );

            contenido.appendChild(enlace);
        });
    }


    boton.addEventListener(
        "click",
        function () {

            const estaAbierto =
                boton.getAttribute(
                    "aria-expanded"
                ) === "true";

            establecerEstadoGrupo(
                grupo,
                !estaAbierto
            );
        }
    );


    grupo.append(
        boton,
        contenido
    );


    return grupo;
}


/* ---------------------------------------------------------
   7. CREAR EL ENLACE Y EL RECUENTO
   --------------------------------------------------------- */

function crearEnlaceCategoria(
    familia,
    entrada
) {

    const enlace = document.createElement("a");

    enlace.className = "category-chip";

    enlace.href =
        "index.html?family=" +
        encodeURIComponent(
            familia.propiedad
        ) +
        "&category=" +
        encodeURIComponent(
            entrada.nombre
        );

    enlace.dataset.searchText =
        normalizarTexto(
            [
                familia.titulo,
                familia.descripcion,
                entrada.nombre
            ].join(" ")
        );

    enlace.setAttribute(
        "aria-label",
        `Ver recetas de la categoría ${entrada.nombre}`
    );


    const nombre = crearElemento(
        "span",
        "category-chip-name",
        entrada.nombre
    );


    const cantidad = crearElemento(
        "span",
        "category-chip-count",

        entrada.cantidad === 1
            ? "1 receta"
            : `${entrada.cantidad} recetas`
    );


    enlace.append(
        nombre,
        cantidad
    );


    return enlace;
}


/* ---------------------------------------------------------
   8. BUSCAR CATEGORÍAS INDIVIDUALES
   --------------------------------------------------------- */

function activarBuscadorCategorias(
    contenedor
) {

    const buscador = document.getElementById(
        "buscador-categorias"
    );

    const grupos = Array.from(
        contenedor.querySelectorAll(
            ".category-group"
        )
    );

    const mensajeSinResultados =
        document.getElementById(
            "categories-empty-results"
        );


    const botonLimpiarBusqueda =
        document.createElement("button");

    botonLimpiarBusqueda.className =
        "primary-button";

    botonLimpiarBusqueda.type = "button";

    botonLimpiarBusqueda.textContent =
        "Limpiar búsqueda";

    botonLimpiarBusqueda.hidden = true;

    botonLimpiarBusqueda.style.gridColumn =
        "1 / -1";

    botonLimpiarBusqueda.style.justifySelf =
        "start";


    contenedor.appendChild(
        botonLimpiarBusqueda
    );


    function actualizarResultados() {

        const consulta =
            normalizarTexto(
                buscador.value
            );

        const palabras =
            consulta === ""
                ? []
                : consulta.split(" ");

        let totalCoincidencias = 0;


        grupos.forEach(function (grupo) {

            const enlaces = Array.from(
                grupo.querySelectorAll(
                    ".category-chip"
                )
            );


            if (consulta === "") {

                grupo.style.display = "";

                enlaces.forEach(
                    function (enlace) {
                        enlace.style.display = "";
                    }
                );

                establecerEstadoGrupo(
                    grupo,

                    grupo.dataset.initiallyOpen ===
                        "true"
                );

                return;
            }


            let coincidenciasGrupo = 0;


            enlaces.forEach(function (enlace) {

                const coincide =
                    palabras.every(
                        function (palabra) {

                            return enlace.dataset
                                .searchText
                                .includes(palabra);
                        }
                    );


                enlace.style.display =
                    coincide
                        ? ""
                        : "none";


                if (coincide) {
                    coincidenciasGrupo += 1;
                }
            });


            grupo.style.display =
                coincidenciasGrupo > 0
                    ? ""
                    : "none";


            if (coincidenciasGrupo > 0) {

                establecerEstadoGrupo(
                    grupo,
                    true
                );
            }


            totalCoincidencias +=
                coincidenciasGrupo;
        });


        mensajeSinResultados.hidden =
            (
                consulta === "" ||
                totalCoincidencias > 0
            );


        botonLimpiarBusqueda.hidden =
            !(
                consulta !== "" &&
                totalCoincidencias === 0
            );


        if (
            consulta !== "" &&
            totalCoincidencias === 0
        ) {

            mensajeSinResultados.textContent =
                "No hay categorías que coincidan con " +
                `«${buscador.value.trim()}».`;
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


    actualizarResultados();
}


/* ---------------------------------------------------------
   9. ABRIR O CERRAR UN GRUPO
   --------------------------------------------------------- */

function establecerEstadoGrupo(
    grupo,
    abierto
) {

    const boton = grupo.querySelector(
        ".category-group-button"
    );

    const contenido = grupo.querySelector(
        ".category-group-content"
    );


    boton.setAttribute(
        "aria-expanded",
        String(abierto)
    );

    contenido.hidden = !abierto;
}


/* ---------------------------------------------------------
   10. FUNCIONES AUXILIARES
   --------------------------------------------------------- */

function crearTextoCantidadCategorias(
    cantidad
) {

    if (cantidad === 1) {
        return "1 categoría";
    }

    return `${cantidad} categorías`;
}


function normalizarTexto(texto) {

    return String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es")
        .trim()
        .replace(/\s+/g, " ");
}


function crearElemento(
    etiqueta,
    clase,
    contenido
) {

    const elemento =
        document.createElement(etiqueta);

    elemento.className = clase;
    elemento.textContent = contenido;

    return elemento;
}
