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
const Alert = ReactBootstrap.Alert;

class AuthNetworkDAO {
    constructor(url_auth) {
        this.dao = new BasicNetworkDAO(url_auth, url_auth);
    }

    userSet(user, success, failure) {
        this.dao.authenticatedTransaction('/user-set', {
            user: user
        }, resp => {
            success();
        }, res => {
            failure(res);
        });
    }

    userDelete(username) {
        this.dao.authenticatedTransaction('/user-delete', {
            username: username
        }, resp => {
            success();
        }, res => {
            failure(res);
        });
    }

    userList(success, failure) {
        this.dao.authenticatedTransaction('/user-list', {}, resp => {
            success(JSON.parse(resp.text));
        }, res => {
            failure(res);
        });
    }

    version() {}

    setCredentials(username, password) {
        this.dao.setUsername(username);
        this.dao.setPassword(password);
    }

    isLoginValid(success, failure) {
        this.dao.authenticatedTransaction('/is-login-valid', {}, resp => {
            success(JSON.parse(resp.text).user);
        }, res => {
            failure(res);
        });
    }
}

class BasicNetworkDAO {
    constructor(url_auth, url_service) {
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
        request.get(this.url_auth + '/challenge').end((err, res) => {
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

        this.challenge(challenge => {
            let phash = sha512(payload);
            let secret = sha512(phash + challenge + this.username + this.hashed_password);
            let _msg = {
                auth: {
                    challenge: challenge,
                    chash: secret,
                    hash: phash
                },
                payload: payload
            };

            this.transaction(url, _msg, success, failure);
        }, res => {
            failure(res);
        });
    }

    transaction(url, msg, success, failure) {
        request.post(this.url_service + url).send(JSON.stringify(msg)).end((err, res) => {
            if (err) {
                failure(err);
            } else {
                success(res);
            }
        });
    }
}

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
        this.props.onChange(event.target.value);
        this.setState({ value: event.target.value });
    }

    render() {
        return React.createElement(
            'label',
            null,
            this.props.label,
            ':',
            React.createElement('input', { type: 'text', value: this.state.value, onChange: this.onChange })
        );
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

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            username: '',
            password: ''
        };
    }

    componentDidMount() {}

    componentWillUnmount() {}

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
        return React.createElement(
            'div',
            null,
            React.createElement(
                'form',
                { onSubmit: this.handleSubmit },
                React.createElement(
                    FormGroup,
                    null,
                    React.createElement(
                        ControlLabel,
                        null,
                        'Username'
                    ),
                    React.createElement(FormControl, {
                        type: 'text',
                        value: this.state.username,
                        placeholder: 'Enter username',
                        onChange: this.handleUsernameChange
                    }),
                    React.createElement(
                        ControlLabel,
                        null,
                        'Password'
                    ),
                    React.createElement(FormControl, {
                        type: 'text',
                        value: this.state.password,
                        placeholder: 'Enter password',
                        onChange: this.handlePasswordChange
                    }),
                    React.createElement(FormControl.Feedback, null),
                    React.createElement(
                        Button,
                        { type: 'submit' },
                        'Login'
                    )
                )
            )
        );
    }
}

/// <summary>
/// 
/// </summary>
class MDACSAuthUserList extends React.Component {}

