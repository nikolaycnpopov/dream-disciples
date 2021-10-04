const battleUpdate = {
    battleEvents: [
        {
            type: "UNIT_ACTED", // -> UNIT_USED_ABILITY
            actedUnitId: 101, // -> unitId
            abilityName: "sword",
            affectedUnits: [
                {
                    unitId: 201,
                    effects: [
                        {
                            type: "DAMAGE",
                            power: 25
                        }
                    ]
                }
            ]
        },
        // {
        //     type: "UNIT_TOOK_DEFENSIVE_STANCE",
        //     unitId: 101
        // },
        {
            type: "UNIT_GOT_TURN"
        }
    ],
    battleState: {
        attackingSquadState: {
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
                    effects: [
                        // {
                        //     type: "DEFENSIVE_STANCE"
                        // }
                    ],
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
                        health: 75,
                        maxHealth: 100,
                        initiative: 50
                    },
                    abilities: [
                        {
                            name: "sword",
                            effectivePower: 25,
                            targetSelectionUnitIds: [101, 102]
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
            activeUnitId: 201,
            doneUnitIds: [101]
        }
    }
}

export default battleUpdate;
