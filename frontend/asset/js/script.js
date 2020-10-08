document.addEventListener("DOMContentLoaded", function (event) {
    const WC_TALK_ANOTHER = "wc-talk-another";
    const WC_TALK_OWNER = "wc-talk-owner";

    let userId = undefined;

    // Create WebSocket connection.
    const socket = new WebSocket('ws://localhost:3000');

    // Connection opened
    socket.addEventListener('open', function (event) {
        console.log('Connected to WS Server')
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
        const msg = JSON.parse(event.data);
        // Init User Id
        if (msg.initUserId !== undefined) {
            userId = msg.initUserId;
        }

        // Create Talk
        let wcTalkClass = WC_TALK_ANOTHER;
        const isMyTalk = msg.name === userId;
        if (isMyTalk) {
            wcTalkClass = WC_TALK_OWNER;
        }
        const newTalk = document.createElement("div");
        newTalk.className = `wc-talk-container ${wcTalkClass}`;
        newTalk.innerHTML = `
            <div class='wc-talk-name'>${msg.name}</div>
            <div class='wc-talk-message'>${msg.message}</div>
            <div class='wc-talk-time'>${msg.time}</div>
        `;

        const lastTalk = getLastTalk();
        if (lastTalk != null) {
            const lastTalkName = lastTalk.getElementsByClassName("wc-talk-name")[0];
            const lastTalkTime = lastTalk.getElementsByClassName("wc-talk-time")[0];
            const newTalkTime = newTalk.getElementsByClassName("wc-talk-name")[0];
            if (lastTalkName.innerHTML === msg.name
                && lastTalkTime.innerHTML === msg.time) {
                lastTalkTime.style.display = "none";
                newTalkTime.style.display = "none";
            }
        }

        // Add Talk
        document.getElementById("wc-content").appendChild(newTalk);

        // Move down when the position located near the bottom or the talk is mine
        const wcContent = document.getElementById("wc-content");
        const isScrollNearBottom = wcContent.scrollHeight - wcContent.scrollTop - wcContent.offsetHeight < 150;
        if (isMyTalk || isScrollNearBottom) {
            wcContent.scrollTop = wcContent.scrollHeight;
        }
    });

    const sendMessage = () => {
        const input = document.getElementById("wc-input");
        if (input.value == null || input.value.length === 0) {
            return;
        }

        const data = {
            name: userId,
            message: input.value
        };

        // Send message
        socket.send(JSON.stringify(data));
        input.value = "";
    };

    const getLastTalk = () => {
        const talkList = document.getElementsByClassName("wc-talk-container");
        return talkList[talkList.length - 1];
    }

    // Event
    document.getElementById("wc-input").addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("wc-submit").click();
        }
    });

    document.getElementById("wc-submit").addEventListener("click", function (event) {
        event.preventDefault();
        sendMessage();
    });

    document.getElementById("wc-content").addEventListener("scroll", function (event) {
        const locationPercentage =
            Math.round(document.getElementById("wc-content").scrollTop /
                (document.getElementById("wc-content").scrollHeight - document.getElementById("wc-content").offsetHeight)
                * 100);

        console.log(locationPercentage);
    });
});