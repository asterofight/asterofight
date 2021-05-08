/// <reference path="common/ExtensionMethods.ts"/>
/// <reference path="game/Startup.ts"/>
/// <reference path="preactCompat.ts"/>
/// <reference path="ui/App.tsx"/>

namespace A
{

    preact.render( <App />, document.querySelector("main")! );
    

    //serviceWorker.unregister();
}
