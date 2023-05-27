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
      .select("subscription")
      .eq("user_id", user_id);

    for (const { subscription } of data) {
      console.log(subscription);
      const res = await webpush.sendNotification(
        JSON.parse(subscription),
        JSON.stringify({
          type: "notification",
          data: {
            title,
            options,
          },
        })
      );
      console.log(res);
    }

    res.json({ message: "success" });
  }
}
