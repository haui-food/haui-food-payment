// config.go
package config

import (
	"os"

	"github.com/joho/godotenv"
)

type ConfigApplication struct {
	ServerPort string
}

var ConfigApp ConfigApplication

func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	ConfigApp.ServerPort = port
}
