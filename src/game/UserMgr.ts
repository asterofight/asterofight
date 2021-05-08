/// <reference path="Connector.ts"/>

namespace A
{
	export class UserMgr
	{
		user?: PacketUser;

		get loggedIn()
		{
			return !!this.user;
		}

		get upgrades()
		{
			return this.user?.upgrades;
		}

		getUsableUnitTypes()
		{
			let ret = ["Fighter"];
			for ( let u of this.upgrades! )
			{
				if ( u.name === "Unlock" && u.rank > 0 && ret.indexOf( u.unitType ) === -1 )
					ret.push( u.unitType );
			}
			return ret;
		}

		async buyUpgrade( id: string )
		{
			let credit = await gameConnector.BuyUpgrade( id );
			this.user!.currentCredit = credit;
			this.upgrades!.find( x => x.id === id ).rank++;
		}

		async sellUpgrade( id: string )
		{
			let credit = await gameConnector.SellUpgrade( id );
			this.user!.currentCredit = credit;
			this.upgrades!.find( x => x.id === id ).rank--;
		}
	}
}