namespace A
{
    export class Asteroid extends MapObject
    {
        constructor( od: PacketAsteroid )
        {
            super( false, od.id, "Asteroid" );
        }

        update( od:PacketAsteroid )
        {
            super.update( od );
            this.ai.setPos( this.renderPosition.x, this.renderPosition.y );
        }

        render()
        {
            if ( this.ai.mesh )
                this.ai.mesh.rotation.y += 0.002;
            super.render();
        }

    }
}