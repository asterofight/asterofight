// namespace A
// {
//
// 	export class Hermite
// 	{
// 		position: Vector2;
// 		velocity: Vector2;
// 		t: number;
//
// 		private a: Vector2;
// 		private b: Vector2;
// 		private c: Vector2;
// 		private d: Vector2;
//
// 		constructor( p0: Vector2, v0: Vector2, p1: Vector2, v1: Vector2, dt: number )
// 		{
// 			dt = 1 / dt;
// 			let dp = p1.sub( p0 );
// 			this.a = v0.add( v1 ).sub( dp.mul( 2 ) ).mul( dt * dt * dt );
// 			this.b = dp.mul( 3 ).sub( v0.mul( 2 ) ).sub( v1 ).mul( dt * dt );
// 			this.c = v0.mul( dt );
// 			this.d = p0.clone();
// 			this.t = 0;
// 			this.position = p0.clone();
// 			this.velocity = v0.clone();
// 		}
//
// 		setTime( t: number )
// 		{
// 			this.t = t;
// 			this.position = this.a.mul( t * t * t ).add( this.b.mul( t * t ) ).add( this.c.mul( t ) ).add( this.d );
// 			this.velocity = this.a.mul( 3 * t * t ).add( this.b.mul( 2 * t ) ).add( this.c );
// 			return this.position;
// 		}
// 	}
//
// }