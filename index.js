import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import got from "got";

let config = {};
let current = {};

console.log("Trying to login with email", process.env.EMAIL);

const api = got.extend({
  prefixUrl: "https://apptoogoodtogo.com/api/",
  headers: {
    "User-Agent":
      "TooGoodToGo/21.9.0 (813) (iPhone/iPhone 7 (GSM); iOS 15.1; Scale/2.00)",
    "Content-Type": "application/json",
    Accept: "",
    "Accept-Language": "en-US",
    "Accept-Encoding": "gzip",
  },
  responseType: "json",
  resolveBodyOnly: true,
  Cookie:
    "datadome=TL~c-lKDatXxxxfDkDWnE_VH.CbnJao7smnwLPfO.cq-yamY5zApRlWl3cUiYEgwofluViQKTKZ~NO4-i5Uk6i~NXd9tSHBlQGKKCIPBYRzXhZv~_Ars~SjwNxEBIDo",
});

main();

async function main() {
  const response = await api.post("auth/v3/authByEmail", {
    json: {
      device_type: "IOS",
      email: process.env.EMAIL,
    },
  });
  console.log(response);

  if (!response.polling_id) {
    console.error("Did not get a polling_id");
    return;
  }

  await new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.on("data", resolve);
  });

  const pollingResponse = await api.post("auth/v3/authByRequestPollingId", {
    json: {
      device_type: "IOS",
      email: process.env.email,
      request_polling_id: response.polling_id,
    },
  });

  if (!pollingResponse) {
    console.error("Did not get an access token");
    return;
  }

  config.userId = pollingResponse.startup_data.user.user_id;
  config.accessToken = pollingResponse.access_token;
  config.refreshToken = pollingResponse.refresh_token;

  console.log("You are now successfully logged in!");

  console.log(config);

  //TODO TGTG made some sort of datadome protection.... need to find a way around this...
  // setInterval(() => {
  //   const items = api
  //     .post("item/v7/", {
  //       json: {
  //         favorites_only: true,
  //         origin: {
  //           latitude: 0,
  //           longitude: 0,
  //         },
  //         radius: 200,
  //         user_id: config.userId,
  //       },
  //       headers: {
  //         Authorization: `Bearer ${config.accessToken}`,
  //       },
  //     })
  //     .then((items) => {
  //       var json = JSON.parse(items.body);
  //       for (var i = 0; i < json.items.length; i++) {
  //         //current time in [hours:minutes]
  //         var time = new Date().toLocaleTimeString();
  //         console.log(
  //           "[" +
  //             time +
  //             "] " +
  //             "Checked " +
  //             json.items[i].display_name +
  //             " " +
  //             json.items[i].item.name +
  //             " AVAILABLE: " +
  //             json.items[i].items_available
  //         );

  //         //check if current exists
  //         if (current[json.items[i].store.store_id] != undefined) {
  //           if (
  //             current[json.items[i].store.store_id].available !=
  //             json.items[i].items_available
  //           ) {
  //             if (json.items[i].items_available == 0) {
  //               notify(
  //                 json.items[i].display_name +
  //                   " " +
  //                   json.items[i].item.name +
  //                   " is niet meer beschikbaar"
  //               );
  //             } else {
  //               console.log("change in availability");
  //               notify(
  //                 "Het item " +
  //                   json.items[i].item.name +
  //                   " heeft een verandering in de voorraad %0A%0A " +
  //                   json.items[i].display_name +
  //                   " %0A%0A Vooraad is van " +
  //                   current[json.items[i].store.store_id].available +
  //                   " naar " +
  //                   json.items[i].items_available
  //               );
  //             }
  //           }
  //         }

  //         current[json.items[i].store.store_id] = {
  //           available: json.items[i].items_available,
  //           name: json.items[i].item.name,
  //           display_name: json.items[i].display_name,
  //         };
  //       }
  //     });
  // }, 60000);
}

function notify(message) {
  console.log("sending notification");
}
