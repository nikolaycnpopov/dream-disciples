package com.dreamdisciples.backend

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseBody
import java.io.File

@Controller
@CrossOrigin(origins = [ "*" ])
class HelloController {

    @Synchronized
    @PostMapping("/")
    @ResponseBody
    fun hello(@RequestBody update: Update): Response {
        logger.info("hello <<<<< $update")

        var limit: Long
        var debt: Long
        var includeDebit: Long
        var includeCash: Long
        var exclude: Long

        val file = File("balance.txt")
        if (!file.exists()) {
            file.createNewFile()

            limit = 0L
            debt = 0L
            includeDebit = 0L
            includeCash = 0L
            exclude = 0L
        } else {
            val lines = file.readText().split("\n").iterator()

            limit = lines.next().toLong()
            debt = lines.next().toLong()
            includeDebit = lines.next().toLong()
            includeCash = lines.next().toLong()
            exclude = lines.next().toLong()
        }

        val text = update.message.text

        val parsed = try {
            text.substring(1).replace(" ", "").replace(".", "").replace(",", "").toLong()
        } catch (e: Exception) {
            // ignored
        }

        val amount = if (parsed is Long) {
            parsed
        } else {
            0L
        }

        // сброс
        if (text.startsWith("%")) {
            limit = 0
            debt = 0
            includeDebit = 0
            includeCash = 0
            exclude = 0
        }

        // добавить лимит
        if (text.startsWith("$")) {
            limit += amount
        }

        // текущая задолженность
        if (text.startsWith("!")) {
            debt = amount
        }

        // добавить расход с дебетовки
        if (text.startsWith("+")) {
            includeDebit += amount
        }

        // добавить расход с дебетовки
        if (text.startsWith("#")) {
            includeCash += amount
        }

        // добавить учтенный извне расход с кредитки
        if (text.startsWith("-")) {
            exclude += amount
        }

        // подсчёт баланса

        val available = limit - debt - includeDebit - includeCash + exclude
        val spent = debt + includeDebit + includeCash - exclude
        val spentCredit = spent - includeDebit - includeCash

        val balance =
            "Available: ${available.formatted()} of limit ${limit.formatted()}\n" +
                    "Spent: ${spent.formatted()} total; ${spentCredit.formatted()} credit, ${includeDebit.formatted()} debit, ${includeCash.formatted()} cash.\n" +
                    "Excluded: ${exclude.formatted()}\n" +
                    "Debt: ${debt.formatted()}"

        logger.info(balance)

        // сохранение в файл
        file.writeText("" + limit + "\n" + debt + "\n" + includeDebit + "\n" + includeCash + "\n" + exclude)

        return Response(text = balance)
    }

    companion object {

        private val logger = LoggerFactory.getLogger(BattleController::class.java)

    }

}

private fun Long.formatted(): String {
    var value = this.toString()

    if (value.length < 3) {
        return value
    }

    value = value.substring(0, value.length - 2) + "." + value.substring(value.length - 2)

    if (value.length > 6) { // учитывая уже добавленную точку
        value = value.substring(0, value.length - 6) + " " + value.substring(value.length - 6)
    }

    return value
}

data class Update(val message: Message)

data class Message(val text: String)

@ResponseBody
data class Response(val method: String = "sendMessage", val chat_id: String = "599817228", val text: String)
