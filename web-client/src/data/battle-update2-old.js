const battleUpdate = {
    battleUpdateIncrements: [
        {
            type: "UnitActed",
            actedUnitId: 101,
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
        {
            type: "UnitGotTurn"
        }
    ],
    battleState: {
        squadLayouts: [
            {
                squadId: 1,
                unitPositions: [
                    { unitId: 101, line: 1, position: 2 },
                    { unitId: 102, line: 1, position: 6 },
                    { unitId: 103, line: 2, position: 1 },
                    { unitId: 104, line: 2, position: 4 },
                    { unitId: 105, line: 2, position: 7 },
                ]
            },
            {
                squadId: 2,
                unitPositions: [
                    { unitId: 201, line: 1, position: 2 },
                    { unitId: 202, line: 1, position: 6 },
                    { unitId: 203, line: 2, position: 1 },
                    { unitId: 204, line: 2, position: 4 },
                    { unitId: 205, line: 2, position: 7 },
                ]
            }
        ],
        units: [
            {
                id: 101,
                unitClassName: "squire",
                health: 100,
                maxHealth: 100,
                initiative: 50
            },
            {
                id: 102,
                unitClassName: "squire",
                health: 100,
                maxHealth: 100,
                initiative: 50
            },
            {
                id: 103,
                unitClassName: "archer",
                health: 50,
                maxHealth: 50,
                initiative: 55
            },
            {
                id: 104,
                unitClassName: "apprentice",
                health: 40,
                maxHealth: 40,
                initiative: 40
            },
            {
                id: 105,
                unitClassName: "acolyte",
                health: 50,
                maxHealth: 50,
                initiative: 20
            },
            {
                id: 201,
                unitClassName: "squire",
                health: 75,
                maxHealth: 100,
                initiative: 50
            },
            {
                id: 202,
                unitClassName: "squire",
                health: 100,
                maxHealth: 100,
                initiative: 50
            },
            {
                id: 203,
                unitClassName: "archer",
                health: 50,
                maxHealth: 50,
                initiative: 55
            },
            {
                id: 204,
                unitClassName: "apprentice",
                health: 40,
                maxHealth: 40,
                initiative: 40
            },
            {
                id: 205,
                unitClassName: "acolyte",
                health: 50,
                maxHealth: 50,
                initiative: 20
            }
        ],
        activeUnitId: 201,
        activeUnitAbilities: [
            {
                name: "sword",
                targetSelectionUnitIds: [101, 102],
                power: 25
            }
        ],
        round: {
            number: 1,
            undoneUnitIds: [102, 103, 104, 105, 201, 202, 203, 204, 205]
        }
    }
}

export default battleUpdate;
