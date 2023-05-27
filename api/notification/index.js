import webpush from "web-push";
import supabase from "../../utils/supabase.js";

const KEYS = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails("https://pxd.pink", KEYS.publicKey, KEYS.privateKey);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { user_id, title, options } = req.body;
    // get all push subscriptions of the user
    const { data } = await supabase
      .from("push-subscriptions")
      .select("id,subscription")
      .eq("user_id", user_id);

    await Promise.all(
      data.map(async ({ id, subscription }) => {
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              type: "notification",
              data: {
                title,
                options,
              },
            })
          );
          return console.log(
            "successfully sent the push notification.",
            subscription.endpoint
          );
        } catch (error) {
          if (
            error.body.includes(
              "push subscription has unsubscribed or expired."
            )
          ) {
            // delete the subscription from db
            await supabase.from("push-subscriptions").delete().eq("id", id);
            console.log("delete the subscription from db.");
          }
          console.log("failed to send the push notification.", error);
        }
      })
    );

    res.json({ message: "success" });
  }
}
