module.exports = async (req, res) => {
    // CORS: Tumhari website ko backend se connect hone ki permission
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { phoneNumber } = req.body;

        if (!phoneNumber || phoneNumber.length !== 10) {
            return res.status(400).json({ success: false, error: "Invalid number" });
        }

        try {
            // 4f113199efmsh82b0825b662cfa5p10d578jsn944a0e3ea3a8
            const RAPID_API_KEY = "4f113199efmsh82b0825b662cfa5p10d578jsn944a0e3ea3a8";
            const RAPID_API_HOST = "truecaller4.p.rapidapi.com"; // RapidAPI par check kar lena ki host kya hai

            const url = `https://${RAPID_API_HOST}/api/v1/search?phone=91${phoneNumber}`;
            
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': RAPID_API_HOST
                }
            };

            const apiResponse = await fetch(url, options);
            const data = await apiResponse.json();
            
            // Truecaller ka data match karke bhejna
            if (data && data.status === "success") {
                return res.status(200).json({
                    success: true,
                    name: data.data.name || "Verified User",
                    operator: data.data.carrier || "Not Found",
                    circle: data.data.circle || "Not Found"
                });
            } else {
                return res.status(200).json({ success: false, message: "Number not found" });
            }
        } catch (error) {
            console.error("API Error:", error);
            return res.status(500).json({ success: false, error: "Server Error Fetching Details" });
        }
    } else {
        return res.status(405).json({ success: false, error: "Only POST allowed" });
    }
};
