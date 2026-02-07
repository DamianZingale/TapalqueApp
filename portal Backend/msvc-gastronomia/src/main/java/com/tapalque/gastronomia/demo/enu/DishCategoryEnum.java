package com.tapalque.gastronomia.demo.enu;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public enum DishCategoryEnum {
    // Entradas y Aperitivos
    ENTRADAS("Entradas"),
    PICADAS("Picadas"),
    EMPANADAS("Empanadas"),
    TABLAS("Tablas de Fiambres"),
    PROVOLETA("Provoleta"),
   

    // Sopas
    SOPAS("Sopas"),
    CALDOS("Caldos"),
    CREMAS("Cremas"),

    // Ensaladas
    ENSALADAS("Ensaladas"),
    ENSALADA_CESAR("Ensalada César"),
    ENSALADA_CAPRESE("Ensalada Caprese"),
    ENSALADA_MIXTA("Ensalada Mixta"),

    // Pastas
    PASTAS("Pastas"),
    

    // Carnes
    CARNES("Carnes"),
    PARRILLA("Parrilla"),


    // Aves
    POLLO("Pollo"),


    // Pescados y Mariscos
    PESCADOS("Pescados"),
    MARISCOS("Mariscos"),


    // Pizzas
    PIZZAS("Pizzas"),


    // Hamburguesas y Sandwiches
    HAMBURGUESAS("Hamburguesas"),
    SANDWICHES("Sandwiches"),
    LOMITOS("Lomitos"),
    PANCHO("Panchos"),
    TOSTADOS("Tostados"),

    // Comida Mexicana
    TACOS("Tacos"),
    BURRITOS("Burritos"),
    QUESADILLAS("Quesadillas"),
    NACHOS("Nachos"),
    FAJITAS("Fajitas"),

    // Comida Asiática
    SUSHI("Sushi"),
    WOK("Wok"),
    CHOP_SUEY("Chop Suey"),

    // Minutas
    MINUTAS("Minutas"),
    TORTILLA("Tortilla"),


    // Guarniciones
    GUARNICIONES("Guarniciones"),
    PAPAS_FRITAS("Papas Fritas"),
    PURE("Puré"),
    ARROZ("Arroz"),
    VERDURAS_GRILLADAS("Verduras Grilladas"),

    // Postres
    POSTRES("Postres"),
    FLAN("Flan"),
    TIRAMISU("Tiramisú"),
    PANQUEQUES("Panqueques"),
    TORTAS("Tortas"),
    CHEESECAKE("Cheesecake"),
    HELADOS("Helados"),
    COPAS("Copas de Helado"),

    // Bebidas
    BEBIDAS("Bebidas"),
    GASEOSAS("Gaseosas"),
    AGUAS("Aguas"),
    JUGOS("Jugos"),
    LICUADOS("Licuados"),
    CAFES("Cafés"),
    TES("Tés"),
    CERVEZAS("Cervezas"),
    VINOS("Vinos"),
    TRAGOS("Tragos"),
    COCKTAILS("Cocktails"),

    // Desayuno y Merienda
    DESAYUNO("Desayuno"),
    MEDIALUNAS("Medialunas"),
    FACTURAS("Facturas"),
    TOSTADAS("Tostadas"),

    // Especialidades
    ESPECIALIDADES("Especialidades de la Casa"),
    MENU_EJECUTIVO("Menú Ejecutivo"),
    MENU_DEL_DIA("Menú del Día"),


    // Otros
    OTROS("Otros");

    private final String displayName;

    DishCategoryEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Obtiene una categoría a partir de su nombre de visualización
     * @param displayName nombre de la categoría
     * @return la categoría encontrada o OTROS si no se encuentra
     */
    public static DishCategoryEnum fromDisplayName(String displayName) {
        if (displayName == null || displayName.trim().isEmpty()) {
            return OTROS;
        }

        for (DishCategoryEnum category : values()) {
            if (category.displayName.equalsIgnoreCase(displayName.trim())) {
                return category;
            }
        }
        return OTROS;
    }

    /**
     * Obtiene todas las categorías disponibles como lista de nombres
     * @return lista con todos los nombres de categorías
     */
    public static List<String> getAllCategoryNames() {
        return Arrays.stream(values())
                .map(DishCategoryEnum::getDisplayName)
                .collect(Collectors.toList());
    }

    /**
     * Busca categorías que contengan el texto especificado
     * @param query texto a buscar
     * @return lista de categorías que coinciden con la búsqueda
     */
    public static List<DishCategoryEnum> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Arrays.asList(values());
        }

        String searchTerm = query.toLowerCase().trim();
        return Arrays.stream(values())
                .filter(category -> category.displayName.toLowerCase().contains(searchTerm))
                .collect(Collectors.toList());
    }

    /**
     * Verifica si existe una categoría con el nombre especificado
     * @param displayName nombre a verificar
     * @return true si existe la categoría, false en caso contrario
     */
    public static boolean exists(String displayName) {
        if (displayName == null || displayName.trim().isEmpty()) {
            return false;
        }

        return Arrays.stream(values())
                .anyMatch(category -> category.displayName.equalsIgnoreCase(displayName.trim()));
    }
}
