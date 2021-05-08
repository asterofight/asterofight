/// <reference path="Transform.ts"/>

namespace A {
	export class RendererPixi {
		mirrored = false;

		// http://millionthvector.blogspot.com/p/free-sprites_12.html


		readonly transform = new UniformScaleTransform();
		readonly pixiApp: PIXI.Application;

		private readonly background: PIXI.TilingSprite;
		private readonly border: PIXI.Graphics;

		mapContainer = new PIXI.Container();
		markingLayer = new PIXI.Container();
		asteroidLayer = new PIXI.Container();
		spaceshipLayer = new PIXI.Container();
		missileLayer = new PIXI.Container();
		textLayer = new PIXI.Container();


		constructor() {
			PIXI.utils.skipHello();
			this.pixiApp = new PIXI.Application( {
				resolution: window.devicePixelRatio,
				resizeTo: document.body,
				clearBeforeRender: false
			} );
			this.mapContainer.addChild( this.markingLayer, this.missileLayer, this.asteroidLayer, this.spaceshipLayer, this.textLayer );
			this.mapContainer.zIndex = 1;
			this.pixiApp.stage.addChild( this.mapContainer );
			this.pixiApp.stage.sortableChildren = true;
			document.body.insertBefore( this.pixiApp.view, document.body.firstChild );
			this.background = new PIXI.TilingSprite( PIXI.Texture.from( "images/b1.jpg" ) );
			this.pixiApp.stage.addChild( this.background );
			this.pixiApp.ticker.add( delta => this.draw( delta ) );
			this.border = new PIXI.Graphics();
			this.markingLayer.addChild( this.border );
		}

		getGameCoords( x, y ): Vector2 {
			return this.transform.transformBack( x, y );
		}


		private draw( t: number ) {
			if ( !game.packetId )
				return;
			let resized = this.background.width !== this.pixiApp.renderer.screen.width || this.background.height !== this.pixiApp.renderer.screen.height;
			if ( resized ) {
				this.background.width = this.pixiApp.renderer.screen.width;
				this.background.height = this.pixiApp.renderer.screen.height;
			}

			let ownTeam = game.player?.team ?? 1;
			this.mirrored = ownTeam === 2;

			game.onDraw();

			this.transform.init( game.visibleArea.x, game.visibleArea.y, game.visibleArea.w, game.visibleArea.h,
				0, 0, this.pixiApp.renderer.screen.width, this.pixiApp.renderer.screen.height, false, this.mirrored );
			//this.mapContainer.setTransform( this.transform.tX, this.transform.tY, this.transform.sX, this.transform.sY );

			let rect = this.transform.transform( game.mapArea.x, game.mapArea.y, game.mapArea.w, game.mapArea.h );
			this.border.clear();
			this.border.lineStyle( 10, 0x404040, 1 );
			this.border.drawRect( rect.x, rect.y, rect.w, rect.h );

			if ( this.background )
				this.background.tilePosition.set( ( this.mirrored ? 1 : -1 ) * 10 * game.visibleArea.x, -10 * game.visibleArea.y );

			for ( let obj of game.capturePoints )
				obj.draw();
			for ( let obj of game.asteroids )
				obj.draw();
			for ( let obj of game.missiles )
				obj.draw();
			for ( let obj of game.spaceships )
				obj.draw( resized );
			for ( let obj of game.effects )
				obj.draw();
			for ( let obj of game.movingEffects )
				obj.draw();

			debug.updateFPS();
		}

	}
}
