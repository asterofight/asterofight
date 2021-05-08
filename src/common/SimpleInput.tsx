namespace A
{
    export interface SimpleInputOptions
    {
        value: string;
        onChange: ( value: string ) => void;
        type?: "text" | "password" | "email";
        placeholder?: string;
        onEnter?: () => void;
        onEsc?: () => void;
        onBlur?: () => void;
        autofocus?: boolean;
    };

    export class SimpleInput extends PureComponent<SimpleInputOptions>
    {

        private inputRef = preact.createRef<HTMLInputElement>();

        componentDidMount()
        {
            if ( this.props.autofocus )
                this.inputRef.current?.focus();
        }

        render()
        {
            let attrs = {} as any;
            if ( this.props.placeholder )
                attrs.placeholder = this.props.placeholder;
            if ( this.props.autofocus )
                attrs.autoFocus = true;
            if ( this.props.onEnter || this.props.onEsc )
                attrs.onKeyDown = e =>
                {
                    if ( e.keyCode === 13 && this.props.onEnter )
                        this.props.onEnter();
                    else if ( e.keyCode === 27 && this.props.onEsc )
                        this.props.onEsc();
                };
            if ( this.props.onBlur )
                attrs.onBlur = this.props.onBlur;
            return (
                <input ref={ this.inputRef } type={ this.props.type ?? "text" } value={ this.props.value }
                    onInput={ e => this.props.onChange?.( ( e.target as HTMLInputElement ).value ) }
                    { ...attrs } />
            );
        }
    }

}
