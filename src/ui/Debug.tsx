/// <reference path="../common/MiniChart.tsx"/>

namespace A
{
    export class Debug extends PureComponent<{ showDetails: boolean }>
    {
        componentDidMount()
        {
            connector.packetEvent.add( p =>
            {
                this.forceUpdate();
            }, this );
        }

        componentWillUnmount()
        {
            connector.packetEvent.removeAll( this );
        }

        render()
        {
            let colors = [ "blue", "green", "yellow", "red", "lime", "orange", "purple" ];
            let text = `${ renderer.width }x${ renderer.height } (${ document.body.clientWidth }x${ document.body.clientHeight }) @${ Math.round( renderer.debugNumbers[ "FPS" ] ) } fps; ${ Math.round( renderer.debugNumbers[ "Frame Time" ] )} ms`;
            return (
                <div className="debug">
                    <p>{ text }</p>
                    { this.props.showDetails &&
                        <div className="charts">
                            { debug.charts.map( ( x, i ) =>
                                <div className="chart" key={ x.name }>
                                    <div className="header">
                                        <p>{ x.name }</p>
                                        <p>{ Math.round( x.values[ x.values.length - 1 ] ) } { x.unit }</p>
                                    </div>
                                    <div>
                                        <MiniChart data={ x.values } min={ x.min } max={ x.max } lineColor={ colors[ i ] } fill={ true } />
                                    </div>
                                </div>
                            ) }

                        </div>
                    }
                </div>
            );
        }
    }
}