import { sendNotification } from "."

export const failedTxMessage = (txType: string, token: string, error: any) => {

    error = JSON.parse(error)

    let message = `Failed to broadcast a ${txType}`
    message += `\n\n\ Token: https://etherscan.io/address/${token}`
    message += `\n\n Error reason`
    message += `\n ${error.code} : ${error.reason}`
    message += `\n\n\n Transaction Data`
    message += `\n ${error.args ? JSON.stringify(error.args) : null}`

    return message
}


export const tokenTaxMessage = (token: string, buyTax: number, sellTax: number) => {
    let message = "Token Tax is more than our minimum"
    message += `\n\nToken`
    message += `\n${token}`
    message += `\n\nBuy Tax`
    message += `\n${buyTax}`
    message += `\n\nSell Tax`
    message += `\n${sellTax}`
    message += `\n\nhttps://honeypot.is/ethereum?address=${token}`

    return message
}

export const sendTaxMessage = async (token: string, buyTax: number, sellTax: number) => {
    await sendNotification(tokenTaxMessage(token, buyTax, sellTax))
}