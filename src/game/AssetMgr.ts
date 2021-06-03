/// <reference path="AssetObject.ts"/>

namespace A
{
    export class AssetMgr
    {

        private readonly assets: { [ name: string ]: AssetObject } = {};

        constructor()
        {
        }

        createInstance( name: string )
        {
            let asset = this.assets[ name ];
            if ( !asset )
                this.assets[ name ] = asset = new AssetObject( name );
            return asset.createInstance();
        }
    }

    export var assetMgr = new AssetMgr();

}
