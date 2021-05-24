/// <reference path="NotLoggedInWarning.tsx"/>
/// <reference path="ShipSelection.tsx"/>
/// <reference path="Upgrades.tsx"/>
/// <reference path="RespawnTimer.tsx"/>
/// <reference path="Stats.tsx"/>
/// <reference path="Debug.tsx"/>
/// <reference path="Chat.tsx"/>
/// <reference path="Joystick.tsx"/>
/// <reference path="Login.tsx"/>
/// <reference path="Menu.tsx"/>

namespace A
{

	export class App extends PureComponent
	{
		state = {
			notLoggedInWarningVisible: false,
			chatInputVisible: false,
			joystick: null,
			loginVisible: true,
			statsVisible: false,
			shipSelectionVisible: false,
			upgradesVisible: false,
			debugVisible: !document.location.hostname,
			menuVisible: true
		};
		private left = false;
		private up = false;
		private right = false;
		private down = false;
		private aX = 0;
		private aY = 0;
		private mouseX = 0;
		private mouseY = 0;
		private mouseDownX = 0;
		private mouseDownY = 0;
		private lastKeyDown = 0;

		private onKey( e: KeyboardEvent, pressed: boolean )
		{
			if ( e.keyCode === 13 && pressed )
			{
				this.setState( { chatInputVisible: true } );
			}
			else if ( e.key === '/' && pressed )
			{
				this.setState( { chatInputVisible: true } );
			}
			else if ( pressed && e.keyCode === 84 )
			{
				this.setState( { statsVisible: !this.state.statsVisible } );
			}
			else if ( pressed && e.keyCode === 85 )
			{
				if ( userMgr.loggedIn )
					this.setState( { shipSelectionVisible: !this.state.shipSelectionVisible } );
				else
					this.setState( { notLoggedInWarningVisible: !this.state.notLoggedInWarningVisible } );
			}
			else if ( pressed && e.keyCode === 78 )
			{
				if ( userMgr.loggedIn )
					this.setState( { upgradesVisible: !this.state.upgradesVisible } );
				else
					this.setState( { notLoggedInWarningVisible: !this.state.notLoggedInWarningVisible } );
			}
			else if ( pressed && e.keyCode === 27 )
			{
				this.setState( { statsVisible: false, shipSelectionVisible: false, upgradesVisible: false, notLoggedInWarningVisible: false } );
			}
			else
			{
				if ( !game.player )
					return;
				if ( ( e.keyCode >= 37 && e.keyCode <= 40 || e.keyCode === 87 || e.keyCode === 65 || e.keyCode === 83 || e.keyCode === 68 ) )
				{
					if ( e.keyCode === 37 || e.keyCode === 65 )
						this.left = pressed;
					if ( e.keyCode === 38 || e.keyCode === 87 )
						this.up = pressed;
					if ( e.keyCode === 39 || e.keyCode === 68 )
						this.right = pressed;
					if ( e.keyCode === 40 || e.keyCode === 83 )
						this.down = pressed;
					this.aX = ( this.left ? -1 : 0 ) + ( this.right ? 1 : 0 );
					this.aY = ( this.up ? 1 : 0 ) + ( this.down ? -1 : 0 );
					game.autoPilot = false;
					this.control();
				}
				else if ( pressed && e.keyCode === 81 )
				{
					connector.Use( 0, 0, 3 );
				}
				else if ( pressed && e.keyCode === 32 )
				{
					game.autoPilot = true;
				}
			}
		}

		private timer = 0;
		private lastSend = 0;

		private control( forceSend?: boolean )
		{
			let now = performance.now();
			let timeSinceLastSend = now - this.lastSend;
			if ( forceSend || timeSinceLastSend > 200 && !this.timer )
			{
				this.lastSend = now;
				if ( this.timer )
				{
					window.clearTimeout( this.timer );
					this.timer = 0;
				}
				connector.Control( !renderer.orientationRightToLeft && !renderer.orientationPortrait ? this.aX :
					renderer.orientationRightToLeft && !renderer.orientationPortrait ? -this.aX :
						!renderer.orientationRightToLeft && renderer.orientationPortrait ? this.aY :
							-this.aY,
					!renderer.orientationRightToLeft && !renderer.orientationPortrait ? this.aY :
						renderer.orientationRightToLeft && !renderer.orientationPortrait ? -this.aY :
							!renderer.orientationRightToLeft && renderer.orientationPortrait ? -this.aX :
								this.aX );
			}
			else if ( !this.timer )
				this.timer = window.setTimeout( () =>
				{
					this.timer = 0;
					this.control( true );
				}, 200 - timeSinceLastSend );
		}


