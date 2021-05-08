namespace A
{
    export interface SwitchProps
    {
        label: string;
        value?: boolean;
        onChange?: ( value: boolean ) => void;
    };

    export class Switch extends PureComponent<SwitchProps>
    {
        state = { value: this.props.value };
        render()
        {
            return (
                <label className="switch">
                    <input type="checkbox" checked={ this.state.value }
                        onChange={ e =>
                        {
                            this.setState( { value: ( e.target as HTMLInputElement ).checked } );
                            this.props.onChange?.( ( e.target as HTMLInputElement ).checked );
                        } } />
                    <span className="slider" />
                    <span className="label">{ this.props.label }</span>
                </label>
            );
        }
    }

}
