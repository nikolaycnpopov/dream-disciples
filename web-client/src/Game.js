import React from 'react';
import update from 'immutability-helper';
import './Game.css';

function noTargets(units) {
    return update(units, {
        $apply: units => units.map(unit => {
            return { ...unit, target: false };
        })
    });
}

const unitClasses = [
    {
        unitClassName: "squire", // Уникальное имя класса юнита.
        // displayName: "Squire", // Имя класса юнита для показа в интерфейсе - кажется, только в профиле. Хорошо бы использовать ключ строки вместо конкретного значения.
        // profileImage: "", // Картинка в профиле юнита / класса (при найме нового юнита).
        // description: "", // Описание в профиле юнита / класса.
        portraitImage: "", // Картинка в отряде, в т.ч. в бою.
        race: "EMPIRE", // Значение енама расы.
        tier: 1, // Уровень класса - чтобы отличать от уровня юнита, который может расти отдельно после найма или последнего повышения юнита и до следующего повышения его в юнит классом выше.
        sizeType: "REGULAR",
        baseHP: 100,
        baseInitiative: 50,
        ability: {
            displayName: "Sword",
            icon: "",
            type: "DAMAGE_MELEE",
            power: 25
            // source: "WEAPON"
        } //,
        // levelUpXP: 500,
        // rewardXP: 50
    },
    {
        unitClassName: "apprentice",
        portraitImage: "",
        race: "EMPIRE",
        tier: 1,
        sizeType: "REGULAR",
        baseHP: 40,
        baseInitiative: 40,
        ability: {
            displayName: "Lightning",
            icon: "",
            type: "DAMAGE_ALL",
            power: 15
        }
    },
    {
        unitClassName: "archer",
        portraitImage: "",
        race: "EMPIRE",
        tier: 1,
        sizeType: "REGULAR",
        baseHP: 50,
        baseInitiative: 55,
        ability: {
            displayName: "Arrow",
            icon: "",
            type: "DAMAGE_RANGE",
            power: 25
        }
    },
    {
        unitClassName: "acolyte",
        portraitImage: "",
        race: "EMPIRE",
        tier: 1,
        sizeType: "REGULAR",
        baseHP: 45,
        baseInitiative: 20,
        ability: {
            displayName: "Heal",
            icon: "",
            type: "HEAL_ONE",
            power: 25
        }
    }
]

