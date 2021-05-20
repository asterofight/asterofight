/// <reference path="Rectangle.ts"/>
/// <reference path="SpacePartitioning.ts"/>


namespace A
{
	export class Map
	{
		mapArea = new Rectangle( -40, -22.5, 80, 45 );
		asteroids: Asteroid[] = [];


		private maxGravityRadius = 25;


		getGravity( mo: MapObject )
		{
			var ret = new Vector2();
			for ( let obj of this.asteroids )
				ret = ret.add( this.getGravity1( obj, mo ) );
			return ret;
		}

		private getGravity1( obj: Asteroid, mo: MapObject )
		{
			let ds = mo.renderPosition.distS( obj.renderPosition );
			var g = obj.m / ds;
			return obj.renderPosition.sub( mo.renderPosition ).mul( g ).mul( 1 / Math.sqrt( ds ) );
		}

	}

}
