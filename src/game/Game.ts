/// <reference path="GameObjects.ts"/>
/// <reference path="Map.ts"/>
/// <reference path="Asteroid.ts"/>
/// <reference path="Effect.ts"/>
/// <reference path="LinkEffect.ts"/>
/// <reference path="ParticleSystem.ts"/>
/// <reference path="CapturePoint.ts"/>
/// <reference path="Missile.ts"/>
/// <reference path="Spaceship.ts"/>
/// <reference path="Player.ts"/>


namespace A
{

	export class Game
	{
		visibleArea: PacketRectangleD = { x: -40, y: -22.5, w: 80, h: 45 };
		mapArea: PacketRectangleD = { x: -40, y: -22.5, w: 80, h: 45 };

		user: PacketUser | undefined;
		team = 1;
		playerId = 0;
		players: Player[] = [];
		player?: Player;
		asteroids: Asteroid[] = [];
		effects: Effect[] = [];
		linkEffects: LinkEffect[] = [];
		particleSystems: ParticleSystem[] = [];
		capturePoints: CapturePoint[] = [];
		missiles: Missile[] = [];
		spaceships: Spaceship[] = [];
		controlledObject?: MovingObject;
		autoPilot = false;
		inputAcceleration = new Vector2();

		packetId = 0;
		//packetTicks = 0;
		lastKnownControlledObjectId = 0;

		constructor()
		{
			renderer.onRender.add( () => this.onRender() );
			renderer.onOrientationChanged.add( () => this.onOrientationChanged() );
		}


		private getOrCreateObject<T>( list: T[], id: number, factory: () => T )
		{
			let obj = list.find( x => ( x as any ).id === id );
			if ( !obj )
				list.push( obj = factory() );
			return obj;
		}

		onMap( data )
		{
			ServerTime.serverTickInterval = data.serverTickInterval;
			ServerTime.serverSendInterval = data.serverSendInterval;
			this.mapArea.x = data.mapArea.X;
			this.mapArea.y = data.mapArea.Y;
			this.mapArea.w = data.mapArea.W;
			this.mapArea.h = data.mapArea.H;
			this.visibleArea.w = data.viewSize.X;
			this.visibleArea.h = data.viewSize.Y;
		}

		onPacket( packet: Packet )
		{
			this.packetId = packet.id;
			//this.packetTicks = packet.serverTicks;
			serverTime.onPacket( packet.serverTicks );
			if ( packet.playerId !== undefined )
				this.playerId = packet.playerId;
			
			let ownTeam = this.player?.team ?? 1;
			renderer.setTeam( ownTeam === 2 );



			//////////////////////// Players ////////////////////////
			if ( packet.players )
			{
				for ( let od of packet.players )
				{
					let obj = this.players.find( x => x.id === od.id );
					if ( !obj )
						this.players.push( obj = new Player( od ) );
					obj.update( od );
				}
				this.players = this.players.filter( obj => obj.lastSeenPacketId === packet.id );
			}
			this.player = this.players.find( x => x.id === this.playerId );
			this.team = game.player?.team ?? 1;
			if ( packet.controlledObjId !== undefined )
				this.lastKnownControlledObjectId = packet.controlledObjId;
			this.controlledObject = undefined;

			//////////////////////// Asteroids ////////////////////////
			if ( packet.asteroids )
			{
				for ( let od of packet.asteroids )
				{
					let obj = this.getOrCreateObject( this.asteroids, od.id, () => new Asteroid( od ) );
					obj.update( od );
				}
				for ( let obj of this.asteroids )
					if ( obj.lastSeenPacketId !== packet.id )
						obj.destroy();
				this.asteroids.removeAll( obj => obj.lastSeenPacketId !== packet.id );
			}

			//////////////////////// CapturePoints ////////////////////////
			for ( let od of packet.capturePoints )
			{
				let obj = this.getOrCreateObject( this.capturePoints, od.id, () => new CapturePoint( od ) );
				obj.update( od );
			}
			for ( let obj of this.capturePoints )
				if ( obj.lastSeenPacketId !== packet.id )
					obj.destroy();
			this.capturePoints = this.capturePoints.filter( obj => obj.lastSeenPacketId === packet.id );

			//////////////////////// Missiles ////////////////////////
			for ( let od of packet.missiles )
			{
				let obj = this.getOrCreateObject( this.missiles, od.id, () => new Missile( od ) );
				obj.update( od );
				if ( obj.id === this.lastKnownControlledObjectId )
					this.controlledObject = obj;
			}
			for ( let obj of this.missiles )
				if ( obj.lastSeenPacketId !== packet.id )
					obj.destroy();
			this.missiles = this.missiles.filter( obj => obj.lastSeenPacketId === packet.id );

			//////////////////////// Spaceships ////////////////////////
			for ( let od of packet.spaceships )
			{
				let obj = this.getOrCreateObject( this.spaceships, od.id, () => new Spaceship( od ) );
				obj.update( od );
				if ( this.lastKnownControlledObjectId === obj.id && this.player && obj.turrets.some( x => x.playerId === this.playerId ) )
				{
					this.controlledObject = obj;
					this.player.packetPositionHistory.pushShift( obj.lastKnownP, 20 );
					this.player.renderPositionAtPacketHistory.pushShift( obj.renderPosition, 20 );
					debug.updateChart( "Render Delta", obj.lastKnownP.sub( obj.renderPosition ).len * 100, 0, 100, "u%" );
				}
			}
			for ( let ship of this.spaceships )
				if ( ship.lastSeenPacketId !== packet.id )
					ship.destroy();
			this.spaceships = this.spaceships.filter( obj => obj.lastSeenPacketId === packet.id );

			//////////////////////// Effects ////////////////////////
			for ( let od of packet.effects )
			{
				let obj = this.getOrCreateObject( this.effects, od.id, () => new Effect( od ) );
				obj.update( od );
			}
			for ( let obj of this.effects )
				if ( obj.lastSeenPacketId !== packet.id )
					obj.destroy();
			this.effects = this.effects.filter( obj => obj.lastSeenPacketId === packet.id );

			//////////////////////// LinkEffects ////////////////////////
			for ( let od of packet.linkEffects )
			{
				let obj = this.linkEffects.find( x => x.srcId === od.srcId && x.dstId === od.dstId );
				if ( !obj )
					this.linkEffects.push( obj = new LinkEffect( od ) );
				obj.update( od );
			}
			for ( let obj of this.linkEffects )
				if ( obj.lastSeenPacketId !== packet.id )
					obj.destroy();
			this.linkEffects = this.linkEffects.filter( obj => obj.lastSeenPacketId === packet.id );


			if ( this.autoPilot )
				this.autoPilotControl();
		}


