/// <reference path="Vector2.ts"/>
namespace A
{

	export class Verlet
	{
		position = Vector2.zero;
		velocity = Vector2.zero;
		acceleration = Vector2.zero;
		maxSpeed?: number;
		maxAcceleration?: number;

		step( dt: number, a?: Vector2 )
		{
			if ( a )
				this.acceleration = this.maxAcceleration ? a.clamp( this.maxAcceleration ) : a;
			let dp = this.velocity.mul( dt ).add( this.acceleration.mul( dt * dt ) );
			if ( this.maxSpeed )
				dp = dp.clamp( this.maxSpeed );
			this.position = this.position.add( dp );
			this.velocity = dp.mul( 1 / dt );
			return this.position;
		}

		reset( p = Vector2.zero, v = Vector2.zero, a = Vector2.zero, maxSpeed?: number, maxAcceleration?: number )
		{
			this.position = p;
			this.velocity = maxSpeed ? v.clamp( maxSpeed ) : v;
			this.acceleration = maxAcceleration ? a.clamp( maxAcceleration ) : a;
			this.maxSpeed = maxSpeed;
			this.maxAcceleration = maxAcceleration;
		}
	}

}