		componentDidMount()
		{
			window.addEventListener( "keydown", e => this.onKeyDown( e ) );
			window.addEventListener( "keyup", e => this.onKeyUp( e ) );
			window.addEventListener( "mousedown", e => this.onMouseDown( e ) );
			window.addEventListener( "mouseup", e => this.onMouseUp( e ) );
			window.addEventListener( "mousemove", e => this.onMouseMove( e ) );
			window.addEventListener( "contextmenu", e =>
			{
				e.preventDefault();
				return false;
			} );
		}

		private onKeyDown( e: KeyboardEvent )
		{
			if ( this.shouldIgnoreKey( e ) || this.lastKeyDown === e.keyCode )
				return;
			this.lastKeyDown = e.keyCode;
			this.onKey( e, true );
		}

		private onKeyUp( e: KeyboardEvent )
		{
			if ( this.shouldIgnoreKey( e ) )
				return;
			this.lastKeyDown = 0;
			this.onKey( e, false );
		}

		private shouldIgnoreKey( e: KeyboardEvent )
		{
			return e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLButtonElement && ( e.keyCode === 27 || e.keyCode === 32 || e.keyCode === 9 );
		}

		onMouseDown( e: MouseEvent )
		{
			if ( e.button === 0 )
			{
				let pos = renderer.getGameCoords( e.clientX, e.clientY );
				connector.Use( pos.x, pos.y, 1 );
			}
			else if ( e.button === 1 )
			{
				this.setState( {
					joystick: {
						x: this.mouseDownX = e.clientX,
						y: this.mouseDownY = e.clientY,
						jx: e.clientX,
						jy: e.clientY
					}
				} );
			}
			else if ( e.button === 2 )
			{
				e.preventDefault();
				let pos = renderer.getGameCoords( e.clientX, e.clientY );
				connector.Use( pos.x, pos.y, 2 );
			}
		}

		onMouseMove( e: MouseEvent )
		{
			this.mouseX = e.clientX;
			this.mouseY = e.clientY;
			if ( e.buttons === 4 )
				this.setState( { joystick: { x: this.mouseDownX, y: this.mouseDownY, jx: e.clientX, jy: e.clientY } } );
		}

		onMouseUp( e: MouseEvent )
		{
			if ( e.button === 1 )
				this.setState( { joystick: null } );
		}

		private processCommand( cmd?: string )
		{
			this.setState( { chatInputVisible: false } );
			if ( cmd === "swap" )
				connector.SwapTeam();
			else if ( cmd === "dbg" )
				this.setState( { debugVisible: !this.state.debugVisible } );
		}


		render()
		{
			return [
				this.state.notLoggedInWarningVisible && <NotLoggedInWarning onClose={ () => this.setState( { notLoggedInWarningVisible: false } ) }/>,
				this.state.upgradesVisible && <Upgrades onClose={ () => this.setState( { upgradesVisible: false } ) }/>,
				this.state.shipSelectionVisible && <ShipSelection onClose={ () => this.setState( { shipSelectionVisible: false } ) }/>,
				<Debug showDetails={ this.state.debugVisible }/>,
				<Stats showDetails={ this.state.statsVisible }/>,
				<Chat inputVisible={ this.state.chatInputVisible } onCloseInput={ x => this.processCommand( x ) }/>,
				this.state.joystick && <Joystick coords={ this.state.joystick! }/>,
				<RespawnTimer/>,
				this.state.loginVisible && <Login onLogin={ () => this.setState( { loginVisible: false } ) }/>
			];
		}
	}
}