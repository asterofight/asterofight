/// <reference path="../common/EventProducer.ts"/>
/// <reference path="Afcp.ts"/>
/// <reference path="EventObject.ts"/>
/// <reference path="UserMgr.ts"/>

namespace A
{

	export class Connector
	{

		address = `${ document.location.protocol === "https:" ? "wss" : "ws" }://${ document.location.port === "443" ? "beta.asterofight.com" : document.location.hostname || "localhost" }/af/game/`;
		webSocket: WebSocket | undefined;
		protocol = "afcp";

		readonly packetEvent = new EventObject<Packet>();
		readonly userEvent = new EventObject<void>();
		readonly connectionEvent = new EventObject<"connected" | "disconnected">();

		private lastPacketTime: number = 0;
		private lastPacketId = 0;
		private stringTable: string[] = [];
		private afcpReader = new Afcp3Reader();

		constructor()
		{
			this.connect();
		}

		test()
		{
			return this.address;
		}

		delayedPackets = [];

		private connect()
		{
			this.webSocket = new WebSocket( this.address, this.protocol );
			this.webSocket.binaryType = "arraybuffer";
			this.webSocket.onmessage = e => this.onMessage( e.data );
			this.webSocket.onopen = () => this.onOpen();
			this.webSocket.onclose = () => this.onClose();
		}

		private onMessage( data )
		{
			if ( typeof data === "string" )
			{
				let obj = JSON.parse( data );
				if ( obj.mapArea ) // map info
				{
					game.onMap( obj );
				}
				else
				{
					let pendingCallIdx = this.pendingCalls.findIndex( x => x.callId === obj.i );
					let pendingCall = this.pendingCalls.splice( pendingCallIdx, 1 )[ 0 ];
					if ( obj.e )
						pendingCall.reject( obj.e );
					else
						pendingCall.resolve( obj.r );
				}
			}
			else
			{
				this.updatePacketHistory( data.byteLength );
				let packet = this.afcpReader.deserialize( new DataViewReader( new DataView( data ), this.stringTable ) )
				this.lastPacketId = packet.id;
				game.onPacket( packet );
				this.packetEvent.raise( packet );
			}
		}

		private async onOpen()
		{
			this.connectionEvent.raise( "connected" );
			this.stringTable = [""];
			if ( game.playerId )
				this.AttachPlayer( game.playerId );
			else
			{
				let token = localStorage[ "loginToken" ];
				if ( token )
				{
					let ret = await this.callAsync<PacketUser | string>( "LoginWithToken", { token } );
					if ( typeof ret !== "string" )
					{
						userMgr.user = ret;
						if ( userMgr.user.loginToken )
							localStorage[ "loginToken" ] = userMgr.user.loginToken;
						this.userEvent.raise();
					}
					else
						localStorage.removeItem( "loginToken" );
				}
			}
			//this.call( "SetClientInfo", { clientInfo: debug.clientInfo } );
			//setInterval(() =>
			//{
			//	while ( Math.random()*2 < this.delayedPackets.length )
			//		this.onMessage( this.delayedPackets.shift() );
			//}, 30 );
		}

		private onClose()
		{
			this.connectionEvent.raise( "disconnected");
			setTimeout( () => this.connect(), 5000 );
		}

		Ack()
		{
			return this.callAsync( "Ack", {} ) as PromiseLike<void>;
		}


		Register( email: string, password: string, name: string )
		{
			return this.callAsync<string>( "Register", { email, password, name } );
		}

		async Login( email: string, password: string, generateToken: boolean )
		{
			let ret = await this.callAsync<PacketUser | string>( "Login", { email, password, generateToken } );
			if ( typeof ret !== "string" )
			{
				userMgr.user = ret;
				if ( userMgr.user.loginToken )
					localStorage[ "loginToken" ] = userMgr.user.loginToken;
				this.userEvent.raise();
				return "";
			}
			return ret;
		}

		Logout()
		{
			localStorage.removeItem( "loginToken" );
			this.call( "Logout", {} );
			userMgr.user = undefined;
			this.userEvent.raise();
		}

		CreatePlayer( name: string )
		{
			this.call( "CreatePlayer", { name } );
		}

		AttachPlayer( playerId: number )
		{
			this.call( "AttachPlayer", { playerId } );
		}

		DestroyPlayer()
		{
			this.call( "DestroyPlayer", {} );
		}

		Control( x: number, y: number )
		{
			this.call( "Control", { x, y } );
		}

		Use( x: number, y: number, ability: number )
		{
			this.call( "Use", { x, y, ability } );
		}

		SwitchSpaceship( type: string )
		{
			this.call( "SwitchSpaceship", { type } );
		}

		SwapTeam()
		{
			this.call( "SwapTeam", {} );
		}

		SendChatMessage( to: number, text: string )
		{
			this.call( "SendChatMessage", { to, text } );
		}

		BuyUpgrade( id: string )
		{
			return this.callAsync<number>( "BuyUpgrade", { id } ) as PromiseLike<number>;
		}

		SellUpgrade( id: string )
		{
			return this.callAsync<number>( "SellUpgrade", { id } ) as PromiseLike<number>;
		}


		private call( method: string, parameters: any )
		{
			if ( !this.webSocket || this.webSocket.readyState !== 1 )
				return;
			let session: any = { lastPacketId: this.lastPacketId };
			//debug.attachToPacket( session );
			parameters.session = session;
			this.webSocket.send( JSON.stringify( { m: method, p: parameters, s: session } ) );
		}


		private pendingCalls = [] as { callId: number, resolve, reject }[];
		private lastCallId = 1;

		private callAsync<T>( method: string, parameters: any ): PromiseLike<T>
		{
			return new Promise( ( resolve, reject ) =>
			{
				if ( !this.webSocket || this.webSocket.readyState !== 1 )
					reject( "no connection" );
				else
				{
					let session: any = { lastPacketId: this.lastPacketId };
					let callId = ++this.lastCallId;
					this.pendingCalls.push( { callId, resolve, reject } );
					this.webSocket.send( JSON.stringify( { i: callId, m: method, p: parameters, s: session } ) );
				}
			} );
		}


		private bytesReceivedHistory: { time: number, length: number }[] = [];

		private updatePacketHistory( packetLength: number )
		{
			let now = performance.now();
			debug.updateNetwork( now - this.lastPacketTime );
			this.lastPacketTime = now;

			this.bytesReceivedHistory.push( { time: now, length: packetLength } );
			while ( this.bytesReceivedHistory.length > 0 && now - this.bytesReceivedHistory[ 0 ].time > 1000 )
				this.bytesReceivedHistory.shift();
			debug.updateChart( "Bandwidth", this.bytesReceivedHistory.reduce( ( p, c ) => p + c.length, 0 ) / 1024, 0, 100, "KB/s" );
		}

	}

	export var connector = new Connector();
}
