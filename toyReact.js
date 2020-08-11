import merge from './utils/merge';
class ElementWrapper {
  constructor(type) {
    this.type = type;
    this.props = Object.create(null);
    this.children = [];
    // this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    // if (/^on(.*)$/.test(name)) {
    //   const eventName = RegExp.$1.replace(/^[\s\S]/, (a) => a.toLowerCase());
    //   this.root.addEventListener(eventName, value);
    // }

    // if (name === 'className') {
    //   name = 'class';
    // }

    this.props[name] = value;
    // this.root.setAttribute(name, value);
  }

  appendChild(vchild) {
    // vchild可能是Component,可能是ElementWrapper包裹的原生element
    // const range = document.createRange();
    // if (this.root.children.length) {
    //   range.setStartAfter(this.root.lastChild);
    //   range.setEndAfter(this.root.lastChild);
    // } else {
    //   range.setStart(this.root, 0);
    //   range.setEnd(this.root, 0);
    // }
    // vchild.mountTo(range);
    this.children.push(vchild);
  }

  mountTo(range) {
    // console.log('elementWrapper mountTo');
    // parent.appendChild(this.root);
    this.range = range;
    range.deleteContents();
    const element = document.createElement(this.type);

    for (let name in this.props) {
      const value = this.props[name];

      if (/^on(.*)$/.test(name)) {
        const eventName = RegExp.$1.replace(/^[\s\S]/, (a) => a.toLowerCase());
        element.addEventListener(eventName, value);
        break;
      }

      if (name === 'className') {
        name = 'class';
      }

      element.setAttribute(name, value);
    }

    this.children.forEach((child) => {
      const childRange = document.createRange();
      if (element.children.length) {
        childRange.setStartAfter(element.lastChild);
        childRange.setEndAfter(element.lastChild);
      } else {
        childRange.setStart(element, 0);
        childRange.setEnd(element, 0);
      }
      child.mountTo(childRange);

    })

    range.insertNode(element);
  }
}

class TextWrapper {
  constructor(content) {
    this.type = "#text";
    this.props = Object.create(null);
    this.children = [];
    this.root = document.createTextNode(content);
  }

  mountTo(range) {
    this.range = range;
    range.insertNode(this.root);
  }
}

export class Component {
  get type() {
    return this.constructor.name;
  }
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }
  setAttribute(name, value) {
    this.props[name] = value;
    // this[name] = value;
  }

  mountTo(range) {
    // console.log('Component mountTo');
    this.range = range;
    this.update();
  }

  update() {
    // todo 改为虚dom，为什么不需要这段代码了
    // 因为直接把整个dom树都更新了
    // const placeholder = document.createComment('placeholder');
    // const rangeContainer = this.range.startContainer;
    // const endOffset = this.range.endOffset;
    // const range = document.createRange();
    // range.setStart(rangeContainer, endOffset);
    // range.setEnd(rangeContainer, endOffset);
    // range.insertNode(placeholder);

    // this.range.deleteContents();
    let vdom = this.render();
    if (this.vdom) {
      // 查看当前节点是否相同 (type, props)
      const isSameNode = (node1, node2) => {
        // compare type
        if (node1.type !== node2.type) {
          return false;
        }

        // compare props
        if (Object.keys(node1.props).length !== Object.keys(node2.props).length) {
          return false;
        }
        for (const key in node1.props) {
          const value1 = node1.props[key];
          const value2 = node2.props[key];
          if (typeof value1 === 'function'
            && typeof value2 === 'function'
            && value1.toString() === value2.toString()) {
            continue;
          }


          if (node1.props[key] !== node2.props[key]) {
            return false;
          }
        }
        // if (Object.keys(node1.props).find((key) => node1.props[key] !== node2.props[key])) {
        //   return false;
        // }

        return true;
      };

      // 从树的最外层开始递归 查看整个树是否相同
      const isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2)) {
          return false;
        }

        if (node1.children.length !== node2.children.length) {
          return false;
        }

        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameTree(node1.children[i], node2.children[i])) {
            return false;
          }
        }

        return true;
      };

      const replace = (newTree, oldTree) => {
        if (isSameTree(newTree, oldTree)) {
          return;
        }

        if (!isSameNode(newTree, oldTree)) {
          // 不理解
          newTree.mountTo(oldTree.range);
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i]);
          }
        }
      }

      if (isSameTree(vdom, this.vdom)) {
        return;
      }

      // 如果根节点不同，直接重新渲染
      if (!isSameNode(vdom, this.vdom)) {
        vdom.mountTo(this.vdom.range);
      } else {
        // diff算法
        console.log(this.vdom);
        console.log(vdom);
        replace(vdom, this.vdom);
      }

    } else {// 如果this.vdom不存在（初始化），直接渲染
      vdom.mountTo(this.range);
    }
    this.vdom = vdom;
  }

  appendChild(vchild) {
    this.children.push(vchild);
  }

  setState(state) {
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
          if (child === null || child === void 0) {
            child = '';
          }
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