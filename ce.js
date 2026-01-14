(function() {
    "use strict";
    window.body = document.body;

    window.editElement = window.ee = (node, opts, opts2) => {
        if (!(node instanceof HTMLElement))
            throw new Error("node needs to be of type HTMLElement");
        if (!opts) return node;

        if (opts instanceof HTMLElement) {
            const parent = { parent: opts };
            opts = typeof opts2 == 'object' ? Object.assign(parent, opts2) : parent;
        }

        for (let key in opts) {
            let data = opts[key];

            switch (key) {
                case "parent": {
                    data.appendChild(node);
                    break;
                }
                case "style": {
                    Object.keys(data).map(key => node.style[key] = data[key]);
                    break;
                }
                case "events": {
                    Object.keys(data).map(key => node.addEventListener(key, data[key]));
                    break;
                }
                case "data": {
                    Object.keys(data).map(key => node.dataset[key] = data[key]);
                    break;
                }
                case "append":
                    if (!Array.isArray(data)) data = [data];
                    node.append(...data.map(data => typeof data === "string" ? ct(data) : data));
                    break;
                case "textContent":
                case "innerHTML":
                    node[key] = data;
                    break;
                default: {
                    node.setAttribute(key, data);
                }
            }

        }

        return node;
    };

    window.createElement = window.ce = (tag, ...argv) => {
        const match = tag.match(/[.#]?[^.#]+/g);
        tag = match.shift();
        const node = document.createElement(tag);

        const ids = match.filter(token => /^#/.test(token));
        if (ids.length > 1)
            throw new Error("an element should never have more than one ID assigned.");
        if (ids.length > 0)
            node.id = ids[0].slice(1);

        match.filter(token => /^\./.test(token)).forEach(c => {
            node.classList.add(c.slice(1));
        });

        return editElement(node, ...argv);
    };

    window.createText = window.ct = (text, parent) => {
        if (text instanceof HTMLElement) {
            parent = text;
            text = "";
        }
        text = text.split(/(?:\r\n|\n)/);
        if (text.length == 1) {
            const n = document.createTextNode(text.shift());
            if (parent) parent.appendChild(n);
            return n;
        }
        let p;
        const nodes = [];
        const texts = [];
        while ((p = text.shift()) !== undefined) {
            if (p !== "") {
                const t = document.createTextNode(p);
                nodes.push(t);
                texts.push(t);
            }
            if (text.length > 0) nodes.push(ce("br"));
        }
        if (parent) nodes.map(n => parent.appendChild(n));

        return texts.length > 1 ? texts : texts.shift();
    };

    window.seeder = seed => {
        return () => {
            seed *= 1103515245 + 12345;
            seed--;
            return (seed %= Number.MAX_SAFE_INTEGER) / Number.MAX_SAFE_INTEGER;
        };
    };

    Array.prototype.unique = function() {
        const o = [];
        this.map(x => o.includes(x) ? x : o.push(x));
        return o;
    };

    Array.prototype.sortAsc = function() {
        return this.sort((a, b) => a - b);
    };
    Array.prototype.sortDesc = function() {
        return this.sort((a, b) => b - a);
    };

    Array.prototype.shuffle = function() {
        const newArray = [], offsets = [...Array(this.length)].map((x, i) => i);
        while (offsets.length > 0)
            newArray.push(this[offsets.splice(Math.floor(Math.random() * offsets.length), 1).shift()]);
        return newArray;
    };

    Array.prototype.seededShuffle = function(x) {
        const newArray = [], offsets = [...Array(this.length)].map((x, i) => i);
        const r = seeder(x);
        r();
        while (offsets.length > 0)
            newArray.push(this[offsets.splice(Math.floor(r() * offsets.length), 1).shift()]);
        return newArray;
    };

    window.textWalker = (node, callback) => {
        const nodes = [node];
        while (nodes.length > 0) {
            node = nodes.shift();
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];
                if (child.nodeType === child.TEXT_NODE) {
                    callback(child);
                } else {
                    nodes.push(child);
                }
            }
        }
    };

    window.hookProperty = o => {
        Object.defineProperty(o.obj, o.name, {
            get: o.get,
            set: o.set
        });

    };

    HTMLElement.prototype.offsetTo = function(offsetNode) {
        let node = this;

        const offset = {
            x: node.offsetLeft,
            y: node.offsetTop
        };


        while ((node = node.offsetParent) != offsetNode && node != null) {
            offset.x += node.offsetLeft;
            offset.y += node.offsetTop;
        }

        return offset;
    };

})();
