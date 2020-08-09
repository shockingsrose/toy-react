class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    if (/^on(.*)$/.test(name)) {
      const eventName = RegExp.$1.replace(/^[\s\S]/, (a) => a.toLowerCase());
      this.root.addEventListener(eventName, value);
    }

    if (name === 'className') {
      name = 'class';
    }

    this.root.setAttribute(name, value);
  }

  appendChild(vchild) {
    // this.root.appendChild(vchild.root);
    vchild.mountTo(this.root);
  }

  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }

  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

export class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }
  setAttribute(name, value) {
    this.props[name] = value;
    this[name] = value;
  }

  mountTo(parent) {
    let vdom = this.render();
    vdom.mountTo(parent);
  }

  appendChild(vchild) {
    this.children.push(vchild);
  }

  setState(state) {
    const merge = (state, newState) => {
      Object.keys(newState).forEach((key) => {
        if (typeof newState[key] === 'object') {
          merge(state[key], newState[key]);
        } else {
          state[key] = newState[key];
        }
      })
      return state;
    }

    this.state = this.state || {};
    merge(this.state, state);
    // console.log(this.state);
  }
}

export let ToyReact = {
  // render方法调用
  createElement(type, attributes, ...children) {
    const element = typeof type === 'string' ? new ElementWrapper(type) : new type;
    attributes && Object.keys(attributes).forEach((name) => {
      element.setAttribute(name, attributes[name])
    })

    const insertChildren = (children) => {
      children.forEach((child) => {
        if (Object.prototype.toString.call(child) === '[object Array]') {
          insertChildren(child);
        } else {
          // 其他类型的处理
          if (!(child instanceof Component) && !(child instanceof ElementWrapper && !(child instanceof TextWrapper))) {
            child = String(child);
          }
          if (typeof child === 'string') {
            child = new TextWrapper(child);
          }
          element.appendChild(child);
        }
      })
    }

    insertChildren(children);

    return element;
  },

  render(vdom, element) {
    vdom.mountTo(element);
    // element.appendChild(vdom);
  }


}