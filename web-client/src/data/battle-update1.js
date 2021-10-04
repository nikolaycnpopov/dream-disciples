/**
 * Принятые решения (29-05-2021):
 * - в бою, кажется, могут понадобиться любые параметры отряда из стейта игрока
 * - при этом стейты отрядов вне боя и в бою - всё же два разных стейта
 *   - результаты боя фиксируются только по его завершению
 *   - лэйаут может меняться в бою и эти изменения, скорее всего, не должны сохраняться после боя
 *   - в бою добавляются эффекты, специфичные только для боя - защитная стойка, бусты, превращения и т.п.
 * - считаем, что эффекты не параметризируются
 * - всё, что сервер уже считает для своих валидаций, передавать в стейте; оставлять клиенту возможность посчитать
 *   все самостоятельно - на случай если нужно будет показать какую-то информацию для справки.
 */

const battleUpdate = {
    battleEvents: [
        {
            type: "ROUND_STARTED"
        },
        {
            type: "UNIT_GOT_TURN"
        }
    ],
    battleState: {
        attackingSquadState: {
            // playerId: ...,
            // squadId: ...,
            unitPositions: [
                { unitId: 101, line: 1, position: 2 },
                { unitId: 102, line: 1, position: 6 },
                { unitId: 103, line: 2, position: 1 },
                { unitId: 104, line: 2, position: 4 },
                { unitId: 105, line: 2, position: 7 },
            ],
            units: [
                {
                    id: 101,
                    unitClassName: "squire",
                    level: 1,
                    effects: [],
                    effectiveStats: {
                        health: 100,
                        maxHealth: 100,
                        initiative: 50//,
                        // armor: 0,
                        // wards: [],
                        // immunities: []
                    },
                    abilities: [
                        {
                            name: "sword",
                            effectivePower: 25,
                            // manaCost: 0,
                            // turnsToActivate: 0,
                            // disableForTurns: 0,
                            targetSelectionUnitIds: [201, 202]
                        }
                    ]
                },
                {
                    id: 102,
                    unitClassName: "squire",
                    level: 1,
                    effects: [],
                    effectiveStats: {
                        health: 100,
                        maxHealth: 100,
                        initiative: 50,
                    },
                    abilities: [
                        {
                            name: "sword",
                            effectivePower: 25,
                            targetSelectionUnitIds: []
                        }
                    ]
                },
                {
                    id: 103,
                    unitClassName: "archer",
                    level: 1,
                    effects: [],
                    effectiveStats: {
                        health: 50,
                        maxHealth: 50,
                        initiative: 55
                    },
                    abilities: [
                        {
                            name: "arrow",
                            effectivePower: 25,
                            targetSelectionUnitIds: []
                        }
                    ]
                },
                {
                    id: 104,
                    unitClassName: "apprentice",
                    level: 1,
                    effects: [],
                    effectiveStats: {
                        health: 40,
                        maxHealth: 40,
                        initiative: 40
                    },
                    abilities: [
                        {
                            name: "lightning",
                            effectivePower: 15,
                            targetSelectionUnitIds: []
                        }
                    ]
                },
                {
                    id: 105,
                    unitClassName: "acolyte",
                    level: 1,
                    effects: [],
                    effectiveStats: {
                        health: 50,
                        maxHealth: 50,
                        initiative: 20
                    },
                    abilities: [
                        {
                            name: "heal",
                            effectivePower: 25,
                            targetSelectionUnitIds: []
                        }
                    ]
                }
            ]
        },
        defendingSquadState: {
            squadId: 2,
            unitPositions: [
                { unitId: 201, line: 1, position: 2 },
                { unitId: 202, line: 1, position: 6 },
                { unitId: 203, line: 2, position: 1 },
                { unitId: 204, line: 2, position: 4 },
                { unitId: 205, line: 2, position: 7 },
            ],
            units: [
                {
                    id: 201,
                    unitClassName: "squire",
                    level: 1,
                    effects: [],
                    effectiveStats: {
                        health: 100,
                        maxHealth: 100,
                        initiative: 50
                    },
                    abilities: [
                        {
                            name: "sword",
                            effectivePower: 25,
                            targetSelectionUnitIds: []
                        }
                    ]
                },
                {
                    id: 202,
                    unitClassName: "squire",
                    level: 1,
                    effects: [],
                    effectiveStats: {
                        health: 100,
                        maxHealth: 100,
                        initiative: 50,
                    },
                    abilities: [
                        {
                            name: "sword",
                            effectivePower: 25,
                            targetSelectionUnitIds: []
                        }
                    ]
                },
                {
                    id: 203,
                    unitClassName: "archer",
                    level: 1,
                    effects: [],
                    effectiveStats: {
                        health: 50,
                        maxHealth: 50,
                        initiative: 55
                    },
                    abilities: [
                        {
                            name: "arrow",
                            effectivePower: 25,
                            targetSelectionUnitIds: []
                        }
                    ]
                },
                {
                    id: 204,
                    unitClassName: "apprentice",
                    level: 1,
                    effects: [],
                    effectiveStats: {
                        health: 40,
                        maxHealth: 40,
                        initiative: 40
                    },
                    abilities: [
                        {
                            name: "lightning",
                            effectivePower: 15,
                            targetSelectionUnitIds: []
                        }
                    ]
                },
                {
                    id: 205,
                    unitClassName: "acolyte",
                    level: 1,
                    effects: [],
                    effectiveStats: {
                        health: 50,
                        maxHealth: 50,
                        initiative: 20
                    },
                    abilities: [
                        {
                            name: "heal",
                            effectivePower: 25,
                            targetSelectionUnitIds: []
                        }
                    ]
                }
            ]
        },
        roundState: {
            roundNumber: 1,
            activeUnitId: 101,
            doneUnitIds: []//,
            // waitingUnitIds: [],
            // escapedUnitIds: []
        }
    }
}

export default battleUpdate;
