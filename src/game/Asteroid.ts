namespace A
{
    export class Asteroid extends MapObject
    {
        m = 0;

        constructor( od: PacketAsteroid )
        {
            super( false, od.id, "Asteroid" );
            //this.ai.setUniformScale( od.r! );
            //console.log( `${ od.p?.x }x${ od.p?.y } ${ od.r }` );
        }

        render()
        {
            this.ai.setPos( this.renderPosition.x, this.renderPosition.y );
            // if ( this.ai.root )
            // {
            //     let rot = 0.001 / this.r;
            //     this.ai.root.rotation.set( 0, this.ai.root.rotation.y + 3 * rot, 0 );
            // }
        }


    }
}