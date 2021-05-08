
namespace A
{

    export class CapturePoint extends MapObject
    {
        status = 0;
        private graphics = new PIXI.Graphics();
        private text = new PIXI.Text( "", { fontFamily: 'Arial', fontSize: 100, stroke: 0xffffff, strokeThickness: 3 } );

        constructor( od: PacketCapturePoint )
        {
            super( false, od.id );
            renderer.markingLayer.addChild( this.graphics );
            renderer.markingLayer.addChild( this.text );
        }

        destroy()
        {
            this.graphics.destroy();
            this.text.destroy();
        }

        update( od: PacketCapturePoint )
        {
            super.update( od );
            if ( od.captureStatus !== undefined )
            {
                this.status = od.captureStatus;
                let color = this.team === 0 ? 0x808080 : this.team === game.team ? 0x0000ff : 0xff0000;
                this.text.text = ( Math.abs( this.status ) * 100 ).toFixed( 0 );
                this.text.style.stroke = color;
            }
        }

        draw()
        {
            let color = this.team === 0 ? 0x808080 : this.team === game.team ? 0x0000ff : 0xff0000;
            let p = renderer.transform.transform( this.renderPosition );
            let r = renderer.transform.transform( this.r );
            this.graphics.clear();
            this.graphics.x = p.x;
            this.graphics.y = p.y;
            this.graphics.lineStyle( 4, color, 1 );
            this.graphics.drawCircle( 0, 0, r );
            this.text.x = p.x - this.text.width / 2;
            this.text.y = p.y - this.text.height / 2;
        }
    }

}