		onRender()
		{
			serverTime.onRender();
			let visibleAreaCenter = null as Vector2 | null;

			for ( let obj of this.asteroids )
			{
				obj.render();
			}


			for ( let obj of this.missiles )
			{
				obj.render();
				if ( this.controlledObject === obj )
					visibleAreaCenter = obj.renderPosition;
			}
			for ( let obj of this.spaceships )
			{
				obj.render();
				let playerTurret;
				if ( this.controlledObject === obj && this.player && ( playerTurret = obj.turrets.find( x => x.playerId === this.player!.id ) ) )
				{
					visibleAreaCenter = obj.renderPosition.add( playerTurret.pos );
					this.player.serverPositionHistory.pushShift( obj.renderPosition, 240 );
					this.player.renderPositionHistory.pushShift( obj.renderPosition, 240 );
					if ( this.particleSystems.length === 0 )
						this.particleSystems.push( new ParticleSystem() );
					if ( this.inputAcceleration.x !== 0 || this.inputAcceleration.y !== 0 )
					{
						let a = new Vector2( -this.inputAcceleration.x, -this.inputAcceleration.y );
						this.particleSystems[ 0 ].emitterV = a.mul( 10 ).add( obj.clientMotion!.velocity );
						this.particleSystems[ 0 ].emitterP = obj.renderPosition;//.add( a );
						this.particleSystems[ 0 ].emitting = true;
					}
					else
						this.particleSystems[ 0 ].emitting = false;
				}
			}

			for ( let obj of this.effects )
				obj.render();

			for ( let obj of this.linkEffects )
				obj.render();

			if ( visibleAreaCenter )
				this.setVisibleAreaCenter( visibleAreaCenter );
		}

		onOrientationChanged()
		{
			for ( let obj of this.spaceships )
				obj.onOrientationChanged();
		}


		private setVisibleAreaCenter( pos: Vector2 )
		{
			this.visibleArea.x = pos.x - this.visibleArea.w * 0.5;
			this.visibleArea.y = pos.y - this.visibleArea.h * 0.5;
			renderer.setCameraTarget( pos );
		}

		autoPilotControl()
		{
			let obj = this.controlledObject;
			if ( !obj )
				return;
			//let a = obj.g.clamp( 1 ).neg().mul( 1.05 / obj.maxA );
			//connector.Control( a.x, a.y );
			////var nG = Vector2.Rotate90( Unit.Gravity );
			//var targetV = nG * 1.5 * Math.Sign( Vector2.Dot( Unit.Velocity, nG ) ) - Unit.Gravity * 0.5;
			//Unit.Acceleration = Vector2.Clamp( targetV - Unit.Velocity, 1 );
		}

	}
	export var game: Game = new Game();
}
