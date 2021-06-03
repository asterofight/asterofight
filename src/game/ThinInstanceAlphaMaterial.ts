// /// <reference path="../../node_modules/babylonjs/babylon.module.d.ts"/>
// namespace A
// {
//     export class ThinInstanceAlphaMaterial extends BABYLON.ShaderMaterial
//     {
//         constructor( scene:BABYLON.Scene)
//         {
//             super( "ThinInstanceAlphaMaterial", scene, {
//                 vertex: "hudBar",
//                 fragment: "hudBar",
//             },
//                 {
//                     // attributes: [ "position", "iaColor", "iaRadius", "iaValue" ],
//                     // uniforms: [ "viewProjection", "worldViewProjection" ]
//                     attributes: [ "position", "normal", "uv", "iaColor", "iaRadius", "iaValue" ],
//                     uniforms: [ "world", "worldView", "worldViewProjection", "view", "projection", "viewProjection" ]
//                 } );
//         }

//         private static init()
//         {
//             BABYLON.Effect.ShadersStore[ "hudBarVertexShader" ] = `precision highp float;

//     	// Attributes
//     	attribute vec3 position;

//         // Instanced Attributes
//         attribute vec3 iaColor;
//         attribute float iaRadius;
//         attribute float iaValue;

//     	// Uniforms
//     	uniform mat4 viewProjection;

//     	// Varying
//     	varying vec4 vColor;

//         #define PI 3.1415926535897932384626433832795

//         #include<instancesDeclaration>

//     	void main(void) {
//             #include<instancesVertex>
//             float angle = 1.5707963267948966192313216916398;
//             float thickness = .1;
//             float x = position.x;
//             float y = position.y;
//             float r = thickness * ( x - .5 );
//             float value = iaValue<0.0?-iaValue:iaValue;
//             float a;
//             if( iaRadius >= 0.0 )
//             {
//                 r += iaRadius;
//                 a = ( ( iaValue < 0.0 ? max( 1.0 + iaValue, y ) : min( iaValue, y ) ) - .5 ) * angle;
//             }
//             else
//             {
//                 r -= iaRadius;
//                 a = ( ( iaValue < 0.0 ? min( -iaValue, y ) : max( 1.0 - iaValue, y ) ) - .5 ) * angle + PI;
//             }
//             vec4 p=vec4(cos( a ) * r,sin( a ) * r, position.z, 1.0);
//     	    gl_Position = viewProjection * finalWorld * p;

//     	    vColor = vec4(iaColor, 1.0);
//     	}`;

//             BABYLON.Effect.ShadersStore[ "hudBarFragmentShader" ] = `precision highp float;

//         varying vec4 vColor;

//     	void main(void) {
//     	    gl_FragColor = vColor;
//     	}`;

//             var shaderMaterial = new BABYLON.ShaderMaterial( "HudBarMaterial", renderer.scene, {
//                 vertex: "hudBar",
//                 fragment: "hudBar",
//             },
//                 {
//                     // attributes: [ "position", "iaColor", "iaRadius", "iaValue" ],
//                     // uniforms: [ "viewProjection", "worldViewProjection" ]
//                     attributes: [ "position", "normal", "uv", "iaColor", "iaRadius", "iaValue" ],
//                     uniforms: [ "world", "worldView", "worldViewProjection", "view", "projection", "viewProjection" ]
//                 } );

//             shaderMaterial.backFaceCulling = false;

//             let pathArray = [ [], [] ] as BABYLON.Vector3[][];
//             for ( let i = 0; i < this.segments; i++ )
//             {
//                 pathArray[ 0 ].push( new BABYLON.Vector3( 0, i / ( this.segments - 1 ), 0 ) );
//                 pathArray[ 1 ].push( new BABYLON.Vector3( 1, i / ( this.segments - 1 ), 0 ) );
//             }
//             this.originalMesh = BABYLON.MeshBuilder.CreateRibbon( "", { pathArray }, renderer.scene );
//             //this.originalMesh.setEnabled( false );
//             this.originalMesh.material = shaderMaterial;
//             this.originalMesh.thinInstanceSetBuffer( "matrix", HudBar.matrixBuffer, 16, false );
//             this.originalMesh.thinInstanceSetBuffer( "iaColor", HudBar.colorBuffer, 3, false );
//             this.originalMesh.thinInstanceSetBuffer( "iaRadius", HudBar.radiusBuffer, 1, false );
//             this.originalMesh.thinInstanceSetBuffer( "iaValue", HudBar.valueBuffer, 1, false );
//             this.originalMesh.thinInstanceCount = 0;

//             renderer.scene.onBeforeRenderObservable.add( () => HudBar.render() );
//         }

//         static render()
//         {
//             let n = Math.min( this.instances.length, HudBar.valueBuffer.length );
//             if ( n === 0 )
//                 return;

//             for ( let i = 0; i < n; i++ )
//             {
//                 let instance = this.instances[ i ];
//                 instance.parent.getWorldMatrix().copyToArray( HudBar.matrixBuffer, i * 16 );
//                 HudBar.colorBuffer[ i * 3 + 0 ] = instance.color.r;
//                 HudBar.colorBuffer[ i * 3 + 1 ] = instance.color.g;
//                 HudBar.colorBuffer[ i * 3 + 2 ] = instance.color.b;
//                 HudBar.radiusBuffer[ i ] = instance.left ? -instance.r : instance.r;
//                 HudBar.valueBuffer[ i ] = instance.mirrorY ? -instance.value : instance.value;
//             }

//             this.originalMesh.thinInstanceCount = n;
//             this.originalMesh.thinInstanceBufferUpdated( "matrix" );
//             this.originalMesh.thinInstanceBufferUpdated( "iaColor" );
//             this.originalMesh.thinInstanceBufferUpdated( "iaRadius" );
//             this.originalMesh.thinInstanceBufferUpdated( "iaValue" );
//         }


//         mirrorY = false;
//         color = new BABYLON.Color4( 1, 1, 1, 1 );
//         value = 1;

//         constructor( public readonly parent: BABYLON.TransformNode, public readonly name: string, public readonly left: boolean,
//             public readonly r: number, public readonly thickness = 0.1 )
//         {
//             if ( !HudBar.originalMesh )
//                 HudBar.init();
//             HudBar.instances.push( this );
//         }

//         destroy()
//         {
//             HudBar.instances.splice( HudBar.instances.indexOf( this ), 1 );
//         }

//     }
// }
