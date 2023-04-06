package com.dreamdisciples.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class DreamDisciplesApplication

fun main(args: Array<String>) {
	runApplication<DreamDisciplesApplication>(*args)
}

//fun main() {
//	for (i in 0..100) {
//		println("$i : ${(-(1.0 - (1.0 / (1 - i / 100.0))) * 100).toInt()}")
//	}
//}
