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
                this.root = ( this.asset.container.meshes[ 0 ] as BABYLON.Mesh ).createInstance( "" );
            else
                this.entries = this.asset.container.instantiateModelsToScene();
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
            if ( this.asset.canBeInstanced )
                this.root?.dispose();
            else
                this.asset.container.removeAllFromScene();
            this.asset.destroyInstance( this );
        }
    }
}
