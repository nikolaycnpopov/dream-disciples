const unitClasses = [
    {
        name: "squire", // Уникальное имя класса юнита.
        // displayName: "Squire", // Имя класса юнита для показа в интерфейсе - кажется, только в профиле. Хорошо бы использовать ключ строки вместо конкретного значения.
        // profileImage: "", // Картинка в профиле юнита / класса (при найме нового юнита).
        // description: "", // Описание в профиле юнита / класса.
        portraitImage: "", // Картинка в отряде, в т.ч. в бою.
        race: "EMPIRE", // Значение енама расы.
        tier: 1, // Уровень класса - чтобы отличать от уровня юнита, который может расти отдельно после найма или последнего повышения юнита и до следующего повышения его в юнит классом выше.
        sizeType: "REGULAR",
        baseHealth: 100,
        baseInitiative: 50,
        abilities: [
            {
                name: "sword",
                displayName: "Sword",
                icon: "",
                type: "DAMAGE_MELEE",
                basePower: 25
                // source: "WEAPON"
            }
        ]//,
        // levelUpXP: 500,
        // rewardXP: 50
    },
    {
        name: "archer",
        portraitImage: "",
        race: "EMPIRE",
        tier: 1,
        sizeType: "REGULAR",
        baseHealth: 45,
        baseInitiative: 60,
        abilities: [
            {
                name: "arrow",
                displayName: "Arrow",
                icon: "",
                type: "DAMAGE_RANGE",
                basePower: 25
            }
        ]
    },
    {
        name: "apprentice",
        portraitImage: "",
        race: "EMPIRE",
        tier: 1,
        sizeType: "REGULAR",
        baseHealth: 40,
        baseInitiative: 40,
        abilities: [
            {
                name: "lightning",
                displayName: "Lightning",
                icon: "",
                type: "DAMAGE_ALL",
                basePower: 15
            }
        ]
    },
    {
        name: "acolyte",
        portraitImage: "",
        race: "EMPIRE",
        tier: 1,
        sizeType: "REGULAR",
        baseHealth: 50,
        baseInitiative: 20,
        abilities: [
            {
                name: "heal",
                displayName: "Heal",
                icon: "",
                type: "HEAL_ANY",
                basePower: 25
            }
        ]
    },
    {
        name: "mage",
        portraitImage: "",
        race: "EMPIRE",
        tier: 1,
        sizeType: "REGULAR",
        baseHealth: 65,
        baseInitiative: 40,
        abilities: [
            {
                name: "fireball",
                displayName: "Fireball",
                icon: "",
                type: "DAMAGE_ALL",
                basePower: 35
            }
        ]
    },
    {
        name: "cleric",
        portraitImage: "",
        race: "EMPIRE",
        tier: 2,
        sizeType: "REGULAR",
        baseHealth: 75,
        baseInitiative: 20,
        abilities: [
            {
                name: "healAll",
                displayName: "Heal All",
                icon: "",
                type: "HEAL_ALL",
                basePower: 20
            }
        ]
    }
]

export default unitClasses;
