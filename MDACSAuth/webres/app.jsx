const request = window.superagent;
const FormGroup = ReactBootstrap.Alert;
const ControlLabel = ReactBootstrap.ControlLabel;
const FormControl = ReactBootstrap.FormControl;
const Button = ReactBootstrap.Button;

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

    setCredentials(username, password) {
        this.dao.setUsername(username);
        this.dao.setPassword(password);
    }

    isLoginValid(success, failure) {
        this.dao.authenticatedTransaction(
            '/is-login-valid',
            {},
            (resp) => {
                success(JSON.parse(resp.text).user);
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
        this.url_service = url_service;
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
                    success(JSON.parse(res.text).challenge);
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
                let secret = sha512(phash + challenge + this.username + this.hashed_password);
                let _msg = {
                    auth: {
                        challenge: challenge,
                        chash: secret,
                        hash: phash,
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
        this.props.onChange(event.target.value);
        this.setState({ value: event.target.value });
    }

    render() {
        return (<label>
                    {this.props.label}: 
                    <input type="text" value={this.state.value} onChange={this.onChange} />
                </label>);
    }
}

/// <summary>
/// Provides a login UI with callback support to a DAO object to keep
/// the username and password field of the DAO synchronized. Also, provides
/// a login button that simply checks that the login is valid.
/// </summary>
/// <prop name="onCheckLogin(username, password)">Callback when login should be checked.</prop>
class MDACSLogin extends React.Component {
    constructor(props) {
        super(props);

        this.handleUsernameChange =
            this.handleUsernameChange.bind(this);
        this.handlePasswordChange =
            this.handlePasswordChange.bind(this);
        this.handleSubmit =
            this.handleSubmit.bind(this);

        this.state = {
            username: '',
            password: '',
        };
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        
    }

    handleUsernameChange(e) {
        this.setState({ username: e.target.value });
    }

    handlePasswordChange(e) {
        this.setState({ password: e.target.value });
    }

    handleSubmit(event) {
        // Will state be up to date when this is called?
        event.preventDefault();

        if (this.props.onCheckLogin) {
            this.props.onCheckLogin(this.state.username, this.state.password);
        }
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <ControlLabel>Username</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.username}
                            placeholder="Enter username"
                            onChange={this.handleUsernameChange}
                        />
                        <ControlLabel>Password</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.password}
                            placeholder="Enter password"
                            onChange={this.handlePasswordChange}
                        />
                        <FormControl.Feedback />
                        <Button type="submit">Login</Button>
                    </FormGroup>
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

/// <summary>
/// </summary>
/// <prop name="user_username"></prop>
/// <prop name="user_realname"></prop>
/// <prop name="user_isadmin"></prop>
/// <prop name="user_candelete"></prop>
/// <prop name="user_userfilter"></prop>
class MDACSAuthAppBody extends React.Component {
    constructor(props) {
        super(props);

        // queue async fetch of userlist
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        // display login information
        // display button to refresh userlist
        // if we have userlist then render items
            // if not admin then only show our information
    }
}

/// <css-class>MDACSAuthAppContainer</css-class>
class MDACSAuthApp extends React.Component {
    constructor(props) {
        super(props);

        this.onCheckLogin = this.onCheckLogin.bind(this);

        this.dao_auth = new AuthNetworkDAO('.');

        this.state = {
            need_login_shown: true,
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    onCheckLogin(username, password) {
        this.dao_auth.setCredentials(username, password);
        this.dao_auth.isLoginValid(
            (user) => {
                console.log('user', user);
                this.setState({
                    need_login_shown: false,
                    user: user,
                });
            },
            (res) => {
                alert('invalid login');
            },
        );
    }

    render() {
        if (this.state.need_login_shown) {
            return <div className="MDACSAuthAppContainer"><MDACSLogin onCheckLogin={this.onCheckLogin} /></div>;
        } else {
            return <div className="MDACSAuthAppContainer">
                <MDACSAuthAppBody
                    user_username={this.state.user.user}
                    user_realname={this.state.user.name}
                    user_isadmin={this.state.user.admin}
                    user_candelete={this.state.user.can_delete}
                    user_userfilter={this.state.user.userfilter}
                />
            </div>;
        }
    }
}

ReactDOM.render(
    <MDACSAuthApp />,
    document.getElementById('root')
);