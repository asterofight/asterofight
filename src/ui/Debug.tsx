/// <reference path="../common/MiniChart.tsx"/>

namespace A
{
    export class Debug extends PureComponent<{ showDetails: boolean }>
    {
        componentDidMount()
        {
            gameConnector.addEventListener( "packet", p =>
            {
                this.forceUpdate();
            }, this );
        }

        componentWillUnmount()
        {
            gameConnector.removeAllEventListener( this );
        }

        render()
        {
            let colors = [ "blue", "green", "yellow", "red", "lime", "orange", "purple" ];
            let text = "";// `${ renderer.pixiApp.renderer.width } x ${ renderer.pixiApp.renderer.height } => ${ renderer.pixiApp.screen.width } x ${ renderer.pixiApp.screen.height }; ${ Math.round( renderer.pixiApp.ticker.FPS ) } fps`;
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