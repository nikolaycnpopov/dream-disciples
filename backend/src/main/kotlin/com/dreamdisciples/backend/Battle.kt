package com.dreamdisciples.backend

import com.dreamdisciples.backend.AbilityType.*
import com.dreamdisciples.backend.UnitEffectType.DEFENSIVE_STANCE
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

class Battle(
    attackingUnitParams: List<UnitParam>,
    defendingUnitParams: List<UnitParam>,
    private val unitClasses: List<UnitClass>)
{

    var _lastBattleUpdate: BattleUpdate

    val lastBattleUpdate: BattleUpdate
        get() = _lastBattleUpdate

    init {
        val (attackingSquadState, defendingSquadState) = (attackingUnitParams.toSquadState(100) to defendingUnitParams.toSquadState(200))
            .updateAbilityTargetSelections()

        val activeUnitId = getNextActiveUnitId(attackingSquadState.units + defendingSquadState.units)

        _lastBattleUpdate = BattleUpdate(
            listOf(RoundStartedBattleEvent, UnitGotTurnBattleEvent),
            BattleState(attackingSquadState, defendingSquadState, RoundState(1, activeUnitId, mutableListOf())))
    }

    private fun List<UnitParam>.toSquadState(unitIdSequenceInit: Int): SquadState {
        val unitPositions = mutableListOf<UnitPosition>()
        val units = mutableListOf<BattleUnit>()

        var unitIdSequence = unitIdSequenceInit

        this.forEach { unitParam ->
            val unitId = unitIdSequence++

            unitPositions.add(UnitPosition(unitId, unitParam.line, unitParam.position))

            val unitClass = unitParam.unitClassName.toUnitClass()

            units.add(BattleUnit(
                unitId,
                unitClass.name,
                1,
                mutableListOf(),
                BattleUnitStats(unitClass.baseHealth, unitClass.baseHealth, unitClass.baseInitiative),
                unitClass.abilities.map { unitClassAbility ->
                    BattleUnitAbility(unitClassAbility.name, unitClassAbility.basePower, mutableListOf())
                }))
        }

        return SquadState(unitPositions, units)
    }

    private fun String.toUnitClass() = unitClasses.find { it.name == this }
        ?: throw IllegalArgumentException(this)

    private fun getNextActiveUnitId(allUnits: List<BattleUnit>, doneUnitIds: List<Int> = listOf()): Int {
        val undoneUnits = allUnits
            .filter { it.effectiveStats.health > 0 }
            .filter { !doneUnitIds.contains(it.id) }

        val maxInitiative = undoneUnits.map { it.effectiveStats.initiative }.maxOrNull()!!

        return undoneUnits.filter { it.effectiveStats.initiative == maxInitiative }
            .random()
            .id
    }

    private fun Pair<SquadState, SquadState>.updateAbilityTargetSelections(): Pair<SquadState, SquadState> {
        val (attackingSquadState, defendingSquadState) = this

        attackingSquadState.updateAbilityTargetSelections(defendingSquadState)
        defendingSquadState.updateAbilityTargetSelections(attackingSquadState)

        return attackingSquadState to defendingSquadState
    }

    private fun SquadState.updateAbilityTargetSelections(opponentSquadState: SquadState) {
        val opponentUnitPositions = opponentSquadState.unitPositions

        units.forEach { unit ->
            val unitClass = unit.unitClassName.toUnitClass()

            unit.abilities.forEach { battleUnitAbility ->
                val unitClassAbility = unitClass.getAbility(battleUnitAbility.name)

                val targetSelectionUnitIds = when (unitClassAbility.type) {
                    DAMAGE_ALL -> {
                        opponentUnitPositions
                    }
                    DAMAGE_MELEE -> {
                        val frontLineUnitPositions = opponentUnitPositions.filter { it.line == 1 }

                        val anyAliveInFrontLine = opponentSquadState.units
                            .filter { it.effectiveStats.health > 0 }
                            .any { unit -> frontLineUnitPositions.any { it.unitId == unit.id } }

                        if (anyAliveInFrontLine) {
                            frontLineUnitPositions
                        } else {
                            opponentUnitPositions.filter { it.line == 2 }
                        }
                    }
                    DAMAGE_RANGE -> {
                        opponentUnitPositions
                    }
                    HEAL_ANY -> {
                        this.unitPositions
                    }
                    HEAL_ALL -> {
                        this.unitPositions
                    }
                }
                .map { it.unitId }
                // todo: нужно делать отдельно для воскрешения
                .filter { unitId ->
                    (this.units + opponentSquadState.units)
                        .find { it.id == unitId }!!
                        .effectiveStats.health > 0
                }

                battleUnitAbility.targetSelectionUnitIds.clear()
                battleUnitAbility.targetSelectionUnitIds.addAll(targetSelectionUnitIds)
            }
        }
    }

    private fun UnitClass.getAbility(abilityName: String) =
        this.abilities.find { it.name == abilityName } ?: throw IllegalArgumentException(this.name + ":" + abilityName)

    @Synchronized
    fun useAbility(targetUnitId: Int?) {
        val battleUnitAbility = _lastBattleUpdate.battleState.getActiveUnit().abilities[0]

        if (targetUnitId != null && !battleUnitAbility.targetSelectionUnitIds.contains(targetUnitId)) {
            throw IllegalArgumentException("$targetUnitId")
        }

        action { battleState, activeUnit -> battleState.useAbility(targetUnitId, activeUnit, battleUnitAbility) }
    }

    private fun action(battleStateAction: (BattleState, BattleUnit) -> List<BattleEvent>) {
        val battleState = _lastBattleUpdate.battleState

        val activeUnit = battleState.getActiveUnit()

        val battleEvents = battleStateAction(battleState, activeUnit).toMutableList()

        battleState.roundState.doneUnitIds.add(activeUnit.id)

        // todo: проверить битву на завершение

        val allDone = battleState.allUnits()
            .filter { it.isAlive() }
            .filter { !battleState.roundState.doneUnitIds.contains(it.id) }
            .size == 0

        if (allDone) {
            battleState.roundState.roundNumber++
            battleState.roundState.doneUnitIds.clear()

            battleEvents.add(RoundStartedBattleEvent)
        }

        battleState.roundState.activeUnitId = getNextActiveUnitId(battleState.allUnits(), battleState.roundState.doneUnitIds)

        battleState.getActiveUnit().effects.removeIf { it == DefensiveStanceUnitEffect } // todo: потенциально может понадобиться соответсвующий баттл эвент

        battleEvents.add(UnitGotTurnBattleEvent)

        (battleState.attackingSquadState to battleState.defendingSquadState).updateAbilityTargetSelections()

        _lastBattleUpdate = BattleUpdate(battleEvents, battleState)
    }

    private fun BattleState.useAbility(targetUnitId: Int?, activeUnit: BattleUnit, battleUnitAbility: BattleUnitAbility): List<BattleEvent> {
        val unitClassAbility = battleUnitAbility.name.toUnitClassAbility()

        val affectedUnits = mutableListOf<AffectedUnit>()

        when (unitClassAbility.type) {
            HEAL_ALL -> {
                val targetSquadState = listOf(attackingSquadState, defendingSquadState)
                    .find { it.units.any { it.id == activeUnit.id } }!!

                targetSquadState.takeHeal(battleUnitAbility.effectivePower)
                    .forEach {
                        affectedUnits.add(AffectedUnit(it.id, listOf(AffectedUnitEffect("HEAL", battleUnitAbility.effectivePower))))
                    }
            }
            DAMAGE_ALL -> {
                val targetSquadState = listOf(attackingSquadState, defendingSquadState)
                    .find { it.units.none { it.id == activeUnit.id } }!!

                targetSquadState.takeDamage(battleUnitAbility.effectivePower)
                    .forEach { (battleUnit, effectiveDamage) ->
                        affectedUnits.add(AffectedUnit(battleUnit.id, listOf(AffectedUnitEffect("DAMAGE", effectiveDamage))))
                    }
            }
            else -> {
                if (targetUnitId == null) {
                    throw IllegalArgumentException("${unitClassAbility.type}")
                }

                val targetUnit = listOf(attackingSquadState, defendingSquadState)
                    .find { it.units.any { it.id == targetUnitId } }
                    ?.let { it.units.find { it.id == targetUnitId } }!!

                when (unitClassAbility.type) {
                    HEAL_ANY -> {
                        targetUnit.takeHeal(battleUnitAbility.effectivePower)

                        affectedUnits.add(AffectedUnit(targetUnitId, listOf(AffectedUnitEffect("HEAL", battleUnitAbility.effectivePower))))
                    }
                    DAMAGE_MELEE -> {
                        val effectiveDamage = targetUnit.takeDamage(battleUnitAbility.effectivePower)

                        affectedUnits.add(AffectedUnit(targetUnitId, listOf(AffectedUnitEffect("DAMAGE", effectiveDamage))))
                    }
                    DAMAGE_RANGE -> {
                        val effectiveDamage = targetUnit.takeDamage(battleUnitAbility.effectivePower)

                        affectedUnits.add(AffectedUnit(targetUnitId, listOf(AffectedUnitEffect("DAMAGE", effectiveDamage))))
                    }
                    else -> {
                        throw IllegalArgumentException("${unitClassAbility.type}")
                    }
                }
            }
        }

        return listOf(UnitActedBattleEvent(
            activeUnit.id,
            battleUnitAbility.name,
            affectedUnits)
        )
    }

    private fun String.toUnitClassAbility() = unitClasses
        .flatMap { it.abilities }
        .find { it.name == this }
        ?: throw IllegalArgumentException(this)

    @Synchronized
    fun takeDefensiveStance() {
        action { battleState, activeUnit -> battleState.takeDefensiveStance(activeUnit) }
    }

    private fun BattleState.takeDefensiveStance(activeUnit: BattleUnit): List<BattleEvent> {
        activeUnit.effects.add(DefensiveStanceUnitEffect)

        return listOf(UnitTookDefensiveStanceBattleEvent(activeUnit.id))
    }

}

