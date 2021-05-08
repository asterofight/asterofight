namespace A
{
    export class Missile extends MovingObject
    {
        private sprite: PIXI.Sprite;
        private container = new PIXI.Container();
        private teamIndicator?: PIXI.Sprite;

        constructor( od: PacketMissile )
        {
            super( od.id );
            this.sprite = new PIXI.Sprite( assetMgr.load( od.type! ) );
            this.container.addChild( this.sprite );
            renderer.missileLayer.addChild( this.container );
        }

        destroy()
        {
            this.container.destroy();
        }

        update( od: PacketMissile )
        {
            super.update( od );
            if ( od.team !== undefined )
            {
                if ( od.team === game.team )
                {
                    if ( this.teamIndicator )
                    {
                        this.teamIndicator.destroy();
                        this.teamIndicator = undefined;
                    }
                }
                else
                {
                    if ( !this.teamIndicator )
                    {
                        this.teamIndicator = new PIXI.Sprite( assetMgr.load( "Enemy" ) );
                        this.container.addChildAt( this.teamIndicator, 0 );
                    }
                }
            }
        }

        draw()
        {
            let p = renderer.transform.transform( this.renderPosition );
            let r = renderer.transform.transform( this.r );
            this.container.setTransform( p.x, p.y, renderer.mirrored ? -1 : 1, 1 );
            if ( this.sprite.texture.baseTexture.valid )
            {
                let tw = this.sprite.texture.width;
                let th = this.sprite.texture.height;
                let s = r * 2;
                this.sprite.setTransform( 0, 0, s / tw, s / th, this.clientMotion?.velocity.rotation ?? 0, 0, 0, tw / 2, th / 2 );
            }
            if ( this.teamIndicator )
            {
                let R = r * 2;
                this.teamIndicator.width = this.teamIndicator.height = R * 2;
                this.teamIndicator.x = -R;
                this.teamIndicator.y = -R;
            }
        }
    }
}
