namespace A
{

	export class LinkEffect
	{
		readonly srcId: number;
		readonly dstId: number;
		readonly srcPos = new Vector2();
		readonly dstPos = new Vector2();
		readonly name: string;
		readonly ai: AssetInstance;
		lastSeenPacketId = game.packetId;

		constructor( od: PacketLinkEffect )
		{
			this.srcId = od.srcId;
			this.dstId = od.dstId;
			this.name = od.name;
			this.ai = assetMgr.createInstance( od.name );
		}

		update( od: PacketLinkEffect )
		{
			this.lastSeenPacketId = game.packetId;
			this.srcPos.setCoords( od.srcPos.x, od.srcPos.y );
			this.dstPos.setCoords( od.dstPos.x, od.dstPos.y );
		}

		render()
		{
			this.ai.setPos2( this.srcPos, this.dstPos );
			this.ai.render();
		}

		destroy()
		{
			this.ai.destroy();
		}

	}
}
