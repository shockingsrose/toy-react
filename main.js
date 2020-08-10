import { ToyReact, Component } from './toyReact.js';

window.Square = {};

class Square extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    }
  }

  render() {
    window.Square[this.props.value] = this;
    return (
      <button className="square" onClick={() => this.setState({ value: 'X' })}>
        {this.state.value || ''}
      </button>
    );
  }
}

class Board extends Component {
  renderSquare(i) {
    return (
      <Square value={i} />
    );
  }

  render() {
    return (
      <div>
        {/* <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div> */}
        <div className="board-row">
          {this.renderSquare(1)}
          {this.renderSquare(2)}
          {this.renderSquare(3)}
          {this.renderSquare(4)}
        </div>
      </div>
    );
  }
}

// class MyComponent extends Component {
//   render() {
//     return <div id="1">
//       MyComponent
//       {this.children}
//     </div>
//   }
// }

// let a = <MyComponent>
//   <MyComponent>
//   </MyComponent>
//   <span>213</span>
// </MyComponent>

// console.log(a);

ToyReact.render(
  <Board></Board>,
  // a,
  document.body
);