/// <reference path="../../node_modules/babylonjs/babylon.module.d.ts"/>
/// <reference path="../../node_modules/babylonjs-loaders/babylonjs.loaders.module.d.ts"/>
/// <reference path="Vector2.ts"/>

namespace A
{

	export class Renderer
	{
		readonly onRender = new EventObject();
		readonly onOrientationChanged = new EventObject();

		orientationRightToLeft = false;
		orientationPortrait = false;

		isPaused = false;
		pixelCount = 0;
		debugNumbers: { [ name: string ]: number } = {};
		targetCamPos = new Vector2();

		readonly engine: BABYLON.Engine;
		readonly scene: BABYLON.Scene;
		readonly unlitMaterial: BABYLON.StandardMaterial;
		private readonly sceneInstrumentation: BABYLON.SceneInstrumentation;
		private readonly camDistance = 100;
		private readonly camera: BABYLON.TargetCamera;
		private readonly lightHemi: BABYLON.HemisphericLight;
		private readonly lightDirect: BABYLON.DirectionalLight;
		private readonly flares = [] as { pos: Vector2, peakIntensity: number, createdAt: number }[];
		private readonly flareLights = [] as BABYLON.PointLight[];

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
			this.scene.clearColor = new BABYLON.Color4( 0, 0, 0, 1 );
			this.scene.ambientColor = BABYLON.Color3.White();
			var gl = new BABYLON.GlowLayer( "glow", this.scene );
			gl.intensity = 1.5;
			this.sceneInstrumentation = new BABYLON.SceneInstrumentation( this.scene );
			this.sceneInstrumentation.captureFrameTime = true;

			this.camera = new BABYLON.TargetCamera( "", new BABYLON.Vector3( 0, 0, -this.camDistance ), this.scene, true );
			//this.camera.inertia = 0;
			this.camera.minZ = this.camDistance - 20;
			this.camera.maxZ = 1000;

			let ambient = new BABYLON.HemisphericLight( "ambient", new BABYLON.Vector3( 0, -1, 0 ), this.scene );
			ambient.groundColor.set( .01, .01, .01 );
			ambient.diffuse.set( .01, .01, .01 );
			//ambient.intensity = 1;
			this.lightHemi = ambient;
			let direct = new BABYLON.DirectionalLight( "sun", new BABYLON.Vector3( 0, -1, 0 ), this.scene );
			direct.intensity = 2;
			//direct.diffuse.set( 1, 0.95, 1 );
			//direct.position = direct.direction.scale( -50 );
			this.lightDirect = direct;

			this.unlitMaterial = new BABYLON.StandardMaterial( "Unlit", this.scene );
			this.unlitMaterial.disableLighting = true;
			this.unlitMaterial.ambientColor = new BABYLON.Color3( 1, 1, 1 );

			for ( let i = 0; i < 4; i++ )
			{
				let light = new BABYLON.PointLight( "Flare", BABYLON.Vector3.Zero(), this.scene );
				light.diffuse = new BABYLON.Color3( 1, .7, .5 );
				light.setEnabled( false );
				this.flareLights.push( light );
			}

			this.createBackground();
		}

		private createBackground()
		{
			let root = new BABYLON.TransformNode( "Background", this.scene );
			let star = BABYLON.MeshBuilder.CreateIcoSphere( "BackgroundStar", { radius: .25 } );
			star.parent = root;
			let bgMat = new BABYLON.StandardMaterial( "BackgroundStar", this.scene );
			bgMat.diffuseColor = new BABYLON.Color3( .3, .3, .35 );
			bgMat.maxSimultaneousLights = 2;
			//bgMat.disableLighting = true;
			//bgMat.emissiveColor = new BABYLON.Color3( .35, .35, .4 );
			star.material = bgMat;
			star.setEnabled( false );
			let w = 1.5;
			let h = .75;
			let minZ = 50;
			let maxZ = 500;
			for ( let i = 0; i < 1000; i++ )
			{
				let instance = star.createInstance( star.name );
				instance.parent = root;
				let z = Math.random() * ( maxZ - minZ ) + minZ;
				instance.position.x = ( Math.random() - 0.5 ) * w * ( z + this.camDistance );
				instance.position.y = ( Math.random() - 0.5 ) * h * ( z + this.camDistance );
				instance.position.z = z;
			}
		}

