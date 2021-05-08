namespace A
{

	export class MovingEffect extends MovingObject
	{
		private sprite: PIXI.Sprite;
		private container = new PIXI.Container();

		constructor( od: PacketMovingEffect )
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

		update( od: PacketMovingEffect )
		{
			super.update( od );
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
		}
	}
}
