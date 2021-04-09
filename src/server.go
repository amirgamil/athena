package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
)

const dbPath = "./data.json"

type thought struct {
	h string
	b string
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

func getThoughts(w http.ResponseWriter, r *http.Request) {
	jsonFile, _ := os.Open(dbPath)
	json.NewEncoder(w).Encode(jsonFile)
}

func writeThought(w http.ResponseWriter, r *http.Request) {
	var thoughts []thought
	err := json.NewDecoder(r.Body).Decode(&thoughts)
	if err != nil {
		return
	}
	io.Write(w, json.Marshal(thoughts))
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
	r.Methods("GET").Path("/data").HandlerFunc(getThoughts)
	r.Methods("POST").Path("/data").HandlerFunc(writeThought)
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	log.Printf("Server listening on %s\n", srv.Addr)
	log.Fatal(srv.ListenAndServe())

}