/// <summary>
/// </summary>
/// <prop name="onUserDelete"></prop>
/// <prop name="user"></prop>
/// <prop name="current_user"></prop>
class MDACSAuthUserItem extends React.Component {}

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
        this.onDeleteUser = this.onDeleteUser.bind(this);

        this.state = {
            user_password: '',
            user_user: props.user.user,
            user_name: props.user.name,
            user_phone: props.user.phone,
            user_email: props.user.email,
            user_admin: props.user.admin,
            user_can_delete: props.user.can_detel,
            user_userfilter: props.user.userfilter
        };
    }

    onRealNameChange(e) {
        if (this.props.current_admin || this.props.current_user == this.state.user_user) this.setState({
            user_name: e.target.value
        });
    }

    onPasswordChange(e) {
        if (this.props.current_admin || this.props.current_user == this.state.user_user) this.setState({
            user_password: e.target.value
        });
    }

    onPhoneChange(e) {
        if (this.props.current_admin || this.props.current_user == this.state.user_user) this.setState({
            user_phone: e.target.value
        });
    }

    onEMailChange(e) {
        if (this.props.current_admin || this.props.current_user == this.state.user_user) this.setState({
            user_email: e.target.value
        });
    }

    onUserFilterChange(e) {
        if (this.props.current_admin || this.props.current_user == this.state.user_user) this.setState({
            user_userfilter: e.target.value
        });
    }

    onIsAdminChange(e) {
        if (this.props.current_admin || this.props.current_user == this.state.user_user) this.setState({
            user_admin: e.target.value
        });
    }

    onCanDeleteChange(e) {
        if (this.props.current_admin || this.props.current_user == this.state.user_user) this.setState({
            user_can_delete: e.target.value
        });
    }

    onDeleteUser() {
        if (this.props.current_admin) {
            this.props.dao_auth.userDelete(this.state.user_user, () => {
                if (this.props.onUserDelete) {
                    this.props.onUserDelete();
                }
            }, () => {});
        }
    }

    render() {
        let disabledForm;

        if (!this.props.current_admin && this.props.current_user != this.state.user_user) {
            disabledForm = true;
        } else {
            disabledForm = false;
        }

        let b;

        if (disabledForm) {
            b = React.createElement(
                'span',
                null,
                'No changes can be saved. You are not an ',
                React.createElement(
                    'code',
                    null,
                    'administrator'
                ),
                ' nor is this ',
                React.createElement(
                    'code',
                    null,
                    'you'
                ),
                '.'
            );
        } else {
            b = React.createElement(
                Button,
                { type: 'submit' },
                'Save Changes'
            );
        }

        let c;

        if (this.props.current_admin) {
            c = React.createElement(
                'div',
                null,
                React.createElement(
                    ControlLabel,
                    null,
                    'User Filter Expression'
                ),
                React.createElement(FormControl, { type: 'text', value: this.state.user_userfilter ? this.state.user_userfilter : '', placeholder: 'Filter expression.', onChange: this.onUserFilterChange }),
                React.createElement(
                    Checkbox,
                    { defaultChecked: this.state.user_admin, onChange: this.onIsAdminChange },
                    'Administrator'
                ),
                React.createElement(
                    Checkbox,
                    { defaultChecked: this.state.user_can_delete, onChange: this.onCanDeleteChange },
                    'Can Delete'
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        Button,
                        { onClick: this.onDeleteUser },
                        'Delete User'
                    )
                )
            );
        } else {
            c = React.createElement(
                'div',
                null,
                'Some settings have been disabled and hidden because you are not an ',
                React.createElement(
                    'code',
                    null,
                    'administrator'
                ),
                '.'
            );
        }

        let a = React.createElement(
            'form',
            null,
            React.createElement(
                FormGroup,
                { disabled: disabledForm },
                React.createElement(
                    ControlLabel,
                    null,
                    'Real Name'
                ),
                React.createElement(FormControl, { type: 'text', value: this.state.user_name, placeholder: 'Real name.', onChange: this.onRealNameChange }),
                React.createElement(
                    ControlLabel,
                    null,
                    'Password'
                ),
                React.createElement(FormControl, { type: 'text', value: this.state.user_password, placeholder: 'Only set to new password if changing the password.', onChange: this.onPasswordChange }),
                React.createElement(
                    ControlLabel,
                    null,
                    'Contact Phone'
                ),
                React.createElement(FormControl, { type: 'text', value: this.state.user_phone ? this.state.user_phone : '', placeholder: 'Phone.', onChange: this.onPhoneChange }),
                React.createElement(
                    ControlLabel,
                    null,
                    'Contact E-Mail'
                ),
                React.createElement(FormControl, { type: 'text', value: this.state.user_email ? this.state.user_email : '', placeholder: 'E-Mail.', onChange: this.onEMailChange }),
                c,
                React.createElement(
                    'div',
                    null,
                    b
                )
            )
        );

        return a;
    }
}

/// <prop name="dao_auth></prop>
/// <prop name="onUserAdded()"></prop>
class MDACSAuthAddUser extends React.Component {
    constructor(props) {
        super(props);

        this.onExpand = this.onExpand.bind(this);
        this.onContract = this.onContract.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onAddUser = this.onAddUser.bind(this);
        this.onDismissAlert = this.onDismissAlert.bind(this);

        this.state = {
            expanded: props.expanded == true ? true : false,
            user_name: '',
            user_user: '',
            user_password: '',
            user_phone: '',
            user_email: '',
            user_admin: false,
            user_can_delete: false,
            user_userfilter: '',
            alert: null,
            success: false
        };
    }

    onExpand() {
        console.log('expanding');
        this.setState({
            expanded: true,
            success: false,
            alert: null
        });
    }

    onContract() {
        this.setState({
            expanded: false,
            success: false,
            alert: null
        });
    }

    onInputChange(id, e) {
        let tmp = {};

        tmp['user_' + id] = e.target.value;

        console.log('@@@', 'user_' + id, e.target.value);

        this.setState(tmp);
    }

