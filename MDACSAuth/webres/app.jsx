
class AuthNetworkDAO {
    constructor(
        url_auth
    ) {
        this.dao = new BasicNetworkDAO(
            url_auth,
            url_auth
        );
    }

    userSet() {
    }

    userDelete() {
    }

    userList() {
    }

    version() {
    }

    isLoginValid(success, failure) {
        this.dao.authenticatedTransaction(
            '/is-login-valid',
            {},
            () => {
                success();
            },
            (res) => {
                failure(res);
            }
        );
    }
}

class BasicNetworkDAO {
    constructor(
        url_auth,
        url_service
    ) {
        this.url_auth = url_auth;
        this.url_db = url_db;
    }

    setUsername(username) {
        this.username = username;
    }

    setPassword(password) {
        this.hashed_password = sha512(password);
    }

    challenge(success, failure) {
        request
            .get(this.url_auth + '/challenge')
            .end((err, res) => {
                if (err) {
                    failure(err);
                } else {
                    success(JSON.parse(res).challenge);
                }
            });
    }

    // TODO: one day come back and add a salt for protection
    //       against rainbow tables also while doing that go
    //       ahead and utilize a PKF to increase the computational
    //       difficulty to something realisticly high
    authenticatedTransaction(url, msg, success, failure) {
        let payload = JSON.stringify(msg);

        this.challenge(
            (challenge) => {
                let phash = sha512(payload);
                let secret = phash + challenge + this.username + this.hashed_password;
                let chash = sha512(secret);
                let _msg = {
                    auth: {
                        challenge: challenge,
                        chash: chash,
                        payload: true,
                    },
                    payload: payload,
                };

                this.transaction(url, _msg, success, failure);
            },
            (res) => {
                failure(res);
            }
        );
    }

    transaction(url, msg, success, failure) {
        request
            .post(this.url_service + url)
            .send(JSON.stringify(msg))
            .end((err, res) => {
                if (err) {
                    failure(err);
                } else {
                    success(res);
                }
            });
    }
}


class MDACSButton extends React.Component {

}

class MDACSInput extends React.Component {

}

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
        return (<label>
                    {this.props.label}: 
                    <input type="text" value={this.state.value} onChange={this.onChange} />
                </label>);
    }
}

class MDACSLogin extends React.Component {
    constructor(props) {
        super(props);

        this.handleUsernameChange =
            this.handleUsernameChange.bind(this);
        this.handlePasswordChange =
            this.handlePasswordChange.bind(this);
        this.handleSubmit =
            this.handleSubmit.bind(this);
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        
    }

    handleUsernameChange(event) {
        this.setState({ username: event.target.value });
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <MDACSLineInput label="Username" value="" onChange={this.handleUsernameChange} />
                    <MDACSLineInput label="Password" value="" onChange={this.handlePasswordChange} />
                    <input type="submit" value="Login" />
                </form>
            </div>
        );
    }
}

/// <summary>
/// 
/// </summary>
class MDACSAuthUserList extends React.Component {
}

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
class MDACSAuthUserItem extends React.Component {
}

class MDACSAuthAppBody extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {

    }
}

/// <css-class>MDACSAuthAppContainer</css-class>
class MDACSAuthApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            need_login_shown: true,
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        if (this.state.need_login_shown) {
            return <div className="MDACSAuthAppContainer"><MDACSLogin /></div>;
        } else {
            return <div className="MDACSAuthAppContainer"><MDACSAuthAppBody /></div>;
        }
    }
}

ReactDOM.render(
    <MDACSAuthApp />,
    document.getElementById('root')
);