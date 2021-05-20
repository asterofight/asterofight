namespace A
{

	export class UpgradeCard extends PureComponent<{ upgrade: PacketUpgrade, totalActiveInType: number, refresh: () => void }>
	{
		async buy()
		{
			await userMgr.buyUpgrade( this.props.upgrade.id );
			this.props.refresh();
		}

		async sell()
		{
			await userMgr.sellUpgrade( this.props.upgrade.id );
			this.props.refresh();
		}

		render()
		{
			let u = this.props.upgrade;
			let active = u.rank > 0;
			let available = this.props.totalActiveInType >= u.level && u.price <= userMgr.user!.currentCredit && u.rank < u.maxRank;
			let cls = active ? "active" : available ? "available" : "notAvailable";

			return (
				<div type="button" class={ "upgradeCard " + cls } title={ `${ u.name } (${ u.price })` }
					 onClick={ () =>
					 {
						 if ( available ) this.buy();
					 } }
					 onContextMenu={ () =>
					 {
						 if ( active ) this.sell();
					 } }>
					<div></div>
				</div>
			);
		}
	}

	export class Upgrades extends PureComponent<{ onClose: () => void }>
	{

		onClick( type: string )
		{
			this.props.onClose();
		}

		render()
		{
			let upgrades = userMgr.upgrades!;
			let columns = [] as { unitType: string, rows, totalActive: number }[];
			for ( let u of upgrades )
			{
				let col = columns.find( x => x.unitType === u.unitType );
				if ( !col )
					columns.push( col = { unitType: u.unitType, rows: [], totalActive: 0 } );
				let row = col.rows[ u.level ];
				if ( !row )
					col.rows[ u.level ] = row = [];
				row.push( u );
				col.totalActive += u.rank;
			}
			return (
				<div className="upgrades" onMouseDown={ e => e.stopPropagation() }>
					<div class="unitTypesContainer">
						{ columns.map( col =>
							<div class="unitType">
								<div class="header">
									{/* <img src={ assetMgr.getSrc( col.unitType ) }/> */}
									<h2>{ col.unitType }</h2>
								</div>
								{ col.rows.map( x =>
									<div class="row">
										{ x.map( u => <UpgradeCard upgrade={ u } totalActiveInType={ col.totalActive } refresh={ () => this.forceUpdate() }/> ) }
									</div> ) }
							</div> ) }
					</div>
					<p class="credit">Current credit: { userMgr.user?.currentCredit }</p>
				</div>
			);
		}
	}
}
