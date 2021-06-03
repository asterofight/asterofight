/** HTMLElement extension methods */
interface HTMLElement
{
	removeAllChildren();
}

/** Array extension methods */
interface Array<T>
{
	/**
	* Returns the first element in array that matches the search criteria or undefined if no such element were found.
	* @param callbackfn The search criteria. Return true if element is found.
	*/
	find( callbackfn: ( value: T, index: number, array: T[] ) => boolean, thisArg?: any ): T;
	/**
	* Returns the last element in array that matches the search criteria or undefined if no such element were found.
	* @param callbackfn The search criteria. Return true if element is found.
	*/
	findLast( callbackfn: ( value: T, index: number, array: T[] ) => boolean, thisArg?: any ): T;
	/**
	* Returns the first element in array that matches the search criteria or undefined if no such element were found.
	* @param callbackfn The search criteria. Return true if element is found.
	*/
	findIndex( callbackfn: ( value: T, index: number, array: T[] ) => boolean, thisArg?: any ): number;
	/**
	* Returns the best element in array that matches the search criteria or undefined if no such element were found.
	* @param callbackfn The search criteria. Return value of element or undefined if element is to be excluded from search.
	*/
	findBest( callbackfn: ( value: T, index: number, array: T[] ) => number | undefined, thisArg?: any ): T;
	/**
	* Adds the element to the array and if its length exceeds maxLength then removes the first and returns it.
	* @param value The element to be added.
	* @param maxLength The maximum length of the array.
	*/
	pushShift( value: T, maxLength: number ): T;
	/**
	* Removes all elements that match the search criteria. Returns the number of elements removed.
	* @param callbackfn The search criteria. Return true if element is found.
	*/
	removeAll( callbackfn: ( value: T, index: number, array: T[] ) => boolean, thisArg?: any );

	last(): T;
}

/** String extension methods */
interface String
{
	endsWith( suffix: string ): boolean;
	startsWith( prefix: string ): boolean;
	contains( substring: string ): boolean;
	padLeft( totalChars: number, paddingChar?: string ): String;
}

interface Number
{
	padLeft( totalDigits: number, paddingChar?: string ): string;
}


if ( typeof HTMLElement.prototype[ "removeAllChildren" ] !== 'function' )
	HTMLElement.prototype[ "removeAllChildren" ] = function () { while ( this.lastChild ) this.removeChild( this.lastChild ); }


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if ( !Array.prototype.find )
{
	Array.prototype.find = function ( predicate )
	{
		if ( this === null )
		{
			throw new TypeError( 'Array.prototype.find called on null or undefined' );
		}
		if ( typeof predicate !== 'function' )
		{
			throw new TypeError( 'predicate must be a function' );
		}
		var list = Object( this );
		var length = list.length >>> 0;
		var thisArg = arguments[ 1 ];
		var value;

		for ( var i = 0; i < length; i++ )
		{
			value = list[ i ];
			if ( predicate.call( thisArg, value, i, list ) )
			{
				return value;
			}
		}
		return undefined;
	};
}

if ( !Array.prototype[ "findLast" ] )
{
	Array.prototype[ "findLast" ] = function ( predicate )
	{
		if ( this === null )
		{
			throw new TypeError( 'Array.prototype.findLast called on null or undefined' );
		}
		if ( typeof predicate !== 'function' )
		{
			throw new TypeError( 'predicate must be a function' );
		}
		var list = Object( this );
		var length = list.length >>> 0;
		var thisArg = arguments[ 1 ];
		var value;

		for ( var i = length - 1; i >= 0; i-- )
		{
			value = list[ i ];
			if ( predicate.call( thisArg, value, i, list ) )
			{
				return value;
			}
		}
		return undefined;
	};
}

if ( !Array.prototype.findIndex )
{
	Array.prototype.findIndex = function ( predicate )
	{
		if ( this === null )
		{
			throw new TypeError( 'Array.prototype.findIndex called on null or undefined' );
		}
		if ( typeof predicate !== 'function' )
		{
			throw new TypeError( 'predicate must be a function' );
		}
		var list = Object( this );
		var length = list.length >>> 0;
		var thisArg = arguments[ 1 ];
		var value;

		for ( var i = 0; i < length; i++ )
		{
			value = list[ i ];
			if ( predicate.call( thisArg, value, i, list ) )
			{
				return i;
			}
		}
		return -1;
	};
}

if ( !Array.prototype.findBest )
{
	Array.prototype.findBest = function ( predicate )
	{
		if ( this === null )
		{
			throw new TypeError( 'Array.prototype.find called on null or undefined' );
		}
		if ( typeof predicate !== 'function' )
		{
			throw new TypeError( 'predicate must be a function' );
		}
		var list = Object( this );
		var length = list.length >>> 0;
		var thisArg = arguments[ 1 ];
		var bestValue, bestItem, found = false;

		for ( var i = 0; i < length; i++ )
		{
			var item = list[ i ];
			var value = predicate.call( thisArg, value, i, list );
			if ( value != null && ( !found || value > bestValue ) )
			{
				found = true;
				bestValue = value;
				bestItem = item;
			}
		}
		return bestItem;
	};
}


if ( !Array.prototype[ "pushShift" ] )
{
	Array.prototype[ "pushShift" ] = function ( value, maxLength )
	{
		if ( this == null )
			throw new TypeError( 'Array.prototype.pushShift called on null or undefined' );
		if ( typeof maxLength !== 'number' || maxLength < 0 )
			throw new TypeError( 'maxCount must be a non-negative number' );
		var list = Object( this );
		list.push( value );
		if ( list.length > maxLength )
			return list.shift();
	};
}

if ( !Array.prototype[ "removeAll" ] )
{
	Array.prototype[ "removeAll" ] = function ( predicate )
	{
		if ( this === null )
		{
			throw new TypeError( 'Array.prototype.removeAll called on null or undefined' );
		}
		if ( typeof predicate !== 'function' )
		{
			throw new TypeError( 'predicate must be a function' );
		}
		var list = Object( this );
		var length = list.length >>> 0;
		var thisArg = arguments[ 1 ];
		var value;

		for ( var i = length - 1; i >= 0; i-- )
		{
			value = list[ i ];
			if ( predicate.call( thisArg, value, i, list ) )
				this.splice( i, 1 );
		}
		return length - list.length;
	};
}


if ( !Array.prototype[ "last" ] )
{
	Array.prototype[ "last" ] = function ()
	{
		var list = Object( this );
		return list[ list.length - 1 ];
	};
}


/** String extension methods */

if ( typeof String.prototype.endsWith !== 'function' )
	String.prototype.endsWith = function ( suffix ) { return this.substr( -suffix.length ) === suffix; }
if ( typeof String.prototype.startsWith !== 'function' )
	String.prototype.startsWith = function ( prefix ) { return this.lastIndexOf( prefix, 0 ) === 0; }
if ( typeof String.prototype[ "contains" ] !== 'function' )
	String.prototype[ "contains" ] = function ( substring ) { return this.indexOf( substring ) != -1; }
if ( typeof String.prototype[ "padLeft" ] !== 'function' )
	String.prototype[ "padLeft" ] = function ( totalChars, paddingChar )
	{
		let s = <string>this;
		while ( s.length < ( totalChars || 2 ) )
			s = ( paddingChar || " " ) + s;
		return s;
	}

if ( typeof Number.prototype[ "padLeft" ] !== 'function' )
	Number.prototype[ "padLeft" ] = function ( totalDigits, paddingChar )
	{
		var s = String( this );
		while ( s.length < ( totalDigits || 2 ) )
			s = ( paddingChar || "0" ) + s;
		return s;
	}


