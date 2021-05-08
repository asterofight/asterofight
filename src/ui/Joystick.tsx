namespace A
{
    export interface JoystickOptions
    {
        coords: {
            x: number;
            y: number;
            jx: number;
            jy: number;
        }
    }

    export class Joystick extends PureComponent<JoystickOptions>
    {
        clamp( x: number, a: number, b: number )
        {
            return x < a ? a : x > b ? b : x;
        }
        render()
        {
            let size = 50;
            let jx = this.props.coords.jx - this.props.coords.x;
            let jy = this.props.coords.jy - this.props.coords.y;
            if ( jx * jx + jy * jy > size * size )
            {
                let s = size / Math.sqrt( jx * jx + jy * jy );
                jx *= s;
                jy *= s;
            }
            jx += size;
            jy += size;
            return (
                <div className="joystick" style={ { top: this.props.coords.y, left: this.props.coords.x } }>
                    <div style={ { top: jy, left: jx } }></div>
                </div>
            );
        }
    }
}
