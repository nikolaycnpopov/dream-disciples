package com.dreamdisciples.backend

data class UnitClass(
    val name: String,
    val portraitImage: String,
    val race: Race,
    val tier: Int,
    val sizeType: UnitSizeType,
    val baseHealth: Int,
    val baseInitiative: Int,
    val abilities: List<UnitClassAbility>
)

enum class Race {

    EMPIRE

}

enum class UnitSizeType {

    REGULAR

}

data class UnitClassAbility(
    val name: String,
    val displayName: String,
    val icon: String,
    val type: AbilityType,
    val basePower: Int
)

enum class AbilityType {

    DAMAGE_MELEE,
    DAMAGE_ALL,
    DAMAGE_RANGE,
    HEAL_ANY,
    HEAL_ALL

}
