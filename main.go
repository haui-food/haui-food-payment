package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"haui-food-payment/config"
)

type Response struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func main() {
	config.LoadEnv()
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		resp := Response{
			Code:    http.StatusOK,
			Message: "Server is running",
		}

		c.JSON(http.StatusOK, resp)
	})

	port := config.ConfigApp.ServerPort

	fmt.Printf("Server is running on port %s\n", port)
	router.Run(":" + port)
}
