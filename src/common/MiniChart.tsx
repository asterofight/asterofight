namespace A
{
    export interface MiniChartProps
    {
        data: number[];
        min: number;
        max: number;
        lineColor?: string;
        lineThickness?: number;
        fill?: boolean;
    }

    export class MiniChart extends preact.Component<MiniChartProps>
    {
        render()
        {
            let aspectRatio = 2;
            let height = 100;
            let width = height * aspectRatio;
            let data = this.props.data;
            let step = width / ( data.length - 1 );
            let scale = ( height / ( this.props.max - this.props.min ) );
            let ymin = this.props.min * scale;
            let pattern = "";

            if ( data.length >= 1 )
            {
                let y = Math.floor( ymin + height - data[ 0 ] * scale );
                pattern += "M0.0 " + ( Math.floor( y ) + 0.5 ) + ( data.length > 1 ? "L" : "" );

                for ( let i = 1; i < data.length; i++ )
                {
                    let y = Math.floor( ymin + height - data[ i ] * scale );
                    let x = step * i;
                    pattern += ( Math.floor( x ) + 0.5 ) + " " + ( Math.floor( y ) + 0.5 ) + " ";
                }
            }


            return (
                <svg viewBox={ `0 0 ${ width } ${ height }` } preserveAspectRatio="none">
                    <path stroke={ this.props.lineColor ?? "black" } strokeWidth={ this.props.lineThickness ?? 1 } fill="none" d={ pattern } />
                    { this.props.fill && data.length >= 2 && <path stroke="none" fill={ this.props.lineColor ?? "black" } fillOpacity="0.25"
                        d={ `${ pattern }${ width } ${ height } 0 ${ height } Z` } /> }
                </svg>
            );
        }

    }
}