data class BattleUpdate(val battleEvents: List<BattleEvent>, val battleState: BattleState)

sealed class BattleEvent(val type: BattleEventType)

enum class BattleEventType {

    ROUND_STARTED,
    UNIT_GOT_TURN,
    UNIT_ACTED,
    UNIT_TOOK_DEFENSIVE_STANCE

}

object RoundStartedBattleEvent : BattleEvent(BattleEventType.ROUND_STARTED)

object UnitGotTurnBattleEvent : BattleEvent(BattleEventType.UNIT_GOT_TURN)

data class UnitActedBattleEvent(
    val actedUnitId: Int,
    val abilityName: String,
    val affectedUnits: List<AffectedUnit>)
: BattleEvent(BattleEventType.UNIT_ACTED)

data class UnitTookDefensiveStanceBattleEvent(val unitId: Int) : BattleEvent(BattleEventType.UNIT_TOOK_DEFENSIVE_STANCE)

data class AffectedUnit(val unitId: Int, val effects: List<AffectedUnitEffect>)

data class AffectedUnitEffect(val type: String, val power: Int)

data class BattleState(val attackingSquadState: SquadState, val defendingSquadState: SquadState, val roundState: RoundState)

data class SquadState(val unitPositions: List<UnitPosition>, val units: List<BattleUnit>)

