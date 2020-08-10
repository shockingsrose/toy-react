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
    // vchild可能是Component,可能是ElementWrapper包裹的原生element
    const range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    vchild.mountTo(range);
  }

  mountTo(range) {
    // console.log('elementWrapper mountTo');
    // parent.appendChild(this.root);

    range.insertNode(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }

  mountTo(range) {
    range.insertNode(this.root);
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

  mountTo(range) {
    // console.log('Component mountTo');
    this.range = range;
    this.update();
  }

  update() {
    const placeholder = document.createComment('placeholder');
    const rangeContainer = this.range.startContainer;
    const endOffset = this.range.endOffset;
    const range = document.createRange();
    range.setStart(rangeContainer, endOffset);
    range.setEnd(rangeContainer, endOffset);
    range.insertNode(placeholder);

    this.range.deleteContents();
    let vdom = this.render();
    vdom.mountTo(this.range);
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

    this.update();
    // console.log(this.state);
  }
}

export let ToyReact = {
  // render方法调用
  createElement(type, attributes, ...children) {
    // console.log('createElement');
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
    const range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vdom.mountTo(range);
  }


}