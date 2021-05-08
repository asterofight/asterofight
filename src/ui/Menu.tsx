namespace A
{
    export class Menu extends PureComponent<{ visible: boolean, onVisibleChange: () => void }>
    {
        state = { loggedIn: false, userName: "", password: "", stayLoggedIn: true };

        // componentDidMount()
        // {
        //     gameConnector.addEventListener( "packet", p =>
        //     {
        //     }, this );
        // }

        // componentWillUnmount()
        // {
        //     gameConnector.removeAllEventListener( this );
        // }


        onClick()
        {
        }

        onLoginRegister()
        {
            // gameConnector.LoginOrRegister( this.state.name, this.state.password, this.state.stayLoggedIn );
            // this.setState( { showUser: false } );
        }

        render()
        {
            return (
                <div className="menu">
                    <button type="button" className="icon" onClick={ () => this.props.onVisibleChange() }>☰</button>
                    { this.props.visible &&
                        <div className="dropdown">
                            <h2>AsteroFight</h2>
                            { this.state.loggedIn ?
                                <button type="button" className="menuitem">Logout</button> :
                                <div>
                                    <button type="button" className="menuitem">Login</button>
                                    <button type="button" className="menuitem">Register</button>
                                </div>
                            }
                        </div>
                    }
                </div>
            );
        }
    }
}
