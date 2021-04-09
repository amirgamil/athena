package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
)

const dbPath = "./data.json"

type thought struct {
	H string `json:"h"`
	B string `json:"b"`
}

func check(e error) {
	if e != nil {
		panic(e)
	}
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
	var thoughts []thought
	jsonFile, _ := os.Open(dbPath)
	byteArray, _ := ioutil.ReadAll(jsonFile)
	json.Unmarshal(byteArray, &thoughts)
	for _, smt := range thoughts {
		fmt.Println(smt.H)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(thoughts)
}

func writeThoughts(w http.ResponseWriter, r *http.Request) {
	var thoughts []thought
	err := json.NewDecoder(r.Body).Decode(&thoughts)
	check(err)
	data, err := json.MarshalIndent(thoughts, "", "")
	check(err)
	ioutil.WriteFile(dbPath, data, 0644)
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
	r.Methods("POST").Path("/data").HandlerFunc(writeThoughts)
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	log.Printf("Server listening on %s\n", srv.Addr)
	log.Fatal(srv.ListenAndServe())

}
