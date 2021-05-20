namespace A
{
    export class Asteroid extends MapObject
    {
        m=0;

        constructor( od: PacketAsteroid )
        {
            super( false, od.id, "Asteroid" );
            //this.ai.setUniformScale( od.r! );
        }

    }
}