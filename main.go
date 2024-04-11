package main

import (
	"fmt"
)

// Variable types
/*
	- int: 32-bit signed integer
	- float32: 32-bit floating point
	- string: text
	- bool: true or false
*/

// Declaring
/*
	- var <name> <type> = <value>
		var student1 string = "John" //type is string
  	var student2 = "Jane" //type is inferred
  	X := 2 //type is inferred
*/

func main() {
	var fullname = "Do Ngoc Giang"
	var age int
	age = 21
	address := "Hanoi"
	fmt.Println("Hello, ", fullname)
	fmt.Println(age)
	fmt.Println(address)
}
