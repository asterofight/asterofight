/// <reference path="Rectangle.ts"/>

namespace A
{

	export class UniformScaleTransform
	{
		sX = 0;
		sY = 0;
		tX = 0;
		tY = 0;
		isX = 0;
		isY = 0;
		itX = 0;
		itY = 0;

		init( srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH, fit?: boolean, mirrorX?: boolean, mirrorY?: boolean )
		{
			if ( ( srcW / srcH < dstW / dstH ) !== fit )
			{
				let s = dstW / srcW;
				if ( mirrorX )
				{
					this.sX = -s;
					this.sY = s;
					this.tX = srcX * s + dstX + dstW;
					this.tY = dstH / 2 - ( srcY + srcH / 2 ) * s + dstY;
				}
				else
				{
					this.sX = s;
					this.sY = s;
					this.tX = -srcX * s + dstX;
					this.tY = dstH / 2 - ( srcY + srcH / 2 ) * s + dstY;
				}
			}
			else
			{
				let s = dstH / srcH;
				if ( mirrorX )
				{
					this.sX = -s;
					this.sY = s;
					this.tX = -dstW / 2 + ( srcX + srcW / 2 ) * s + dstX + dstW;
					this.tY = -srcY * s + dstY;
				}
				else
				{
					this.sX = s;
					this.sY = s;
					this.tX = dstW / 2 - ( srcX + srcW / 2 ) * s + dstX;
					this.tY = -srcY * s + dstY;
				}
			}
			this.isX = 1 / this.sX;
			this.isY = 1 / this.sY;
			this.itX = -this.tX / this.sX;
			this.itY = -this.tY / this.sY;
		}

		transform( x: number, y: number ): Vector2;
		transform( pos: Vector2 ): Vector2;
		transform( d: number ): number;
		transform( x: number, y: number, w: number, h: number ): Rectangle;
		transform( rect: Rectangle ): Rectangle;
		transform( vlx: Rectangle | Vector2 | number, y?: number, w?: number, h?: number ): Rectangle | Vector2 | number
		{
			if ( typeof vlx === "number" )
				if ( y === undefined )
					return vlx * Math.abs( this.sX );
				else
				{
					if ( w === undefined )
						return this.transformPosition( vlx, y );
					else
						return this.transformRectangle( vlx, y, w, h! );
				}
			else if ( vlx instanceof Vector2 )
				return this.transformPosition( vlx.x, vlx.y );
			else
				return this.transformRectangle( vlx.x, vlx.y, vlx.w, vlx.h );
		}

		private transformPosition( x: number, y: number )
		{
			return new Vector2( x * this.sX + this.tX, y * this.sY + this.tY );
		}

		private transformRectangle( x: number, y: number, w: number, h: number )
		{
			let c1 = this.transformPosition( x, y );
			let c2 = this.transformPosition( x + w, y + h );
			return new Rectangle( Math.min( c1.x, c2.x ), Math.min( c1.y, c2.y ), Math.abs( c1.x - c2.x ), Math.abs( c1.y - c2.y ) );
		}

		transformNormal( x: number, y: number ): Vector2;
		transformNormal( pos: Vector2 ): Vector2;
		transformNormal( vlx: Vector2 | number, y?: number ): Vector2
		{
			if ( typeof vlx === "number" )
				return new Vector2( vlx * ( this.sX > 0 ? 1 : -1 ), y! * ( this.sY > 0 ? 1 : -1 ) );
			else
				return this.transformNormal( vlx.x, vlx.y );
		}

		transformBack( x: number, y: number ): Vector2;
		transformBack( pos: Vector2 ): Vector2;
		transformBack( vlx: Vector2 | number, y?: number ): Vector2 | number
		{
			if ( typeof vlx === "number" )
				return new Vector2( vlx * this.isX + this.itX, y! * this.isY + this.itY );
			else
				return this.transformBack( vlx.x, y! );
		}

	}
}
