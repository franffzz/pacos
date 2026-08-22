"use strict";


/* =========================================================
   PACO'S
   Paleta opcional para las tarjetas de recetas
   ========================================================= */


const PacosCardColors = (function () {

    const AUTOMATIC = "automatic";

    const COLORS = Object.freeze([
        Object.freeze({
            id: "burgundy",
            name: "Granate",
            group: "warm"
        }),
        Object.freeze({
            id: "plum",
            name: "Ciruela",
            group: "warm"
        }),
        Object.freeze({
            id: "brick",
            name: "Teja",
            group: "warm"
        }),
        Object.freeze({
            id: "terracotta",
            name: "Terracota",
            group: "warm"
        }),
        Object.freeze({
            id: "ochre",
            name: "Ocre",
            group: "warm"
        }),
        Object.freeze({
            id: "bottle-green",
            name: "Verde botella",
            group: "opposite"
        }),
        Object.freeze({
            id: "forest-green",
            name: "Verde bosque",
            group: "opposite"
        }),
        Object.freeze({
            id: "dark-turquoise",
            name: "Turquesa oscuro",
            group: "opposite"
        }),
        Object.freeze({
            id: "medium-blue",
            name: "Azul medio",
            group: "opposite"
        }),
        Object.freeze({
            id: "indigo",
            name: "Índigo",
            group: "opposite"
        })
    ]);

    const VALID_COLORS = new Set(
        COLORS.map(function (color) {

            return color.id;
        })
    );


    function isValidColor(value) {

        return VALID_COLORS.has(value);
    }


    function getColorsByGroup(group) {

        return COLORS.filter(function (color) {

            return color.group === group;
        });
    }


    return Object.freeze({
        AUTOMATIC,
        COLORS,
        isValidColor,
        getColorsByGroup
    });
})();
