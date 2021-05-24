/// <reference path="common/ExtensionMethods.ts"/>
/// <reference path="game/game.ts"/>
/// <reference path="preactCompat.ts"/>
/// <reference path="ui/App.tsx"/>
namespace A
{
    preact.render( <App />, document.querySelector("main")! );
    console.log( connector.test());
}
