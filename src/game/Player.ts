namespace A
{

    export class Player
    {
        id = 0;
        name = "";
        team = 0;
        bot = false;
        respawnIn = 0;
        stats = { score: 0, scorePerHour: 0, kills: 0, deaths: 0, damageDone: 0, damageTaken: 0, healingDone: 0, energySpent: 0, energyRestored: 0, mapObjectiveScore: 0 };
        spaceshipType = "";
        lastSeenPacketId = 0;

        packetPositionHistory: Vector2[] = [];
        renderPositionHistory: Vector2[] = [];
        renderPositionAtPacketHistory: Vector2[] = [];
        serverPositionHistory: Vector2[] = [];

        constructor( od: PacketPlayer )
        {
            this.id = od.id;
        }

        update( od: PacketPlayer )
        {
            this.copyDefinedProps( od, this, "stats" );
            this.lastSeenPacketId = game.packetId;
            this.copyDefinedProps( od.stats, this.stats );
        }

        copyDefinedProps( src, dst, ...args )
        {
            for ( let prop in src )
                if ( src[ prop ] !== undefined && args.indexOf( prop ) === -1 )
                    dst[ prop ] = src[ prop ];
        }
    }
}
