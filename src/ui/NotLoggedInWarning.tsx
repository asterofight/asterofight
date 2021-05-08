namespace A
{
	export class NotLoggedInWarning extends PureComponent<{ onClose: () => void }>
	{
		private timer = 0;

		componentDidMount()
		{
			this.timer = setTimeout( () => this.props.onClose(), 5000 );
		}

		componentWillUnmount()
		{
			if ( this.timer )
				clearTimeout( this.timer );
		}

		render()
		{
			return (
				<div class="notLoggedInWarning">
					<h2>This functionality requires a logged in user</h2>
					<p>Registering is free; refresh the page to login/register.</p>
					<p>You gain access to</p>
					<ul>
						<li>Different types of spaceships;</li>
						<li>Upgrades;</li>
						<li>Achievements;</li>
					</ul>
				</div>
			);
		}
	}
}
