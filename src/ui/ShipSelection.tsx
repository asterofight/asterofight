namespace A
{
	export class ShipSelection extends PureComponent<{ onClose: () => void }>
	{
		onClick( type: string )
		{
			connector.SwitchSpaceship( type );
			this.props.onClose();
		}

		render()
		{
			let shipTypes = userMgr.getUsableUnitTypes();
			let currentShipType = game.player?.spaceshipType;
			return (
				<div className="shipSelection" onMouseDown={ e => e.stopPropagation() }>
					<p>Choose spaceship type:</p>
					<div className="shipTypes">
						{ shipTypes.map( x =>
							<button key={ x } type="button" class={ "shipCard " + ( x === currentShipType ? "active":"available" ) }
									onClick={ e => this.onClick( x ) } disabled={ x === currentShipType }
									title={ x === currentShipType ? "You are on this": "Click to switch to " + x }>
								{/* <img src={ assetMgr.getSrc( x ) }/> */}
								<p>{ x }</p>
							</button> ) }
					</div>
				</div>
			);
		}
	}
}
