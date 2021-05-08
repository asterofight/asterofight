namespace A
{
	export class BitArray
	{
		constructor( private bytes: Uint8Array, public length: number )
		{
		}

		getBit( index: number )
		{
			return this.bytes[ Math.floor( index / 8 ) ] & ( 1 << ( index % 8 ) );
		}
	}


	export class DataViewReader
	{
		constructor( public dv: DataView, public stringTable: string[], public offset = 0 )
		{
		}

		private inc( length: number )
		{
			let ret = this.offset;
			this.offset += length;
			return ret;
		}

		readBoolean()
		{
			return !!this.dv.getUint8( this.offset++ );
		}

		readByte()
		{
			return this.dv.getUint8( this.offset++ );
		}

		readInt8()
		{
			return this.dv.getInt8( this.offset++ );
		}

		readInt16()
		{
			return this.dv.getInt16( this.inc( 2 ), true );
		}

		readUint16()
		{
			return this.dv.getUint16( this.inc( 2 ), true );
		}

		readUint()
		{
			return this.dv.getUint32( this.inc( 4 ), true );
		}

		readSint()
		{
			return this.dv.getInt32( this.inc( 4 ), true );
		}

		readFloat()
		{
			return this.dv.getFloat32( this.inc( 4 ), true );
		}

		readDouble()
		{
			return this.dv.getFloat64( this.inc( 8 ), true );
		}

		readBitArray( bitLength: number )
		{
			let nBytes = Math.ceil( bitLength / 8 );
			return new BitArray( new Uint8Array( this.dv.buffer, this.inc( nBytes ), nBytes ), bitLength );
		}

		readVarInt()
		{
			let n = 0;
			let p = 0;
			let b;
			while ( ( b = this.dv.getUint8( this.offset++ ) ) >= 128 )
			{
				n += ( b & 127 ) << p;
				p += 7;
			}
			return n + ( b << p );
		}

		readVarIntNeg()
		{
			let x = this.readVarInt();
			return x % 2 == 0 ? x / 2 : -( x + 1 ) / 2;
		}

		readString()
		{
			let len = this.readVarInt();
			let s = "";
			while ( len-- > 0 )
			{
				let c = this.readByte();
				let cc = c >> 4;
				if ( cc < 8 ) // 0xxxxxxx
					s += String.fromCharCode( c );
				else if ( cc === 12 || c === 13 ) // 110x xxxx   10xx xxxx
				{
					s += String.fromCharCode( ( ( c & 0x1F ) << 6 ) | ( this.readByte() & 0x3F ) );
					len--;
				}
				else if ( cc === 14 ) // 1110 xxxx  10xx xxxx  10xx xxxx
				{
					s += String.fromCharCode( ( ( c & 0x0F ) << 12 ) | ( ( this.readByte() & 0x3F ) << 6 ) | ( ( this.readByte() & 0x3F ) << 0 ) );
					len -= 2;
				}
			}
			return s;
		}

		readInternedString()
		{
			let idx = this.readVarInt();
			if ( idx < this.stringTable.length )
				return this.stringTable[ idx ];
			let s = this.readString();
			this.stringTable.push( s );
			return s;
		}

	}

}
