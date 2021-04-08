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

//smallest unit of mutuable data
class Thought extends Record { }

//store for handling ordered list of records
class ThoughtStore extends StoreOf(Thought) {
    fetch() {
        return fetch("./data")
            .then(r => r.json())
            .then(data => {
                //assign everything to blocks
                this.reset(data.map(thought => new this.Thought(thought)));
            });
    }

    save() {
        return fetch("./data", {
            method: "POST",
            body: JSON.stringify(this.seralize()),
        });
    }
}

class ThoughtItem extends Component {
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

    compose({h}) {
        return jdom`
                <div class="head">
                    <textarea>
                    </textarea>
                </div>
        `
    }
}

class ThoughtList extends ListOf(ThoughtItem) {
    compose() {
        return jdom`<div class="thoughts">
            ${this.nodes}
        </div>`;
    }
}

class App extends Component {
    init() {
       this.store = new ThoughtStore();
       this.list  = new ThoughtList(this.store);
        
       this.save = bounce(this.save.bind(this), 800);
       this.store.fetch()
                .then(() => {
                    this.bind(this.store, this.save);
                    this.render();
                })

    }

    save() {
        //do stuff
    }

    remove() {
        super.remove();
    }

    compose() {
       return jdom 
        `<main class="app">
            <header>
                <h1>Athena</h1>
                <button class = "add" onclick=${() => this.store.create({h: ''})}>
                +
                </button>
                <p class="sub">
                    Last saved soon
                </p>
            </header>
            ${this.list.nodes}
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
