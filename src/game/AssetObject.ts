/// <reference path="Renderer.ts"/>
/// <reference path="AssetInstance.ts"/>
/// <reference path="AnimatedBillboard.ts"/>


namespace A
{

    export class AssetObject
    {
        readonly instances: AssetInstance[] = [];
        container?: BABYLON.AssetContainer;
        isLoaded = false;

        private animatedSprite?: AnimatedBillboard;

        constructor( public name: string )
        {
            if ( name === "Asteroid" || name === "Explosion" || name === "BasicMissile" || name === "Fighter" || name === "Tower" || name === "Lightning" )
                this.load();
            else
            {
                this.container = new BABYLON.AssetContainer( renderer.scene );
                let mesh = name === "CapturePoint" ? BABYLON.MeshBuilder.CreateSphere( name, { diameter: .01 } ) :
                    BABYLON.MeshBuilder.CreateSphere( name, { diameter: 1 } );
                let mat = new BABYLON.PBRMaterial( name, renderer.scene );
                mat.metallic = 0.5;
                mat.roughness = 0.5;
                mesh.material = mat;
                this.container.meshes.push( mesh );
                this.container.removeAllFromScene();
                this.isLoaded = true;
            }
        }

        private async load()
        {
            if ( this.name === "Asteroid" )
            {
                this.container = await BABYLON.SceneLoader.LoadAssetContainerAsync( "./assets/", "asteroid.glb", renderer.scene );
                let mesh = AssetObject.unwrapMeshFromGlb( this.container );
                mesh.rotation = new BABYLON.Vector3( 0, 0, 0 );
                mesh.scaling.setAll( 1 );
                this.container.removeAllFromScene();
            }
            else if ( this.name === "BasicMissile" )
            {
                this.container = await BABYLON.SceneLoader.LoadAssetContainerAsync( "./assets/", "BasicMissile.glb", renderer.scene );
                let mesh = AssetObject.unwrapMeshFromGlb( this.container );
                mesh.scaling.setAll( .15 );
                this.container.removeAllFromScene();
            }
            else if ( this.name === "Fighter" )
            {
                this.container = await BABYLON.SceneLoader.LoadAssetContainerAsync( "./assets/", "Fighter.glb", renderer.scene );
                let mesh = AssetObject.unwrapMeshFromGlb( this.container );
                mesh.rotation = new BABYLON.Vector3( -Math.PI / 2, -Math.PI / 2, 0 );
                mesh.scaling.setAll( .07 );
                this.container.removeAllFromScene();
            }
            else if ( this.name === "Tower" )
            {
                this.container = await BABYLON.SceneLoader.LoadAssetContainerAsync( "./assets/", "Tower.glb", renderer.scene );
                let mesh = AssetObject.unwrapMeshFromGlb( this.container );
                mesh.rotation = new BABYLON.Vector3( 0, -Math.PI / 2, Math.PI / 2 );
                mesh.scaling.setAll( .1 );
                let ag = new BABYLON.AnimationGroup( "", renderer.scene );
                let ani = new BABYLON.Animation( "", "rotation.x", .03, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE );
                ani.setKeys( [ { frame: 0, value: 0 }, { frame: 1, value: 2 * Math.PI } ] );
                ag.addTargetedAnimation( ani, mesh );
                this.container.animationGroups.push( ag );
                this.container.removeAllFromScene();
            }
            else if ( this.name === "Lightning" )
            {
                this.container = new BABYLON.AssetContainer( renderer.scene );
                let length = 30;
                let vb = [] as number[];
                for ( let i = 0; i < length * 6; i++ )
                    vb.push( 0 );
                let ib = [] as number[];
                for ( let i = 1; i < length; i++ )
                {
                    let idx = i * 2;
                    ib.push( idx - 2 );
                    ib.push( idx );
                    ib.push( idx - 1 );
                    ib.push( idx - 1 );
                    ib.push( idx );
                    ib.push( idx + 1 );
                }
                let ret = new BABYLON.Mesh( "Lightning", renderer.scene );
                ret.setIndices( ib );
                ret.setVerticesData( BABYLON.VertexBuffer.PositionKind, vb );
                let mat = new BABYLON.StandardMaterial( "Lightning", renderer.scene );
                ret.material = mat;
                mat.backFaceCulling = false;
                mat.diffuseColor = new BABYLON.Color3( 0, 0, 0 );
                mat.emissiveColor = new BABYLON.Color3( 0.5, 1, 1 );
                this.container.meshes.push( ret );
                this.container.removeAllFromScene();
            }
            else if ( this.name === "Explosion" )
            {
                let texture = new BABYLON.Texture( "assets/Explosion-L.png", renderer.scene );
                this.animatedSprite = new AnimatedBillboard( texture, 5, 4, 20, false );
                // let billboard = BABYLON.MeshBuilder.CreatePlane( this.name + "Template", { updatable: true } );
                // let billboardMtl = new BABYLON.StandardMaterial( this.name + "Material", renderer.scene );
                // billboardMtl.diffuseTexture = new BABYLON.Texture( "assets/Explosion-L.png", renderer.scene );
                // billboardMtl.diffuseTexture.hasAlpha = true;
                // billboardMtl.useAlphaFromDiffuseTexture = true;
                // billboardMtl.disableLighting = true;
                // billboardMtl.ambientColor = BABYLON.Color3.White();
                // billboard.material = billboardMtl;
                // billboard.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
                // this.container = new BABYLON.AssetContainer( renderer.scene );
                // this.container.meshes.push( billboard );
                // this.container.removeAllFromScene();
            }
            this.isLoaded = true;
            for ( let i of this.instances )
                this.onAssetLoaded( i );
        }

