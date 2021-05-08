namespace A
{
    export class Asteroid extends MapObject
    {
        m=0;
        private static texture = PIXI.Texture.from( "images/Asteroid1.png" );
        private sprite = new PIXI.Sprite( Asteroid.texture );

        constructor( od: PacketAsteroid )
        {
            super( false, od.id );
            renderer.asteroidLayer.addChild( this.sprite );
        }

        destroy()
        {
            this.sprite.destroy();
        }

        update( od: PacketAsteroid )
        {
            super.update( od );
        }

        draw()
        {
            let p = renderer.transform.transform( this.renderPosition );
            let r = renderer.transform.transform( this.r );
            this.sprite.x = p.x - r;
            this.sprite.y = p.y - r;
            this.sprite.width = r * 2;
            this.sprite.height = r * 2;
        }
    }
}