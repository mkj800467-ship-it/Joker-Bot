// plugins/signup.js
// ✧ THE JOKER & ITACHI - زر التسجيل التفاعلي 📝

import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {

    const contentMsg = {
        "interactiveMessage": {
            "header": {
                "title": "❄️ JOKER & ITACHI BOT"
            },
            "body": {
                "text": "https://github.com/mkj800467-ship-it"
            },
            "nativeFlowMessage": {
                "buttons": [
                    {
                        "name": "inapp_signup",
                        "buttonParamsJson": "{}"
                    }
                ],
                "messageParamsJson": "{}"
            }
        }
    }

    const webMsg = proto.Message.fromObject(contentMsg)
    const waMsg = generateWAMessageFromContent(m.chat, webMsg, {
        userJid: conn.user.jid,
        quoted: {
            "key": {
                "remoteJid": m.chat,
                "fromMe": false,
                "id": m.key.id,
                "participant": m.sender
            },
            "message": {
                "extendedTextMessage": {
                    "text": "❄️",
                    "previewType": "NONE",
                    "contextInfo": {
                        "stanzaId": m.key.id,
                        "participant": m.sender,
                        "quotedMessage": {
                            "interactiveMessage": {
                                "header": {
                                    "title": "❄️ JOKER & ITACHI BOT"
                                },
                                "body": {
                                    "text": "https://github.com/mkj800467-ship-it"
                                },
                                "nativeFlowMessage": {
                                    "buttons": [
                                        {
                                           "name": "inapp_signup",
                                           "buttonParamsJson": "{}"
                                        }
                                    ],
                                    "messageParamsJson": "{}"
                                }
                            }
                        },
                        "expiration": 7776000,
                        "disappearingMode": {
                            "initiator": "CHANGED_IN_CHAT",
                            "trigger": "UNKNOWN"
                        },
                        "quotedType": "EXPLICIT"
                    },
                    "inviteLinkGroupTypeV2": "DEFAULT"
                },
                "messageContextInfo": {
                    "messageSecret": "8aMLB+/F6SKPzZ/uxBU9QeUeFhRtUtqDTrhLRffJn4w=",
                    "limitSharingV2": {
                        "sharingLimited": true,
                        "trigger": "CHAT_SETTING",
                        "limitSharingSettingTimestamp": Date.now().toString(),
                        "initiatedByMe": false
                    }
                }
            },
            "messageTimestamp": Math.floor(Date.now() / 1000).toString(),
            "broadcast": false,
            "pushName": "❄️ JOKER & ITACHI",
            "verifiedBizName": "❄️ JOKER & ITACHI"
        }
    })

    await conn.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id })
}

handler.help = ['تسجيل']
handler.tags = ['main']
handler.command = /^(تسجيل|signup|register)$/i

export default handler