        private static unwrapMeshFromGlb( container: BABYLON.AssetContainer )
        {
            let mesh = container.meshes[ 1 ];
            mesh.parent = null;
            container.meshes[ 0 ].dispose();
            container.meshes.shift();
            return mesh as BABYLON.Mesh;
        }

        private onAssetLoaded( ai: AssetInstance )
        {
            if ( this.name === "BasicMissile" || this.name === "Fighter" || this.name === "Asteroid" || this.name === "MegaBomb" || this.name === "Trick" )
            {
                ai.mesh = ( this.container?.meshes[ 0 ] as BABYLON.Mesh ).createInstance( this.name );
                ai.mesh.parent = ai.root;
            }
            else if ( this.animatedSprite )
            {
                ai.animatedBillboard = this.animatedSprite.createInstance( ai.root );
            }
            else
            {
                ai.entries = this.container!.instantiateModelsToScene( x => x );
                ai.entries.rootNodes[ 0 ].parent = ai.root;
                if ( this.name === "Lightning" )
                {
                    let mesh = ai.root as BABYLON.Mesh;
                    mesh.geometry?.copy( "" ).applyToMesh( mesh );
                }
                for ( let a of ai.entries.animationGroups )
                    a.start( true );
            }
        }


        createInstance()
        {
            let ret = new AssetInstance( this );
            this.instances.push( ret );
            if ( this.isLoaded )
                this.onAssetLoaded( ret );
            return ret;
        }

        renderInstance( ai: AssetInstance )
        {
            // if ( this.animatedSprite )
            // {
            //     let billboard = ai.root?.getChildMeshes()[ 0 ] as BABYLON.Mesh;
            //     let uvs = billboard.getVerticesData( BABYLON.VertexBuffer.UVKind )!;
            //     let time = performance.now() / 1000 - ai.createdAt;
            //     let frame = Math.floor( time * this.animatedSprite.fps );
            //     frame = this.animatedSprite.loop ? frame % ( this.animatedSprite.w * this.animatedSprite.h ) : Math.min( frame, this.animatedSprite.w * this.animatedSprite.h - 1 );
            //     let col = frame % this.animatedSprite.w;
            //     let u0 = col / this.animatedSprite.w;
            //     let u1 = ( col + 1 ) / this.animatedSprite.w;
            //     let row = this.animatedSprite.h - 1 - Math.floor( frame / this.animatedSprite.w );
            //     let v0 = row / this.animatedSprite.h;
            //     let v1 = ( row + 1 ) / this.animatedSprite.h;
            //     uvs[ 0 ] = u0;
            //     uvs[ 1 ] = v0;
            //     uvs[ 2 ] = u1;
            //     uvs[ 3 ] = v0;
            //     uvs[ 4 ] = u1;
            //     uvs[ 5 ] = v1;
            //     uvs[ 6 ] = u0;
            //     uvs[ 7 ] = v1;
            //     billboard.setVerticesData( BABYLON.VertexBuffer.UVKind, uvs );
            // }
        }

