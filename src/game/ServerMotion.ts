namespace A
{

	export class ServerMotion
	{
		packets: {
			t: number,
			p: Vector2,
			v: Vector2,
			a: Vector2,
			maxSpeed: number
		}[] = [];

		addPacket( p: Vector2, v: Vector2, a: Vector2, maxSpeed: number )
		{
			this.packets.push( { t: serverTime.packetTime, p, v, a, maxSpeed } );

		}

		getPositionAt( t: number )
		{
			if ( this.packets.length === 0 )
				return Vector2.zero;
			let i = this.packets.length - 1;
			while ( i >= 0 && this.packets[ i ].t > t )
				i--;
			if ( i < 0 )
				return this.packets[ 0 ].p;
			let pck = this.packets[ i ];
			let npck = this.packets[ i + 1 ];
			if ( i > 0 )
				this.packets.shift();

			if ( npck ) // interpolate
				return pck.p.lerp( npck.p, ( t - pck.t ) / ( npck.t - pck.t ) );

			// extrapolate
			let dt = t - pck.t;
			return pck.p.add( pck.v.mul( dt ) ).add( pck.a.mul( dt * dt * 0.5 ) );
		}
	}

}