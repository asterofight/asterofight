/// <reference path="Types.ts"/>
/// <reference path="DataViewReader.ts"/>

namespace A
{
	interface CachedObject
	{
		packetId: number;
		p: PacketPoint;
		v: PacketPoint;
		a: PacketPoint;
	}

	export class Afcp3Reader
	{
		mapArea = {} as PacketRectangleD;
		private objectCache: { [ id: number ]: CachedObject } = {};
		private packetId;

		deserialize( dvr: DataViewReader ): Packet
		{
			/* let version =*/
			dvr.readUint();
			let packet = {} as Packet;
			packet.id = this.packetId = dvr.readVarInt();
			packet.serverTicks = dvr.readVarInt();

			let generalFlags = dvr.readBitArray( 6 );
			let flagIndex = 0;
			if ( generalFlags.getBit( flagIndex++ ) ) packet.playerId = dvr.readVarInt();
			if ( generalFlags.getBit( flagIndex++ ) ) packet.controlledObjId = dvr.readVarInt();
			if ( generalFlags.getBit( flagIndex++ ) ) packet.team = dvr.readByte();

			if ( generalFlags.getBit( flagIndex++ ) )
				packet.asteroids = this.readArray( dvr, () => this.readAsteroid( dvr ) );
			packet.missiles = this.readArray( dvr, () => this.readMissile( dvr ) );
			packet.spaceships = this.readArray( dvr, () => this.readSpaceship( dvr ) );
			packet.effects = this.readArray( dvr, () => this.readEffect( dvr ) );
			packet.linkEffects = this.readArray( dvr, () => this.readLinkEffect( dvr ) );
			packet.capturePoints = this.readArray( dvr, () => this.readCapturePoint( dvr ) );
			if ( generalFlags.getBit( flagIndex++ ) )
				packet.players = this.readArray( dvr, () => this.readPlayer( dvr ) );
			if ( generalFlags.getBit( flagIndex++ ) ) packet.chatMessage = this.readChat( dvr );

			for ( let id in this.objectCache )
				if ( this.objectCache[ id ].packetId !== this.packetId )
					delete this.objectCache[ id ];

			return packet;
		}

		private readNumberCentiUnit16( dvr: DataViewReader )
		{
			return dvr.readInt16() / 100;
		}

		private readPoint( dvr: DataViewReader ): PacketPoint
		{
			return { x: dvr.readDouble(), y: dvr.readDouble() };
		}

		private readPointCentiUnit16( dvr: DataViewReader ): PacketPoint
		{
			return { x: dvr.readInt16() / 100, y: dvr.readInt16() / 100 };
		}

		private readRelPointCentiUnit16( dvr: DataViewReader, prevValue: PacketPoint ): PacketPoint
		{
			return { x: prevValue.x + dvr.readVarIntNeg() / 100, y: prevValue.y + dvr.readVarIntNeg() / 100 };
		}

		private readRectangleCentiUnit16( dvr: DataViewReader ): PacketRectangleD
		{
			return { x: dvr.readInt16() / 100, y: dvr.readInt16() / 100, w: dvr.readInt16() / 100, h: dvr.readInt16() / 100 };
		}

		private readArray<T>( dvr: DataViewReader, reader: () => T ): T[]
		{
			let n = dvr.readVarInt();
			let a: T[] = [];
			for ( let i = 0; i < n; i++ )
				a.push( reader() );
			return a;
		}

		private readAsteroid( dvr: DataViewReader )
		{
			let id = dvr.readVarInt();
			let flags = dvr.readBitArray( 3 );
			let ret = { id } as PacketAsteroid;
			let flagIndex = 0;
			if ( flags.getBit( flagIndex++ ) ) ret.type = dvr.readInternedString();
			if ( flags.getBit( flagIndex++ ) ) ret.p = this.readPointCentiUnit16( dvr );
			if ( flags.getBit( flagIndex++ ) ) ret.r = this.readNumberCentiUnit16( dvr );
			return ret;
		}

		private readMissile( dvr: DataViewReader )
		{
			let id = dvr.readVarInt();
			let cache = this.objectCache[ id ] || ( this.objectCache[ id ] = { packetId: this.packetId, p: { x: 0, y: 0 }, v: { x: 0, y: 0 }, a: { x: 0, y: 0 } } );
			cache.packetId = this.packetId;
			let flags = dvr.readBitArray( 8 );
			let ret = { id } as PacketMissile;
			let flagIndex = 0;
			if ( flags.getBit( flagIndex++ ) ) ret.type = dvr.readInternedString();
			if ( flags.getBit( flagIndex++ ) ) ret.p = cache.p = this.readRelPointCentiUnit16( dvr, cache.p );
			if ( flags.getBit( flagIndex++ ) ) ret.r = this.readNumberCentiUnit16( dvr );
			if ( flags.getBit( flagIndex++ ) ) ret.team = dvr.readByte();
			if ( flags.getBit( flagIndex++ ) ) ret.v = cache.v = this.readRelPointCentiUnit16( dvr, cache.v );
			if ( flags.getBit( flagIndex++ ) ) ret.a = cache.a = this.readRelPointCentiUnit16( dvr, cache.a );
			if ( flags.getBit( flagIndex++ ) ) ret.maxS = this.readNumberCentiUnit16( dvr );
			if ( flags.getBit( flagIndex++ ) ) ret.maxA = this.readNumberCentiUnit16( dvr );
			return ret;
		}

