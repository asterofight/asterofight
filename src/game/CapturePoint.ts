
namespace A
{

    export class CapturePoint extends MapObject
    {
        status = 0;

        constructor( od: PacketCapturePoint )
        {
            super( false, od.id, "CapturePoint" );
        }

        update( od: PacketCapturePoint )
        {
            super.update( od );
            if ( od.captureStatus !== undefined )
            {
                this.status = od.captureStatus;
                let color = this.team === 0 ? 0x808080 : this.team === game.team ? 0x0000ff : 0xff0000;
                // this.text.text = ( Math.abs( this.status ) * 100 ).toFixed( 0 );
                // this.text.style.stroke = color;
            }
        }
    }

}
