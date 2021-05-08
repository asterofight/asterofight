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


        private name: PIXI.Text;
        private energyBar: PIXI.Graphics;
        private cooldownBar: PIXI.Graphics;
        energyBarIsDirty = true;
        cooldownBarIsDirty = true;


        constructor( public parent: Spaceship, private parentContainer: PIXI.Container )
        {
            this.energyBar = new PIXI.Graphics();
            this.cooldownBar = new PIXI.Graphics();
            parentContainer.addChild( this.energyBar );
            parentContainer.addChild( this.cooldownBar );
            this.name = new PIXI.Text( "", { fontFamily: 'Arial', fontSize: 16, fill: 0xffffff } );
            renderer.textLayer.addChild( this.name );
        }

        destroy()
        {
            this.name.destroy();
        }

        update( pt: PacketTurret )
        {
            if ( pt.playerId !== undefined )
                this.playerId = pt.playerId;
            if ( pt.pos !== undefined )
                this.pos.setCoords( pt.pos.x, pt.pos.y );
            this.energyBarIsDirty = this.energyBarIsDirty || pt.e !== undefined;
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
            {
                this.a2ChargeStatus = pt.ability2ChargeStatus;
                this.cooldownBarIsDirty = true;
            }
            if ( pt.ability1Energy !== undefined )
                this.a1Energy = pt.ability1Energy;
            if ( pt.ability2Energy !== undefined )
                this.a2Energy = pt.ability2Energy;

            // name
            let name = this.playerId ? game.players.find( x => x.id === this.playerId )?.name ?? "" : "";
            if ( this.name.text !== name )
                this.name.text = name;
            this.name.style.fill = game.team === this.parent.team ? 0xc6eaff : 0xff6857;
        }

        draw( resized: boolean )
        {
            let p = renderer.transform.transform( this.parent.renderPosition.add( this.pos ) );
            this.name.x = p.x - this.name.width / 2;
            this.name.y = p.y - 45;
            let px = renderer.transform.transform( this.pos.x );
            let py = renderer.transform.transform( this.pos.y );
            this.cooldownBar.x = this.energyBar.x = ( this.parent.team === 1 ) ? px : -px;
            this.cooldownBar.y = this.energyBar.y = py;
            if ( this.energyBarIsDirty || resized )
            {
                this.energyBarIsDirty = false;
                let r = renderer.transform.transform( this.parent.r <= 1 ? this.parent.r * 1.5 : 1.5 );
                this.energyBar.clear();
                if ( this.e > 0 )
                {
                    this.energyBar.lineStyle( 3, (this.parent.mods & PacketModifiers.Controllable) ? 0x808080 : this.e >= 2 * this.a1Energy ? 0x30A0FF : this.e >= this.a1Energy ? 0x8080FF : 0x404040, 1 );
                    //this.energyBar.lineStyle( 3, this.e >= 2 * this.a1Energy ? 0x30A0FF : this.e >= this.a1Energy ? 0x8080FF : 0x404040, 1 );
                    let eLen = Math.PI * 2 / 3;
                    this.energyBar.arc( 0, 0, r, eLen / 2, eLen / 2 - eLen * this.e / this.maxE, true );
                }
            }
            if ( this.cooldownBarIsDirty || resized )
            {
                this.cooldownBarIsDirty = false;
                let r = renderer.transform.transform( Math.min( 1, this.parent.r ) * 1.3 );
                this.cooldownBar.clear();
                if ( this.e > 0 )
                {
                    this.cooldownBar.lineStyle( 3, (this.parent.mods & PacketModifiers.Controllable) ? 0x808080 : this.a2ChargeStatus < 100 ? 0x404040 : 0x00527F, 1 );
                    //this.cooldownBar.lineStyle( 2, this.a2ChargeStatus < 100 ? 0x404040 : 0x00527F, 1 );
                    let eLen = Math.PI * 2 / 3;
                    this.cooldownBar.arc( 0, 0, r, eLen / 2, eLen / 2 - eLen * this.a2ChargeStatus / 100, true );
                }
            }
        }

    }
}
