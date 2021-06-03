namespace A
{

	export class EventObject<T>
	{
		private listeners: { callback: ( arg: T ) => void, scope?: Object }[] = [];

		add( callback: ( arg: T ) => void, scope?: Object )
		{
			this.listeners.push( { callback, scope } );
		}

		remove( callback: ( arg: T ) => void )
		{
			this.listeners = this.listeners.filter( x => x.callback !== callback );
		}

		removeAll( scope: Object )
		{
			if ( !scope )
				throw new Error( "Must specify object" );
			this.listeners = this.listeners.filter( x => x.scope !== scope );
		}

		raise( arg?: T )
		{
			for ( let listener of this.listeners )
				listener.callback.call( listener.scope, arg! );
		}
	}


}
