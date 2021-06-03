namespace A
{
    export class Missile extends MovingObject
    {
        constructor( od: PacketMissile )
        {
            super( od.id, od.type! );
        }

        update( od: PacketMissile )
        {
            super.update( od );
            if ( od.team !== undefined )
            {
                if ( od.team === game.team )
                {
                    // if ( this.teamIndicator )
                    // {
                    //     this.teamIndicator.destroy();
                    //     this.teamIndicator = undefined;
                    // }
                }
                else
                {
                    // if ( !this.teamIndicator )
                    // {
                    //     this.teamIndicator = new PIXI.Sprite( assetMgr.load( "Enemy" ) );
                    //     this.container.addChildAt( this.teamIndicator, 0 );
                    // }
                }
            }
        }

        render()
        {
            this.ai.setRotation( this.clientMotion?.velocity.rotation ?? 0 );
            super.render();
        }

        draw()
        {
            // this.container.setTransform( p.x, p.y, renderer.mirrored ? -1 : 1, 1 );
            // if ( this.sprite.texture.baseTexture.valid )
            // {
            //     let tw = this.sprite.texture.width;
            //     let th = this.sprite.texture.height;
            //     let s = r * 2;
            //     this.sprite.setTransform( 0, 0, s / tw, s / th, this.clientMotion?.velocity.rotation ?? 0, 0, 0, tw / 2, th / 2 );
            // }
            // if ( this.teamIndicator )
            // {
            //     let R = r * 2;
            //     this.teamIndicator.width = this.teamIndicator.height = R * 2;
            //     this.teamIndicator.x = -R;
            //     this.teamIndicator.y = -R;
            // }
        }
    }
}
