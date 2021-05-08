
namespace A
{
    export interface CheckBoxProps
    {
        label: string;
        value?: boolean;
        onChange?: ( value: boolean ) => void;
        onEnter?: () => void;
        autofocus?: boolean;
    };

    export class CheckBox extends PureComponent<CheckBoxProps>
    {
        state = { value: this.props.value };
        render()
        {
            let attrs = { type: "checkbox" } as any;
            if ( this.props.autofocus )
                attrs.autoFocus = true;
            if ( this.props.onEnter )
                attrs.onKeyDown = e =>
                {
                    if ( e.keyCode === 13 )
                        this.props.onEnter!();
                };
            return (
                <label className="checkbox">
                    <input checked={ this.state.value }
                        onChange={ e =>
                        {
                            this.setState( { value: ( e.target as HTMLInputElement ).checked } );
                            this.props.onChange?.( ( e.target as HTMLInputElement ).checked );
                        } }
                        { ...attrs } />
                    <span>{ this.props.label }</span>
                </label>
            );
        }
    }

}
