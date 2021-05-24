/// <reference path="../../node_modules/babylonjs/babylon.module.d.ts"/>
/// <reference path="../../node_modules/babylonjs-loaders/babylonjs.loaders.module.d.ts"/>
/// <reference path="assetObject.ts"/>

namespace A
{
    export class AssetInstance
    {
        entries?: BABYLON.InstantiatedEntries;
        root?: BABYLON.TransformNode;

        constructor( public asset: AssetObject )
        {
            if ( asset.isLoaded )
                this.onAssetLoaded();
        }

        onAssetLoaded()
        {
            if ( this.asset.canBeInstanced )
                this.root = ( this.asset.container!.meshes[ 0 ] as BABYLON.Mesh ).createInstance( "" );
            else
            {
                this.entries = this.asset.container!.instantiateModelsToScene();
                this.root = this.entries.rootNodes[ 0 ];
                this.root.rotationQuaternion = null;
                let ani = new BABYLON.Animation( "", "rotation.y", .01, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE );
                ani.setKeys( [ { frame: 0, value: 0 }, { frame: 1, value: 2 * Math.PI } ] );
                this.root.animations.push( ani );
                renderer.scene.beginAnimation( this.root, 0, 1, true );
            }
        }

        setPos( x: number, y: number, z: number = 0, x2?: number, y2?: number, z2?: number )
        {
            this.root?.position.set( x, y, z );
        }

        setUniformScale( x: number )
        {
            this.root?.scaling.setAll( x );
        }

        setState( state: string )
        {

        }

        destroy()
        {
            if ( this.root )
                this.root.dispose();
            if ( this.entries )
                this.asset.container!.removeAllFromScene();
            this.asset.destroyInstance( this );
        }
    }
}
