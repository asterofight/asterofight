namespace A
{
    export class Stats extends PureComponent<{ showDetails: boolean }>
    {
        state = { list: [] as Player[] };

        componentDidMount()
        {
            gameConnector.addEventListener( "packet", p =>
            {
                if ( game.players && game.players.length > 0 )
                    this.setState( { list: game.players.filter( x => !x.bot || this.props.showDetails ) } );
            }, this );
        }

        componentWillUnmount()
        {
            gameConnector.removeAllEventListener( this );
        }

        render()
        {
            let list: Player[] = this.state.list.sort( ( a, b ) => b.stats.scorePerHour - a.stats.scorePerHour || b.stats.score - a.stats.score ||
                b.stats.kills - a.stats.kills || b.stats.damageDone - a.stats.damageDone ||
                a.stats.deaths - b.stats.deaths || a.stats.damageTaken - b.stats.damageTaken || a.stats.energySpent - b.stats.energySpent );
            let selfN = list.findIndex( x => x.id === game.playerId );
            let team = selfN >= 0 ? list[ selfN ].team : 1;
            const n = 10;
            if ( list.length === 0 )
                return false;
            //let credit = gameConnector.user && game.player ? gameConnector.user.currentCredit + Math.floor( game.player.stats.score ) : -1;
            return (
                <div className="stats">
                    <table>
                        { this.props.showDetails &&
                            <thead>
                                <tr>
                                    { this.props.showDetails && <th>Rank</th> }
                                    <th>Name</th>
                                    <th>Score</th>
                                    { this.props.showDetails &&
                                        [
                                            <th>Ship</th>,
                                            <th>Kills</th>,
                                            <th>Deaths</th>,
                                            <th>Damage<br />Done</th>,
                                            <th>Damage<br />Taken</th>,
                                            <th>Healing<br />Done</th>,
                                            <th>Energy<br />Restored</th>
                                        ]
                                    }
                                </tr>
                            </thead>
                        }
                        <tbody>
                            { list.map( ( p, i ) =>
                                i < n || i > selfN - 3 && i < selfN + 3 ?
                                    <tr key={ p.id } className={ p.id === game.playerId ? "self" : p.team === team ? "homeTeam" : "enemyTeam" }>
                                        { this.props.showDetails && <td>{ i + 1 }</td> }
                                        <td>{ p.name }</td>
                                        <td>{ p.stats.score } ({ p.stats.scorePerHour }/h)</td>
                                        { this.props.showDetails &&
                                            [
                                                <td>{ p.spaceshipType }</td>,
                                                <td>{ p.stats.kills }</td>,
                                                <td>{ p.stats.deaths }</td>,
                                                <td>{ p.stats.damageDone }</td>,
                                                <td>{ p.stats.damageTaken }</td>,
                                                <td>{ p.stats.healingDone }</td>,
                                                <td>{ p.stats.energyRestored }</td>
                                            ]
                                        }
                                    </tr> :
                                    i === n && selfN > n + 5 && <tr key={ i }><td>...</td></tr>

                            ) }
                        </tbody>
                    </table>
                </div>
            );
        }
    }
}