    onAddUser(e) {
        e.preventDefault();

        let user = {
            user: this.state.user_user,
            name: this.state.user_name,
            phone: this.state.user_phone,
            email: this.state.user_email,
            admin: this.state.user_admin,
            can_delete: this.state.user_can_delete,
            userfilter: this.state.user_userfilter
        };

        console.log('adding user');

        this.props.dao_auth.userSet(user, resp => {
            console.log('got success');
            this.setState({
                success: true,
                alert: null,
                expanded: false
            });

            if (this.props.onAddedUser) this.props.onAddedUser();
        }, res => {
            this.setState({
                alert: 'The add user command failed to execute on the server.'
            });
        });
    }

    onDismissAlert() {
        this.setState({
            alert: null
        });
    }

    render() {
        if (this.state.expanded) {
            let alertstuff;

            if (this.state.alert === null) {
                alertstuff = null;
            } else {
                alertstuff = React.createElement(
                    'div',
                    null,
                    React.createElement(
                        Alert,
                        { bsStyle: 'warning', onDismiss: this.onDismissAlert },
                        React.createElement(
                            'strong',
                            null,
                            'Opps..'
                        ),
                        ' there was a problem adding the user. The server rejected the command.'
                    )
                );
            }

            return React.createElement(
                'span',
                null,
                React.createElement(
                    Button,
                    { onClick: this.onContract },
                    'Cancel'
                ),
                React.createElement(
                    'form',
                    { onSubmit: this.onAddUser },
                    React.createElement(
                        FormGroup,
                        null,
                        React.createElement(
                            ControlLabel,
                            null,
                            'Real Name'
                        ),
                        React.createElement(FormControl, { type: 'text', value: this.state.user_name, placeholder: 'Real name.', onChange: e => this.onInputChange('name', e) }),
                        React.createElement(
                            ControlLabel,
                            null,
                            'Username'
                        ),
                        React.createElement(FormControl, { type: 'text', value: this.state.user_user, placeholder: 'The username used to login.', onChange: e => this.onInputChange('user', e) }),
                        React.createElement(
                            ControlLabel,
                            null,
                            'Password'
                        ),
                        React.createElement(FormControl, { type: 'text', value: this.state.user_password, placeholder: 'Only set to new password if changing the password.', onChange: e => this.onInputChange('password', e) }),
                        React.createElement(
                            ControlLabel,
                            null,
                            'Contact Phone'
                        ),
                        React.createElement(FormControl, { type: 'text', value: this.state.user_phone ? this.state.user_phone : '', placeholder: 'Phone.', onChange: e => this.onInputChange('phone', e) }),
                        React.createElement(
                            ControlLabel,
                            null,
                            'Contact E-Mail'
                        ),
                        React.createElement(FormControl, { type: 'text', value: this.state.user_email ? this.state.user_email : '', placeholder: 'E-Mail.', onChange: e => this.onInputChange('email', e) }),
                        React.createElement(
                            ControlLabel,
                            null,
                            'User Filter Expression'
                        ),
                        React.createElement(FormControl, { type: 'text', value: this.state.user_userfilter ? this.state.user_userfilter : '', placeholder: 'Filter expression.', onChange: e => this.onInputChange('userfilter', e) }),
                        React.createElement(
                            Checkbox,
                            { defaultChecked: this.state.user_admin, onChange: e => this.onInputChange('admin', e) },
                            'Administrator'
                        ),
                        React.createElement(
                            Checkbox,
                            { defaultChecked: this.state.user_can_delete, onChange: e => this.onInputChange('can_delete', e) },
                            'Can Delete'
                        ),
                        alertstuff,
                        React.createElement(
                            Button,
                            { type: 'submit' },
                            'Save New User'
                        ),
                        ';'
                    )
                )
            );
        } else {
            if (this.state.success === true) {
                return React.createElement(
                    'span',
                    null,
                    React.createElement(
                        Alert,
                        { bsStyle: 'success' },
                        'The user was added.'
                    ),
                    React.createElement(
                        Button,
                        { onClick: this.onExpand },
                        'Add User'
                    )
                );
            } else {
                return React.createElement(
                    'span',
                    null,
                    React.createElement(
                        Button,
                        { onClick: this.onExpand },
                        'Add User'
                    )
                );
            }
        }
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

        this.onAddedUser = this.onAddedUser.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.refresh = this.refresh.bind(this);

        this.state = {
            userlist: null,
            lasterror: null
        };

        this.refresh();
    }

