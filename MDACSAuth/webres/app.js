/// <pure/>
const MDACSUserSettingsInitialState = props => {
    return {
        user_password: '',
        user_user: props.user.user,
        user_name: props.user.name,
        user_phone: props.user.phone,
        user_email: props.user.email,
        user_admin: props.user.admin,
        user_can_delete: props.user.can_delete,
        user_userfilter: props.user.userfilter,
        success: false,
        delete_success: false,
        alert: null
    };
};

/// <pure/>
const MDACSUserSettingsMutators = {
    permCheck: (props, state, cb) => props.current_admin || prop.current_user == state.user_user ? cb() : false,
    utility: (props, state, setState, k, e) => {
        MDACSUserSettingsMutators.permCheck(props, state, () => {
            let tmp = {};
            tmp[k] = e.target.value;
            setState(tmp);
        });
    },
    onRealNameChange: (e, props, state, setState) => MDACSUserSettingsMutators.utility(props, state, setState, 'user_name', e),
    onPasswordChange: (e, props, state, setState) => MDACSUserSettingsMutators.utility(props, state, setState, 'user_password', e),
    onPhoneChange: (e, props, state, setState) => MDACSUserSettingsMutators.utility(props, state, setState, 'user_phone', e),
    onEMailChange: (e, props, state, setState) => MDACSUserSettingsMutators.utility(props, state, setState, 'user_email', e),
    onUserFilterChange: (e, props, state, setState) => MDACSUserSettingsMutators.utility(props, state, setState, 'user_userfilter', e),
    onIsAdminChange: (e, props, state, setState) => MDACSUserSettingsMutators.utility(props, state, setState, 'user_admin', e),
    onCanDeleteChange: (e, props, state, setState) => MDACSUserSettingsMutators.utility(props, state, setState, 'user_can_delete', e),
    onDeleteUser: (props, state, setState) => props.current_admin ? props.dao_auth.userDelete(state.user_user, resp => {
        if (props.onUserDelete) props.onUserDelete();

        setState({
            success: true,
            alert: null,
            delete_success: true
        });
    }, res => {
        setState({ success: false, alert: 'The server failed to delete the user.' });
    }) : setState({ success: false, alert: 'You do not have the delete user priviledge.' }),
    onUpdateUser: (e, props, state, setState) => {
        e.preventDefault();

        let user = {
            user: state.user_user,
            name: state.user_name,
            phone: state.user_phone,
            email: state.user_email,
            hash: sha512(state.user_password),
            admin: state.user_admin === 'on' ? true : false,
            can_delete: state.user_can_delete === 'on' ? true : false,
            userfilter: state.user_userfilter
        };

        console.log('updating user');

        props.dao_auth.userSet(user, resp => {
            setState({
                success: true
            });

            if (props.onAddedUser) props.onAddedUser();
        }, res => {
            setState({
                success: false,
                alert: 'The update user command failed to execute on the server.'
            });
        });
    }
};

/// <pure/>
const MDACSUserSettingsBottomView = (props, state, setState, mutators) => {
    let formDisabled = !props.current_admin && props.current_user != state.user_user;

    if (formDisabled) {
        bottom = React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                null,
                'No changes can be saved.'
            ),
            React.createElement(
                'div',
                null,
                'You are not an ',
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
            )
        );
    } else {
        if (state.success) {
            bottom = React.createElement(
                'div',
                null,
                React.createElement(
                    Alert,
                    { bsStyle: 'success' },
                    'The update was successful.'
                ),
                React.createElement(
                    Button,
                    { id: 'user_settings_save_changes_button', type: 'submit' },
                    'Save Changes'
                )
            );
        } else {
            if (state.alert) {
                bottom = React.createElement(
                    'div',
                    null,
                    React.createElement(
                        Alert,
                        { bsStyle: 'warning' },
                        state.alert
                    ),
                    React.createElement(
                        Button,
                        { id: 'user_settings_save_changes_button', type: 'submit' },
                        'Save Changes'
                    )
                );
            } else {
                bottom = React.createElement(
                    'div',
                    null,
                    React.createElement(
                        Button,
                        { id: 'user_settings_save_changes_button', type: 'submit' },
                        'Save Changes'
                    )
                );
            }
        }
    }
};

