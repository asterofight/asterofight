/// <reference path="GameObjects.ts"/>
/// <reference path="Map.ts"/>
/// <reference path="Asteroid.ts"/>
/// <reference path="Effect.ts"/>
/// <reference path="MovingEffect.ts"/>
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
		movingEffects: MovingEffect[] = [];
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
			renderer.onRender.add( () => this.onDraw() );
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
			for ( let od of packet.asteroids )
			{
				let obj = this.getOrCreateObject( this.asteroids, od.id, () => new Asteroid( od ) );
				obj.update( od );
			}
			for ( let obj of this.asteroids )
				if ( obj.lastSeenPacketId !== packet.id )
					obj.destroy();
			this.asteroids.removeAll( obj => obj.lastSeenPacketId !== packet.id );

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

			//////////////////////// MovingEffects ////////////////////////
			for ( let od of packet.movingEffects )
			{
				let obj = this.getOrCreateObject( this.movingEffects, od.id, () => new MovingEffect( od ) );
				obj.update( od );
			}
			for ( let obj of this.movingEffects )
				if ( obj.lastSeenPacketId !== packet.id )
					obj.destroy();
			this.movingEffects = this.movingEffects.filter( obj => obj.lastSeenPacketId === packet.id );


			if ( this.autoPilot )
				this.autoPilotControl();
		}


		onDraw()
		{
			serverTime.onDraw();

			for ( let obj of this.asteroids )
			{
				obj.render();
			}


			for ( let obj of this.missiles )
			{
				obj.render();
				if ( this.controlledObject === obj )
					this.setVisibleAreaCenter( obj.renderPosition );
			}
			for ( let obj of this.spaceships )
			{
				let p = obj.serverMotion!.getPositionAt( serverTime.time );
				//for ( let a of this.asteroids )
				//{
				//	let rr = obj.r + a.r;
				//	if ( p.distS( a.renderPosition ) < rr * rr )
				//	{
				//		p = p.sub( a.renderPosition ).norm().mul( rr ).add( a.renderPosition );
				//		break;
				//	}
				//}
				p = obj.clientMotion!.step( serverTime.renderDelta, obj.pid!.step( p.sub( obj.clientMotion!.position ), serverTime.renderDelta ) );
				for ( let a of this.asteroids )
				{
					let rr = obj.r + a.r;
					if ( p.distS( a.renderPosition ) < rr * rr )
					{
						p = p.sub( a.renderPosition ).norm().mul( rr ).add( a.renderPosition );
						break;
					}
				}
				let moveDistance = p.sub( obj.renderPosition ).len;
				obj.renderPosition = p;
				//if ( closestAsteroid && obj.renderPosition.distS( closestAsteroid.renderPosition ) < rrMin * rrMin )
				//	obj.renderPosition = obj.renderPosition.sub( closestAsteroid.renderPosition ).norm().mul( rrMin ).add( closestAsteroid.renderPosition );
				let playerTurret;
				if ( this.controlledObject === obj && this.player && ( playerTurret = obj.turrets.find( x => x.playerId === this.player!.id ) ) )
				{
					this.player.serverPositionHistory.pushShift( p, 240 );
					this.player.renderPositionHistory.pushShift( obj.renderPosition, 240 );
					debug.updateChart( "Move Distance", moveDistance * 100, 0, 100, "u", 200 );
					let pTurret = obj.renderPosition.add( playerTurret.pos );
					this.setVisibleAreaCenter( pTurret );
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
				obj.render();
			}

			for ( let obj of this.movingEffects )
			{
				let p = obj.serverMotion!.getPositionAt( serverTime.time );
				obj.renderPosition = obj.clientMotion!.step( 1 / 60, obj.pid!.step( p.sub( obj.clientMotion!.position ), 1 / 60 ) );
				obj.render();
			}

			for ( let obj of this.effects )
			{
				obj.render();
			}

		}

		private setVisibleAreaCenter( pos: Vector2 )
		{
			this.visibleArea.x = pos.x - this.visibleArea.w * 0.5;
			this.visibleArea.y = pos.y - this.visibleArea.h * 0.5;
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
