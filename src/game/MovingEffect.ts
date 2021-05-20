namespace A
{

	export class MovingEffect extends MovingObject
	{
		constructor( od: PacketMovingEffect )
		{
			super( od.id, od.type! );
		}

		destroy()
		{
		}

		update( od: PacketMovingEffect )
		{
			super.update( od );
		}

		draw()
		{
		}
	}
}
