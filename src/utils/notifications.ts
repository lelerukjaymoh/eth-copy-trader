import { sendNotification } from "../telegram";

const sellingNotification = async (token: any, target: any) => {
  let message = `${target} is selling`;
  message += "\n\n===============================";
  message += `\n\n Token: ${token}`;

  await sendNotification(message);
};

const sendTgNotification = async (
  target: string,
  targetTxhash: string,
  ourTxHash: string,
  txType: string,
  token: string
) => {
  let message = `\n\n Target Transaction:`;
  message += `\n\n Txn Type: ${txType}`;
  message += "\n--------------------";
  message += `\n\nTarget:`;
  message += `\nhttps://etherscan.io/address/${target}`;
  message += `\n\nTarget Txn Link: `;
  message += `\nhttps://etherscan.io/tx/${targetTxhash}`;
  message += "\n\n-------------";
  message += `\n\n Our Txn Link: `;
  message += `\nhttps://etherscan.io/tx/${ourTxHash}`;
  message += `\n\nToken: `;
  message += `${token.toLowerCase()}`;

  await sendNotification(message);
};

export { sellingNotification, sendTgNotification };
