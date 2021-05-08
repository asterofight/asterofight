/// <reference path="../node_modules/preact/src/index.d.ts"/>

namespace A
{
    export abstract class PureComponent<P = {}, S = {}> extends preact.Component<P, S>
    {
        shouldComponentUpdate( nextProps, nextState )
        {
            const shallowCompare = ( obj1, obj2 ) =>
                Object.keys( obj1 ).length === Object.keys( obj2 ).length &&
                Object.keys( obj1 ).every( key =>
                    obj2.hasOwnProperty( key ) && obj1[ key ] === obj2[ key ]
                );
            let identical = shallowCompare( this.props, nextProps ) && shallowCompare( this.state, nextState );
            return !identical;
        }
    }

}