namespace A
{

	export class PidController
	{
		output = new Vector2();

		private pError = new Vector2();
		private integral = new Vector2();

		constructor( public Kp = 1, public Ki = 0, public Kd = 0, public maxOutput?: number )
		{
			this.reset();
		}

		step( error: Vector2, dt: number ): Vector2
		{
			this.integral = this.integral.add( error.mul( dt * this.Ki ) );
			let d = error.sub( this.pError ).mul( this.Kd / dt );
			this.output = error.mul( this.Kp ).add( this.integral ).add( d );
			if ( this.maxOutput )
			{
				this.integral = this.integral.clamp( this.maxOutput );
				this.output = this.output.clamp( this.maxOutput );
			}
			this.pError = error;
			return this.output;
		}

		reset()
		{
			this.pError = Vector2.zero;
			this.integral = Vector2.zero;
		}
	}

}