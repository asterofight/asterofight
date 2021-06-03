/// <reference path="../../node_modules/babylonjs/babylon.module.d.ts"/>
/// <reference path="../../node_modules/babylonjs-loaders/babylonjs.loaders.module.d.ts"/>
/// <reference path="AssetObject.ts"/>

namespace A
{
    export class AssetInstance
    {
        entries?: BABYLON.InstantiatedEntries;
        readonly root: BABYLON.TransformNode;
        mesh?: BABYLON.AbstractMesh;
        lightningShape?: number[];
        animatedBillboard?: AnimatedBillboardInstance;
        createdAt = performance.now() / 1000;

        constructor( public asset: AssetObject )
        {
            this.root = new BABYLON.TransformNode( asset.name );
        }

        setPos( x: number, y: number )
        {
            this.root.position.set( x, y, 0 );
        }

        setPos2( srcPos: Vector2, dstPos: Vector2 )
        {
            this.asset.setInstancePos2( this, srcPos, dstPos );
        }

        setRotation( a: number )
        {
            this.root.rotation.set( 0, 0, a );
        }

        setUniformScale( x: number )
        {
            this.root.scaling.setAll( x );
        }

        render()
        {
            this.asset.renderInstance( this );
        }

        destroy()
        {
            this.asset.destroyInstance( this );
        }
    }

}
