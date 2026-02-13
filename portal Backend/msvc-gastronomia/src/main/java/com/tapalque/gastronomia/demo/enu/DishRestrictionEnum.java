package com.tapalque.gastronomia.demo.enu;

public enum DishRestrictionEnum {
    VEGETARIANO("Vegetariano"),
    VEGANO("Vegano"),
    SIN_GLUTEN("Sin Gluten"),
    SIN_LACTOSA("Sin Lactosa"),
    SIN_ALCOHOL("Sin Alcohol");

    private final String displayName;

    DishRestrictionEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static DishRestrictionEnum fromDisplayName(String displayName) {
        for (DishRestrictionEnum restriction : values()) {
            if (restriction.displayName.equalsIgnoreCase(displayName)) {
                return restriction;
            }
        }
        return null;
    }
}
