class Test extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div>
                <h1>Hello</h1>
                <h2>World</h2>
            </div>
        );
    }
}

ReactDOM.render(
    <Test />,
    document.getElementById('root')
);