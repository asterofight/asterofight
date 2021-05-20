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


        energyBarIsDirty = true;
        cooldownBarIsDirty = true;


        constructor( public parent: Spaceship )
        {
        }

        destroy()
        {
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
        }

        draw( resized: boolean )
        {
        }

    }
}
