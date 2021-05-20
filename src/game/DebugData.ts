namespace A
{

    export interface DebugChart
    {
        name: string;
        values: number[];
        min: number;
        max: number;
        unit: string;
    }

    export class DebugData
    {
        charts = [] as DebugChart[];

        private packetHistory: number[] = [];
        private unsentPacketHistoryCount = 0;
        private fpsTimes: number[] = [];
        private fpsLastValueTime: number = 0;
        private fpsHistory: number[] = [];
        private unsentFpsHistoryCount = 0;

        get currentFps() { return this.fpsHistory.length > 0 ? this.fpsHistory[ this.fpsHistory.length - 1 ] : 0; }

        updateChart( name: string, value: number, min: number, max: number, unit: string, length?: number )
        {
            let chart = this.charts.find( x => x.name === name ) || ( this.charts[ this.charts.push( { name, values: [], min, max, unit } ) - 1 ] );
            chart.values.pushShift( value, length ?? 60 );
        }

        updateNetwork( interval: number )
        {
            this.updateChart( "Network", interval, 0, 200, "ms" );
            this.unsentPacketHistoryCount++;
        }

        updateFPS()
        {
            let now = performance.now();
            this.fpsTimes.pushShift( now, 60 );
            if ( this.fpsTimes.length > 1 && now > this.fpsLastValueTime + 500 )
            {
                this.fpsLastValueTime = now;
                this.fpsHistory.pushShift( ( this.fpsTimes.length - 1 ) * 1000 / ( this.fpsTimes[ this.fpsTimes.length - 1 ] - this.fpsTimes[ 0 ] ), 60 );
                this.updateChart( "FPS", ( this.fpsTimes.length - 1 ) * 1000 / ( this.fpsTimes[ this.fpsTimes.length - 1 ] - this.fpsTimes[ 0 ] ), 0, 120, "/s" );
                this.unsentFpsHistoryCount++;
            }
        }

    }
    export var debug = new DebugData();
}
