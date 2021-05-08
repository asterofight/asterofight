namespace A
{
    export class AssetMgr
    {

        private textures: { [ name: string ]: PIXI.Texture } = {};
        quality = "L";

        getSrc( unitName: string )
        {
            return `images/${ unitName }-${ this.quality }.png`;
        }

        load( unitName: string )
        {
            let tex = this.textures[ unitName ];
            if ( !tex )
                this.textures[ unitName ] = tex = PIXI.Texture.from( this.getSrc( unitName ) );
            return tex;
        }

        loadAnimatedSprite( name: string, horizontalImageCount: number, verticalImageCount: number, imageSize: number )
        {
            let tex = this.textures[ name ];
            if ( !tex )
                this.textures[ name ] = tex = PIXI.Texture.from( this.getSrc( name ) );
            let a: PIXI.Texture[] = [];
            for ( let j = 0; j < verticalImageCount; j++ )
                for ( let i = 0; i < horizontalImageCount; i++ )
                    a.push( new PIXI.Texture( tex.baseTexture, new PIXI.Rectangle( i * imageSize, j * imageSize, imageSize, imageSize ) ) );
            return new PIXI.AnimatedSprite( a );
        }
    }

}