		start()
		{
			this.isPaused = false;
			this.rearrange( false );
			this.engine.runRenderLoop( this.render );
		}

		stop()
		{
			this.isPaused = true;
			this.engine.stopRenderLoop();
		}

		setTeam( rightToLeft: boolean )
		{
			if ( this.orientationRightToLeft !== rightToLeft )
			{
				this.orientationRightToLeft = rightToLeft;
				this.rearrange( true );
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

		getScreenCoords( gamePos: Vector2 )
		{
			let coordinates = BABYLON.Vector3.Project( new BABYLON.Vector3( gamePos.x, gamePos.y, 0 ),
				BABYLON.Matrix.Identity(),
				this.scene.getTransformMatrix(),
				this.camera.viewport.toGlobal( this.engine.getRenderWidth(), this.engine.getRenderHeight(), ) );
			return new Vector2( coordinates.x / window.devicePixelRatio, coordinates.y / window.devicePixelRatio );
		}

		flare( pos: Vector2, intensity: number )
		{
			this.flares.push( { pos, peakIntensity: intensity, createdAt: performance.now() } );
		}

		showDebug()
		{
			this.scene.debugLayer.show( {
				overlay: true,
				embedMode: true
			} );
		}

		private renderLights()
		{
			let activeLights = [] as { pos: Vector2, intensity: number }[];

			let now = performance.now();
			this.flares.removeAll( x => x.createdAt + 3000 < now );

			let c = .002;
			for ( let f of this.flares )
			{
				let t = ( now - f.createdAt ) * c;
				let intensity = f.peakIntensity * ( 2 * t / ( Math.pow( t, 4 ) + 1 ) - t * .2 );
				if ( intensity > 0 )
					activeLights.push( { pos: f.pos, intensity } );
			}

			for ( let i = 0; i < this.flareLights.length; i++ )
			{
				if ( i < activeLights.length )
				{
					this.flareLights[ i ].position = new BABYLON.Vector3( activeLights[ i ].pos.x, activeLights[ i ].pos.y, -.5 );
					this.flareLights[ i ].intensity = activeLights[ i ].intensity;
					this.flareLights[ i ].setEnabled( true );
				}
				else
					this.flareLights[ i ].setEnabled( false );
			}

		}

		private render = () =>
		{
			this.onRender.raise( this.scene );

			this.renderLights();

			let dx = ( this.targetCamPos.x - this.camera.position.x ) * .1;
			let dy = ( this.targetCamPos.y - this.camera.position.y ) * .1;
			let x = this.camera.position.x + dx;
			let y = this.camera.position.y + dy;
			this.camera.setTarget( new BABYLON.Vector3( x, y, 0 ) );
			this.camera.position.set( x, y, -this.camDistance );

			this.scene.render();

			this.debugNumbers[ "FPS" ] = this.engine.performanceMonitor.averageFPS;
			this.debugNumbers[ "Frame Time" ] = this.sceneInstrumentation.frameTimeCounter.current;
			debug.updateChart( "Draw Calls", this.sceneInstrumentation.drawCallsCounter.current, 0, 100, "", 360 );
		};

		private resize = () =>
		{
			if ( this.engine )
				this.rearrange( false );
		};

		private rearrange( triggerOrientationChanged: boolean )
		{
			this.engine.resize();
			let aspectRatio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
			triggerOrientationChanged = triggerOrientationChanged || this.orientationPortrait !== aspectRatio < 1;
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

			if ( triggerOrientationChanged )
				this.onOrientationChanged.raise();
		}


	}

	export var renderer = new Renderer( document.querySelector( "canvas" )! );
	window.addEventListener( "load", () => renderer.start() );

}
