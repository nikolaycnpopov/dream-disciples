package com.dreamdisciples.backend

//import org.slf4j.LoggerFactory
//import org.springframework.stereotype.Controller
//import org.springframework.web.bind.annotation.CrossOrigin
//import org.springframework.web.bind.annotation.PostMapping
//import org.springframework.web.bind.annotation.RequestBody
//import org.springframework.web.bind.annotation.ResponseBody
//import kotlin.math.max
//
//@Controller
//@CrossOrigin(origins = [ "*" ])
//class BattleController {
//
//    private var unitClasses = listOf<UnitClass>()
//
//    private var units = listOf<BattleUnit>()
//
//    @Synchronized
//    @PostMapping("/start-battle")
//    @ResponseBody
//    fun startBattle(@RequestBody startBattleRequest: StartBattleRequest): BattleStateResponse {
//        logger.info("startBattle <<<<< $startBattleRequest")
//
//        unitClasses = startBattleRequest.unitClasses
//
//        var unitIdSequence = 1
//
//        val units1 = startBattleRequest.units1
//            .map { it.copy(id = unitIdSequence++, squad = 1) }
//
//        val units2 = startBattleRequest.units2
//            .map { it.copy(id = unitIdSequence++, squad = 2) }
//
//        units = units1 + units2
//
//        units = units.map { unit ->
//            val unitClass = unitClasses.find { it.unitClassName == unit.unitClassName }!!
//
//            return@map unit.copy(health = unitClass.baseHP, maxHealth = unitClass.baseHP)
//        }
//
//        val selectedUnit = units.random()
//        val targetUnits = units
//            .filter { it.squad != selectedUnit.squad }
//            .filter {
//                if (selectedUnit.unitClassName == "squire") {
//                    it.line == 1
//                } else { // AttackType.RANGE - targets all
//                    true
//                }
//            }
//
//        units = units
//            .replace(selectedUnit) { it.copy(selected = true)}
//            .replace(targetUnits) { it.copy(target = true)}
//
//        val battleStateResponse = units.toBattleStateResponse()
//
//        logger.info("startBattle >>>>> $battleStateResponse")
//
//        return battleStateResponse
//    }
//
//    @Synchronized
//    @PostMapping("/unit-action")
//    @ResponseBody
//    fun unitAction(@RequestBody unitActionRequest: UnitActionRequest): BattleStateResponse {
//        logger.info("unitAction <<<<< $unitActionRequest")
//
//        val actingUnit = units.find { it.selected }!!
//
//        val allDone = units
//            .filter { !it.done }
//            .filter { !it.selected }
//            .filter { it.health > 0 }
//            .count() == 0
//
//        if (allDone) {
//            units = units.map { it.copy(done = false) }
//        }
//
//        units = units
//            .map { it.copy(tookDamage = 0, target = false, acting = false) }
//            .replace(actingUnit) { it.copy(selected = false, acting = true, done = !allDone) }
//            .replace(unitActionRequest.unit) {
//                val health = max(it.health - 50, 0)
//
//                it.copy(tookDamage = 50, health = health)
//            }
//
//        val nextActingUnit = units
//            .filter { !it.done }
//            .filter { it.health > 0 }
//            .random()
//
//        val targetUnits = units
//            .filter { it.health > 0 }
//            // todo: два фильтра ниже дублируется с startBattle
//            .filter { it.squad != nextActingUnit.squad }
//            .filter {
//                if (nextActingUnit.unitClassName == "squire") {
//                    it.line == 1
//                } else { // AttackType.RANGE - targets all
//                    true
//                }
//            }
//
//        units = units
//            .replace(nextActingUnit) { it.copy(selected = true)}
//            .replace(targetUnits) { it.copy(target = true)}
//
//        val battleStateResponse = units.toBattleStateResponse()
//
//        logger.info("unitAction >>>>> $battleStateResponse")
//
//        return battleStateResponse
//    }
//
//    companion object {
//        private val logger = LoggerFactory.getLogger(BattleController::class.java)
//    }
//
//}
//
//private fun List<BattleUnit>.toBattleStateResponse() = BattleStateResponse(
//    units1 = this.filter { it.squad == 1 },
//    units2 = this.filter { it.squad == 2 })
//
//private fun List<BattleUnit>.replace(unit: BattleUnit, unitMappingFun: (BattleUnit) -> BattleUnit) = this
//    .map {
//        if (it == unit) {
//            unitMappingFun(it)
//        } else {
//            it
//        }
//    }
//
//private fun List<BattleUnit>.replace(units: List<BattleUnit>, unitMappingFun: (BattleUnit) -> BattleUnit) = this
//    .map {
//        if (units.contains(it)) {
//            unitMappingFun(it)
//        } else {
//            it
//        }
//    }
//
//data class StartBattleRequest(val units1: List<BattleUnit>, val units2: List<BattleUnit>, val unitClasses: List<UnitClass>)
//
//data class BattleUnit(
//    val id: Int,
//    val squad: Int,
//    val line: Int,
//    val position: Int,
//    val unitClassName: String,
//    val health: Int,
//    val maxHealth: Int,
//    val selected: Boolean,
//    val target: Boolean,
//    val acting: Boolean,
//    val tookDamage: Int,
//    val done: Boolean)
//{
//
//    override fun equals(other: Any?) =
//        other != null
//        && other is BattleUnit
//        && this.id == other.id
//
//    override fun hashCode() = 1
//
//}
//
//data class BattleStateResponse(val units1: List<BattleUnit>, val units2: List<BattleUnit>)
//
//data class UnitActionRequest(val unit: BattleUnit)
