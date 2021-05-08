namespace A
{

	export interface PacketPoint
	{
		x: number;
		y: number;
	}

	export interface PacketRectangleD
	{
		x: number;
		y: number;
		w: number;
		h: number;
	}

	export interface Packet
	{
		id: number;
		serverTicks: number;
		playerId?: number;
		controlledObjId?: number;
		team?: number;
		asteroids: PacketAsteroid[];
		missiles: PacketMissile[];
		spaceships: PacketSpaceship[];
		effects: PacketEffect[];
		movingEffects: PacketMovingEffect[];
		capturePoints: PacketCapturePoint[];
		players: PacketPlayer[];
		chatMessage?: PacketChatMessage;
	}

	export interface PacketMapObject
	{
		id: number;
		type?: string;
		p?: PacketPoint;
		r?: number;
		team?: number;
	}

	export interface PacketAsteroid extends PacketMapObject
	{
	}

	export interface PacketMovingObject extends PacketMapObject
	{
		v?: PacketPoint;
		a?: PacketPoint;
		maxS?: number;
		maxA?: number;
	}

	export interface PacketMissile extends PacketMovingObject
	{
	}

	export const enum PacketModifiers
	{
		Stealth = 1, Speed = 2, MaxSpeed = 4, Acceleration = 8, Friction = 16, Targetable = 32, DamageReduction = 64, Controllable = 128,
		MaxHealth = 256, HealthRegen = 512, MaxEnergy = 1024, EnergyRegen = 2048
	}

	export interface PacketSpaceship extends PacketMovingObject
	{
		h?: number;
		maxH?: number;
		mods?: number;
		turrets: PacketTurret[];
	}

	export interface PacketTurret
	{
		playerId?: number;
		e?: number;
		maxE?: number;
		pos?: PacketPoint;
		useShootingPosition: boolean;
		shootingPosition?: PacketPoint;
		ability1ChargeStatus?: number;
		ability1Energy?: number;
		ability2ChargeStatus?: number;
		ability2Energy?: number;
	}

	export interface PacketEffect extends PacketMapObject
	{
		ticksLeft?: number;
	}

	export interface PacketMovingEffect extends PacketMapObject
	{
		v?: PacketPoint;
	}

	export interface PacketCapturePoint extends PacketMovingObject
	{
		captureStatus: number;
	}

	export interface PacketPlayer
	{
		id: number;
		name?: string;
		team?: number;
		bot: boolean;
		respawnIn?: number;
		stats: {
			score?: number;
			scorePerHour?: number;
			kills?: number;
			deaths?: number;
			damageDone?: number;
			damageTaken?: number;
			healingDone?: number;
			energySpent?: number;
			energyRestored?: number;
			mapObjectiveScore?: number;
		};
		spaceshipType?: string;
	}

	export interface PacketChatMessage
	{
		type: number;
		time: number;
		from: number;
		text: string;
	}

	export interface PacketUser
	{
		loginToken?: string;
		name: string;
		totalCredit: number;
		currentCredit: number;
		upgrades: PacketUpgrade[];
	}

	export interface PacketUpgrade
	{
		id: string;
		unitType: string;
		name: string;
		maxRank: number;
		level: number;
		price: number;
		rank: number;
	}
}
