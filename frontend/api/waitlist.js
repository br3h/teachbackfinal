module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }
  
    const webhookUrl = process.env.MAKE_WAITLIST_WEBHOOK_URL;
  
    if (!webhookUrl) {
      return res.status(500).json({ message: "Missing MAKE_WAITLIST_WEBHOOK_URL" });
    }
  
    try {
      const makeRes = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });
  
      if (!makeRes.ok) {
        return res.status(500).json({ message: "Make webhook failed" });
      }
  
      return res.status(200).json({
        status: "success",
        message: "You're on the list. We'll email you when early access opens.",
      });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  };