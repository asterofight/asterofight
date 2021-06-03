/// <reference path="Turret.ts"/>
/// <reference path="HudBar.ts"/>

namespace A
{

	export class Spaceship extends MovingObject
	{
		h = 0;
		maxH = 0;
		mods = 0;
		turrets: Turret[];
		readonly healthBar: HudBar;

		static readonly barColorDisabled = new BABYLON.Color4( .5, .5, .5, 1 );
		static readonly barColorLowHealth = new BABYLON.Color4( 1, 0x60 / 0xff, 0x20 / 0xff, 1 );
		static readonly barColorMediumHealth = new BABYLON.Color4( 0xcc / 0xff, 0xcc / 0xff, 0x33 / 0xff, 1 );
		static readonly barColorHighHealth = new BABYLON.Color4( 0x33 / 0xff, 0xcc / 0xff, 0x33 / 0xff, 1 );

		constructor( od: PacketSpaceship )
		{
			super( od.id, od.type! );
			this.healthBar = new HudBar( this.ai.root, "HealthBar", true, 1 );
			this.turrets = od.turrets.map( x => new Turret( this ) );
		}

		// enum Modifiers { Stealth, Speed, MaxSpeed, Acceleration, Friction, Targetable, DamageReduction, Controllable, MaxHealth, HealthRegen, MaxEnergy, EnergyRegen }

		destroy()
		{
			super.destroy();
			this.healthBar.destroy();
			this.turrets.forEach( x => x.destroy() );
		}

		update( od: PacketSpaceship )
		{
			super.update( od );
			if ( od.h !== undefined )
				this.h = od.h;
			if ( od.maxH !== undefined )
				this.maxH = od.maxH;
			if ( od.mods !== undefined )
			{
				// if ( ( this.mods & PacketModifiers.Targetable ) !== ( od.mods & PacketModifiers.Targetable ) )
				// 	this.ai.root.getChildMeshes()[ 0 ].visibility = ( od.mods & PacketModifiers.Targetable ) ? 0.75 : 1;
				// if ( ( this.mods & PacketModifiers.Stealth ) !== ( od.mods & PacketModifiers.Stealth ) )
				// 	this.ai.root.getChildMeshes()[ 0 ].visibility = ( od.mods & PacketModifiers.Stealth ) ? 0.4 : 1;
				// if ( ( this.mods & PacketModifiers.DamageReduction ) !== ( od.mods & PacketModifiers.DamageReduction ) )
				// 	this.damageReductionAssetIsDirty = true;
				this.mods = od.mods;
			}

			let mirrorY = ( this.team === 2 ) !== renderer.orientationRightToLeft;

			for ( let i = 0; i < od.turrets.length; i++ )
				this.turrets[ i ].update( od.turrets[ i ] );
			if ( od.team )
				this.onOrientationChanged();

			let barValue = this.h / this.maxH;
			this.healthBar.mirrorY = mirrorY;
			this.healthBar.value = barValue;
			this.healthBar.color = ( this.mods & PacketModifiers.Controllable ) ? Spaceship.barColorDisabled :
				barValue > .6 ? Spaceship.barColorHighHealth :
					barValue > .3 ? Spaceship.barColorMediumHealth :
						Spaceship.barColorLowHealth;
		}

		onOrientationChanged()
		{
			this.ai.setRotation( this.team === 2 ? Math.PI : 0 );
			// let mirror = ( this.team === 2 ) !== renderer.orientationRightToLeft;
			// this.healthBar.mirrorY = mirror;
			// for ( let x of this.turrets )
			// {
			// 	x.energyBar.mirrorY = mirror;
			// 	x.cdBar.mirrorY = mirror;
			// }
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
			this.ai.render();
		}

	}
}
