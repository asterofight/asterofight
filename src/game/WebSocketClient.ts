namespace A
{
	export enum WebSocketClientState { NotConnected, Connecting, Connected, Error }
	export interface CallOptions<T>
	{
		success?: ( ret?: T ) => void;
		exception?: ( ex: any ) => void;
		error?: ( code: number, message: string ) => void;
		onFinished?: () => void;
	}

	interface PendingCall
	{
		id: number;
		time: number;
		options: CallOptions<any>;
		method: string;
	}

	export class WebSocketClient
	{
		onBinaryMessage?: ( buffer: ArrayBuffer ) => void;
		onJsonMessage?: ( obj: any ) => void;
		onStateChanged?: ( state: WebSocketClientState ) => void;
		get state() { return this._state; }

		private _state = WebSocketClientState.NotConnected;
		private webSocket?: WebSocket;
		private lastCallId = 0;
		private pendingCalls: PendingCall[] = [];
		private address: string;
		private reconnectDelay: number = 0;
		private lastConnectTime: number = 0;

		constructor( private addressPath: string, private protocol?: string )
		{
			if ( !this.addressPath.startsWith( "/" ) )
				this.addressPath = "/" + this.addressPath;
			if ( !this.addressPath.endsWith( "/" ) )
				this.addressPath = this.addressPath + "/";
			this.address = `ws://asterofight.com${ this.addressPath }`;
			//this.address = `ws://${document.location.hostname || "localhost"}${this.addressPath}`;
			this.connect();
		}

		private setState( s: WebSocketClientState )
		{
			if ( this._state !== s )
			{
				this._state = s;
				if ( this.onStateChanged )
					this.onStateChanged( s );
			}
		}

		private connect()
		{
			this.lastConnectTime = Date.now();
			this.webSocket = new WebSocket( this.address, this.protocol );
			this.webSocket.binaryType = "arraybuffer";
			this.webSocket.addEventListener( "message", e => this.onMessage( e.data ) );
			this.webSocket.addEventListener( "open", () => this.onOpen() );
			//this.webSocket.addEventListener( "close", () => this.onClose() );
			this.webSocket.addEventListener( "error", () => this.onError() );
			this.setState( WebSocketClientState.Connecting );
		}

		private onMessage( data )
		{
			if ( typeof data === "string" )
			{
				let message = JSON.parse( data );
				if ( message.i )
				{
					let idx = this.pendingCalls.findIndex( x => x.id === message.i );
					if ( idx >= 0 )
					{
						let pendingCall = this.pendingCalls[ idx ];
						this.pendingCalls.splice( idx, 1 );
						if ( pendingCall.options.onFinished )
							pendingCall.options.onFinished();
						if ( message.e && pendingCall.options.exception )
							pendingCall.options.exception( message.e );
						else if ( pendingCall.options.success )
							pendingCall.options.success( message.r );
					}
				}
				else if ( this.onJsonMessage )
					this.onJsonMessage( message );
			}
			else if ( this.onBinaryMessage )
				this.onBinaryMessage( data );

			// clean up
			if ( this.pendingCalls.length > 0 )
			{
				let removeBefore = Date.now() - 10000; // 10s
				for ( let i = this.pendingCalls.length - 1; i >= 0; i-- )
				{
					let pendingCall = this.pendingCalls[ i ];
					this.pendingCalls.splice( i, 1 );
					if ( pendingCall.time < removeBefore )
					{
						console.log( "Timeout: " + pendingCall.method );
						if ( pendingCall.options.onFinished )
							pendingCall.options.onFinished();
						if ( pendingCall.options.error )
							pendingCall.options.error( 2, "Timeout" );
					}
				}
			}

		}

		private onOpen()
		{
			this.setState( WebSocketClientState.Connected );
		}

		//private onClose()
		//{
		//	this.setState( ConnectionState.NotConnected );
		//	setTimeout( () => this.connect(), 1000 );
		//}

		private onError()
		{
			this.setState( WebSocketClientState.Error );
			this.webSocket!.close();
			this.webSocket = undefined;
			this.setState( WebSocketClientState.Connecting );
			this.reconnectDelay = Date.now() - this.lastConnectTime > 600000 ? 0
				: this.reconnectDelay < 30000 ? 2 * this.reconnectDelay + 1000
					: 60000;
			if ( this.reconnectDelay )
				setTimeout( () => this.connect(), this.reconnectDelay );
			else
				this.connect();
		}

		call( method: string, parameters: any, options?: CallOptions<any> )
		{
			if ( !this.webSocket || this.webSocket.readyState !== 1 )
			{
				if ( options && options.onFinished )
					options.onFinished();
				if ( options && options.error )
					options.error( 1, "Disconnected. No network available or server is down." );
				return;
			}
			let obj: any = { m: method, p: parameters };
			if ( options )
			{
				let id = ++this.lastCallId;
				this.pendingCalls.push( { id, options, time: Date.now(), method } );
				obj.i = id;
			}
			this.webSocket.send( JSON.stringify( obj, null, 2 ) );
		}

		callAsync<T>( method: string, parameters: any ): PromiseLike<T>
		{
			return new Promise( ( resolve, reject ) =>
			{
				this.call( method, parameters, {
					success: result => resolve( result ),
					error: ( code, m ) =>
					{
						let error = new Error( m );
						error.name = "NetworkError";
						reject( error );
					},
					exception: ex => reject( ex )
				} );
			} );
		}


	}

}