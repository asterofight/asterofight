namespace A
{
	export class Vector2
	{
		constructor( public x: number = 0, public y: number = 0 ) { }

		add( v: Vector2 ) { return new Vector2( this.x + v.x, this.y + v.y ); }
		sub( v: Vector2 ) { return new Vector2( this.x - v.x, this.y - v.y ); }
		mul( t: number ) { return new Vector2( this.x * t, this.y * t ); }
		neg() { return new Vector2( -this.x, -this.y ); }
		eq( v: Vector2 ) { return this.x === v.x && this.y === v.y; }
		notEq( v: Vector2 ) { return this.x !== v.x || this.y !== v.y; }
		dist( v: Vector2 ) { return Math.sqrt( ( this.x - v.x ) * ( this.x - v.x ) + ( this.y - v.y ) * ( this.y - v.y ) ); }
		distS( v: Vector2 ) { return ( this.x - v.x ) * ( this.x - v.x ) + ( this.y - v.y ) * ( this.y - v.y ); }
		dot( v: Vector2 ) { return this.x * v.x + this.y * v.y; }
		lerp( v: Vector2, t: number ) { return new Vector2( this.x + ( v.x - this.x ) * t, this.y + ( v.y - this.y ) * t ); }
		norm() { let f = 1 / this.len; return new Vector2( this.x * f, this.y * f ); }
		clone() { return new Vector2( this.x, this.y ); }
		clamp( len: number ) { let lenS = this.lenS; return lenS <= len * len ? this : this.mul( len / Math.sqrt( lenS ) ); }

		setCoords( x: number, y: number ) { this.x = x; this.y = y; return this; }

		get len() { return Math.sqrt( this.x * this.x + this.y * this.y ); }
		get lenS() { return this.x * this.x + this.y * this.y; }
		get rotation() { return Math.atan2( this.y, this.x ); }


		static get one() { return new Vector2( 1, 1 ); }
		static get zero() { return new Vector2( 0, 0 ); }
	}

}
