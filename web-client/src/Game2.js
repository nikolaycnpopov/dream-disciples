import React from 'react';
import update from 'immutability-helper';
import './Game.css';

import unitClasses from './data/unit-classes.js';

import battleUpdate1 from './data/battle-update1.js';
import battleUpdate2 from './data/battle-update2.js';

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = { }

        this.handleUnitClick = this.handleUnitClick.bind(this)
    }

    componentDidMount() {
        // this.requestStartBattle(units1, units2).then(
        //     (result) => {
        //         this.setState({
        //             units1: noTargets(result.units1),
        //             units2: noTargets(result.units2)
        //         });
        //
        //         setTimeout(() => {
        //             this.setState({
        //                 units1: result.units1,
        //                 units2: result.units2
        //             })
        //         }, 2000); // время анимации на .unit-selected
        //     },
        //     (error) => {
        //         this.setState({
        //             error.message
        //         })
        //     }
        // );

        this.setState({
            battleState: battleUpdate1.battleState,
            phase: 1 // помигать ходящим юнитом
        });

        setTimeout(() => {
            this.setState({
                phase: 2 // показать таргеты
            });
        }, 1500); // секунда на анимацию .unit-selected плюс полсекунды на задержку перед этой анимацией. Появление
                          // выделений таргет селекшена синхронизировано с завершением мигания желтого выделения - если править,
                          // нужно править и там тоже.
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
        var content;

        if (this.state.error) {
            content = (<div>ERROR: {this.state.error}</div>);
        } else if (this.state.battleState) {
            content = this.renderBattle(unitClasses);
        } else {
            content = (<div>Loading...</div>);
        }

        return (<div>{content}</div>);
    }

    renderBattle() {
        return (
            <div className="battle-field">
                {this.renderAttackingSquad()}
                {this.renderDefendingSquad()}
            </div>
        );
    }

    renderAttackingSquad() {
        let atackingSquadState = this.state.battleState.attackingSquadState;

        return (
            <div className="squad squad-on-the-left">
                <div className="squad-line">
                    {this.renderSquadLine(atackingSquadState, 1)}
                </div>
                <div className="squad-line">
                    {this.renderSquadLine(atackingSquadState, 2)}
                </div>
            </div>
        );
    }

    renderSquadLine(squadState, line) {
        let battleEvents = this.state.battleEvents
        let battleState = this.state.battleState;

        const lineUnitPositions = squadState.unitPositions.filter(unitPosition => unitPosition.line === line);

        const cells = [];
        var lastFilledPosition = 0;

        lineUnitPositions.forEach(unitPosition => {
            for (let i = lastFilledPosition + 1; i < unitPosition.position; i++) {
                cells.push(<EmptyCell/>)
            }

            let unit = { ...squadState.units.find(unit => unit.id === unitPosition.unitId) }

            let activeUnit = battleState.attackingSquadState.units.concat(battleState.defendingSquadState.units)
                .find(unit => unit.id === battleState.roundState.activeUnitId)

            if (this.state.phase < 4) {
                if (unit.id === activeUnit.id) {
                    unit.selected = true;
                }
            }

            if (this.state.phase === 2) {
                if (activeUnit.abilities[0].targetSelectionUnitIds.includes(unit.id)) {
                    unit.target = true;
                }
            }

            if (this.state.phase === 3) {
                if (activeUnit.abilities[0].targetSelectionUnitIds.includes(unit.id)) {
                    if (unit.id === this.state.targetUnitId) {
                        unit.theTarget = true;
                    } else {
                        unit.untarget = true
                    }
                }

                if (unit.selected === true) {
                    unit.actor = true;
                }
            }

            if (this.state.phase === 4) {
                let unitActedEvent = battleEvents.find(it => it.type === "UnitActed")

                if (unit.id === unitActedEvent.actedUnitId) {
                    unit.acting = true;

                    unit.side = 0;
                }

                let affectedUnit = unitActedEvent.affectedUnits.find(it => it.unitId === unit.id)

                if (affectedUnit) {
                    unit.tookDamage = affectedUnit.effects[0].power
                }
            }

            cells.push(<UnitCell unit={unit} onClick={this.handleUnitClick}/>);

            let unitSizeCells = sizeTypeOf(unit) === 2 ? 4 : 2;

            lastFilledPosition = unitPosition.position + unitSizeCells - 1;
        }, this);

        for (let i = lastFilledPosition + 1; i <= 8; i++) {
            cells.push(<EmptyCell/>)
        }

        return cells;
    }

    renderDefendingSquad() {
        let defendingSquadState = this.state.battleState.defendingSquadState;

        return (
            <div className="squad squad-on-the-right">
                <div className="squad-line">
                    {this.renderSquadLine(defendingSquadState, 1)}
                </div>
                <div className="squad-line">
                    {this.renderSquadLine(defendingSquadState, 2)}
                </div>
            </div>
        );
    }

    handleUnitClick(theUnit) {
        if (!theUnit.target) {
            return;
        }

        this.setState({
            // battleState: this.state.battleState,
            phase: 3, // подготовка к действию: убрать таргеты, кроме зе таргетов, и оттопырить активный юнит
            targetUnitId: theUnit.id
        });

        // Здесь как-будто отправляем действие на сервер и получаем следующий апдейт. Можно лэтенси вызова прятять в анимацию.

        setTimeout(() => {
            this.setState({
                battleEvents: battleUpdate2.battleEvents,
                battleState: battleUpdate2.battleState,
                phase: 4, // показать действия, убрать выделения, обновить маски
                targetUnitId: null
            });
        }, 750); // 0.4 секунды на анимацию (трансформ) .unit-actor плюс небольшая задержка для драматизма

        // setTimeout(() => {
        //     this.setState({
        //         battleUpdateIncrements: null, // на всякий случай, вообще не должен дергаться, кроме 4-й фазы
        //
        //         phase: 5 //
        //     });
        // }, 750 + 2500); //

        setTimeout(() => {
            this.setState({
                battleEvents: null, // на всякий случай, вообще не должен дергаться, кроме 4-й фазы
                phase: 1 // Начинаем новый ход. У .unit-selected ещё есть задержка 0.5 секунды.
            });

            // todo: унифицировать с componentDidMount
            setTimeout(() => {
                this.setState({
                    phase: 2 // показать таргеты
                });
            }, 1500);
        }, 750 + 2400 + 500); // 2400 - время показа действий, полсекунды паузы до хода след. юнита.

        // setTimeout(() => {
        //     // todo: move error handler to request method
        //     this.requestUnitAction(theUnit).then(
        //         (result) => {
        //             function clearSelectedAndTargets(units) {
        //                 return update(units, {
        //                     $apply: units => units.map(unit => {
        //                         return { ...unit, selected: false, target: false };
        //                     })
        //                 });
        //             }
        //
        //             let units1 = clearSelectedAndTargets(result.units1)
        //             let units2 = clearSelectedAndTargets(result.units2)
        //
        //             function setActingUnitSide(units, side) {
        //                 units.forEach(unit => {
        //                     if (unit.acting) {
        //                         unit.side = side;
        //                     }
        //                 });
        //             }
        //
        //             setActingUnitSide(units1, 0)
        //             setActingUnitSide(units2, 1)
        //
        //             this.setState({
        //                 isLoaded: true,
        //                 units1: units1,
        //                 units2: units2
        //             });
        //
        //             setTimeout(() => {
        //                 function clearActingAndTookDamage(units) {
        //                     return update(units, {
        //                         $apply: units => units.map(unit => {
        //                             return { ...unit, acting: false, tookDamage: 0 };
        //                         })
        //                     });
        //                 }
        //
        //                 let units1 = clearActingAndTookDamage(result.units1);
        //                 let units2 = clearActingAndTookDamage(result.units2);
        //
        //                 this.setState({
        //                     isLoaded: true,
        //                     units1: noTargets(units1),
        //                     units2: noTargets(units2)
        //                 });
        //
        //                 setTimeout(() => {
        //                     this.setState({
        //                         isLoaded: true,
        //                         units1: units1,
        //                         units2: units2
        //                     });
        //                 }, 2000);
        //             }, 2500);
        //         },
        //         (error) => {
        //             this.setState({
        //                 isLoaded: true,
        //                 error
        //             })
        //         }
        //     );
        // }, 1000);
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

function sizeTypeOf(unit) {
    let unitClass = unitClasses.find(unitClass => unitClass.name === unit.unitClassName)

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

    render() {
        let unit = this.props.unit

        let unitHealth = unit.effectiveStats.health;
        let unitMaxHealth = unit.effectiveStats.maxHealth;

        let unitSizeTypeClassName = this.toUnitSizeTypeClassName(sizeTypeOf(unit));
        let unitSelectedClassName = unit.selected ? " unit-selected" : "";
        let unitTargetClassName = unit.target ? " unit-target" : "";
        let unitThetargetClassName = unit.theTarget ? " unit-the-target" : "";
        let unitUntargetClassName = unit.untarget ? " unit-untarget" : "";
        let unitActorClassName = unit.actor ? " unit-actor" : "";
        let unitActingClassNames = unit.acting ? (unit.side === 0 ? " unit-acting-left" : " unit-acting-right") : "";
        let unitTakingDamageClassName = unit.tookDamage > 0 ? " unit-took-damage" : "";
        let unitHealthMaskDeadOrAliveClassName = unitHealth > 0 ? "unit-health-mask-alive" : "unit-health-mask-dead";
        let unitShowDamageClassName = unit.tookDamage > 0 ? " unit-show-damage" : "";

        let damagedHealthPercent = ((unitMaxHealth - unitHealth) / unitMaxHealth) * 100;

        return (
            <div className={
                "unit-cell " +
                unitSizeTypeClassName +
                unitSelectedClassName +
                unitTargetClassName +
                unitThetargetClassName +
                unitUntargetClassName +
                unitActorClassName +
                unitActingClassNames +
                unitTakingDamageClassName
            }
                 onClick={() => this.props.onClick(unit)}
                 onMouseEnter={() => {
                     // console.log('ENTER');
                     this.state.mouseIsOver = true
                 }}
                 onMouseLeave={() => {
                     // console.log('LEAVE');
                     this.state.mouseIsOver = false
                 }}
            >
                <div className={"unit-health-mask " + unitHealthMaskDeadOrAliveClassName} style={{height: damagedHealthPercent + "%"}}/>
                <div className={unitSizeTypeClassName + unitShowDamageClassName} hidden={unit.tookDamage === 0}>{unit.tookDamage}</div>
                <div className="unit-status">
                    <span className="health-label">&nbsp;{unitHealth} / {unitMaxHealth}&nbsp;</span>
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
