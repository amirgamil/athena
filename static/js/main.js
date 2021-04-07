const {
    Record,
    StoreOf,
    Component,
    ListOf,
} = window.Torus;

function fmtDate(date) {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// only fire fn once it hasn't been called in delay ms
const bounce = (fn, delay) => {
    let to = null;
    return (...args) => {
        const bfn = () => fn(...args);
        clearTimeout(to);
        to = setTimeout(bfn, delay);
    }
}

class Block extends Record { }

class BlockStore extends StoreOf(Block) {
    fetch() {
        return fetch('/data')
            .then(r => r.json())
            .then(data => this.reset(data.map(d => new Block(d))));
    }
    save() {
        return fetch('/data', {
            method: 'POST',
            body: JSON.stringify(this.serialize()),
        });
    }
}

class BlockItem extends Component {
    init(record, removeCallback) {
        
    }
    
    isCollapsed() {

    }
    setCollapsed(c) {

    }
    handleInput(prop, evt) {
        
    }
    handleKeydown(evt) {
        
    }
    handleToggleCollapse() {
   
    }
    handleRemove() {

    }

    compose({h, b}) {
        
    }
}

class BlockList extends ListOf(BlockItem) {
    compose() {
        return jdom`<div class="block-list">
            ${this.nodes}
        </div>`;
    }
}

class App extends Component {
    init() {
       
    }
    remove() {
        super.remove();
        
    }

    compose() {
       return jdom 
        `<main class="app">
            <header>
                <h1>Athena</h1>
                <button class = "add">
                +
                </button>
                <p class="sub">
                    Last saved soon
                </p>
            </header>
            
       
            <footer>
                <p>
                    Built with love by 
                    <a href = "http://amirbolous.com">
                        Amir
                    </a>
                </p>
            </footer>
       </main>`;
    }
}

const app = new App();
document.body.appendChild(app.node);
