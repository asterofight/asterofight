/// <reference path="../../node_modules/pixi.js/pixi.js.d.ts"/>

/// <reference path="AssetMgr.ts"/>
/// <reference path="ServerTime.ts"/>
/// <reference path="Connector.ts"/>
/// <reference path="Game.ts"/>
/// <reference path="RendererPixi.ts"/>
/// <reference path="DebugData.ts"/>


namespace A
{

	// PIXI.Renderer.registerPlugin( 'batch', PIXI.BatchRenderer );
	// PIXI.Renderer.registerPlugin( 'tilingSprite', PIXI.TilingSpriteRenderer );
	// PIXI.Application.registerPlugin( PIXI.TickerPlugin );

	export var assetMgr = new AssetMgr();
	export var serverTime = new ServerTime();
	export var userMgr = new UserMgr();
	export var gameConnector = new Connector();
	export var game: Game = new Game();
	export var renderer: RendererPixi = new RendererPixi();
	export var debug = new DebugData();
}
