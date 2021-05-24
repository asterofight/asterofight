/// <reference path="Turret.ts"/>

namespace A
{

	export class Spaceship extends MovingObject
	{
		h = 0;
		maxH = 0;
		mods = 0;
		turrets: Turret[];

		private healthBarIsDirty = true;
		private damageReductionAssetIsDirty = false;

		constructor( od: PacketSpaceship )
		{
			super( od.id, od.type! );
			this.turrets = od.turrets.map( x => new Turret( this ) );
		}

		// enum Modifiers { Stealth, Speed, MaxSpeed, Acceleration, Friction, Targetable, DamageReduction, Controllable, MaxHealth, HealthRegen, MaxEnergy, EnergyRegen }

		destroy()
		{
			super.destroy();
			this.turrets.forEach( x => x.destroy() );
		}

		update( od: PacketSpaceship )
		{
			super.update( od );
			this.healthBarIsDirty = this.healthBarIsDirty || od.h !== undefined;
			if ( od.h !== undefined )
				this.h = od.h;
			if ( od.maxH !== undefined )
				this.maxH = od.maxH;
			// if ( od.mods !== undefined )
			// {
			// 	if ( ( this.mods & PacketModifiers.Controllable ) !== ( od.mods & PacketModifiers.Controllable ) )
			// 		this.makeBarsDirty();
			// 	if ( ( this.mods & PacketModifiers.Targetable ) !== ( od.mods & PacketModifiers.Targetable ) )
			// 		this.container.alpha = ( od.mods & PacketModifiers.Targetable ) ? 0.5 : 1;
			// 	if ( ( this.mods & PacketModifiers.Stealth ) !== ( od.mods & PacketModifiers.Stealth ) )
			// 		this.container.alpha = ( od.mods & PacketModifiers.Stealth ) ? 0.1 : 1;
			// 	if ( ( this.mods & PacketModifiers.DamageReduction ) !== ( od.mods & PacketModifiers.DamageReduction ) )
			// 		this.damageReductionAssetIsDirty = true;
			// 	this.mods = od.mods;
			// }
			for ( let i = 0; i < od.turrets.length; i++ )
				this.turrets[ i ].update( od.turrets[ i ] );
		}

		private makeBarsDirty()
		{
			this.healthBarIsDirty = true;
			for ( let t of this.turrets )
			{
				t.cooldownBarIsDirty = true;
				t.energyBarIsDirty = true;
			}
		}

		render()
		{
			let p = this.serverMotion!.getPositionAt( serverTime.time );
			p = this.clientMotion!.step( serverTime.renderDelta, this.pid!.step( p.sub( this.clientMotion!.position ), serverTime.renderDelta ) );
			for ( let a of game.asteroids )
			{
				let rr = this.r + a.r;
				if ( p.distS( a.renderPosition ) < rr * rr )
				{
					p = p.sub( a.renderPosition ).norm().mul( rr ).add( a.renderPosition );
					break;
				}
			}
			this.renderPosition = p;
			this.ai.setPos( this.renderPosition.x, this.renderPosition.y );
		}

		draw( resized: boolean )
		{
			// if ( this.sprite.texture.baseTexture.valid )
			// {
			// 	let tw = this.sprite.texture.width;
			// 	let th = this.sprite.texture.height;
			// 	let s = r * 2;
			// 	this.sprite.setTransform( 0, 0, s / tw, s / th, 0, 0, 0, tw / 2, th / 2 );
			// }
			// this.container.scale.x = ( this.team === game.team ) ? 1 : -1;

			// if ( this.healthBarIsDirty || resized )
			// {
			// 	this.healthBarIsDirty = false;
			// 	this.healthBar.clear();
			// 	this.healthBar.lineStyle( 3, ( this.mods & PacketModifiers.Controllable ) ? 0x808080 : this.h > 60 ? 0x33CC33 : this.h > 30 ? 0xCCCC33 : 0xFF6020, 1 );
			// 	let eLen = Math.PI * 2 / 3;
			// 	this.healthBar.arc( 0, 0, r * 1.5, Math.PI - eLen / 2, Math.PI - eLen / 2 + eLen * this.h / this.maxH );
			// }

			// if ( this.damageReductionAssetIsDirty || resized )
			// {
			// 	this.damageReductionAssetIsDirty = false;
			// 	this.damageReductionAsset.clear();
			// 	if ( this.mods & PacketModifiers.DamageReduction )
			// 	{
			// 		this.damageReductionAsset.lineStyle( 3, 0x0080ff, 0.25 );
			// 		this.damageReductionAsset.drawCircle( 0, 0, r * 1.1 );
			// 	}
			// }

			for ( let turret of this.turrets )
				turret.draw( resized );
		}
	}
}
