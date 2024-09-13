import "rxjs/add/operator/share";
import "rxjs/add/observable/of";
import { Attachment, Message, User } from "botframework-directlinejs";
import { Observable } from "rxjs/Observable";
import MockAdapter from "./mockadapter";
import { uuidv4 } from "@microsoft/omnichannel-chat-sdk";
import { postEchoActivity } from "./utils/chatAdapterUtils";

const customerUser: User = {
    id: "usedId",
    name: "User",
    role: "user"
};

const botUser: User = {
    id: "botId",
    name: "Bot",
    role: "bot"
};

export class DemoChatAdapter extends MockAdapter {
    constructor() {
        super();

        setTimeout(() => {
            this.postSystemMessageActivity("You're currently using a demo.", 0);
            this.postBotMessageActivity("Type `/help` to learn more", undefined, 0); // send init message from bot
        }, 1000);
    }

    private postBotCommandsActivity(delay = 1000) {
        this.postBotAttachmentActivity([{
            contentType: "application/vnd.microsoft.card.thumbnail",
            content: {
                buttons: [
                    {
                        title: "Send system message",
                        type: "imBack",
                        value: "send system message"
                    },
                    {
                        title: "Send typing",
                        type: "imBack",
                        value: "send typing"
                    },
                    {
                        title: "Send bot message",
                        type: "imBack",
                        value: "send bot message"
                    }
                ],
                title: "Commands"
            }
        }], delay);
    }

    private postBotMessageActivity(text: string, tags = "", delay = 1000) {
        setTimeout(() => {
            this.activityObserver?.next({
                id: uuidv4(),
                from: {
                    ...botUser
                },
                text,
                type: "message",
                channelData: {
                    tags
                }
            });
        }, delay);
    }

    private postSystemMessageActivity(text: string, delay = 1000) {
        this.postBotMessageActivity(text, "system", delay);
    }

    private postBotTypingActivity(delay = 1000) {
        setTimeout(() => {
            this.activityObserver?.next({
                id: uuidv4(),
                from: {
                    ...botUser
                },
                type: "typing"
            });
        }, delay);
    }

    private postBotAttachmentActivity(attachments: Attachment[] = [], delay = 1000) {
        setTimeout(() => {
            this.activityObserver?.next({
                id: uuidv4(),
                from: {
                    ...botUser
                },
                attachments,
                type: "message",
            });
        }, delay);
    }

    public postActivity(activity: Message): Observable<string> {
        if (activity) {
            postEchoActivity(this.activityObserver, activity, customerUser);

            if (activity.text) {
                switch(true) {
                    case activity.text === "/help":
                        this.postBotCommandsActivity();
                        break;
                    case activity.text === "send system message":
                        this.postSystemMessageActivity("Contoso has joined the chat.");
                        break;
                    case activity.text === "send typing":
                        this.postBotTypingActivity();
                        break;
                    case activity.text === "send attachment":
                        this.postBotAttachmentActivity([{
                            contentType: "image/jpeg", 
                            name: "600x400.jpg", 
                            contentUrl: "https://raw.githubusercontent.com/microsoft/omnichannel-chat-sdk/e7e75d4ede351e1cf2e52f13860d2284848c4af0/playwright/public/images/600x400.jpg"}]);
                        break;
                    case activity.text === "send bot message":
                        this.postBotMessageActivity("Hi, how can I help you?");
                        break;
                    case activity.text === "/card signin":
                        this.postBotAttachmentActivity([{
                            contentType: "application/vnd.microsoft.card.signin",
                            content: {
                                text: "Please login",
                                buttons: [
                                    {
                                        type: "signin",
                                        title: "Signin",
                                        value: "https://login.live.com/"
                                    }
                                ]
                            }
                        }]);
                        break;
                    case activity.text === "/card hero":
                        this.postBotAttachmentActivity([{
                            contentType: "application/vnd.microsoft.card.hero",
                            content: {
                                buttons: [
                                    {
                                        title: "Bellevue",
                                        type: "imBack",
                                        value: "Bellevue"
                                    },
                                    {
                                        title: "Redmond",
                                        type: "imBack",
                                        value: "Redmond"
                                    },
                                    {
                                        title: "Seattle",
                                        type: "imBack",
                                        value: "Seattle"
                                    }
                                ],
                                title: "Choose your location"
                            }
                        }]);
                        break;
                    case activity.text === "/card thumbnail":
                        this.postBotAttachmentActivity([{
                            contentType: "application/vnd.microsoft.card.thumbnail",
                            content: {
                                title: "Microsoft",
                                subtitle: "Our mission is to empower every person and every organization on the planet to achieve more.",
                                text: "Microsoft creates platforms and tools powered by AI to deliver innovative solutions that meet the evolving needs of our customers. The technology company is committed to making AI available broadly and doing so responsibly, with a mission to empower every person and every organization on the planet to achieve more.",
                                images: [{
                                    alt: "Microsoft logo",
                                    url: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31" // logo from https://microsoft.com
                                }],
                                buttons: [
                                    {
                                        title: "Learn more",
                                        type: "openUrl",
                                        value: "https://www.microsoft.com/"
                                    }
                                ]
                            }
                        }]);
                        break;
                    case activity.text.startsWith("/bot "):
                        this.postBotMessageActivity(activity.text.substring(5));
                        break;
                    case activity.text.startsWith("/system "):
                        this.postSystemMessageActivity(activity.text.substring(8));
                        break;
                }
            }
        }

        return Observable.of(activity.id || "");
    }
}