    refresh() {
        this.props.dao_auth.userList(resp => {
            this.setState({
                userlist: resp,
                lasterror: null
            });
            console.log('user list', resp);
        }, res => {
            this.setState({
                userlist: null,
                lasterror: res
            });
            console.log('user list failure', res);
        });
    }

    componentDidMount() {}

    componentWillUnmount() {}

    onAddedUser() {
        this.refresh();
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
            tabs = this.state.userlist.map(user => React.createElement(
                Tab,
                { key: user.user, eventKey: user.user, title: user.user },
                React.createElement(MDACSUserSettings, {
                    dao_auth: this.props.dao_auth,
                    current_admin: this.props.user_isadmin,
                    current_user: this.props.user_username,
                    user: user })
            ));
        }

        let expstuff;

        if (this.props.user_userfilter == null) {
            expstuff = 'can see all items due to not having a user filter specifier';
        } else {
            expstuff = React.createElement(
                'span',
                null,
                'can only see items matching the expression',
                React.createElement(
                    'code',
                    null,
                    this.props.user_userfilter
                )
            );
        };

        return React.createElement(
            'div',
            null,
            React.createElement(
                Panel,
                null,
                React.createElement(
                    Panel.Heading,
                    null,
                    'Active Credentials'
                ),
                React.createElement(
                    Panel.Body,
                    null,
                    React.createElement(
                        ListGroup,
                        null,
                        React.createElement(
                            ListGroupItem,
                            null,
                            'You are logged in as ',
                            React.createElement(
                                'code',
                                null,
                                this.props.user_username
                            ),
                            ' with the real name ',
                            React.createElement(
                                'code',
                                null,
                                this.props.user_realname
                            ),
                            '.'
                        ),
                        React.createElement(
                            ListGroupItem,
                            null,
                            'You are ',
                            React.createElement(
                                'code',
                                null,
                                this.props.user_isadmin ? 'an administrator' : 'a user with limited priviledges'
                            ),
                            '.'
                        ),
                        React.createElement(
                            ListGroupItem,
                            null,
                            'You can ',
                            React.createElement(
                                'code',
                                null,
                                this.props.user_candelete ? 'delete' : 'not delete'
                            ),
                            ' items.'
                        ),
                        React.createElement(
                            ListGroupItem,
                            null,
                            'You ',
                            expstuff,
                            '.'
                        )
                    ),
                    React.createElement(
                        Button,
                        { onClick: this.onLogout },
                        'Logout'
                    )
                )
            ),
            React.createElement(
                Panel,
                null,
                React.createElement(
                    Panel.Heading,
                    null,
                    'Existing Users'
                ),
                React.createElement(
                    Panel.Body,
                    null,
                    React.createElement(
                        Tabs,
                        { defaultActiveKey: 1, id: 'User Settings Tabs' },
                        tabs != null ? tabs : ''
                    )
                )
            ),
            React.createElement(
                Panel,
                null,
                React.createElement(
                    Panel.Heading,
                    null,
                    'Add User'
                ),
                React.createElement(
                    Panel.Body,
                    null,
                    React.createElement(MDACSAuthAddUser, {
                        onAddedUser: this.onAddedUser,
                        dao_auth: this.props.dao_auth })
                )
            )
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
            dao_auth: new AuthNetworkDAO('.')
        };
    }

    componentDidMount() {}

    componentWillUnmount() {}

    onLogout() {
        // Clear the credentials.
        this.state.dao_auth.setCredentials('', '');
        this.setState({ need_login_shown: true });
    }

    onCheckLogin(username, password) {
        this.state.dao_auth.setCredentials(username, password);
        this.state.dao_auth.isLoginValid(user => {
            console.log('user', user);
            this.setState({
                need_login_shown: false,
                user: user
            });
        }, res => {
            alert('invalid login');
        });
    }

    render() {
        if (this.state.need_login_shown) {
            return React.createElement(
                'div',
                { className: 'MDACSAuthAppContainer' },
                React.createElement(MDACSLogin, { onCheckLogin: this.onCheckLogin })
            );
        } else {
            return React.createElement(
                'div',
                { className: 'MDACSAuthAppContainer' },
                React.createElement(MDACSAuthAppBody, {
                    onLogout: this.onLogout,
                    dao_auth: this.state.dao_auth,
                    user_username: this.state.user.user,
                    user_realname: this.state.user.name,
                    user_isadmin: this.state.user.admin,
                    user_candelete: this.state.user.can_delete,
                    user_userfilter: this.state.user.userfilter
                })
            );
        }
    }
}

ReactDOM.render(React.createElement(MDACSAuthApp, null), document.getElementById('root'));

