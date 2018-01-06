class MDACSButton extends React.Component {}

class MDACSInput extends React.Component {}

class MDACSLineInput extends React.Component {
    constructor(props) {
        super(props);

        this.render = this.render.bind(this);
        this.onChange = this.onChange.bind(this);
        this.state = {
            value: props.value
        };
    }

    onChange(event) {
        this.setState({ value: event.target.value });
    }

    render() {
        return React.createElement(
            "label",
            null,
            this.props.label,
            ":",
            React.createElement("input", { type: "text", value: this.state.value, onChange: this.onChange })
        );
    }
}

class MDACSLogin extends React.Component {
    constructor(props) {
        super(props);

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {}

    componentWillUnmount() {}

    handleUsernameChange(event) {
        this.setState({ username: event.target.value });
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();

        // Retrieve login token for the username and password.
    }

    render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "form",
                { onSubmit: this.handleSubmit },
                React.createElement(MDACSLineInput, { label: "Username", value: "", onChange: this.handleUsernameChange }),
                React.createElement(MDACSLineInput, { label: "Password", value: "", onChange: this.handlePasswordChange }),
                React.createElement("input", { type: "submit", value: "Login" })
            )
        );
    }
}

/// <summary>
/// 
/// </summary>
class MDACSAuthUserList extends React.Component {}

/// <summary>
/// Implements a single user item in the user list. Provides the functionality to
/// edit, manipulate, or launch a component that allows editing and manipulation.
///
/// * Shall allow admin to change real name.
/// * Shall allow admin to change the username.
/// * Shall allow user/admin to set a password.
/// * Shall allow user/admin to set contact email.
/// * Shall allow user/admin to set contact phone.
/// </summary>
class MDACSAuthUserItem extends React.Component {}

class MDACSAuthAppBody extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {}

    componentWillUnmount() {}

    render() {}
}

/// <css-class>MDACSAuthAppContainer</css-class>
class MDACSAuthApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            need_login_shown: true
        };
    }

    componentDidMount() {}

    componentWillUnmount() {}

    render() {
        if (this.state.need_login_shown) {
            return React.createElement(
                "div",
                { className: "MDACSAuthAppContainer" },
                React.createElement(MDACSLogin, null)
            );
        } else {
            return React.createElement(
                "div",
                { className: "MDACSAuthAppContainer" },
                React.createElement(MDACSAuthAppBody, null)
            );
        }
    }
}

ReactDOM.render(React.createElement(MDACSAuthApp, null), document.getElementById('root'));

