namespace A
{
	export class Sound
	{
		audio: HTMLAudioElement[] = [];
		maxInstances = 4;

		constructor( src: string, autoPlay: boolean = false )
		{
			this.audio.push( new Audio( src ) );
			if ( autoPlay )
				this.audio[ 0 ].autoplay = autoPlay;
		}

		play( x: number, y: number )
		{
			for ( let a of this.audio )
				if ( !this.audioIsPlaying( a ) )
				{
					a.play();
					return;
				}
			if ( this.maxInstances > this.audio.length )
			{
				let a = <HTMLAudioElement>this.audio[ 0 ].cloneNode();
				a.play();
				this.audio.push( a );
			}
		}

		private audioIsPlaying( a: HTMLAudioElement )
		{
			return a && a.currentTime > 0 && !a.paused && !a.ended && a.readyState > 2;
		}

	}
}
