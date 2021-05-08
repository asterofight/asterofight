namespace A
{
	export class LanguagePack
	{
		static languageCode = "en";

		static get( key: string, def?: string ): string
		{
			let ret = this.data[ key ];
			if ( ret == undefined )
			{
				ret = key;
				return def ? def : key;
			}
			return ret;
		}

		static stringCompare( strA: string, strB: string, ignoreCase: boolean = false ): number
		{
			strA = strA || "";
			strB = strB || "";
			if ( ignoreCase )
				return strA.toUpperCase().localeCompare( strB.toUpperCase() );
			return strA.localeCompare( strB );
		}

		static formatNumber( value: number, precision: number ): string
		{
			return this.toLocaleStringSupportsOptions ?
				value.toLocaleString( this.languageCode, { minimumFractionDigits: precision, maximumFractionDigits: precision } ) :
				value.toFixed( precision );
		}

		static formatDateTime( datetime: number | string ): string
		{
			let m = new Date( <any>datetime );
			//return this.dateTimeFormat ? m.format( this.dateTimeFormat ) : m.toLocaleString();
			return m.toLocaleString();
		}

		static formatDate( datetime: number | string ): string
		{
			//return this.dateFormat ? datetime.format( this.dateFormat ) : datetime.toDate().toLocaleDateString();
			return new Date( <any>datetime ).toLocaleDateString();
		}

		static formatDuration( time: number, showMilliseconds?: boolean ): string
		{
			let s = "";
			if ( time >= 1000 * 60 * 60 * 24 )
			{
				let d = ~~( time / 1000 / 60 / 60 / 24 );
				time -= d * 1000 * 60 * 60 * 24;
				s += d + ".";
			}
			let x = ~~( time / 1000 / 60 / 60 );
			time -= x * 1000 * 60 * 60;
			s += x.padLeft( 2 );
			x = ~~( time / 1000 / 60 );
			time -= x * 1000 * 60;
			s += ":" + x.padLeft( 2 );
			x = ~~( time / 1000 );
			time -= x * 1000;
			s += ":" + x.padLeft( 2 );
			if ( showMilliseconds )
			{
				x = ~~( time );
				s += "." + x.padLeft( 3 );
			}
			return s;
		}


		private static data: { [ key: string ]: string } = {};

		/** Internal function */
		private static setData( data: { [ key: string ]: string } )
		{
			this.data = data;
			this.dateTimeFormat = this.data[ "dateTimeFormat" ]; // defaults to local
			this.dateFormat = this.data[ "dateFormat" ]; // defaults to local
			this.timeFormat = this.data[ "timeFormat" ];
		}

		private static __ctor = ( () =>
		{
			//LanguagePack.setData( pcsdkServerSettings.LanguagePack );
		} )();


		private static toLocaleStringSupportsOptions = !!( typeof Intl == 'object' && Intl && typeof Intl.NumberFormat == 'function' );
		static dateTimeFormat: string;
		static dateFormat: string;
		static timeFormat: string;

	}
}