		private readSpaceship( dvr: DataViewReader )
		{
			let nTurret = dvr.readByte();
			let id = dvr.readVarInt();
			let cache = this.objectCache[ id ] || ( this.objectCache[ id ] = { packetId: this.packetId, p: { x: 0, y: 0 }, v: { x: 0, y: 0 }, a: { x: 0, y: 0 } } );
			cache.packetId = this.packetId;
			let flags = dvr.readBitArray( 10 + 7 * nTurret );
			let ret = { id } as PacketSpaceship;
			let flagIndex = 0;
			if ( flags.getBit( flagIndex++ ) ) ret.type = dvr.readInternedString();
			if ( flags.getBit( flagIndex++ ) ) ret.p = cache.p = this.readRelPointCentiUnit16( dvr, cache.p );
			if ( flags.getBit( flagIndex++ ) ) ret.r = this.readNumberCentiUnit16( dvr );
			if ( flags.getBit( flagIndex++ ) ) ret.team = dvr.readByte();
			if ( flags.getBit( flagIndex++ ) ) ret.v = cache.v = this.readRelPointCentiUnit16( dvr, cache.v );
			if ( flags.getBit( flagIndex++ ) ) ret.a = cache.a = this.readRelPointCentiUnit16( dvr, cache.a );
			if ( flags.getBit( flagIndex++ ) ) ret.maxS = this.readNumberCentiUnit16( dvr );
			if ( flags.getBit( flagIndex++ ) ) ret.maxA = this.readNumberCentiUnit16( dvr );
			if ( flags.getBit( flagIndex++ ) ) ret.h = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.maxH = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.mods = dvr.readVarInt();
			ret.turrets = [];
			for ( let i = 0; i < nTurret; i++ )
			{
				let turret = {} as PacketTurret;
				if ( flags.getBit( flagIndex++ ) ) turret.playerId = dvr.readVarInt();
				if ( flags.getBit( flagIndex++ ) ) turret.e = dvr.readVarInt();
				if ( flags.getBit( flagIndex++ ) ) turret.maxE = dvr.readVarInt();
				if ( flags.getBit( flagIndex++ ) ) turret.pos = this.readPointCentiUnit16( dvr );
				turret.useShootingPosition = !!flags.getBit( flagIndex++ );
				if ( flags.getBit( flagIndex++ ) ) turret.shootingPosition = this.readPointCentiUnit16( dvr );
				if ( flags.getBit( flagIndex++ ) )
				{
					let a = dvr.readUint();
					turret.ability1ChargeStatus = a & 255;
					turret.ability1Energy = ( a >> 8 ) & 255;
					turret.ability2ChargeStatus = ( a >> 16 ) & 255;
					turret.ability2Energy = a >> 24;
				}
				ret.turrets.push( turret );
			}
			return ret;
		}

		private readEffect( dvr: DataViewReader )
		{
			let id = dvr.readVarInt();
			let flags = dvr.readBitArray( 4 );
			let ret = { id } as PacketEffect;
			let flagIndex = 0;
			if ( flags.getBit( flagIndex++ ) ) ret.type = dvr.readInternedString();
			if ( flags.getBit( flagIndex++ ) ) ret.p = this.readPointCentiUnit16( dvr );
			if ( flags.getBit( flagIndex++ ) ) ret.r = this.readNumberCentiUnit16( dvr )
			if ( flags.getBit( flagIndex++ ) ) ret.ticksLeft = dvr.readVarInt();
			return ret;
		}

		private readLinkEffect( dvr: DataViewReader )
		{
			return {
				srcId: dvr.readVarInt(),
				dstId: dvr.readVarInt(),
				srcPos: this.readPointCentiUnit16( dvr ),
				dstPos: this.readPointCentiUnit16( dvr ),
				name: dvr.readInternedString()
			} as PacketLinkEffect;
		}

		private readCapturePoint( dvr: DataViewReader )
		{
			let id = dvr.readVarInt();
			let flags = dvr.readBitArray( 5 );
			let ret = { id } as PacketCapturePoint;
			let flagIndex = 0;
			if ( flags.getBit( flagIndex++ ) ) ret.type = dvr.readInternedString();
			if ( flags.getBit( flagIndex++ ) ) ret.p = this.readPointCentiUnit16( dvr )
			if ( flags.getBit( flagIndex++ ) ) ret.r = this.readNumberCentiUnit16( dvr )
			if ( flags.getBit( flagIndex++ ) ) ret.team = dvr.readByte();
			if ( flags.getBit( flagIndex++ ) ) ret.captureStatus = dvr.readInt8() / 100;
			return ret;
		}


		private readPlayer( dvr: DataViewReader )
		{
			let id = dvr.readVarInt();
			let flags = dvr.readBitArray( 15 );
			let ret = { id, stats: {} } as PacketPlayer;
			let flagIndex = 0;
			if ( flags.getBit( flagIndex++ ) ) ret.name = dvr.readString();
			if ( flags.getBit( flagIndex++ ) ) ret.team = dvr.readByte();
			ret.bot = !!flags.getBit( flagIndex++ );
			if ( flags.getBit( flagIndex++ ) ) ret.respawnIn = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.stats.score = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.stats.scorePerHour = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.stats.kills = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.stats.deaths = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.stats.damageDone = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.stats.damageTaken = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.stats.healingDone = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.stats.energySpent = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.stats.energyRestored = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.stats.mapObjectiveScore = dvr.readVarInt();
			if ( flags.getBit( flagIndex++ ) ) ret.spaceshipType = dvr.readInternedString();
			return ret;
		}

		private readChat( dvr: DataViewReader )
		{
			return {
				type: dvr.readVarInt(),
				time: Date.now(),
				from: dvr.readVarInt(),
				text: dvr.readString()
			} as PacketChatMessage;
		}

	}
}
