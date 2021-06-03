namespace A
{
    export class HudBar
    {
        private static originalMesh: BABYLON.Mesh;
        private static readonly segments = 16;
        private static instances = [] as HudBar[];
        private static maxInstances = 500;
        private static matrixBuffer = new Float32Array( HudBar.maxInstances * 16 );
        private static colorBuffer = new Float32Array( HudBar.maxInstances * 3 );
        private static radiusAndValueBuffer = new Float32Array( HudBar.maxInstances * 2 );


        private static init()
        {
            BABYLON.Effect.ShadersStore[ "hudBarVertexShader" ] = `precision highp float;

    	// Attributes
    	attribute vec3 position;

        // Instanced Attributes
        attribute vec3 iaColor;
        attribute vec2 iaRadiusAndValue;

    	// Uniforms
    	uniform mat4 viewProjection;

    	// Varying
    	varying vec4 vColor;

        #define PI 3.1415926535897932384626433832795

        #include<instancesDeclaration>

    	void main(void) {
            #include<instancesVertex>
            float angle = 1.5707963267948966192313216916398;
            float thickness = .1;
            float x = position.x;
            float y = position.y;
            float r = thickness * ( x - .5 );
            float a;
            if( iaRadiusAndValue.x >= 0.0 )
            {
                r += iaRadiusAndValue.x;
                a = ( ( iaRadiusAndValue.y < 0.0 ? max( 1.0 + iaRadiusAndValue.y, y ) : min( iaRadiusAndValue.y, y ) ) - .5 ) * angle;
            }
            else
            {
                r -= iaRadiusAndValue.x;
                a = ( ( iaRadiusAndValue.y < 0.0 ? min( -iaRadiusAndValue.y, y ) : max( 1.0 - iaRadiusAndValue.y, y ) ) - .5 ) * angle + PI;
            }
            vec4 p=vec4(cos( a ) * r,sin( a ) * r, position.z, 1.0);
    	    gl_Position = viewProjection * finalWorld * p;

    	    vColor = vec4(iaColor, 1.0);
    	}`;

            BABYLON.Effect.ShadersStore[ "hudBarFragmentShader" ] = `precision highp float;

        varying vec4 vColor;

    	void main(void) {
    	    gl_FragColor = vColor;
    	}`;

            var shaderMaterial = new BABYLON.ShaderMaterial( "HudBarMaterial", renderer.scene,
                {
                    vertex: "hudBar",
                    fragment: "hudBar",
                },
                {
                    attributes: [ "position", "iaColor", "iaRadiusAndValue" ],
                    uniforms: [ "world", "viewProjection" ]
                } );

            shaderMaterial.backFaceCulling = false;

            let pathArray = [ [], [] ] as BABYLON.Vector3[][];
            for ( let i = 0; i < this.segments; i++ )
            {
                pathArray[ 0 ].push( new BABYLON.Vector3( 0, i / ( this.segments - 1 ), 0 ) );
                pathArray[ 1 ].push( new BABYLON.Vector3( 1, i / ( this.segments - 1 ), 0 ) );
            }
            this.originalMesh = BABYLON.MeshBuilder.CreateRibbon( "", { pathArray }, renderer.scene );
            //this.originalMesh.setEnabled( false );
            this.originalMesh.material = shaderMaterial;
            this.originalMesh.thinInstanceSetBuffer( "matrix", HudBar.matrixBuffer, 16, false );
            this.originalMesh.thinInstanceSetBuffer( "iaColor", HudBar.colorBuffer, 3, false );
            this.originalMesh.thinInstanceSetBuffer( "iaRadiusAndValue", HudBar.radiusAndValueBuffer, 2, false );
            this.originalMesh.thinInstanceCount = 0;

            renderer.scene.onBeforeRenderObservable.add( () => HudBar.render() );
        }

        static render()
        {
            let n = Math.min( this.instances.length, HudBar.radiusAndValueBuffer.length / 2 );
            if ( n === 0 )
                return;

            for ( let i = 0; i < n; i++ )
            {
                let instance = this.instances[ i ];
                instance.parent.getWorldMatrix().copyToArray( HudBar.matrixBuffer, i * 16 );
                HudBar.colorBuffer[ i * 3 + 0 ] = instance.color.r;
                HudBar.colorBuffer[ i * 3 + 1 ] = instance.color.g;
                HudBar.colorBuffer[ i * 3 + 2 ] = instance.color.b;
                HudBar.radiusAndValueBuffer[ i * 2 + 0 ] = instance.left ? -instance.r : instance.r;
                HudBar.radiusAndValueBuffer[ i * 2 + 1 ] = instance.mirrorY ? -instance.value : instance.value;
            }

            this.originalMesh.thinInstanceCount = n;
            this.originalMesh.thinInstanceBufferUpdated( "matrix" );
            this.originalMesh.thinInstanceBufferUpdated( "iaColor" );
            this.originalMesh.thinInstanceBufferUpdated( "iaRadiusAndValue" );
        }


        mirrorY = false;
        color = new BABYLON.Color4( 1, 1, 1, 1 );
        value = 1;

        constructor( public readonly parent: BABYLON.TransformNode, public readonly name: string, public readonly left: boolean,
            public readonly r: number, public readonly thickness = 0.1 )
        {
            if ( !HudBar.originalMesh )
                HudBar.init();
            HudBar.instances.push( this );
        }

        destroy()
        {
            HudBar.instances.splice( HudBar.instances.indexOf( this ), 1 );
        }

    }
}