/// <pure/>
const MDACSUserSettingsViewCenter = (props, state, setState, mutators) => {
    return props.current_admin ? React.createElement(
        'div',
        null,
        React.createElement(
            ControlLabel,
            null,
            'User Filter Expression'
        ),
        React.createElement(FormControl, {
            id: 'user_settings_userfilter',
            type: 'text',
            value: state.user_userfilter ? state.user_userfilter : '',
            placeholder: 'Filter expression.',
            onChange: e => mutators.onUserFilterChange(e, props, state, setState) }),
        React.createElement(
            Checkbox,
            {
                id: 'user_settings_admin',
                defaultChecked: state.user_admin,
                onChange: e => mutators.onIsAdminChange(e, props, state, setState) },
            'Administrator'
        ),
        React.createElement(
            Checkbox,
            {
                id: 'user_settings_can_delete',
                defaultChecked: state.user_can_delete,
                onChange: e => mutators.onCanDeleteChange(e, props, state, setState) },
            'Can Delete'
        ),
        React.createElement(
            'div',
            null,
            React.createElement(
                Button,
                {
                    id: 'user_settings_delete_user_button',
                    onClick: e => mutators.onDeleteUser(props, state, setState) },
                'Delete User'
            )
        )
    ) : React.createElement(
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
};

/// <pure/>
const MDACSUserSettingsView = (props, state, setState, mutators) => {
    if (state.delete_success) {
        return React.createElement(
            'div',
            null,
            React.createElement(
                Alert,
                { bsStyle: 'success' },
                'The user has been deleted.'
            )
        );
    }

    let bottom = MDACSUserSettingsBottomView(props, state, setState, mutators);

    let center = MDACSUserSettingsViewCenter(props, state, setState, mutators);

    let top = React.createElement(
        'form',
        { id: 'user_settings_form', onSubmit: e => mutators.onUpdateUser(e, props, state, setState) },
        React.createElement('div', {
            style: { display: 'hidden' },
            id: 'user_settings_username',
            'data-test': props.this_username }),
        React.createElement(
            FormGroup,
            null,
            React.createElement(
                ControlLabel,
                null,
                'Real Name'
            ),
            React.createElement(FormControl, {
                id: 'user_settings_realname',
                type: 'text',
                value: state.user_name,
                placeholder: 'Real name.',
                onChange: e => mutators.onRealNameChange(e, props, state, setState) }),
            React.createElement(
                ControlLabel,
                null,
                'Password'
            ),
            React.createElement(FormControl, {
                id: 'user_settings_password',
                type: 'text',
                value: state.user_password,
                placeholder: 'Only set to new password if changing the password.',
                onChange: e => mutators.onPasswordChange(e, props, state, setState) }),
            React.createElement(
                ControlLabel,
                null,
                'Contact Phone'
            ),
            React.createElement(FormControl, {
                id: 'user_settings_phone',
                type: 'text',
                value: state.user_phone ? state.user_phone : '',
                placeholder: 'Phone.',
                onChange: e => mutators.onPhoneChange(e, props, state, setState) }),
            React.createElement(
                ControlLabel,
                null,
                'Contact E-Mail'
            ),
            React.createElement(FormControl, {
                id: 'user_settings_email',
                type: 'text',
                value: state.user_email ? state.user_email : '',
                placeholder: 'E-Mail.',
                onChange: e => mutators.onEMailChange(e, props, state, setState) }),
            center,
            React.createElement(
                'div',
                null,
                bottom
            ),
            React.createElement(
                Button,
                { type: 'submit', id: 'user_settings_save_changes_button' },
                'Save'
            )
        )
    );

    return top;
};

class MDACSUserSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = MDACSUserSettingsInitialState(props);
    }

    render() {
        return MDACSUserSettingsView(this.props, this.state, this.setState.bind(this), MDACSUserSettingsMutators);
    }
}

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

    userDelete(username, success, failure) {
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

/// <summary>
/// Initial model
/// </summary>
/// <pure/>
const MDACSLoginInitialState = {
    username: '',
    password: ''
};

/// <summary>
/// Controller/Mutator
/// </summary>
/// <pure/>
const MDACSLoginMutators = {
    onUserChange: (e, props, state, setState) => setState({ username: e.target.value }),
    onPassChange: (e, props, state, setState) => setState({ password: e.target.value }),
    onSubmit: (e, props, state, setState) => {
        e.preventDefault();

        if (props.onCheckLogin) {
            props.onCheckLogin(state.username, state.password);
        }
    }
};

/// <summary>
/// View
/// </summary>
/// <pure/>
const MDACSLoginView = (props, state, setState, mutators) => {
    let onUserChange = e => mutators.onUserChange(e, props, state, setState);
    let onPassChange = e => mutators.onPassChange(e, props, state, setState);
    let onSubmit = e => mutators.onSubmit(e, props, state, setState);

    return React.createElement(
        'div',
        null,
        React.createElement(
            'form',
            { onSubmit: onSubmit },
            React.createElement(
                FormGroup,
                null,
                React.createElement(
                    ControlLabel,
                    null,
                    'Username'
                ),
                React.createElement(FormControl, {
                    id: 'login_username',
                    type: 'text',
                    value: state.username,
                    placeholder: 'Enter username',
                    onChange: onUserChange
                }),
                React.createElement(
                    ControlLabel,
                    null,
                    'Password'
                ),
                React.createElement(FormControl, {
                    id: 'login_password',
                    type: 'text',
                    value: state.password,
                    placeholder: 'Enter password',
                    onChange: onPassChange
                }),
                React.createElement(FormControl.Feedback, null),
                React.createElement(
                    Button,
                    { id: 'login_submit', type: 'submit' },
                    'Login'
                )
            )
        )
    );
};

/// <summary>
/// </summary>
/// <prop-event name="onCheckLogin(username, password)">Callback when login should be checked.</prop-event>
class MDACSLogin extends React.Component {
    constructor(props) {
        super(props);
        this.state = MDACSLoginInitialState;
    }

    render() {
        return MDACSLoginView(this.props, this.state, this.setState.bind(this), MDACSLoginMutators);
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

        this.setState(tmp);
    }

    onAddUser(e) {
        e.preventDefault();

        let user = {
            user: this.state.user_user,
            name: this.state.user_name,
            phone: this.state.user_phone,
            email: this.state.user_email,
            hash: sha512(this.state.user_password),
            admin: this.state.user_admin === 'on' ? true : false,
            can_delete: this.state.user_can_delete === 'on' ? true : false,
            userfilter: this.state.user_userfilter
        };

        this.props.dao_auth.userSet(user, resp => {
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
                        { id: 'adduser_alert_problem_adding', bsStyle: 'warning', onDismiss: this.onDismissAlert },
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
                { id: 'adduser_container' },
                React.createElement(
                    Button,
                    { id: 'adduser_contract_button', onClick: this.onContract },
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
                        React.createElement(FormControl, { id: 'adduser_realname', type: 'text', value: this.state.user_name, placeholder: 'Real name.', onChange: e => this.onInputChange('name', e) }),
                        React.createElement(
                            ControlLabel,
                            null,
                            'Username'
                        ),
                        React.createElement(FormControl, { id: 'adduser_username', type: 'text', value: this.state.user_user, placeholder: 'The username used to login.', onChange: e => this.onInputChange('user', e) }),
                        React.createElement(
                            ControlLabel,
                            null,
                            'Password'
                        ),
                        React.createElement(FormControl, { id: 'adduser_password', type: 'text', value: this.state.user_password, placeholder: 'Only set to new password if changing the password.', onChange: e => this.onInputChange('password', e) }),
                        React.createElement(
                            ControlLabel,
                            null,
                            'Contact Phone'
                        ),
                        React.createElement(FormControl, { id: 'adduser_phone', type: 'text', value: this.state.user_phone ? this.state.user_phone : '', placeholder: 'Phone.', onChange: e => this.onInputChange('phone', e) }),
                        React.createElement(
                            ControlLabel,
                            null,
                            'Contact E-Mail'
                        ),
                        React.createElement(FormControl, { id: 'adduser_email', type: 'text', value: this.state.user_email ? this.state.user_email : '', placeholder: 'E-Mail.', onChange: e => this.onInputChange('email', e) }),
                        React.createElement(
                            ControlLabel,
                            null,
                            'User Filter Expression'
                        ),
                        React.createElement(FormControl, { id: 'adduser_userfilter', type: 'text', value: this.state.user_userfilter ? this.state.user_userfilter : '', placeholder: 'Filter expression.', onChange: e => this.onInputChange('userfilter', e) }),
                        React.createElement(
                            Checkbox,
                            { id: 'adduser_admin', defaultChecked: this.state.user_admin, onChange: e => this.onInputChange('admin', e) },
                            'Administrator'
                        ),
                        React.createElement(
                            Checkbox,
                            { id: 'adduser_can_delete', defaultChecked: this.state.user_can_delete, onChange: e => this.onInputChange('can_delete', e) },
                            'Can Delete'
                        ),
                        alertstuff,
                        React.createElement(
                            Button,
                            { id: 'adduser_submit_button', type: 'submit' },
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
                        { id: 'adduser_alert_success', bsStyle: 'success' },
                        'The user was added.'
                    ),
                    React.createElement(
                        Button,
                        { id: 'adduser_expand_button', onClick: this.onExpand },
                        'Add User'
                    )
                );
            } else {
                return React.createElement(
                    'span',
                    null,
                    React.createElement(
                        Button,
                        { id: 'adduser_expand_button', onClick: this.onExpand },
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
        }, res => {
            this.setState({
                userlist: null,
                lasterror: res
            });
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
                    this_username: user.user,
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
                        { id: 'logout_button', onClick: this.onLogout },
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
                        { defaultActiveKey: 1, id: 'user_settings_tabs' },
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
            dao_auth: new AuthNetworkDAO('.'),
            alert: null
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
            this.setState({
                need_login_shown: false,
                user: user,
                alert: null
            });
        }, res => {
            this.setState({
                alert: 'The login failed. Reason given was ' + res + '.'
            });
        });
    }

    render() {
        if (this.state.need_login_shown) {
            if (this.state.alert !== null) {
                return React.createElement(
                    'div',
                    { className: 'MDACSAuthAppContainer' },
                    React.createElement(
                        Alert,
                        { id: 'login_alert_problem', bsStyle: 'warning' },
                        this.state.alert
                    ),
                    React.createElement(MDACSLogin, { onCheckLogin: this.onCheckLogin })
                );
            } else {
                return React.createElement(
                    'div',
                    { className: 'MDACSAuthAppContainer' },
                    React.createElement(MDACSLogin, { onCheckLogin: this.onCheckLogin })
                );
            }
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

