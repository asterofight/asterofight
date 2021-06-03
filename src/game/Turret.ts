namespace A
{

    export class Turret
    {
        playerId = 0;
        e = 0;
        maxE = 0;
        pos = new Vector2();
        shootingPosition: Vector2 | null = null;
        a1ChargeStatus = 0;
        a2ChargeStatus = 0;
        a1Energy = 0;
        a2Energy = 0;

        name = "";

        readonly energyBar: HudBar;
        readonly cdBar: HudBar;

        static readonly energyBarColorLow = new BABYLON.Color4( 0x40 / 255, 0x40 / 255, 0x40 / 255, 1 );
        static readonly energyBarColorMedium = new BABYLON.Color4( 0x80 / 255, 0x80 / 255, 1, 1 );
        static readonly energyBarColorHigh = new BABYLON.Color4( 0x30 / 255, 0xa0 / 255, 1, 1 );
        static readonly cdBarColorHigh = new BABYLON.Color4( 0, 82 / 255, 127 / 255, 1 );

        constructor( public parent: Spaceship )
        {
            this.energyBar = new HudBar( parent.ai.root, "EnergyBar", false, 1 );
            this.cdBar = new HudBar( parent.ai.root, "CdBar", false, .9 );
        }

        destroy()
        {
            this.energyBar.destroy();
            this.cdBar.destroy();
        }

        update( pt: PacketTurret )
        {
            if ( pt.playerId !== undefined )
                this.playerId = pt.playerId;
            if ( pt.pos !== undefined )
                this.pos.setCoords( pt.pos.x, pt.pos.y );
            if ( pt.e !== undefined )
                this.e = pt.e;
            if ( pt.maxE !== undefined )
                this.maxE = pt.maxE;
            if ( !pt.useShootingPosition )
                this.shootingPosition = null;
            else if ( pt.shootingPosition !== undefined )
                this.shootingPosition = new Vector2( pt.shootingPosition.x, pt.shootingPosition.y );
            if ( pt.ability1ChargeStatus !== undefined )
                this.a1ChargeStatus = pt.ability1ChargeStatus;
            if ( pt.ability2ChargeStatus !== undefined )
                this.a2ChargeStatus = pt.ability2ChargeStatus;
            if ( pt.ability1Energy !== undefined )
                this.a1Energy = pt.ability1Energy;
            if ( pt.ability2Energy !== undefined )
                this.a2Energy = pt.ability2Energy;

            // name
            this.name =  this.playerId ? game.players.find( x => x.id === this.playerId )?.name ?? "" : "";

            let mirrorY = ( this.parent.team === 2 ) !== renderer.orientationRightToLeft;
            let disabled = ( this.parent.mods & PacketModifiers.Controllable );
            this.energyBar.mirrorY = mirrorY;
            this.energyBar.value = this.e / this.maxE;
            this.energyBar.color = disabled ? Spaceship.barColorDisabled :
                this.e >= 2 * this.a1Energy ? Turret.energyBarColorHigh :
                    this.e >= this.a1Energy ? Turret.energyBarColorMedium :
                        Turret.energyBarColorLow;
            this.cdBar.mirrorY = mirrorY;
            this.cdBar.value = this.a2ChargeStatus / 100;
            this.cdBar.color = disabled ? Spaceship.barColorDisabled : Turret.cdBarColorHigh;
        }

    }
}
