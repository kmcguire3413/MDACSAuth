const request = window.superagent;
const FormGroup = ReactBootstrap.Alert;
const ControlLabel = ReactBootstrap.ControlLabel;
const FormControl = ReactBootstrap.FormControl;
const Button = ReactBootstrap.Button;
const Panel = ReactBootstrap.Panel;
const Tabs = ReactBootstrap.Tabs;
const Tab = ReactBootstrap.Tab;
const Label = ReactBootstrap.Label;
const ListGroup = ReactBootstrap.ListGroup;
const ListGroupItem = ReactBootstrap.ListGroupItem;
const Checkbox = ReactBootstrap.Checkbox;

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

    userList(success, failure) {
        this.dao.authenticatedTransaction(
            '/user-list',
            {},
            (resp) => {
                success(JSON.parse(resp.text));
            },
            (res) => {
                failure(res);
            }
        );
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
/// </summary>
/// <prop name="user"></prop>
/// <prop name="current_user"></prop>
class MDACSAuthUserItem extends React.Component {
}

class MDACSUserSettings extends React.Component {
    constructor(props) {
        super(props);

        this.onRealNameChange = this.onRealNameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.onPhoneChange = this.onPhoneChange.bind(this);
        this.onEMailChange = this.onEMailChange.bind(this);
        this.onUserFilterChange = this.onUserFilterChange.bind(this);
        this.onIsAdminChange = this.onIsAdminChange.bind(this);
        this.onCanDeleteChange = this.onCanDeleteChange.bind(this);

        this.state = {
            user: props.user
        };
    }

    onRealNameChange(e) {

    }

    onPasswordChange(e) {

    }

    onPhoneChange(e) {

    }

    onEMailChange(e) {

    }

    onUserFilterChange(e) {

    }

    onIsAdminChange(e) {

    }

    onCanDeleteChange(e) {

    }

    render() {
        let isAdmin = this.state.user.admin;
        let canDelete = this.state.user.can_delete;
        let disabledForm;

        if (!this.props.current_admin && this.props.current_user != this.state.user.user) {
            disabledForm = true;
        } else {
            disabledForm = false;
        }

        let b;

        if (disabledForm) {
            b = <span>
                No changes can be saved.
                You are not an <code>administrator</code> nor is this <code>you</code>.
            </span>;
        } else {
            b = <Button type="submit">Save Changes</Button>;
        }

        let a = (<form>
            <FormGroup disabled={disabledForm}>
            <ControlLabel>Real Name</ControlLabel>
            <FormControl type="text" value={this.state.user.name} placeholder="Real name." onChange={this.onRealNameChange} />
            <ControlLabel>Password</ControlLabel>
            <FormControl type="text" value="" placeholder="Only set to new password if changing the password." onChange={this.onPasswordChange} />
            <ControlLabel>Contact Phone</ControlLabel>
            <FormControl type="text" value={this.state.user.phone ? this.state.user.phone : ''} placeholder="Phone." onChange={this.onPhoneChange} />
            <ControlLabel>Contact E-Mail</ControlLabel>
            <FormControl type="text" value={this.state.user.email ? this.state.user.email : ''} placeholder="E-Mail." onChange={this.onEMailChange} />
            <ControlLabel>User Filter Expression</ControlLabel>
            <FormControl type="text" value={this.state.user.userfilter ? this.state.user.userfilter : ''} placeholder="Filter expression." onChange={this.onUserFilterChange} />
            <Checkbox defaultChecked={isAdmin} onChange={this.onIsAdminChange}>Administrator</Checkbox>
            <Checkbox defaultChecked={canDelete} onChange={this.onCanDeleteChange}>Can Delete</Checkbox>
            {b}
            </FormGroup>
        </form>);

        return a;
    }
}

/// <summary>
/// </summary>
/// <prop name="dao_auth">The authentication service data access object.</prop>
/// <prop name="onLogout()">Callback when logout is activated.</prop>
/// <prop name="user_username"></prop>
/// <prop name="user_realname"></prop>
/// <prop name="user_isadmin"></prop>
/// <prop name="user_candelete"></prop>
/// <prop name="user_userfilter"></prop>
class MDACSAuthAppBody extends React.Component {
    constructor(props) {
        super(props);

        this.onLogout = this.onLogout.bind(this);

        this.state = {
            userlist: null,
            lasterror: null,
        };

        this.props.dao_auth.userList(
            (resp) => {
                this.setState({
                    userlist: resp,
                    lasterror: null
                });
                console.log('user list', resp);
            },
            (res) => {
                this.setState({
                    userlist: null,
                    lasterror: res
                });
                console.log('user list failure', res);
            }
        );
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    onLogout(e) {
        if (this.props.onLogout) {
            this.props.onLogout();
        }
    }

    render() {
        // display login information
        // display button to refresh userlist
        // if we have userlist then render items
            // if not admin then only show our information
        let tabs;
        if (this.state.userlist == null) {
            tabs = null;
        } else {
            tabs = this.state.userlist.map(user =>
                <Tab key={user.user} eventKey={user.user} title={user.user}>
                    <MDACSUserSettings current_admin={this.props.user_isadmin} current_user={this.props.user_username} user={user} />
                </Tab>
            );
        }

        let expstuff;

        if (this.props.user_userfilter == null) {
            expstuff = 'can see all items due to not having a user filter specifier';
        } else {
            expstuff = <span>
                can only see items matching the expression
                <code>{this.props.user_userfilter}</code>
            </span>;
        };

        return (
            <div>
            <Panel>
                <Panel.Heading>Active Credentials</Panel.Heading>
                <Panel.Body>
                        <ListGroup>
                            <ListGroupItem>
                                You are logged in as <code>{this.props.user_username}</code> with the real name <code>{this.props.user_realname}</code>.
                            </ListGroupItem>
                            <ListGroupItem>
                                You are <code>{this.props.user_isadmin ? 'an administrator' : 'a user with limited priviledges'}</code>.
                            </ListGroupItem>
                            <ListGroupItem>
                                You can <code>{this.props.user_candelete ? 'delete' : 'not delete'}</code> items.
                            </ListGroupItem>
                            <ListGroupItem>
                                You {expstuff}.
                            </ListGroupItem>
                        </ListGroup>
                        <Button onClick={this.onLogout}>Logout</Button>
                </Panel.Body>
            </Panel>
            <Panel>
                <Panel.Heading>Settings</Panel.Heading>
                <Panel.Body>
                        <Tabs defaultActiveKey={1} id="User Settings Tabs">
                            {tabs != null ? tabs : ''}
                        </Tabs>
                </Panel.Body>
            </Panel>
            </div>
        );

    }
}

/// <css-class>MDACSAuthAppContainer</css-class>
class MDACSAuthApp extends React.Component {
    constructor(props) {
        super(props);

        this.onCheckLogin = this.onCheckLogin.bind(this);
        this.onLogout = this.onLogout.bind(this);

        this.state = {
            need_login_shown: true,
            dao_auth: new AuthNetworkDAO('.'),
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    onLogout() {
        // Clear the credentials.
        this.state.dao_auth.setCredentials('', '');
        this.setState({ need_login_shown: true });
    }

    onCheckLogin(username, password) {
        this.state.dao_auth.setCredentials(username, password);
        this.state.dao_auth.isLoginValid(
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
                    onLogout={this.onLogout}
                    dao_auth={this.state.dao_auth}
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