data class UnitPosition(val unitId: Int, val line: Int, val position: Int)

data class BattleUnit(
    val id: Int,
    val unitClassName: String,
    val level: Int,
    val effects: MutableList<UnitEffect>,
    val effectiveStats: BattleUnitStats,
    val abilities: List<BattleUnitAbility>)

sealed class UnitEffect(val type: UnitEffectType)

enum class UnitEffectType {

    DEFENSIVE_STANCE

}

object DefensiveStanceUnitEffect : UnitEffect(DEFENSIVE_STANCE)

data class BattleUnitStats(var health: Int, var maxHealth: Int, var initiative: Int)

data class BattleUnitAbility(val name: String, var effectivePower: Int, val targetSelectionUnitIds: MutableList<Int>)

data class RoundState(var roundNumber: Int, var activeUnitId: Int, val doneUnitIds: MutableList<Int>)

// ==============

private fun BattleState.getActiveUnit() =
    (attackingSquadState.units + defendingSquadState.units)
        .find { it.id == roundState.activeUnitId }
        ?: throw IllegalStateException()

private fun BattleState.allUnits() = attackingSquadState.units + defendingSquadState.units

private fun BattleUnit.takeHeal(healAmount: Int) {
    effectiveStats.health = min(effectiveStats.health + healAmount, effectiveStats.maxHealth)
}

fun BattleUnit.takeDamage(damageAmount: Int): Int {
    val reducedDamageAmount = if (effects.contains(DefensiveStanceUnitEffect)) {
        damageAmount / 2
    } else {
        damageAmount
    }

    val randomizedDamageAmount = reducedDamageAmount + Random.nextInt(0, 6)

    val missedDamageAmount = if (Random.nextInt(1, 101) > 95) {
        1
    } else {
        randomizedDamageAmount
    }

    // todo: можно посчитать фактический дамаг
    effectiveStats.health = max(effectiveStats.health - missedDamageAmount, 0)

    return missedDamageAmount
}

private fun SquadState.takeHeal(healAmount: Int): List<BattleUnit> {
    val affectedUnits = units.filter { it.isAlive() }

    affectedUnits.forEach { it.takeHeal(healAmount) }

    return affectedUnits
}

private fun BattleUnit.isAlive() = effectiveStats.health > 0

private fun SquadState.takeDamage(damageAmount: Int): List<Pair<BattleUnit, Int>> {
    val affectedUnits = units.filter { it.isAlive() }

    return affectedUnits.map { it to it.takeDamage(damageAmount) }
}
