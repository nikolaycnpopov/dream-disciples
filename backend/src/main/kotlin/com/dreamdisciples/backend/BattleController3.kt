package com.dreamdisciples.backend

import com.dreamdisciples.backend.UnitActionType.TAKE_DEFENSIVE_STANCE
import com.dreamdisciples.backend.UnitActionType.USE_ABILITY
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseBody

@Controller
@CrossOrigin(origins = [ "*" ])
class BattleController {

    private lateinit var battle: Battle

    @Synchronized
    @PostMapping("/start-battle")
    @ResponseBody
    fun startBattle(@RequestBody startBattleRequest: StartBattleRequest): BattleUpdateResponse {
        logger.info("startBattle <<<<< $startBattleRequest")

        battle = Battle(startBattleRequest.units1, startBattleRequest.units2, startBattleRequest.unitClasses)

        val battleUpdateResponse = BattleUpdateResponse(battle.lastBattleUpdate)

        logger.info("startBattle >>>>> $battleUpdateResponse")

        return battleUpdateResponse
    }

    @Synchronized
    @PostMapping("/unit-action")
    @ResponseBody
    fun unitAction(@RequestBody unitActionRequest: UnitActionRequest): BattleUpdateResponse {
        logger.info("unitAction <<<<< $unitActionRequest")

        when (unitActionRequest.actionType) {
            USE_ABILITY -> {
                battle.useAbility(unitActionRequest.targetUnitId)
            }
            TAKE_DEFENSIVE_STANCE -> {
                battle.takeDefensiveStance()
            }
        }

        val battleUpdateResponse = BattleUpdateResponse(battle.lastBattleUpdate)

        logger.info("unitAction >>>>> $battleUpdateResponse")

        return battleUpdateResponse
    }

    companion object {
        private val logger = LoggerFactory.getLogger(BattleController::class.java)
    }

}

data class StartBattleRequest(val units1: List<UnitParam>, val units2: List<UnitParam>, val unitClasses: List<UnitClass>)

data class UnitParam(
    val unitClassName: String,
    val line: Int,
    val position: Int)

data class BattleUpdateResponse(val battleUpdate: BattleUpdate)

// todo: наверное можно прикрутить десериалайзер, который будет проверять типа экшена и возвращать конкретный тип запроса
data class UnitActionRequest(val actionType: UnitActionType, val targetUnitId: Int?)

enum class UnitActionType {

    USE_ABILITY,
    TAKE_DEFENSIVE_STANCE

}