function sizeTypeOf(unit) {
    let unitClass = unitClasses.find(unitClass => unitClass.unitClassName === unit.unitClassName)

    switch (unitClass.sizeType) {
        case "REGULAR": {
            return 0;
        }
        case "LARGE": {
            return 1;
        }
        case "GIANT": {
            return 2;
        }
        default: {
            throw Error("Unexpected unit size type: " + unitClass.sizeType)
        }
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoaded: false,
            units1: [],
            units2: []
        }

        this.handleUnitClick = this.handleUnitClick.bind(this)
    }

    componentDidMount() {
        // const units1 = [
        //     // line 1
        //     { sizeType: 0, line: 1, position: 2, health: 200, maxHealth: 200, attackType: "MELEE", damage: 50 },
        //     { sizeType: 1, line: 1, position: 7, health: 300, maxHealth: 300, attackType: "RANGE" },
        //     // line 2
        //     { sizeType: 0, line: 2, position: 1, health: 150, maxHealth: 150, attackType: "RANGE" },
        //     { sizeType: 2, line: 2, position: 3, health: 350, maxHealth: 350, attackType: "RANGE" },
        // ];
        //
        // const units2 = [
        //     // line 1
        //     { sizeType: 0, line: 1, position: 1, health: 170, maxHealth: 170, attackType: "MELEE" },
        //     { sizeType: 1, line: 1, position: 4, health: 280, maxHealth: 280, attackType: "RANGE" },
        //     { sizeType: 0, line: 1, position: 7, health: 170, maxHealth: 170, attackType: "MELEE" },
        //     // line 2
        //     { sizeType: 0, line: 2, position: 2, health: 120, maxHealth: 120, attackType: "RANGE" },
        //     { sizeType: 0, line: 2, position: 6, health: 120, maxHealth: 120, attackType: "RANGE" },
        // ];

        const units1 = [
            // line 1
            { line: 1, position: 2, unitClassName: "squire" },
            { line: 1, position: 6, unitClassName: "squire" },
            // line 2
            { line: 2, position: 1, unitClassName: "archer" },
            { line: 2, position: 4, unitClassName: "apprentice" },
            { line: 2, position: 7, unitClassName: "acolyte" }
        ];

        const units2 = [
            // line 1
            { line: 1, position: 2, unitClassName: "squire" },
            { line: 1, position: 6, unitClassName: "squire" },
            // line 2
            { line: 2, position: 1, unitClassName: "archer" },
            { line: 2, position: 4, unitClassName: "apprentice" },
            { line: 2, position: 7, unitClassName: "acolyte" }
        ];

        this.requestStartBattle(units1, units2).then(
            (result) => {
                // function withTargetsCleared(units) {
                //     return update(units, {
                //         $apply: units => units.map(unit => {
                //             return { ...unit, target: false };
                //         })
                //     });
                // }

                this.setState({
                    isLoaded: true,
                    units1: noTargets(result.units1),
                    units2: noTargets(result.units2)
                });

                setTimeout(() => {
                    this.setState({
                        isLoaded: true,
                        units1: result.units1,
                        units2: result.units2
                    })
                }, 2000); // время анимации на .unit-selected
            },
            (error) => {
                this.setState({
                    isLoaded: true,
                    error
                })
            }
        );
    }

    async requestStartBattle(units1, units2) {
        const url = 'http://localhost:8080/start-battle';
        const data = { units1: units1, units2: units2, unitClasses: unitClasses };

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const json = await response.json();

            if (response.ok) {
                console.log('/start-battle done:', JSON.stringify(json));

                return json;
            } else {
                throw Error("response not ok: " + json.message);
            }
        } catch (error) {
            console.error('/start-battle failed:', error);

            throw Error("/start-battle failed: " + error.message);
        }
    }

    render() {
        const { error, isLoaded, unitClasses } = this.state

        var content;

        if (this.state.isLoaded) {
            if (error) {
                content = (
                    <div>
                        ERROR: {error.message}
                    </div>
                );
            } else {
                content = this.renderBattleField(unitClasses);
            }
        } else {
            content = (
                <div>Loading...</div>
            );
        }

        return (<div>{content}</div>);
    }

    renderBattleField() {
        return (
            <div className="battle-field">
                <div className="squad squad-on-the-left">
                    <div className="squad-line">
                        {this.toLineCells(this.state.units1, 1)}
                    </div>
                    <div className="squad-line">
                        {this.toLineCells(this.state.units1, 2)}
                    </div>
                </div>
                <div className="squad squad-on-the-right">
                    <div className="squad-line">
                        {this.toLineCells(this.state.units2, 1)}
                    </div>
                    <div className="squad-line">
                        {this.toLineCells(this.state.units2, 2)}
                    </div>
                </div>
            </div>
        );
    }

    toLineCells(units, line) {
        const lineUnits = units.filter(unit => unit.line === line);

        const cells = [];
        var lastFilledPosition = 0;

        lineUnits.forEach(unit => {
            for (let i = lastFilledPosition + 1; i < unit.position; i++) {
                cells.push(<EmptyCell/>)
            }

            cells.push(<UnitCell unit={unit} onClick={this.handleUnitClick}/>)

            let unitSizeCells = sizeTypeOf(unit) === 2 ? 4 : 2;

            lastFilledPosition = unit.position + unitSizeCells - 1;
        }, this);

        for (let i = lastFilledPosition + 1; i <= 8; i++) {
            cells.push(<EmptyCell/>)
        }

        return cells;
    }

    handleUnitClick(theUnit) {
        if (!theUnit.target) {
            return;
        }

        function prepareForAction(units) {
            return update(units, {
                $apply: units => units.map(unit => {
                    if (unit.selected) {
                        return {...unit, actor: true}
                    } else if (unit.target) {
                        if (unit === theUnit) {
                            return { ...unit, target: false, thetarget: true };
                        } else {
                            return { ...unit, target: false, untarget: true };
                        }
                    } else {
                        return unit;
                    }
                })
            });
        }

        this.setState({
            isLoaded: true,
            units1: prepareForAction(this.state.units1),
            units2: prepareForAction(this.state.units2)
        });

        setTimeout(() => {
            // todo: move error handler to request method
            this.requestUnitAction(theUnit).then(
                (result) => {
                    function clearSelectedAndTargets(units) {
                        return update(units, {
                            $apply: units => units.map(unit => {
                                return { ...unit, selected: false, target: false };
                            })
                        });
                    }

                    let units1 = clearSelectedAndTargets(result.units1)
                    let units2 = clearSelectedAndTargets(result.units2)

                    function setActingUnitSide(units, side) {
                        units.forEach(unit => {
                            if (unit.acting) {
                                unit.side = side;
                            }
                        });
                    }

                    setActingUnitSide(units1, 0)
                    setActingUnitSide(units2, 1)

                    this.setState({
                        isLoaded: true,
                        units1: units1,
                        units2: units2
                    });

                    setTimeout(() => {
                        function clearActingAndTookDamage(units) {
                            return update(units, {
                                $apply: units => units.map(unit => {
                                    return { ...unit, acting: false, tookDamage: 0 };
                                })
                            });
                        }

                        let units1 = clearActingAndTookDamage(result.units1);
                        let units2 = clearActingAndTookDamage(result.units2);

                        this.setState({
                            isLoaded: true,
                            units1: noTargets(units1),
                            units2: noTargets(units2)
                        });

                        setTimeout(() => {
                            this.setState({
                                isLoaded: true,
                                units1: units1,
                                units2: units2
                            });
                        }, 2000);
                    }, 2500);
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    })
                }
            );
        }, 1000);
    }

    // todo: unify with request start battle
    async requestUnitAction(unit) {
        let endpoint = '/unit-action';
        let data = { unit: unit }

        try {
            const response = await fetch(this.toServerUrl(endpoint), {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const json = await response.json();

            if (response.ok) {
                console.log(endpoint + " done: ", JSON.stringify(json));

                return json;
            } else {
                throw Error("response not ok: " + json.message);
            }
        } catch (error) {
            console.error(endpoint + " failed: ", error);

            throw Error(endpoint + " failed: " + error.message);
        }
    }

    toServerUrl(endpoint) {
        return "http://localhost:8080" + endpoint;
    }
}

function EmptyCell(props) {
    return (
        <div className="empty-cell">
            <div className="empty-cell-img"/>
            <div className="empty-cell-img"/>
        </div>
    );
}

class UnitCell extends React.Component {

    constructor(props) {
        super(props);

        this.state = { mouseIsOver: false }
    }

    onMouseEnter(event) {
        console.log("ENTER")
    }

    onMouseLeave(event) {
        console.log("LEAVE")
    }

    render() {
        let unit = this.props.unit

        let unitSizeTypeClassName = this.toUnitSizeTypeClassName(sizeTypeOf(unit));
        let unitSelectedClassName = unit.selected ? " unit-selected" : "";
        let unitPretargetClassName = unit.pretarget ? (this.state.mouseIsOver) ? " unit-pretarget-mouse" : " unit-pretarget" : "";
        let unitTargetClassName = unit.target ? " unit-target" : "";
        let unitThetargetClassName = unit.thetarget ? " unit-the-target" : "";
        let unitUntargetClassName = unit.untarget ? " unit-untarget" : "";
        let unitActorClassName = unit.actor ? " unit-actor" : "";
        let unitActingClassNames = unit.acting ? /*" unit-acting" +*/ (unit.side === 0 ? " unit-acting-left" : " unit-acting-right") : "";
        let unitTakingDamageClassName = unit.tookDamage > 0 ? " unit-took-damage" : "";

        let unitHealthMaskDeadOrAliveClassName = unit.health > 0 ? "unit-health-mask-alive" : "unit-health-mask-dead";

        let unitShowDamageClassName = unit.tookDamage > 0 ? " unit-show-damage" : "";

        let damagedHealthPart = ((unit.maxHealth - unit.health) / unit.maxHealth) * 100;

        return (
            <div className={
                "unit-cell " +
                unitSizeTypeClassName +
                unitSelectedClassName +
                unitPretargetClassName +
                unitTargetClassName +
                unitThetargetClassName +
                unitUntargetClassName +
                unitActorClassName +
                unitActingClassNames +
                unitTakingDamageClassName
            }
                 onClick={() => this.props.onClick(unit)}
                 onMouseEnter={() => {
                     console.log('ENTER');
                     this.state.mouseIsOver = true
                 }}
                 onMouseLeave={() => {
                     console.log('LEAVE');
                     this.state.mouseIsOver = false
                 }}
            >
                <div className={"unit-health-mask " + unitHealthMaskDeadOrAliveClassName} style={{height: damagedHealthPart + "%"}}/>
                <div className={unitSizeTypeClassName + unitShowDamageClassName} hidden={unit.tookDamage === 0}>-{unit.tookDamage}</div>
                <div className="unit-status">
                    <span className="health-label">&nbsp;{unit.health} / {unit.maxHealth}&nbsp;</span>
                </div>
            </div>

        );
    }

    toUnitSizeTypeClassName(unitSizeType) {
        return (unitSizeType === 0)
            ? "regular-unit-cell"
            : (unitSizeType === 1)
                ? "large-unit-cell"
                : "giant-unit-cell"
    }

}

export default Game;
