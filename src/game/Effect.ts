namespace A
{
    
    export class Effect extends MapObject
    {
        startTime = 0;
        endTime = 0;
        lastSeenPacketId = 0;
        fade = false;

        constructor( od: PacketEffect )
        {
            super( false, od.id, od.type! );

            // if ( od.type === "Explosion" )
            // {
            //     let ani = this.sprite = assetMgr.loadAnimatedSprite( "Explosion", 5, 4, 96 ) as PIXI.AnimatedSprite;
            //     ani.animationSpeed = 0.4;
            //     ani.loop = false;
            //     ani.play();
            //     renderer.textLayer.addChild( ani );
            // }
            // else if ( od.type === "Shock" )
            // {
            //     this.sprite = new PIXI.Sprite( assetMgr.load( "Shock" ) );
            //     this.fade = true;
            //     renderer.textLayer.addChild( this.sprite );
            // }
            // // else if ( od.type === "NoControl" )
            // // {
            // //     this.sprite = null;
            // // }
            // else
            //     throw new Error( "not supported effect" );
        }

        update( od: PacketEffect )
        {
            super.update( od );
            if ( this.startTime === 0 )
                this.startTime = serverTime.packetTime;
            if ( od.ticksLeft !== undefined )
                this.endTime = ( serverTime.packetTicks + od.ticksLeft ) * ServerTime.serverTickInterval;
        }

        draw()
        {
            // if ( this.sprite?.texture.valid )
            // {
            //     let p = renderer.transform.transform( this.lastKnownP );
            //     let r = renderer.transform.transform( this.r );
            //     this.sprite.x = p.x - r;
            //     this.sprite.y = p.y - r;
            //     this.sprite.width = r * 2;
            //     this.sprite.height = r * 2;
            //     if ( this.fade )
            //         this.sprite.alpha = serverTime.time <= this.startTime ? 1 : serverTime.time >= this.endTime ? 0 :
            //             ( this.endTime - serverTime.time ) / ( this.endTime - this.startTime );
            // }
        }
    }
}
