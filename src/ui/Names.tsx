namespace A
{

	export class Names extends PureComponent
	{
		state = {};

		componentDidMount()
		{
			renderer.onRender.add( () => this.forceUpdate(), this );
		}

		componentWillUnmount()
		{
			renderer.onRender.removeAll( this );
		}

		render()
		{
			let players = [] as { id: number, pos: Vector2, name: string, enemy: boolean }[];
			for ( let s of game.spaceships )
				for ( let t of s.turrets )
				{
					if ( t.playerId )
						players.push( {
							id: t.playerId,
							pos: renderer.getScreenCoords( s.renderPosition.add( t.pos ) ),
							name: t.name,
							enemy: game.team !== s.team
						} );
				}

			return <div class="Names">
				{
					players.map( x => <span key={ x.id } class={ x.enemy ? "foe" : "friend" } style={ { left: x.pos.x, top: x.pos.y } }>{ x.name }</span> )
				}
			</div>;
		}
	}
}