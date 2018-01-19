/// <pure/>
const MDACSUserSettingsInitialState = (props) => {
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
        alert: null,
    };
};

/// <pure/>
const MDACSUserSettingsMutators = {
    permCheck: (props, state, cb) =>
        props.current_admin || prop .current_user == state.user_user ? cb() : false,
    utility: (props, state, setState, k, e) => {
        MDACSUserSettingsMutators.permCheck(props, state, () => {
            let tmp = {};
            tmp[k] = e.target.value;
            setState(tmp);
        });
    },
    onRealNameChange: (e, props, state, setState) =>
    MDACSUserSettingsMutators.utility(props, state, setState, 'user_name', e),
    onPasswordChange: (e, props, state, setState) =>
    MDACSUserSettingsMutators.utility(props, state, setState, 'user_password', e),
    onPhoneChange: (e, props, state, setState) =>
    MDACSUserSettingsMutators.utility(props, state, setState, 'user_phone', e),
    onEMailChange: (e, props, state, setState) =>
    MDACSUserSettingsMutators.utility(props, state, setState, 'user_email', e),
    onUserFilterChange: (e, props, state, setState) =>
    MDACSUserSettingsMutators.utility(props, state, setState, 'user_userfilter', e),
    onIsAdminChange: (e, props, state, setState) =>
    MDACSUserSettingsMutators.utility(props, state, setState, 'user_admin', e),
    onCanDeleteChange: (e, props, state, setState) =>
    MDACSUserSettingsMutators.utility(props, state, setState, 'user_can_delete', e),
    onDeleteUser: (props, state, setState) =>
        props.current_admin ?
            props.dao_auth.userDelete(
                state.user_user,
                (resp) => {
                    if (props.onUserDelete)
                        props.onUserDelete();

                    setState({
                        success: true,
                        alert: null,
                        delete_success: true,
                    });
                },
                (res) => {
                    setState({ success: false, alert: 'The server failed to delete the user.' });
                }
            )
            :
            setState({ success: false, alert: 'You do not have the delete user priviledge.' }),
    onUpdateUser: (e, props, state, setState) => {
        e.preventDefault();

        let hash;

        if (state.user_password) {
            hash = sha512(state.user_password);
        } else {
            hash = null;
        }

        console.log('state.user_admin=' + state.user_admin);

        let user = {
            user: state.user_user,
            name: state.user_name,
            phone: state.user_phone,
            email: state.user_email,
            hash: hash,
            admin: state.user_admin,
            can_delete: state.user_can_delete,
            userfilter: state.user_userfilter,
        };

        props.dao_auth.userSet(
            user,
            (resp) => {
                setState({
                    success: true,
                });

                if (props.onAddedUser)
                    props.onAddedUser();
            },
            (res) => {
                setState({
                    success: false,
                    alert: 'The update user command failed to execute on the server.',
                });
            },
        );
    },
};

/// <pure/>
const MDACSUserSettingsBottomView = (props, state, setState, mutators) => {
    let formDisabled =
        !props.current_admin && props.current_user != state.user_user;

    if (formDisabled) {
        bottom =
            <div>
                <div>No changes can be saved.</div>
                <div>You are not an <code>administrator</code> nor is this <code>you</code>.</div>
            </div>;
    } else {
        if (state.success) {
            bottom = <div>
                <Alert bsStyle="success">
                    The update was successful.
                    </Alert>
                <Button id="user_settings_save_changes_button" type="submit">
                    Save Changes
                </Button>
            </div>;
        } else {
            if (state.alert) {
                bottom = <div>
                    <Alert bsStyle="warning">
                        {state.alert}
                    </Alert>
                    <Button id="user_settings_save_changes_button" type="submit">
                        Save Changes
                    </Button>
                </div>;
            } else {
                bottom = <div>
                    <Button id="user_settings_save_changes_button" type="submit">
                        Save Changes
                    </Button>
                </div>;
            }
        }
    }
};

/// <pure/>
const MDACSUserSettingsViewCenter = (props, state, setState, mutators) => {
    return props.current_admin ?
        (
            <div>
                <ControlLabel>User Filter Expression</ControlLabel>
                <FormControl
                    id="user_settings_userfilter"
                    type="text"
                    value={state.user_userfilter ? state.user_userfilter : ''}
                    placeholder="Filter expression."
                    onChange={(e) => mutators.onUserFilterChange(e, props, state, setState)} />
                <Checkbox
                    id="user_settings_admin"
                    defaultChecked={state.user_admin}
                    onChange={(e) => mutators.onIsAdminChange(e, props, state, setState)}>Administrator</Checkbox>
                <Checkbox
                    id="user_settings_can_delete"
                    defaultChecked={state.user_can_delete}
                    onChange={(e) => mutators.onCanDeleteChange(e, props, state, setState)}>Can Delete</Checkbox>
                <div>
                    <Button
                        id="user_settings_delete_user_button"
                        onClick={(e) => mutators.onDeleteUser(props, state, setState)}>
                        Delete User
                    </Button>
                </div>
            </div>)
        :
        <div>
            Some settings have been disabled and hidden
            because you are not an <code>administrator</code>.
        </div>;
};

/// <pure/>
const MDACSUserSettingsView = (props, state, setState, mutators) => {
    if (state.delete_success) {
        return <div><Alert bsStyle="success">The user has been deleted.</Alert></div>
    }

    let bottom = MDACSUserSettingsBottomView(
        props, state, setState, mutators
    );

    let center = MDACSUserSettingsViewCenter(
        props, state, setState, mutators,
    );

    let top = (
        <form id="user_settings_form" onSubmit={(e) => mutators.onUpdateUser(e, props, state, setState)}>
            <div
                style={{ display: 'hidden' }}
                id="user_settings_username"
                data-test={props.this_username}></div>
            <FormGroup>
                <ControlLabel>Real Name</ControlLabel>
                <FormControl
                    id="user_settings_realname"
                    type="text"
                    value={state.user_name}
                    placeholder="Real name."
                    onChange={(e) => mutators.onRealNameChange(e, props, state, setState)} />
                <ControlLabel>Password</ControlLabel>
                <FormControl
                    id="user_settings_password"
                    type="text"
                    value={state.user_password}
                    placeholder="Only set to new password if changing the password."
                    onChange={(e) => mutators.onPasswordChange(e, props, state, setState)} />
                <ControlLabel>Contact Phone</ControlLabel>
                <FormControl
                    id="user_settings_phone"
                    type="text"
                    value={state.user_phone ? state.user_phone : ''}
                    placeholder="Phone."
                    onChange={(e) => mutators.onPhoneChange(e, props, state, setState)} />
                <ControlLabel>Contact E-Mail</ControlLabel>
                <FormControl
                    id="user_settings_email"
                    type="text"
                    value={state.user_email ? state.user_email : ''}
                    placeholder="E-Mail."
                    onChange={(e) => mutators.onEMailChange(e, props, state, setState)} />
                {center}
                <div>
                    {bottom}
                </div>
                <Button type="submit" id="user_settings_save_changes_button">
                    Save
                </Button>
            </FormGroup>
    </form>);

    return top;
};

class MDACSUserSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = MDACSUserSettingsInitialState(props);
    }

    render() {
        return MDACSUserSettingsView(
            this.props,
            this.state,
            this.setState.bind(this),
            MDACSUserSettingsMutators
        );
    }
}
