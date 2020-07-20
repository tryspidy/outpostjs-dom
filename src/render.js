class Render {
    constructor(html, target) {
        const container = document.createElement("div");
        container.innerHTML = html;
        const newVdom = this.createVirtualDOM(container.children[0]);
        const oldVdom = this.createVirtualDOM(target);
        this.diff(newVdom, oldVdom);
    }

    parseAttrs(attrs) {
        if (attrs === undefined) return [];
        const arr = [];
        for (let i = 0; i < attrs.length; i++) {
            arr.push({
                name: attrs[i].name,
                value: attrs[i].value
            });
        }
        return arr;
    }

    replaceOrUpdate(newVdom, oldVdom) {
        if (typeof newVdom === "string") {
            if (newVdom !== oldVdom) {
                
            }
        }
        if (newVdom.tagName !== oldVdom.tagName) {
            oldVdom.el.parentNode.replaceChild(this.render(newVdom), oldVdom.el);
            return;
        }

        newVdom.attrs.forEach(newAttr => {
            let isChanged = true;
            oldVdom.attrs.forEach(oldAttr => {
                if (newAttr.name === oldAttr.name && newAttr.value === oldAttr.value) {
                    isChanged = true;
                }
            });
            if (isChanged) {
                oldVdom.el.setAttribute(newAttr.name, newAttr.value);
            }
        });
    }

    addNode(parent, newVdom) {
        parent.appendChild(this.render(newVdom));
    }

    diff(newVdom, oldVdom) {
        this.replaceOrUpdate(newVdom, oldVdom);
        for (let i = 0; i < newVdom.children.length; i++) {
            if (oldVdom.children[i] === undefined) {
                this.addNode(oldVdom.el, newVdom.children[i]);
            } else {
                this.diff(newVdom.children[i], oldVdom.children[i]);
            }
        }
    }

    render(vdom) {
        if (typeof vdom === "string") {
            return document.createTextNode(vdom);
        }
        const el = document.createElement(vdom.tagName);
        for (const attr of vdom.attrs) el.setAttribute(attr.name, attr.value);
        for (const child of vdom.children) {
            el.appendChild(this.render(child))
        }

        return el;
    }


    createVirtualDOM(el) {
        let dom = {tagName: el.tagName, attrs: this.parseAttrs(el.attributes), children: [], el: el};
        if (el.childNodes.length > 0) {
            for (let i = 0; i < el.childNodes.length; i++) {
                const child = el.childNodes[i];
                if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() === "") {
                    continue;
                }

                if (child.nodeType === Node.TEXT_NODE) {
                    dom.children.push(child.textContent);
                } else {
                    dom.children.push(this.createVirtualDOM(child));
                }
            }
        }
        return dom;
    }
}


export default Render;
