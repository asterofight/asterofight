/// <reference path="../../node_modules/babylonjs/babylon.module.d.ts"/>
/// <reference path="../../node_modules/babylonjs-loaders/babylonjs.loaders.module.d.ts"/>
/// <reference path="Vector2.ts"/>

namespace A
{

	export class Renderer
	{
		readonly onRender = new BABYLON.Observable();

		orientationRightToLeft = false;
		orientationPortrait = false;

		pixelCount = 0;
		debugNumbers: { [ name: string ]: number } = {};
		targetCamPos = new Vector2();

		readonly engine: BABYLON.Engine;
		readonly scene: BABYLON.Scene;
		private readonly sceneInstrumentation: BABYLON.SceneInstrumentation;
		private readonly camDistance = 100;
		private readonly camera: BABYLON.TargetCamera;
		private readonly lightHemi:BABYLON.HemisphericLight;
		private readonly lightDirect: BABYLON.DirectionalLight;

		get width()
		{
			return this.engine.getRenderWidth();
		}

		get height()
		{
			return this.engine.getRenderHeight();
		}

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
			this.scene.clearColor = new BABYLON.Color4( .01, .01, .01, 1 );
			this.sceneInstrumentation = new BABYLON.SceneInstrumentation( this.scene );
			this.sceneInstrumentation.captureFrameTime = true;

			this.camera = new BABYLON.TargetCamera( "", new BABYLON.Vector3( 0, 0, -this.camDistance ), this.scene, true );
			//this.camera.inertia = 0;
			this.camera.minZ = this.camDistance - 20;
			this.camera.maxZ = this.camDistance + 20;

			let ambient = new BABYLON.HemisphericLight( "ambient", new BABYLON.Vector3( 0, 1, 2 ), this.scene );
			ambient.groundColor.set( 0.2, 0.3, 0.2 );
			ambient.diffuse.set( .88, .93, 1 );
			ambient.direction.set( 0, 0.9, 1.5 );
			ambient.intensity = 0.1;
			this.lightHemi = ambient;
			let direct = new BABYLON.DirectionalLight( "sun", new BABYLON.Vector3( 0.8, -1, 1 ), this.scene );
			direct.intensity = 2;
			//direct.diffuse.set( 1, 0.95, 1 );
			//direct.position = direct.direction.scale( -50 );
			this.lightDirect = direct;
		}

		start()
		{
			this.rearrange();
			this.engine.runRenderLoop( this.render );
		}

		stop()
		{
			this.engine.stopRenderLoop();
		}

		setTeam( rightToLeft: boolean )
		{
			if ( this.orientationRightToLeft !== rightToLeft )
			{
				this.orientationRightToLeft = rightToLeft;
				this.rearrange();
			}
		}

		setCameraTarget( gamePos: Vector2 )
		{
			this.targetCamPos = gamePos;
		}

		getGameCoords( clientX: number, clientY: number )
		{
			let picked = this.scene.pick( clientX, clientY );
			if ( picked?.ray )
			{
				let ip = picked.ray.intersectsPlane( new BABYLON.Plane( 0, 0, 1, 0 ) );
				if ( ip )
					return new Vector2( picked.ray.origin.x + picked.ray.direction.x * ip, picked.ray.origin.y + picked.ray.direction.y * ip );
			}
			return new Vector2();
		}

		private render = () =>
		{
			let scene = this.engine.scenes[ 0 ];
			this.onRender.notifyObservers( scene );

			let dx = ( this.targetCamPos.x - this.camera.position.x ) * .1;
			let dy = ( this.targetCamPos.y - this.camera.position.y ) * .1;
			let x = this.camera.position.x + dx;
			let y = this.camera.position.y + dy;
			this.camera.setTarget( new BABYLON.Vector3( x, y, 0 ) );
			this.camera.position.set( x, y, -this.camDistance );

			scene.render();

			this.debugNumbers[ "FPS" ] = this.engine.performanceMonitor.averageFPS;
			this.debugNumbers[ "Frame Time" ] = this.sceneInstrumentation.frameTimeCounter.current;
		};

		private resize = () =>
		{
			if ( this.engine )
				this.rearrange();
		};

		private rearrange()
		{
			this.engine.resize();
			let aspectRatio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
			this.orientationPortrait = aspectRatio < 1;
			if ( !this.orientationPortrait )
			{
				let h = Math.min( 40 / aspectRatio, 22.5 );// 45 / aspectRatio * 16 / 9 / 2
				this.camera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
				this.camera.fov = Math.atan( h / this.camDistance ) * 2;
				this.camera.upVector = this.orientationRightToLeft ? BABYLON.Vector3.Down() : BABYLON.Vector3.Up();
			}
			else
			{
				let h = Math.min( 45 / 2 * aspectRatio / 9 * 16, 22.5 );
				this.camera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED;
				this.camera.fov = Math.atan( h / this.camDistance ) * 2;
				this.camera.upVector = this.orientationRightToLeft ? BABYLON.Vector3.Left() : BABYLON.Vector3.Right();
			}

			let lightDir = BABYLON.Vector3.TransformCoordinates( this.camera.upVector.negate(),
				BABYLON.Matrix.RotationAxis( BABYLON.Axis.Z, Math.PI / 4 ) ).add( BABYLON.Axis.Z );
			this.lightHemi.direction = lightDir;
			this.lightDirect.direction = lightDir;
		}


	}

	export var renderer = new Renderer( document.querySelector( "canvas" )! );
	window.addEventListener( "load", () => renderer.start() );

}
