/// <reference path="../common/Switch.tsx"/>
/// <reference path="../common/CheckBox.tsx"/>
namespace A
{
	export class Login extends PureComponent<{ onLogin: () => void }>
	{
		state = {
			name: localStorage[ "name" ] ?? "",
			proMode: localStorage[ "proMode" ] === "true",
			loggedIn: false,
			register: true,
			userName: "",
			password: "",
			fullName: "",
			stayLoggedIn: true,
			errorMessage: ""
		};

		componentDidMount()
		{
			connector.userEvent.add( () => this.setState( { loggedIn: userMgr.loggedIn } ), this );
		}

		componentWillUnmount()
		{
			connector.userEvent.removeAll( this );
		}

		proModeChange( checked: boolean )
		{
			localStorage[ "proMode" ] = checked.toString();
			if( !checked)
				connector.Logout();
			this.setState( { proMode: checked } );
		}


		async onJoin()
		{
			if ( this.state.proMode && !this.state.loggedIn )
			{
				if ( this.state.register )
				{
					let ret = await connector.Register( this.state.userName, this.state.password, this.state.fullName );
					if ( ret )
					{
						this.setState( { errorMessage: ret } );
						return;
					}
				}
				let ret = await connector.Login( this.state.userName, this.state.password, this.state.stayLoggedIn );
				if ( ret )
				{
					this.setState( { errorMessage: ret } );
					return;
				}
			}

			connector.CreatePlayer( this.state.name );
			this.props.onLogin();
		}

		render()
		{
			return (
				<div className="login">
					<h1>AsteroFight</h1>
					<input type="text" placeholder="Name" value={ this.state.name }
						   onChange={ x =>
						   {
							   localStorage[ "name" ] = ( x.target as HTMLInputElement ).value;
							   this.setState( { name: ( x.target as HTMLInputElement ).value } );
						   } }
						   onKeyDown={ e =>
						   {
							   if ( e.keyCode === 13 ) this.onJoin();
						   } } className="displayName" autoFocus/>
					<Switch label="Pro Mode" value={ this.state.proMode }
							onChange={ x => this.proModeChange( x ) }/>
					{ this.state.proMode &&
					( this.state.loggedIn ?
						<p>You are logged in as { userMgr.user?.name }</p> :
						<div class="fields">
							<p>Log in to upgrade ships</p>
							<input type="text" value={ this.state.userName }
								   onChange={ x => this.setState( { userName: ( x.target as HTMLInputElement ).value } ) }
								   placeholder="Email" onKeyDown={ e =>
							{
								if ( e.keyCode === 13 ) this.onJoin();
							} }/>
							<input type="password" value={ this.state.password }
								   onChange={ x => this.setState( { password: ( x.target as HTMLInputElement ).value } ) }
								   placeholder="Password" onKeyDown={ e =>
							{
								if ( e.keyCode === 13 ) this.onJoin();
							} }/>
							{ this.state.register &&
                            <input type="text" value={ this.state.fullName }
                                   onChange={ x => this.setState( { fullName: ( x.target as HTMLInputElement ).value } ) }
                                   placeholder="Full Name" onKeyDown={ e =>
							{
								if ( e.keyCode === 13 ) this.onJoin();
							} }/>
							}
							<CheckBox label="Stay logged in" value={ this.state.stayLoggedIn }
									  onChange={ ( checked ) => this.setState( { stayLoggedIn: checked } ) }/>
							{ this.state.register ?
								<p>Already have an account? Switch to<a onClick={ () => this.setState( { register: false } ) }>Login</a></p> :
								<p>Have no account yet? Switch to<a onClick={ () => this.setState( { register: true } ) }>Register</a></p>
							}
						</div> )
					}
					<button type="button" onClick={ () => this.onJoin() }>{ !this.state.proMode || this.state.loggedIn ? "Join" : this.state.register ? "Register" : "Login" }</button>
					<p class="error">{ this.state.errorMessage }</p>
					<div>
						<a href="Site/rules.html">Rules</a>
						<a href="Site/credits.html">Credits</a>
						<a href="Site/join.html">Join Us</a>
						<a href="Site/privacy.html">Privacy Policy</a>
					</div>
				</div>
			);
		}
	}
}
