namespace A
{

	export class Rectangle
	{
		constructor( public x = 0, public y = 0, public w = 0, public h = 0 ) { }

		clone() { return new Rectangle( this.x, this.y, this.w, this.h ); }

		static get zero() { return new Rectangle( 0, 0, 0, 0 ); }
	}

}