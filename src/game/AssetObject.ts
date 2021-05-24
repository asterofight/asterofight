/// <reference path="renderer.ts"/>
/// <reference path="assetInstance.ts"/>


namespace A
{
    export class AssetObject
    {
        readonly instances: AssetInstance[] = [];
        container?: BABYLON.AssetContainer;
        isLoaded = false;
        canBeInstanced = false;

        constructor( public name: string )
        {
            if ( name === "Asteroid" )
                this.load();
            else
            {
                this.container = new BABYLON.AssetContainer( renderer.scene );
                let mesh = name === "CapturePoint" ? BABYLON.MeshBuilder.CreateSphere( "", { diameter: .01 } ) :
                    name === "Fighter" ? BABYLON.MeshBuilder.CreateBox( "", { size: 1 } ) :
                        BABYLON.MeshBuilder.CreateSphere( "", { diameter: 1 } );
                this.container.meshes.push( mesh );
                this.container.removeAllFromScene();
                this.canBeInstanced = true;
                this.isLoaded = true;
            }
        }

        private async load()
        {
            if ( this.name === "Asteroid" )
            {
                this.container = await BABYLON.SceneLoader.LoadAssetContainerAsync( "./assets/", "asteroid.glb", renderer.scene );
                this.isLoaded = true;
                //this.canBeInstanced = true;
            }
            for ( let i of this.instances )
                i.onAssetLoaded();
        }

        createInstance()
        {
            let ret = new AssetInstance( this );
            this.instances.push( ret );
            return ret;
        }

        destroyInstance( instance: AssetInstance )
        {
            this.instances.splice( this.instances.indexOf( instance ) );
        }
    }
}
