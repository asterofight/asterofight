/// <reference path="debugData.ts"/>
namespace A
{

	export class ServerTime
	{
		static serverTickInterval: number = 0.05;
		static serverSendInterval: number = 0.1;

		zeroServerTimeInLocalTime = 0;
		time = 0;
		timeSincePacket = 0;
		packetTicks = 0;
		packetTime = 0;
		renderDelta = 0.001;

		private currentDsct = 0;
		private targetDsct = 0;
		private lastUpdate = 0;
		private lastMeasure = 0;

		async onPacket( serverTicks: number )
		{
			let now = performance.now() * 0.001;
			this.packetTicks = serverTicks;
			this.packetTime = now;//serverTicks * ServerTime.serverTickInterval;
			this.targetDsct = this.packetTime - now;
			let diff = Math.abs( this.targetDsct - this.currentDsct );
			if ( diff > 0.1 )
				this.currentDsct = this.targetDsct;
			if ( !this.zeroServerTimeInLocalTime )
				this.zeroServerTimeInLocalTime = Date.now() - this.packetTime * 1000;
			//debug.updateChart( "Server Time", diff * 1000, 0, 100, "ms" );
			if ( now - this.lastMeasure > 1 )
			{
				this.lastMeasure = now;
				let t0 = performance.now();
				await gameConnector.Ack();
				let t1 = performance.now();
				debug.updateChart( "Ping", ( t1 - t0 ), 0, 500, "ms" );
			}
		}

		onDraw()
		{
			let maxAdjustment = 0.0001;
			let adjustment = ( this.targetDsct - this.currentDsct ) * 0.001;
			this.currentDsct += Math.min( maxAdjustment, Math.max( -maxAdjustment, adjustment ) );
			this.time = performance.now() * 0.001 + this.currentDsct;
			this.timeSincePacket = this.time - this.packetTime;
			if ( this.lastUpdate )
				this.renderDelta = this.time - this.lastUpdate;
			this.lastUpdate = this.time;
		}

		toLocalTime( t: number )
		{
			return new Date( this.zeroServerTimeInLocalTime + t * 1000 );
		}


	}

	export var serverTime = new ServerTime();
}
