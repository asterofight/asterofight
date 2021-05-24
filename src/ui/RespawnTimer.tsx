namespace A
{
    export class RespawnTimer extends PureComponent
    {
        state = { respawnIn: 0 };
        componentDidMount()
        {
            connector.packetEvent.add( p =>
            {
                let respawnIn = ( game.player?.respawnIn ?? 0 ) * ServerTime.serverTickInterval;
                if ( this.state.respawnIn !== respawnIn )
                    this.setState( { respawnIn } );
            }, this );
        }

        componentWillUnmount()
        {
            connector.packetEvent.removeAll( this );
        }

        render()
        {
            return (
                <div className={ "respawnTimer" + ( this.state.respawnIn > 0.5 ? " visible" : "" ) }>
                    <div>
                        <p>Respawn in</p>
                        <p className="timer">{ this.state.respawnIn.toFixed( 0 ) }</p>
                        <p>Press U to choose another spaceship</p>
                    </div>
                </div>
            );
        }
    }
}