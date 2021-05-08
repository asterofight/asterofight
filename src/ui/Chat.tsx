/// <reference path="../common/SimpleInput.tsx"/>

namespace A
{

    export interface ChatProps
    {
        inputVisible: boolean;
        onCloseInput: ( cmd?: string ) => void;
    }

    export class Chat extends PureComponent<ChatProps>
    {

        state = { messages: [] as PacketChatMessage[], text: "" };

        private onEnter()
        {
            let cmd: string | undefined;
            if ( this.state.text )
            {
                if ( this.state.text[ 0 ] === "/" )
                    cmd = this.state.text.substr( 1 );
                else
                    gameConnector.SendChatMessage( 0, this.state.text );
            }
            this.closeInput( cmd );
        }

        private closeInput( cmd?: string )
        {
            this.setState( { text: "" } );
            this.props.onCloseInput( cmd );
        }

        componentDidMount()
        {
            gameConnector.addEventListener( "packet", p =>
            {
                let messages = this.state.messages;
                let dirty = false;
                if ( p.chatMessage )
                {
                    messages.pushShift( p.chatMessage, 10 );
                    dirty = true;
                }
                if ( messages.length > 0 && Date.now() > messages[ 0 ].time + 60000 )
                {
                    dirty = true;
                    messages.shift();
                }
                if ( dirty )
                {
                    this.setState( { messages } );
                    this.forceUpdate();
                }
            }, this );
        }

        componentWillUnmount()
        {
            gameConnector.removeAllEventListener( this );
        }

        typeClass = [ "server", "game", "team", "whisper" ];

        render()
        {
            return (
                <div className="chat">
                    <div className="messages">
                        { this.state.messages.map( x =>
                            <p key={ x.time } className={ ( x.from ? "fromPlayer " : "fromServer " ) + this.typeClass[ x.type ] }>
                                <span className="time">{ new Date( x.time ).toLocaleTimeString() }</span>
                                { !!x.from && <span className="from">{ game.players.find( p => p.id === x.from )?.name }:</span> }
                                <span className="text">{ x.text }</span>
                            </p>
                        ) }
                    </div>

                    { this.props.inputVisible &&
                        <SimpleInput placeholder="Type something here..." autofocus={ true }
                            value={ this.state.text } onChange={ e => this.setState( { text: e } ) }
                            onEnter={ () => this.onEnter() } onEsc={ () => this.closeInput() } onBlur={ () => this.closeInput() } />
                    }
                </div>
            );
        }
    }
}