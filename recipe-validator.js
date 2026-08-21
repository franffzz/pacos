"use strict";


/* =========================================================
   PACO'S
   Validación del formato pacos-recipe
   ========================================================= */


const PacosRecipeValidator = (function () {

    const RECIPE_PROPERTIES = [
        "format",
        "schemaVersion",
        "id",
        "title",
        "servings",
        "createdAt",
        "updatedAt",
        "categories",
        "ingredients",
        "steps"
    ];

    const CATEGORY_PROPERTIES = [
        "cuisines",
        "dishTypes",
        "mainIngredients",
        "cookingMethods"
    ];

    const INGREDIENT_PROPERTIES = [
        "name",
        "quantity",
        "unit",
        "scaling"
    ];

    const ALLOWED_UNITS = new Set([
        "gram",
        "kilogram",
        "unit",
        "clove",
        "tablespoon",
        "teaspoon",
        "cup",
        "toTaste"
    ]);

    const ALLOWED_SCALING_TYPES = new Set([
        "exact",
        "culinary",
        "discrete",
        "soft",
        "free"
    ]);


    /* -----------------------------------------------------
       1. VALIDAR UNA RECETA COMPLETA
       ----------------------------------------------------- */

    function validateRecipe(recipe) {

        const errors = [];


        if (!isPlainObject(recipe)) {

            return {
                valid: false,
                errors: [
                    "El contenido debe ser un objeto JSON."
                ]
            };
        }


        validateExactProperties(
            recipe,
            RECIPE_PROPERTIES,
            "La receta",
            errors
        );


        if (recipe.format !== "pacos-recipe") {

            errors.push(
                'El campo "format" debe ser "pacos-recipe".'
            );
        }


        if (recipe.schemaVersion !== 1) {

            errors.push(
                'El campo "schemaVersion" debe tener el valor 1.'
            );
        }


        if (!isUuid(recipe.id)) {

            errors.push(
                'El campo "id" no contiene un UUID válido.'
            );
        }


        if (
            typeof recipe.title !== "string" ||
            recipe.title.trim() === ""
        ) {

            errors.push(
                "La receta debe tener un título."
            );
        }


        if (
            !Number.isInteger(recipe.servings) ||
            recipe.servings < 1
        ) {

            errors.push(
                "Las raciones deben ser un número entero igual o mayor que 1."
            );
        }


        if (!isDateTime(recipe.createdAt)) {

            errors.push(
                'El campo "createdAt" no contiene una fecha válida.'
            );
        }


        if (!isDateTime(recipe.updatedAt)) {

            errors.push(
                'El campo "updatedAt" no contiene una fecha válida.'
            );
        }


        validateCategories(
            recipe.categories,
            errors
        );

        validateIngredients(
            recipe.ingredients,
            errors
        );

        validateSteps(
            recipe.steps,
            errors
        );


        return {
            valid: errors.length === 0,
            errors
        };
    }


    /* -----------------------------------------------------
       2. VALIDAR LAS CATEGORÍAS
       ----------------------------------------------------- */

    function validateCategories(
        categories,
        errors
    ) {

        if (!isPlainObject(categories)) {

            errors.push(
                'El campo "categories" debe ser un objeto.'
            );

            return;
        }


        validateExactProperties(
            categories,
            CATEGORY_PROPERTIES,
            "Las categorías",
            errors
        );


        CATEGORY_PROPERTIES.forEach(
            function (property) {

                const values = categories[property];


                if (!Array.isArray(values)) {

                    errors.push(
                        `La categoría "${property}" debe ser una lista.`
                    );

                    return;
                }


                const validValues = values.every(
                    function (value) {

                        return (
                            typeof value === "string" &&
                            value.trim() !== ""
                        );
                    }
                );


                if (!validValues) {

                    errors.push(
                        `La categoría "${property}" contiene un valor vacío o no textual.`
                    );
                }


                if (
                    new Set(values).size !==
                    values.length
                ) {

                    errors.push(
                        `La categoría "${property}" contiene valores repetidos.`
                    );
                }
            }
        );
    }


    /* -----------------------------------------------------
       3. VALIDAR LOS INGREDIENTES
       ----------------------------------------------------- */

    function validateIngredients(
        ingredients,
        errors
    ) {

        if (
            !Array.isArray(ingredients) ||
            ingredients.length === 0
        ) {

            errors.push(
                "La receta debe contener al menos un ingrediente."
            );

            return;
        }


        ingredients.forEach(
            function (ingredient, index) {

                const position = index + 1;


                if (!isPlainObject(ingredient)) {

                    errors.push(
                        `El ingrediente ${position} no es un objeto válido.`
                    );

                    return;
                }


                validateExactProperties(
                    ingredient,
                    INGREDIENT_PROPERTIES,
                    `El ingrediente ${position}`,
                    errors
                );


                if (
                    typeof ingredient.name !== "string" ||
                    ingredient.name.trim() === ""
                ) {

                    errors.push(
                        `El ingrediente ${position} no tiene nombre.`
                    );
                }


                if (
                    !ALLOWED_UNITS.has(
                        ingredient.unit
                    )
                ) {

                    errors.push(
                        `El ingrediente ${position} utiliza una unidad desconocida.`
                    );
                }


                if (
                    !ALLOWED_SCALING_TYPES.has(
                        ingredient.scaling
                    )
                ) {

                    errors.push(
                        `El ingrediente ${position} utiliza un escalado desconocido.`
                    );
                }


                const isFree =
                    ingredient.scaling === "free";


                if (isFree) {

                    if (
                        ingredient.quantity !== null ||
                        ingredient.unit !== "toTaste"
                    ) {

                        errors.push(
                            `El ingrediente ${position}, marcado como libre, debe tener cantidad nula y unidad "toTaste".`
                        );
                    }


                } else {

                    if (
                        typeof ingredient.quantity !==
                            "number" ||
                        !Number.isFinite(
                            ingredient.quantity
                        ) ||
                        ingredient.quantity <= 0
                    ) {

                        errors.push(
                            `El ingrediente ${position} debe tener una cantidad numérica mayor que 0.`
                        );
                    }


                    if (ingredient.unit === "toTaste") {

                        errors.push(
                            `El ingrediente ${position} solo puede usar "toTaste" con escalado libre.`
                        );
                    }
                }
            }
        );
    }


    /* -----------------------------------------------------
       4. VALIDAR LOS PASOS
       ----------------------------------------------------- */

    function validateSteps(
        steps,
        errors
    ) {

        if (
            !Array.isArray(steps) ||
            steps.length === 0
        ) {

            errors.push(
                "La receta debe contener al menos un paso."
            );

            return;
        }


        steps.forEach(function (step, index) {

            if (
                typeof step !== "string" ||
                step.trim() === ""
            ) {

                errors.push(
                    `El paso ${index + 1} está vacío o no es texto.`
                );
            }
        });
    }


    /* -----------------------------------------------------
       5. COMPROBAR PROPIEDADES
       ----------------------------------------------------- */

    function validateExactProperties(
        value,
        allowedProperties,
        name,
        errors
    ) {

        allowedProperties.forEach(
            function (property) {

                if (
                    !Object.prototype.hasOwnProperty.call(
                        value,
                        property
                    )
                ) {

                    errors.push(
                        `${name} no contiene el campo obligatorio "${property}".`
                    );
                }
            }
        );


        Object.keys(value).forEach(
            function (property) {

                if (
                    !allowedProperties.includes(
                        property
                    )
                ) {

                    errors.push(
                        `${name} contiene el campo no reconocido "${property}".`
                    );
                }
            }
        );
    }


    /* -----------------------------------------------------
       6. UUID, FECHAS Y OBJETOS
       ----------------------------------------------------- */

    function isUuid(value) {

        return (
            typeof value === "string" &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                .test(value)
        );
    }


    function isDateTime(value) {

        return (
            typeof value === "string" &&
            value.trim() !== "" &&
            !Number.isNaN(
                Date.parse(value)
            )
        );
    }


    function isPlainObject(value) {

        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

/* ---------------------------------------------------------
   7. VALIDAR UNA COPIA DE SEGURIDAD
   --------------------------------------------------------- */

function validateBackup(backup) {

    const errors = [];

    const backupProperties = [
        "format",
        "schemaVersion",
        "exportedAt",
        "recipes",
        "notes"
    ];


    if (!isPlainObject(backup)) {

        return {
            valid: false,
            errors: [
                "La copia de seguridad debe ser un objeto JSON."
            ]
        };
    }


    validateExactProperties(
        backup,
        backupProperties,
        "La copia de seguridad",
        errors
    );


    if (backup.format !== "pacos-backup") {

        errors.push(
            'El campo "format" debe ser "pacos-backup".'
        );
    }


    if (backup.schemaVersion !== 1) {

        errors.push(
            'La copia debe utilizar la versión 1.'
        );
    }


    if (!isDateTime(backup.exportedAt)) {

        errors.push(
            "La copia no contiene una fecha de exportación válida."
        );
    }


    const recipeIds = new Set();


    if (!Array.isArray(backup.recipes)) {

        errors.push(
            "La copia no contiene una lista válida de recetas."
        );


    } else {

        backup.recipes.forEach(
            function (recipe, index) {

                const position = index + 1;

                const result =
                    validateRecipe(recipe);


                result.errors.forEach(
                    function (error) {

                        errors.push(
                            `Receta ${position}: ${error}`
                        );
                    }
                );


                if (isUuid(recipe && recipe.id)) {

                    if (recipeIds.has(recipe.id)) {

                        errors.push(
                            `La receta ${position} tiene un identificador repetido.`
                        );

                    } else {

                        recipeIds.add(recipe.id);
                    }
                }
            }
        );
    }


    if (!Array.isArray(backup.notes)) {

        errors.push(
            "La copia no contiene una lista válida de notas."
        );


    } else {

        const noteRecipeIds = new Set();


        backup.notes.forEach(
            function (note, index) {

                const position = index + 1;


                if (!isPlainObject(note)) {

                    errors.push(
                        `La nota ${position} no es un objeto válido.`
                    );

                    return;
                }


                if (!isUuid(note.recipeId)) {

                    errors.push(
                        `La nota ${position} no contiene un identificador de receta válido.`
                    );

                    return;
                }


                if (noteRecipeIds.has(note.recipeId)) {

                    errors.push(
                        `La nota ${position} está repetida.`
                    );

                } else {

                    noteRecipeIds.add(
                        note.recipeId
                    );
                }


                if (!recipeIds.has(note.recipeId)) {

                    errors.push(
                        `La nota ${position} pertenece a una receta que no está incluida en la copia.`
                    );
                }
            }
        );
    }


    return {
        valid: errors.length === 0,
        errors
    };
}

    /* -----------------------------------------------------
       7. COMPARAR DOS RECETAS
       ----------------------------------------------------- */

    function areRecipesIdentical(
        firstRecipe,
        secondRecipe
    ) {

        return (
            JSON.stringify(
                sortObject(firstRecipe)
            ) ===
            JSON.stringify(
                sortObject(secondRecipe)
            )
        );
    }


    function sortObject(value) {

        if (Array.isArray(value)) {

            return value.map(sortObject);
        }


        if (isPlainObject(value)) {

            const sorted = {};


            Object.keys(value)
                .sort()
                .forEach(function (key) {

                    sorted[key] =
                        sortObject(value[key]);
                });


            return sorted;
        }


        return value;
    }


    /* -----------------------------------------------------
       8. API DISPONIBLE
       ----------------------------------------------------- */

    return Object.freeze({

    validateRecipe,
    validateBackup,
    areRecipesIdentical
});

})();