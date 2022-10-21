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