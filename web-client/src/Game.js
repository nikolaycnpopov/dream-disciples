import React from 'react';
import './Game.css';

import unitClasses from './data/unit-classes.js';

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = { }

        this.handleUnitClick = this.handleUnitClick.bind(this)
    }

    componentDidMount() {
        const units1 = [
            // line 1
            { line: 1, position: 4, unitClassName: "squire" },
            // { line: 1, position: 6, unitClassName: "squire" },
            // line 2
            { line: 2, position: 1, unitClassName: "archer" },
            { line: 2, position: 3, unitClassName: "cleric" },
            { line: 2, position: 5, unitClassName: "apprentice" },
            { line: 2, position: 7, unitClassName: "archer" }
        ];

        const units2 = [
            // line 1
            { line: 1, position: 2, unitClassName: "squire" },
            { line: 1, position: 6, unitClassName: "squire" },
            // line 2
            // { line: 2, position: 1, unitClassName: "archer" },
            { line: 2, position: 1, unitClassName: "mage" },
            { line: 2, position: 4, unitClassName: "archer" },
            { line: 2, position: 7, unitClassName: "acolyte" }
        ];

        this.requestStartBattle(units1, units2).then(
            (result) => {
                this.startNextTurn(result.battleUpdate)
            },
            (error) => {
                this.setState({
                    error: error.message
                })
            }
        );
    }

    startNextTurn(battleUpdate) {
        this.setState({
            battleEvents: null, // на всякий случай, вообще не должен дергаться, кроме 4-й фазы
            battleState: battleUpdate.battleState, // нужно только для старта баттла, после хода будет выставлен на 4-й фазе
            phase: 1 // Начинаем новый ход. У .unit-selected ещё есть задержка 0.5 секунды.
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
            content = this.renderBattle();
        } else {
            content = (<div>Loading...</div>);
        }

        return (<div>{content}</div>);
    }

    renderBattle() {
        return (
            <div className="battle-field">
                {this.renderAttackingSquad()}
                {this.renderActionsPanel()}
                {this.renderDefendingSquad()}
            </div>
        );
    }

    renderAttackingSquad() {
        let attackingSquadState = this.state.battleState.attackingSquadState;

        let isHealAllTarget = this.isHealAllTarget(attackingSquadState);

        let isDamageAllTarget = this.isDamageAllTarget(attackingSquadState);

        let isAny = isHealAllTarget || isDamageAllTarget

        // todo: выбрать имя
        let allSquadClassNameString = isAny ? "all-squad" : "";

        var onClick;
        if (isAny) {
            onClick = this.handleSquadClick
        } else {
            onClick = function () { }
        }

        return (
            <div onClickCapture={onClick} className={"squad squad-on-the-left " + allSquadClassNameString}>
                <div className="squad-line">
                    {this.renderSquadLine(attackingSquadState, 1)}
                </div>
                <div className="squad-line">
                    {this.renderSquadLine(attackingSquadState, 2)}
                </div>
            </div>
        );
    }

    isHealAllTarget(squadState) {
        return this.getActiveUnitClassAbility().type === "HEAL_ALL" && this.isActiveUnitAt(squadState);
    }

    getActiveUnitClassAbility() {
        let activeUnit = this.getActiveUnit();

        let activeAbility = activeUnit.abilities[0]; // в будущем будет выбираться пользователем

        let activeUnitClassAbility = unitClasses
            .flatMap(unitClass => unitClass.abilities)
            .find(ability => ability.name === activeAbility.name);

        return activeUnitClassAbility;
    }

    getActiveUnit() {
        let battleState = this.state.battleState;

        return battleState.attackingSquadState.units.concat(battleState.defendingSquadState.units)
            .find(unit => unit.id === battleState.roundState.activeUnitId)
    }

    isActiveUnitAt(squadState) {
        return squadState.units.find(unit => unit.id === this.state.battleState.roundState.activeUnitId) !== undefined
    }

    isDamageAllTarget(squadState) {
        return this.getActiveUnitClassAbility().type === "DAMAGE_ALL" && !this.isActiveUnitAt(squadState);
    }

    handleSquadClick = event => {
        event.stopPropagation();

        this.unitAction();
    }

    async unitAction(targetUnitId) {
        this.setState({
            phase: 3, // подготовка к действию: убрать таргеты, кроме зе таргетов, и оттопырить активный юнит
            targetUnitId: targetUnitId
        });

        let battleUpdate = await this.requestUnitAction("USE_ABILITY", targetUnitId);

        // todo: когда это он null?
        // if (battleUpdate === null) {
        //     return;
        // }

        setTimeout(() => {
            this.setState({
                battleEvents: battleUpdate.battleEvents,
                battleState: battleUpdate.battleState,
                phase: 4, // показать действия, убрать выделения, обновить маски
                targetUnitId: null
            });
        }, 750); // 0.4 секунды на анимацию (трансформ) .unit-actor плюс небольшая задержка для драматизма

        setTimeout(() => {
            this.startNextTurn(battleUpdate)
        }, 750 + 2400); // 2400 - время показа действий, у .unit-selected есть своя задержка
    }

    // todo: unify with request start battle
    async requestUnitAction(actionType, targetUnitId) {
        let endpoint = '/unit-action';
        let data = { actionType: actionType, targetUnitId: targetUnitId }

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

                return json.battleUpdate;
            } else {
                this.setState({ error: endpoint + ": response not ok: " + json.message });

                return null;
            }
        } catch (error) {
            this.setState({ error: endpoint + " failed: " + error.message });

            return null;
        }
    }

    toServerUrl(endpoint) {
        return "http://localhost:8080" + endpoint;
    }

    async unitDefending() {
        let battleUpdate = await this.requestUnitAction("TAKE_DEFENSIVE_STANCE");

        this.setState({
            phase: 23 // показать действие защиты, в т.ч. убираются маски и выделения
        });

        setTimeout(() => {
            this.startNextTurn(battleUpdate)
        }, 1200); // время показа действия защиты, у .unit-selected есть своя задержка
    }

    renderSquadLine(squadState, line) {
        const lineUnitPositions = squadState.unitPositions.filter(unitPosition => unitPosition.line === line);

        const cells = [];
        var lastFilledPosition = 0;

        lineUnitPositions.forEach(unitPosition => {
            for (let i = lastFilledPosition + 1; i < unitPosition.position; i++) {
                cells.push(<EmptyCell/>)
            }

            let unit = { ...squadState.units.find(unit => unit.id === unitPosition.unitId) }

            let activeUnit = this.getActiveUnit()

            if (this.state.phase < 4) {
                if (unit.id === activeUnit.id) {
                    unit.selected = true;
                }
            }

            let activeUnitClassAbility = this.getActiveUnitClassAbility()

            if (this.state.phase === 2) {
                if (activeUnit.abilities[0].targetSelectionUnitIds.includes(unit.id)) {
                    if (activeUnitClassAbility.type === "HEAL_ANY" || activeUnitClassAbility.type === "HEAL_ALL") {
                        unit.potentialHealTarget = true;
                    } else {
                        unit.potentialDamageTarget = true;
                    }
                }
            }

            if (this.state.phase === 3) {
                let activeAbility = activeUnit.abilities[0]

                let activeUnitClassAbility = this.getActiveUnitClassAbility()

                if (activeUnitClassAbility.type === "DAMAGE_ALL") {
                    if (activeAbility.targetSelectionUnitIds.includes(unit.id)) {
                        unit.selectedDamageTarget = true
                    }
                } else if (activeUnitClassAbility.type === "DAMAGE_RANGE" || activeUnitClassAbility.type === "DAMAGE_MELEE") {
                    if (unit.id === this.state.targetUnitId) {
                        unit.selectedDamageTarget = true;
                    } else if (activeAbility.targetSelectionUnitIds.includes(unit.id)) {
                        unit.unselectedDamageTarget = true
                    }
                } else if (activeUnitClassAbility.type === "HEAL_ALL") {
                    if (activeAbility.targetSelectionUnitIds.includes(unit.id)) {
                        unit.selectedHealTarget = true
                    }
                } else if (activeUnitClassAbility.type === "HEAL_ANY") {
                    if (unit.id === this.state.targetUnitId) {
                        unit.selectedHealTarget = true;
                    } else if (activeAbility.targetSelectionUnitIds.includes(unit.id)) {
                        unit.unselectedHealTarget = true
                    }
                }

                if (unit.selected === true) {
                    unit.actor = true;
                }
            }

            if (this.state.phase === 4) {
                let battleEvents = this.state.battleEvents

                let unitActedEvent = battleEvents.find(it => it.type === "UNIT_ACTED")

                if (unit.id === unitActedEvent.actedUnitId) {
                    unit.acting = true;

                    let battleState = this.state.battleState;

                    if (battleState.attackingSquadState.units.find(it => it.id === unit.id) !== undefined) {
                        unit.side = 0;
                    } else {
                        unit.side = 1;
                    }
                }

                let affectedUnit = unitActedEvent.affectedUnits.find(it => it.unitId === unit.id)

                if (affectedUnit) {
                    if (affectedUnit.effects[0].type === "DAMAGE") {
                        unit.tookDamage = affectedUnit.effects[0].power
                    }

                    if (affectedUnit.effects[0].type === "HEAL") {
                        unit.tookHeal = affectedUnit.effects[0].power
                    }
                }
            }

            if (this.state.phase === 23) {
                if (unit.id === activeUnit.id) {
                    unit.takingDefensiveStance = true;
                }

                let activeAbility = activeUnit.abilities[0]

                let activeUnitClassAbility = this.getActiveUnitClassAbility()

                if (activeUnitClassAbility.type === "DAMAGE_ALL" || activeUnitClassAbility.type === "DAMAGE_RANGE" || activeUnitClassAbility.type === "DAMAGE_MELEE") {
                    if (activeAbility.targetSelectionUnitIds.includes(unit.id)) {
                        unit.unselectedDamageTarget = true
                    }
                }

                if (activeUnitClassAbility.type === "HEAL_ALL" || activeUnitClassAbility.type === "HEAL_ANY") {
                    if (activeAbility.targetSelectionUnitIds.includes(unit.id)) {
                        unit.unselectedHealTarget = true
                    }
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

    renderActionsPanel() {
        return (
            <div className="center-panel">
                <div className="actions-panel">
                    <button className="action-button">&nbsp;&nbsp;Wait&nbsp;&nbsp;</button>
                    <button className="action-button" onClick={() => this.unitDefending()}>&nbsp;Block&nbsp;</button>
                    <button className="action-button">Retreat</button>
                </div>
            </div>
        );
    }

    renderDefendingSquad() {
        let defendingSquadState = this.state.battleState.defendingSquadState;

        let isHealAllTarget = this.isHealAllTarget(defendingSquadState);

        let isDamageAllTarget = this.isDamageAllTarget(defendingSquadState);

        let isAny = isHealAllTarget || isDamageAllTarget

        // todo: выбрать имя
        let allSquadClassNameString = isAny ? "all-squad" : "";

        var onClick;
        if (isAny) {
            onClick = this.handleSquadClick
        } else {
            onClick = function () { }
        }

        return (
            <div onClickCapture={onClick} className={"squad squad-on-the-right " + allSquadClassNameString}>
                <div className="squad-line">
                    {this.renderSquadLine(defendingSquadState, 1)}
                </div>
                <div className="squad-line">
                    {this.renderSquadLine(defendingSquadState, 2)}
                </div>
            </div>
        );
    }

    // todo: handleUnitClick = theUnit => { // убрать бинд из конструктора
    handleUnitClick(theUnit) {
        if (!(theUnit.potentialDamageTarget || theUnit.potentialHealTarget)) {
            return;
        }

        this.unitAction(theUnit.id);
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
        let unit = this.props.unit;

        let unitSizeTypeClassName = this.toUnitSizeTypeClassName(sizeTypeOf(unit));
        let unitSelectedClassName = unit.selected ? " unit-selected" : "";
        let unitPotentialHealTargetClassName = unit.potentialHealTarget ? " unit-potential-heal-target" : "";
        let unitPotentialDamageTargetClassName = unit.potentialDamageTarget ? " unit-potential-damage-target" : "";
        let unitSelectedHealTargetClassName = unit.selectedHealTarget ? " unit-selected-heal-target" : "";
        let unitUnselectedHealTargetClassName = unit.unselectedHealTarget ? " unit-unselected-heal-target" : "";
        let unitSelectedDamageTargetClassName = unit.selectedDamageTarget ? " unit-selected-damage-target" : "";
        let unitUnselectedDamageTargetClassName = unit.unselectedDamageTarget ? " unit-unselected-damage-target" : "";
        let unitActorClassName = unit.actor ? " unit-actor" : "";
        let unitActingClassNames = unit.acting ? (unit.side === 0 ? " unit-acting-left" : " unit-acting-right") : "";
        let unitTookHealClassName = unit.tookHeal > 0 ? " unit-took-heal" : "";
        let unitTookDamageClassName = unit.tookDamage > 0 ? " unit-took-damage" : "";

        return (
            <div className={
                "unit-cell " +
                unitSizeTypeClassName +
                unitSelectedClassName +
                unitPotentialHealTargetClassName +
                unitPotentialDamageTargetClassName +
                unitSelectedHealTargetClassName +
                unitUnselectedHealTargetClassName +
                unitSelectedDamageTargetClassName +
                unitUnselectedDamageTargetClassName +
                unitActorClassName +
                unitActingClassNames +
                unitTookHealClassName +
                unitTookDamageClassName
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
                {this.renderContent()}
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

    renderContent() {
        let unit = this.props.unit;

        let unitHealth = unit.effectiveStats.health;
        let unitMaxHealth = unit.effectiveStats.maxHealth;

        let unitSizeTypeClassName = this.toUnitSizeTypeClassName(sizeTypeOf(unit));
        let unitHealthMaskDeadOrAliveClassName = unitHealth > 0 ? "unit-health-mask-alive" : "unit-health-mask-dead";
        let unitShowHealClassName = unit.tookHeal > 0 ? " unit-show-heal" : "";
        let unitShowDamageClassName = unit.tookDamage > 0 ? " unit-show-damage" : "";

        let damagedHealthPercent = ((unitMaxHealth - unitHealth) / unitMaxHealth) * 100;

        let impact = 0 + ((unit.tookHeal > 0) ? unit.tookHeal : 0) + ((unit.tookDamage > 0) ? unit.tookDamage : 0);

        let inDefenseStance = unit.effects.find(effect => effect.type === "DEFENSIVE_STANCE") !== undefined

        return (
            <div>
                <div hidden={!unit.takingDefensiveStance}>
                    <div className={unitSizeTypeClassName + " unit-taking-defensive-stance-border"}/>
                    <div className={unitSizeTypeClassName + " unit-taking-defensive-stance-mask"}>BLOCK</div>
                </div>
                <div className={unitSizeTypeClassName + unitShowHealClassName + unitShowDamageClassName} hidden={impact === 0}>{impact}</div>
                <div className="unit-name">
                    <span className="name-label">{unit.unitClassName}</span>
                </div>
                <div className="unit-status">
                    <span className="block-label" hidden={!inDefenseStance || unitHealth === 0}>BLOCK</span><br/><br/>
                    <span className="health-label">{unitHealth} / {unitMaxHealth}&nbsp;</span>
                </div>
                <div className={"unit-health-mask " + unitHealthMaskDeadOrAliveClassName} style={{height: damagedHealthPercent + "%"}}/>
            </div>
        );
    }

}

export default Game;
