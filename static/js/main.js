const {
    Record,
    StoreOf,
    Component,
    ListOf,
} = window.Torus;

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

function fmtDate(date) {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function relativeDate(date) {
    const delta = (new Date() - date) / 1000;
    if (delta < 60) {
        return '< 1 min ago';
    } else if (delta < 3600) {
        return `${~~(delta / 60)} min ago`;
    } else if (delta < 86400) {
        return `${~~(delta / 3600)} hr ago`;
    } else if (delta < 86400 * 2) {
        return 'yesterday';
    } else if (delta < 86400 * 3) {
        return '2 days ago';
    } else {
        return date.toLocaleDateString() + ' ' + formatTime(date);
    }
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
        return fetch("/data")
            .then(r => r.json())
            .then(data => {
                //assign everything to blocks
                this.reset(data.map(thought => new Thought(thought)));
            });
    }

    save() {
        return fetch("/data", {
            method: "POST",
            body: JSON.stringify(this.serialize()),
        });
    }
}

class ThoughtItem extends Component {
    init(record, removeCallback) {
        this.isCollapsed = true;

		const tags = record.data.T;
		let buildString = "";
		if (tags != null) {
			tags.forEach((tag, _) => {
				buildString += "#" + tag + " ";
			});
		}
		
		this.tagString = buildString;
        this.handleTitleInput = evt => this.handleInput("h", evt);
        this.handleBodyInput = evt => this.handleInput("b", evt);
		this.handleTagInput = this.handleTagInput.bind(this);
        this.removeCallback = removeCallback;
        this.show = this.show.bind(this);
        this.setCollapsed = this.setCollapsed.bind(this);
		this.handleTagKeydown = this.handleTagKeydown.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.bind(record, data => this.render(data));
    }

    show() {
        this.isCollapsed = false;
        this.render();
    }
    setCollapsed() {
        this.isCollapsed = true;
        this.render();
    }

	handleTagInput(evt) {
		this.tagString = evt.target.value;
		this.render();
	}

    handleInput(prop, evt) {
        this.record.update({[prop]: evt.target.value});
    }

	handleTagKeydown(evt) {
		if (evt.key === 'Enter') {
			evt.target.blur();
			let tags = this.tagString.split('').join('').split('#');
			tags = tags.length > 1 ? tags.slice(1) : [];
			this.record.update({t: tags})
		}
	}

    handleKeydown(evt) {
        if (evt.key === 'Tab') {
            //stop what would have happened so we can artifically simulate tab
            evt.preventDefault();
            const idx = evt.target.selectionStart;
            if (idx != null) {
                const text = this.record.get("b").substring(0, idx) + "    " + this.record.get("b").substring(idx + 1);
                this.record.update({b: text});
            }
        }
    }

    handleRemove() {
        this.removeCallback(this.record);
    }

    compose({h, b, t}) {
        return jdom`<div class = "block>
                <div class="block-heading">
                    <input class = "title"
                    value="${h}"
                    placeholder="thought"
                    oninput="${this.handleTitleInput}"/>
                    <div class = "button-bar">
                        <button class="toggle"
                        onclick="${() => this.isCollapsed ? this.show() : this.setCollapsed()}">
                        ${this.isCollapsed ? "↓" : "→"}
                        </button>
                        <button class="close"
                        onclick="${this.handleRemove}">
                        X
                        </button>
                    </div>
                </div>
				<input class = "tags"
					placeholder = "#tags"
					oninput="${this.handleTagInput}"
					onkeydown="${this.handleTagKeydown}"
					value="${this.tagString}"/>
                ${this.isCollapsed ? null : jdom`
				<div class="block-body">
					<textarea class="thought"
					placeholder="Enter your thought here"
					value="${b}"
					onkeydown="${this.handleKeydown}"
					oninput="${this.handleBodyInput}" />
					<div class = "p-heights ${b.endsWith('\n') ? 'endline' : ''}">${b}</div>
            	</div>`}
            </div>`;
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
       	this.list  = new ThoughtList(this.store, (data) => this.store.remove(data));
       	this.date = new Date();
       	this.save = bounce(this.save.bind(this), 800);
	   	this._loading = false;
	   	this._lastSaved = new Date();
       	this.store.fetch()
                .then(() => {
                    this.bind(this.store, this.save);
                    this.render();
                })
	   	this._interval = setInterval(this.render.bind(this), 60 * 1000);

    }

    save() {
		if (this._lastSaved === new Date()) {
			return;
		}
		this._loading = true;
		this.render();
        this.store.save()
				.then(() => {
					this._loading = false;
					this._lastSaved = new Date();
				}).catch(error => {
					console.log(error);
				}).finally(() => {
					setTimeout(() => {
						this.render();
						// adding artificial delay makes this easy to see as a user.
					}, 500);
				});
    }

    remove() {
        super.remove();
		clearInterval(this._interval);
    }

    compose() {
		const hour = new Date().getHours();
		if (hour > 19 || hour < 7) {
			document.body.classList.add('dark');
			document.documentElement.style.color = '#222';
		} else {
			document.body.classList.remove('dark');
			document.documentElement.style.color = '#fafafa';
		}
		return jdom
        `<main class="app" oninput="${this.save}">
            <header>
                <div class="header-left>
                <h1>${fmtDate(this.date)}</h1>
                <p class="sub">
                    ${this._loading ? "Saving..." : relativeDate(this._lastSaved)}
                </p>
                </div>
                <div class = "header-right">
                    <button class = "add" onclick=${() => {
                        this.store.create({h: '', b: '', t: []});
                        console.log(this.store.summarize());
                    }}>
                    +
                    </button>
                </div>

            </header>
            ${this.list.node}
            <footer>
                <p>
                    Built with love by
                    <a href = "http://amirbolous.com">
                        Amir
                    </a> and inspired by 
					<a href = "https://github.com/thesephist/pico">
						Pico
					</a>
                </p>
            </footer>
       </main>`;
    }
}

const app = new App();
document.body.appendChild(app.node);
