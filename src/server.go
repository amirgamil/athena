package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
)

const dbPath = "./data.json"

type thought struct {
	content string
	tags    []string
}

func ensureDataExists() {
	jsonFile, err := os.Open(dbPath)
	if err != nil {
		f, errCreating := os.Create(dbPath)
		if errCreating != nil {
			log.Fatal("Could not create database")
			return
		}
		defer f.Close()
	} else {
		defer jsonFile.Close()
	}

}

func getThought(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "yay, you tried to get a thought")
}

func writeThought(w http.ResponseWriter, r *http.Request) {

}

func index(w http.ResponseWriter, r *http.Request) {
	indexFile, err := os.Open("./static/index.html")
	if err != nil {
		io.WriteString(w, "error reading index")
		return
	}
	defer indexFile.Close()

	io.Copy(w, indexFile)
}

func main() {
	//create data.json if it doesn't exit
	ensureDataExists()

	r := mux.NewRouter()

	srv := &http.Server{
		Handler:      r,
		Addr:         "127.0.0.1:8998",
		WriteTimeout: 60 * time.Second,
		ReadTimeout:  60 * time.Second,
	}

	r.HandleFunc("/", index)
	r.Methods("GET").Path("/data").HandlerFunc(getThought)
	r.Methods("POST").Path("/data").HandlerFunc(writeThought)
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	log.Printf("Server listening on %s\n", srv.Addr)
	log.Fatal(srv.ListenAndServe())

}
