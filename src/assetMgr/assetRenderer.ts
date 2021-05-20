/// <reference path="../../node_modules/babylonjs/babylon.module.d.ts"/>
/// <reference path="../../node_modules/babylonjs-loaders/babylonjs.loaders.module.d.ts"/>


namespace A
{

    export class AssetRenderer
    {
        readonly onRender = new BABYLON.Observable();
        ready = false;

        pixelCount = 0;
        avgFrameTime = 0;
        avgRenderTime = 0;
        readonly frameTimes = [] as number[];
        drawCalls = 0;

        droppedFrames = 0;

        readonly engine: BABYLON.Engine;
        readonly scene: BABYLON.Scene;
        private loadCount = 0;

        private calcPixelCount = () =>
        {
            this.pixelCount = this.engine.getRenderWidth() * this.engine.getRenderHeight();
        };

        constructor( private canvas: HTMLCanvasElement )
        {
            this.engine = new BABYLON.Engine( canvas, true );
            this.engine.setHardwareScalingLevel( 1 / window.devicePixelRatio );
            this.engine.onResizeObservable.add( this.calcPixelCount );
            this.calcPixelCount();
            window.addEventListener( "resize", this.resize );

            this.scene = new BABYLON.Scene( this.engine );
            this.scene.clearColor = new BABYLON.Color4( .1, .1, .1, 1 );

            let cam = new BABYLON.ArcRotateCamera( "Main", -Math.PI / 2, 1.2, 80, new BABYLON.Vector3( 0, 0, 0 ), this.scene );
            cam.minZ = 1;
            cam.maxZ = 100;
            cam.attachControl( this.canvas );

            let ambient = new BABYLON.HemisphericLight( "ambient", new BABYLON.Vector3( 0, 1, 2 ), this.scene );
            ambient.groundColor.set( 0.2, 0.3, 0.2 );
            ambient.diffuse.set( .88, .93, 1 );
            ambient.direction.set( 0, 0.9, 1.5 );
            ambient.intensity = 0.3;
            let direct = new BABYLON.DirectionalLight( "sun", new BABYLON.Vector3( 0.8, -1, 0.2 ), this.scene );
            direct.intensity = 4;
            direct.diffuse.set( 0.9, 0.95, 1 );
            direct.position = direct.direction.scale( -50 );
        }

        start()
        {
            this.engine.runRenderLoop( this.render );
        }

        stop()
        {
            this.engine.stopRenderLoop();
        }

        get activeBones()
        {
            return this.engine.scenes[ 0 ].getActiveBones();
        }

        get faceCount()
        {
            return this.engine.scenes[ 0 ].getActiveIndices() / 3;
        }

        private fpsFrames = 0;
        private fpsSecond = 0;
        fps = 0;
        private lastFrameAt = 0;
        private frameIdx = 0;

        private render = () =>
        {
            let scene = this.engine.scenes[ 0 ];
            this.onRender.notifyObservers( scene );
            scene.render();
        };

        private resize = () =>
        {
            this.engine?.resize();
        };


    }

    export var renderer = new AssetRenderer( document.querySelector( "canvas" )! );
    window.addEventListener( "load", () => renderer.start() );

}
