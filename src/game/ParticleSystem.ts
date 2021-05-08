namespace A
{

	export class ParticleSystem
	{
		emitterP = new Vector2();
		emitterV = new Vector2();
		emitting = false;
		interval = 0.01; // s
		fade = 1.5; // s
		randomize = 1;
		private lastEmit = 0;
		//color: string;

		particles: { position: Vector2, velocity: Vector2, createdAt: number }[] = [];

		draw()
		{
			let now = serverTime.time;
			while ( this.particles.length > 0 && now - this.particles[ 0 ].createdAt > this.fade )
				this.particles.shift();
			if ( this.emitting && now >= this.lastEmit + this.interval )
			{
				this.lastEmit = now;
				let v = this.emitterV;
				if ( this.randomize )
				{
					v.x += ( ( now * 1000 ) % 1 ) * this.randomize * 2 - this.randomize;
					v.y += ( ( now * 100 ) % 1 ) * this.randomize * 2 - this.randomize;
				}
				this.particles.push( { position: this.emitterP, velocity: v, createdAt: now } );
			}
			// for ( let particle of this.particles )
			// {
			// 	let dt = now - particle.createdAt;
			// 	let progress = dt / this.fade;
			// 	let p = particle.position.add( particle.velocity.mul( dt ) ).add( particle.velocity.mul( -0.5 * dt * dt / this.fade ) );
			// 	p = renderer.transform.transform( p );
			// 	let r = renderer.transform.transform( 1 ) * ( dt + 0.2 );
			// 	ctx.globalAlpha = 1 - progress;
			// 	renderer.spriteSmoke.drawAtPoint( ctx, p, r * 2 );
			// }
			// ctx.globalAlpha = 1;
		}

	}

}