        setInstancePos2( ai: AssetInstance, srcPos: Vector2, dstPos: Vector2 )
        {
            if ( this.name === "Lightning" )
            {
                let mesh = ai.root.getChildMeshes()[ 0 ];
                let reset = !ai.lightningShape || Math.random() < 0.05;
                let vb = mesh.getVerticesData( BABYLON.VertexBuffer.PositionKind ) as number[];
                let len = vb.length / 6;
                if ( !ai.lightningShape )
                {
                    ai.lightningShape = [];
                    for ( let i = 0; i < len; i++ )
                        ai.lightningShape.push( 0 );
                }
                let deviation = .3;
                let v = dstPos.sub( srcPos );
                let n = v.rot90().norm();
                let prevD = 0;
                let a = reset ? 4 : 0.4;
                for ( let i = 1; i < len - 1; i++ )
                {
                    let avg = ( prevD + ai.lightningShape[ i + 1 ] ) * .5;
                    prevD = ai.lightningShape[ i ];
                    ai.lightningShape[ i ] += ( ( Math.random() - .5 ) * deviation + ( avg - ai.lightningShape[ i ] ) * 0.1 + ai.lightningShape[ i ] * -0.02 ) * a;
                }
                for ( let i = 0; i < len; i++ )
                {
                    let p = i / ( len - 1 );
                    let x = srcPos.x + v.x * p + n.x * ai.lightningShape[ i ];
                    let y = srcPos.y + v.y * p + n.y * ai.lightningShape[ i ];
                    let halfThickness = Math.random() * 0.05 + 0.02;
                    vb[ i * 6 ] = x - n.x * halfThickness;
                    vb[ i * 6 + 1 ] = y - n.y * halfThickness;
                    vb[ i * 6 + 3 ] = x + n.x * halfThickness;
                    vb[ i * 6 + 4 ] = y + n.y * halfThickness;
                }
                //let a = ( performance.now() - ai.createdAt ) % 50 === 0 ? 4 : 0.4;
                // for ( let i = 0; i < vb.length; i++ )
                // {
                //     let avg = ( vb[ i + 1 ] + ys[ i - 1 ] ) / 2;
                //     let dir = avg - ys[ i ];
                //     let dy = ( Math.random() * 0.2 - 0.1 + dir * 0.1 + ( 1 - ys[ i ] ) * 0.02 ) * a;
                //     ys[ i ] += dy;
                //     vb[ i * 6 + 1 ] += dy;
                //     vb[ i * 6 + 4 ] += dy;
                // }
                mesh.setVerticesData( BABYLON.VertexBuffer.PositionKind, vb );

            }
        }

        destroyInstance( instance: AssetInstance )
        {
            this.instances.splice( this.instances.indexOf( instance ), 1 );

            if ( instance.entries )
            {
                for ( let x of instance.entries.animationGroups )
                    x.dispose();
                for ( let x of instance.entries.skeletons )
                    x.dispose();
                for ( let x of instance.entries.rootNodes )
                    x.dispose();
                instance.entries = undefined;
            }

            if ( this.animatedSprite && instance.animatedBillboard)
                this.animatedSprite.destroyInstance( instance.animatedBillboard );
            
            instance.root.dispose();
        }
    }
}
