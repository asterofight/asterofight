/// <reference path="connector.ts"/>
/// <reference path="../assetMgr/assetMgr.ts"/>
/// <reference path="Verlet.ts"/>
/// <reference path="ServerMotion.ts"/>
/// <reference path="PidController.ts"/>

namespace A
{

	export class MapObject
	{
		lastSeenPacketId = game.packetId;
		r = 0;
		team = 0;
		renderPosition = new Vector2();
		lastKnownP = new Vector2();
		readonly ai: AssetInstance;

		constructor( public canMove: boolean, public id: number, public type: string )
		{
			this.ai = assetMgr.createInstance( type );
		}

		destroy()
		{
			this.ai.destroy();
		}

		update( od: PacketMapObject )
		{
			this.lastSeenPacketId = game.packetId;
			if ( od.type !== undefined )
				this.type = od.type;
			if ( od.r !== undefined )
				this.r = od.r;
			if ( od.team !== undefined )
				this.team = od.team;
			if ( od.p !== undefined )
			{
				this.lastKnownP.setCoords( od.p.x, od.p.y );
				if ( !this.canMove )
					this.renderPosition = this.lastKnownP;
			}
			this.ai.setUniformScale( this.r * 2 );
		}

		render()
		{
			this.ai.setPos( this.renderPosition.x, this.renderPosition.y );
		}
	}

	export class MovingObject extends MapObject
	{
		lastKnownV = new Vector2();
		lastKnownA = new Vector2();
		maxS = 0;
		maxA = 0;

		clientMotion: Verlet;
		serverMotion: ServerMotion;
		pid?: PidController;

		constructor( id: number, type: string )
		{
			super( true, id, type );
			this.clientMotion = new Verlet();
			this.serverMotion = new ServerMotion();
			this.pid = new PidController( 50, 2, 15, 50 ); // https://robotics.stackexchange.com/questions/167/what-are-good-strategies-for-tuning-pid-loops
		}

		update( od: PacketMovingObject )
		{
			super.update( od );
			if ( od.v )
				this.lastKnownV.setCoords( od.v.x, od.v.y );
			if ( od.a )
				this.lastKnownA.setCoords( od.a.x, od.a.y );
			if ( od.maxS !== undefined )
				this.maxS = od.maxS;
			if ( od.maxA !== undefined )
				this.maxA = od.maxA;

			this.serverMotion.addPacket( this.lastKnownP, this.lastKnownV, this.lastKnownA, this.maxS );

			if ( this.lastKnownP.sub( this.renderPosition ).lenS > 4 )
				this.clientMotion.reset( this.lastKnownP, this.lastKnownV, this.lastKnownA );
			this.ai.setUniformScale( this.r * 2 );
		}

		render()
		{
			let p = this.serverMotion!.getPositionAt( serverTime.time );
			this.renderPosition = this.clientMotion!.step( 1 / 60, this.pid!.step( p.sub( this.clientMotion!.position ), 1 / 60 ) );
			super.render();
		}

	}

}


