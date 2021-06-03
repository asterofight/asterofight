/// <reference path="renderer.ts"/>
/// <reference path="assetInstance.ts"/>


namespace A
{
    export class AnimatedBillboardInstance
    {
        readonly createdAt = performance.now();
        constructor( public readonly parent: BABYLON.TransformNode ) { }
    }

    export class AnimatedBillboard
    {
        private originalMesh: BABYLON.Mesh;
        private instances = [] as AnimatedBillboardInstance[];
        private matrixBuffer: Float32Array;
        private iaBuffer: Float32Array;
        private timeScale: number;


        constructor( public readonly texture: BABYLON.Texture, public readonly w: number, public readonly h: number, public readonly fps: number, public readonly loop = false, public readonly maxInstances = 100 )
        {
            this.matrixBuffer = new Float32Array( this.maxInstances * 16 );
            this.iaBuffer = new Float32Array( this.maxInstances );
            this.timeScale = 0.001 / ( this.w * this.h ) * this.fps;
            BABYLON.Effect.ShadersStore[ "animatedBillboardVertexShader" ] = `precision highp float;

    	// Attributes
    	attribute vec3 position;

        // Instanced Attributes
        attribute float iaTime;

    	// Uniforms
    	uniform mat4 view;
    	uniform mat4 viewProjection;
        uniform vec2 dimensions;

    	// Varying
    	varying vec2 vUV;

        #include<instancesDeclaration>

    	void main(void) {
            #include<instancesVertex>
            vec3 center = finalWorld[3].xyz;
            vec2 size = vec2( finalWorld[0][0], finalWorld[1][1] );
            vec3 right= vec3( view[0][0], view[1][0], view[2][0] );
            vec3 up= vec3( view[0][1], view[1][1], view[2][1] );
            vec3 p = center + right * ( position.x - .5 ) * size.x + up * ( position.y - .5 ) * size.y;
    	    gl_Position = viewProjection * vec4( p, 1.0 );
            float row = floor( iaTime * dimensions.y );
            float col = floor( iaTime * dimensions.x * dimensions.y - row * dimensions.x );
            vec2 idx = vec2( col, dimensions.y - row - 1.0 );
    	    vUV = ( position.xy + idx ) / dimensions;// vec2( ( position.x, ( position.y + row ) / dimensions.y );
    	}`;

            BABYLON.Effect.ShadersStore[ "animatedBillboardFragmentShader" ] = `precision highp float;

        varying vec2 vUV;
        uniform sampler2D sampler;
    	void main(void) {
    	    gl_FragColor = texture2D( sampler, vUV );
    	}`;

            let shaderMaterial = new BABYLON.ShaderMaterial( "AnimatedBillboardMaterial", renderer.scene,
                {
                    vertex: "animatedBillboard",
                    fragment: "animatedBillboard",
                },
                {
                    attributes: [ "position", "iaTime" ],
                    uniforms: [ "world", "viewProjection", "view" ],
                    needAlphaBlending: true,
                } );

            shaderMaterial.backFaceCulling = false;
            shaderMaterial.setTexture( "sampler", texture );
            shaderMaterial.setVector2( "dimensions", new BABYLON.Vector2( w, h ) );

            this.originalMesh = new BABYLON.Mesh( "AnimatedBillboard", renderer.scene );
            let vertexData = new BABYLON.VertexData();
            vertexData.positions = [ 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0 ];
            vertexData.indices = [ 0, 1, 2, 0, 2, 3 ];
            vertexData.applyToMesh( this.originalMesh );
            this.originalMesh.material = shaderMaterial;
            this.originalMesh.thinInstanceSetBuffer( "matrix", this.matrixBuffer, 16, false );
            this.originalMesh.thinInstanceSetBuffer( "iaTime", this.iaBuffer, 1, false );
            this.originalMesh.thinInstanceCount = 0;

            renderer.scene.onBeforeRenderObservable.add( this.render );
        }

        createInstance( parent: BABYLON.TransformNode )
        {
            let ret = new AnimatedBillboardInstance( parent );
            this.instances.push( ret );
            return ret;
        }

        destroyInstance( instance: AnimatedBillboardInstance )
        {
            this.instances.splice( this.instances.indexOf( instance ), 1 );
        }

        private render = () =>
        {
            let n = Math.min( this.instances.length, this.matrixBuffer.length / 16 );
            this.originalMesh.thinInstanceCount = n;
            if ( n === 0 )
                return;

            let now = performance.now();
            for ( let i = 0; i < n; i++ )
            {
                let instance = this.instances[ i ];
                instance.parent.getWorldMatrix().copyToArray( this.matrixBuffer, i * 16 );
                let dt = now - instance.createdAt;
                let time = dt * this.timeScale;
                if ( !this.loop && time >= 1 )
                    time = .999;
                this.iaBuffer[ i ] = time;
            }

            this.originalMesh.thinInstanceBufferUpdated( "matrix" );
            this.originalMesh.thinInstanceBufferUpdated( "iaTime" );
        }

    }
}
